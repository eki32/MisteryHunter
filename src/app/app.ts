import {
  Component,
  inject,
  afterNextRender,
  signal,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MysteryService } from './services/mystery';

declare global {
  interface Window {
    checkAnswerPopup: (titulo: string) => void;
  }
  interface Navigator {
    vibrate(pattern: number | number[]): boolean;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  showWelcome = signal(true);
  showInstructions = signal(false); // ✅ NUEVO
  private mysteryService = inject(MysteryService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private lastAccuracy: number = 0;

  userId: string = '';
  playerName = signal('');

  totalPoints = signal(0);
  selectedMystery = signal<any>(null);
  private notifiedMysteries: Set<string> = new Set();

  showSuccessModal = signal(false);
  solvedMysteryTitle = signal('');
  earnedPoints = signal(0);

  showRanking = signal(false);
  topPlayers = signal<any[]>([]);
  loadingRanking = signal(false);
  userRank = signal<number | null>(null);
  showAllPlayers = signal(false);

  isLoginMode = signal(true);
  nameError = signal('');
  passwordError = signal('');
  showUserMenu = signal(false);

  private map: any;
  private playerMarker: any;
  private L: any;
  misteriosList: any[] = [];
  private markers: Map<string, any> = new Map();

  private userProgress: { puntos: number; unlockedMysteries: string[] } = {
    puntos: 0,
    unlockedMysteries: [],
  };

  private watchId: number | null = null;
  private locationAttempts = 0;
  private maxLocationAttempts = 3;

  // ✅ Variables para carga progresiva
  private loadedMysteries: Set<string> = new Set();
  private LOAD_MORE_DISTANCE = 10000; // 10km para cargar más
  private BATCH_SIZE = 5; // Cargar de 5 en 5
  private currentUserLocation: any = null;

  // ✅ NUEVO: Control de vibración única
  private vibratedMysteries: Set<string> = new Set();
  private isLoggingOut: boolean = false; // ✅ Flag para evitar vibraciones durante logout

  // Helper para vibración compatible con TypeScript
  private vibrar(pattern: number | number[]): void {
    // ✅ No vibrar si estamos haciendo logout o en pantallas de bienvenida/instrucciones
    if (this.isLoggingOut || this.showWelcome()) return;

    // ✅ No vibrar si no hay usuario logueado
    if (!this.userId) return;

    try {
      const nav = navigator as any;
      if (nav.vibrate) {
        nav.vibrate(pattern);
      }
    } catch (e) {
      console.log('Vibración no soportada');
    }
  }

  constructor() {
    window.checkAnswerPopup = (titulo: string) => {
      this.ngZone.run(() => {
        const inputElement = document.getElementById(`ans-${titulo}`) as HTMLInputElement;
        if (!inputElement) return;

        const respuestaUser = inputElement.value.trim();
        this.validarDesdePopup(titulo, respuestaUser);
      });
    };

    // ✅ Registrar Service Worker para notificaciones en segundo plano
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);
        })
        .catch((error) => {
          console.error('❌ Error al registrar Service Worker:', error);
        });
    }

    afterNextRender(async () => {
      const leafletModule = await import('leaflet');
      this.L = leafletModule.default || leafletModule;

      const savedUserId = localStorage.getItem('mysteryHunterUserId');
      const savedPlayerName = localStorage.getItem('mysteryHunterPlayerName');

      if (savedUserId && savedPlayerName) {
        this.userId = savedUserId;
        this.playerName.set(savedPlayerName);
        this.userProgress = await this.mysteryService.getUserProgress(this.userId);
        this.totalPoints.set(this.userProgress.puntos);
        this.showWelcome.set(false);
        console.log('👋 Sesión recuperada:', savedPlayerName);
      }

      await this.initMap(this.L);
      this.loadMysteries(this.L);
      this.loadRanking();
    });
  }

  toggleMode() {
    this.isLoginMode.update((v) => !v);
    this.nameError.set('');
    this.passwordError.set('');
  }

  toggleUserMenu() {
    this.showUserMenu.update((v) => !v);
  }

  goToCurrentLocation() {
    if (this.currentUserLocation && this.map) {
      this.map.setView(this.currentUserLocation, 16, {
        animate: true,
        duration: 1,
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = this.L.latLng(latitude, longitude);
          this.map.setView(newPos, 16);
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
        },
        { enableHighAccuracy: true },
      );
    }
  }

  logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      // ✅ Activar flag INMEDIATAMENTE para bloquear vibraciones
      this.isLoggingOut = true;

      localStorage.removeItem('mysteryHunterUserId');
      localStorage.removeItem('mysteryHunterPlayerName');

      this.userId = '';
      this.playerName.set('');
      this.totalPoints.set(0);
      this.userProgress = { puntos: 0, unlockedMysteries: [] };
      this.showRanking.set(false);

      this.markers.forEach((marker) => {
        if (this.L) {
          const lockedIcon = this.L.icon({
            iconUrl: 'assets/locked.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          marker.setIcon(lockedIcon);
          marker.bindPopup(`
          <div style="text-align: center; padding: 10px;">
            <b>🔒 Bloqueado</b><br>
            <span style="font-size: 12px;">Acércate para desbloquear</span>
          </div>`);
        }
      });

      this.misteriosList.forEach((m) => {
        m.desbloqueado = false;
      });

      // ✅ Limpiar registros de notificaciones y vibraciones
      this.notifiedMysteries.clear();
      this.vibratedMysteries.clear();

      this.showWelcome.set(true);
      this.showInstructions.set(false);

      console.log('👋 Sesión cerrada');

      // ✅ Reactivar vibraciones después de 1 segundo (cuando ya se mostró el login)
      setTimeout(() => {
        this.isLoggingOut = false;
      }, 1000);
    }
  }

  async handleAuth(playerName: string, password: string) {
    this.nameError.set('');
    this.passwordError.set('');

    if (!playerName || !playerName.trim()) {
      this.nameError.set('Por favor, escribe tu nombre');
      return;
    }

    if (!password || password.length < 4) {
      this.passwordError.set('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    const trimmedName = playerName.trim();

    if (this.isLoginMode()) {
      const result = await this.mysteryService.loginPlayer(trimmedName, password);

      if (result.success && result.userId) {
        this.userId = result.userId;
        this.playerName.set(trimmedName);
        localStorage.setItem('mysteryHunterUserId', result.userId);
        localStorage.setItem('mysteryHunterPlayerName', trimmedName);

        this.userProgress = await this.mysteryService.getUserProgress(result.userId);
        this.totalPoints.set(this.userProgress.puntos);

        console.log('✅ Login exitoso:', trimmedName);
        this.showWelcome.set(false);
        this.showInstructions.set(true); // ✅ Mostrar instrucciones

        // ✅ Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

        if (this.L) {
          this.loadMysteries(this.L);
        }
      } else {
        if (result.error === 'Usuario no encontrado') {
          this.nameError.set('❌ Usuario no encontrado');
        } else if (result.error === 'Contraseña incorrecta') {
          this.passwordError.set('❌ Contraseña incorrecta');
        } else {
          this.nameError.set('❌ Error al iniciar sesión');
        }
      }
    } else {
      const result = await this.mysteryService.registerPlayer(trimmedName, password);

      if (result.success && result.userId) {
        this.userId = result.userId;
        this.playerName.set(trimmedName);
        localStorage.setItem('mysteryHunterUserId', result.userId);
        localStorage.setItem('mysteryHunterPlayerName', trimmedName);

        this.userProgress = { puntos: 0, unlockedMysteries: [] };
        this.totalPoints.set(0);

        console.log('✅ Registro exitoso:', trimmedName);
        this.showWelcome.set(false);
        this.showInstructions.set(true); // ✅ Mostrar instrucciones
      } else {
        if (result.error === 'El nombre ya está en uso') {
          this.nameError.set('⚠️ Este nombre ya está en uso');
        } else {
          this.nameError.set('❌ Error al registrarse');
        }
      }
    }
  }

  toggleRanking() {
    this.showRanking.update((v) => !v);
    if (this.showRanking()) {
      this.showAllPlayers.set(false);
      this.loadRanking();
      this.showUserMenu.set(false);
    }
  }

  toggleShowAllPlayers() {
    this.showAllPlayers.update((v) => !v);
  }

  getVisiblePlayers(): any[] {
    const limit = this.showAllPlayers() ? 10 : 6;
    return this.topPlayers().slice(0, limit);
  }

  async loadRanking() {
    this.loadingRanking.set(true);
    try {
      const ranking = await this.mysteryService.getTopPlayers(10);
      this.topPlayers.set(ranking);

      const allPlayers = await this.mysteryService.getAllPlayers();
      const userIndex = allPlayers.findIndex((p) => p.id === this.userId);
      this.userRank.set(userIndex >= 0 ? userIndex + 1 : null);

      console.log('🏆 Ranking cargado:', ranking);
    } catch (error) {
      console.error('❌ Error al cargar ranking:', error);
    } finally {
      this.loadingRanking.set(false);
    }
  }

  validarDesdePopup(titulo: string, respuestaUser: string) {
    const misterio = this.misteriosList.find((m) => m.titulo === titulo);

    if (!misterio) {
      alert('Error: Misterio no encontrado');
      return;
    }

    // ✅ Función para limpiar acentos, mayúsculas y espacios
    const normalizar = (texto: string) => {
      return texto
        .toLowerCase() // Todo a minúsculas
        .trim() // Quitar espacios al inicio y final
        .normalize('NFD') // Descomponer caracteres con acentos
        .replace(/[\u0300-\u036f]/g, ''); // Eliminar los símbolos de acentos
    };

    const userClean = normalizar(respuestaUser);
    const correctClean = normalizar(misterio.respuesta);

    console.log('🔍 Validando:');
    console.log('   Usuario escribió:', respuestaUser.toLowerCase());
    console.log('   Respuesta correcta:', misterio.respuesta.toLowerCase());

    if (userClean === correctClean) {
      console.log('✅ ¡Respuesta correcta! (Normalizada)');

      this.map.closePopup();
      misterio.desbloqueado = true;

      // ✅ Limpiar registros de notificación/vibración del misterio resuelto
      this.notifiedMysteries.delete(misterio.id);
      this.vibratedMysteries.delete(misterio.id);

      this.ngZone.run(() => {
        this.solvedMysteryTitle.set(misterio.titulo);
        this.earnedPoints.set(50);
        this.showSuccessModal.set(true);

        console.log('🎉 Modal activado:', {
          show: this.showSuccessModal(),
          title: this.solvedMysteryTitle(),
          points: this.earnedPoints(),
        });

        this.totalPoints.update((p) => p + 50);
        this.cdr.detectChanges();
      });

      const marker = this.markers.get(misterio.id);
      if (marker && this.L) {
        const unlockedIcon = this.L.icon({
          iconUrl: 'assets/unlocked.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        marker.setIcon(unlockedIcon);

        const popupContent = `
          <div class="popup-info" style="width: 220px; padding: 10px;">
            <div style="width: 100%; height: 120px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
              <div style="position: absolute; color: #d4af37; font-size: 32px;">🔓</div>
              <img src="${misterio.imagen}" 
                   loading="lazy"
                   style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; position: absolute; top: 0; left: 0; opacity: 0; transition: opacity 0.3s;"
                   onload="this.style.opacity='1'"
                   onerror="this.style.display='none'"
                   alt="${misterio.titulo}">
            </div>
            <h3 style="margin: 0 0 8px 0; color: #d4af37;">${misterio.titulo}</h3>
            <p style="font-size: 13px; line-height: 1.4; margin: 0;">${misterio.descripcion}</p>
          </div>`;
        marker.bindPopup(popupContent);
      }

      Promise.all([
        this.mysteryService.unlockMystery(this.userId, misterio.id),
        this.mysteryService.addPoints(this.userId, 50),
      ])
        .then(() => {
          console.log('✅ Progreso guardado en Firebase');
          this.loadRanking();
        })
        .catch((err) => {
          console.error('❌ Error al guardar:', err);
        });
    } else {
      console.log('❌ Respuesta incorrecta');
      alert('Respuesta incorrecta. ¡Sigue intentándolo!');
      const inputElement = document.getElementById(`ans-${titulo}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
        inputElement.focus();
      }
    }
  }

  closeSuccessModal() {
    this.showSuccessModal.set(false);

    const misterioResuelto = this.misteriosList.find((m) => m.titulo === this.solvedMysteryTitle());

    if (misterioResuelto) {
      const marker = this.markers.get(misterioResuelto.id);

      if (marker) {
        setTimeout(() => {
          this.map.setView(marker.getLatLng(), 17, {
            animate: true,
            duration: 0.5,
          });

          marker.openPopup();
        }, 300);
      }
    }
  }

  // ✅ NUEVO: Cerrar pantalla de instrucciones
  closeInstructions() {
    this.showInstructions.set(false);
  }

  async initMap(L: any): Promise<void> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        console.log('🔍 Solicitando permisos de geolocalización...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('✅ Ubicación inicial obtenida:', latitude, longitude);
            this.finishMapSetup(L, latitude, longitude);
            resolve();
          },
          (error) => {
            console.error('❌ Error de geolocalización:', error.message, error.code);
            this.finishMapSetup(L, 43.263, -2.935);
            resolve();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      } else {
        console.warn('⚠️ Geolocalización no disponible en este navegador');
        this.finishMapSetup(L, 43.263, -2.935);
        resolve();
      }
    });
  }

  private finishMapSetup(L: any, lat: number, lng: number) {
    console.log('🗺️ Configurando mapa en:', lat, lng);

    this.map = L.map('map', {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
    });

    const iconDefault = L.icon({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      className: 'map-lighter',
    }).addTo(this.map);

    console.log('📍 Creando marcador de jugador en:', lat, lng);
    this.playerMarker = L.circleMarker([lat, lng], {
      radius: 10,
      color: '#ffffff',
      fillColor: '#007bff',
      fillOpacity: 1,
      weight: 3,
    }).addTo(this.map);

    this.currentUserLocation = L.latLng(lat, lng);

    this.map.locate({
      setView: false,
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 30000,
    });

    this.map.on('locationfound', (e: any) => {
      console.log(
        '📍 Ubicación actualizada:',
        e.latlng.lat,
        e.latlng.lng,
        'Precisión:',
        e.accuracy + 'm',
      );

      if (this.playerMarker) {
        this.playerMarker.setLatLng(e.latlng);
      }

      this.currentUserLocation = e.latlng;
      this.lastAccuracy = e.accuracy;
      this.updateMysteriesDistance(e.latlng);
      this.loadNearbyMysteries(e.latlng);
    });

    this.map.on('locationerror', (e: any) => {
      console.warn('⚠️ Timeout de ubicación (es normal, seguirá intentando):', e.message);
    });

    this.map.on('moveend', () => {
      this.loadVisibleMysteries();
    });
  }

  private startLocationTracking() {
    if (!navigator.geolocation) {
      console.warn('⚠️ No se puede rastrear ubicación: geolocalización no disponible');
      return;
    }

    console.log('🎯 Iniciando rastreo continuo de ubicación...');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Ubicación actualizada:', latitude, longitude, 'Precisión:', accuracy + 'm');

        this.locationAttempts = 0;

        if (this.playerMarker && this.L) {
          const newPos = this.L.latLng(latitude, longitude);
          this.playerMarker.setLatLng(newPos);
          this.currentUserLocation = newPos;
          this.updateMysteriesDistance(newPos);
          this.loadNearbyMysteries(newPos);
        }
      },
      (error) => {
        this.locationAttempts++;
        console.error(
          `❌ Error al rastrear ubicación (intento ${this.locationAttempts}):`,
          error.message,
        );

        if (this.locationAttempts >= this.maxLocationAttempts) {
          console.warn('⚠️ Reiniciando rastreo...');
          this.stopLocationTracking();

          setTimeout(() => {
            this.locationAttempts = 0;
            this.startLocationTracking();
          }, 5000);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );

    console.log('✅ Rastreo iniciado');
  }

  private stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      console.log('🛑 Rastreo detenido');
      this.watchId = null;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    if (this.L) {
      const pos1 = this.L.latLng(lat1, lon1);
      const pos2 = this.L.latLng(lat2, lon2);
      return pos1.distanceTo(pos2);
    }
    return Infinity;
  }

  private loadNearbyMysteries(userLocation: any) {
    if (!this.L || this.misteriosList.length === 0) return;

    const mysteriesToLoad = this.misteriosList
      .filter((m) => !this.loadedMysteries.has(m.id))
      .map((m) => ({
        ...m,
        distance: this.calculateDistance(userLocation.lat, userLocation.lng, m.latitud, m.longitud),
      }))
      .filter((m) => m.distance < this.LOAD_MORE_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, this.BATCH_SIZE);

    if (mysteriesToLoad.length > 0) {
      console.log(`🎯 Cargando ${mysteriesToLoad.length} misterios cercanos...`);

      mysteriesToLoad.forEach((m) => {
        this.addMysteryMarker(m);
        this.loadedMysteries.add(m.id);
      });
    }
  }

  private loadVisibleMysteries() {
    if (!this.map || !this.L || this.misteriosList.length === 0) return;

    const bounds = this.map.getBounds();
    let loadedCount = 0;

    this.misteriosList.forEach((m) => {
      if (!this.loadedMysteries.has(m.id)) {
        const mysteryPos = this.L.latLng(m.latitud, m.longitud);

        if (bounds.contains(mysteryPos)) {
          this.addMysteryMarker(m);
          this.loadedMysteries.add(m.id);
          loadedCount++;
        }
      }
    });

    if (loadedCount > 0) {
      console.log(`🗺️ Cargados ${loadedCount} misterios en viewport`);
    }
  }

  private addMysteryMarker(mystery: any) {
    if (!this.L || !this.map || this.markers.has(mystery.id)) return;

    const lockedIcon = this.L.icon({
      iconUrl: 'assets/locked.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const unlockedIcon = this.L.icon({
      iconUrl: 'assets/unlocked.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const mysteryPos = this.L.latLng(mystery.latitud, mystery.longitud);
    const initialIcon = mystery.desbloqueado ? unlockedIcon : lockedIcon;
    const marker = this.L.marker(mysteryPos, { icon: initialIcon }).addTo(this.map);

    this.markers.set(mystery.id, marker);

    if (mystery.desbloqueado) {
      const popupContent = `
        <div class="popup-info" style="width: 220px; padding: 10px;">
          <div style="width: 100%; height: 120px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
            <div style="position: absolute; color: #d4af37; font-size: 32px;">🔓</div>
            <img src="${mystery.imagen}" 
                 loading="lazy"
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; position: absolute; top: 0; left: 0;"
                 onload="this.style.opacity='1'"
                 onerror="this.style.display='none'"
                 alt="${mystery.titulo}">
          </div>
          <h3 style="margin: 0 0 8px 0; color: #d4af37;">${mystery.titulo}</h3>
          <p style="font-size: 13px; line-height: 1.4; margin: 0;">${mystery.descripcion}</p>
        </div>`;
      marker.bindPopup(popupContent);
    } else {
      marker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
          <b>🔒 Bloqueado</b><br>
          <span style="font-size: 12px;">Acércate a ${mystery.radioDesbloqueo || 50}m para desbloquear</span>
        </div>`);
    }

    console.log(`📍 Marcador añadido: ${mystery.titulo}`);
  }

  // ✅ NUEVO MÉTODO: Mostrar notificación del sistema tipo SMS/WhatsApp
  private async mostrarNotificacionProximidad(mystery: any, distance: number) {
    console.log('🔔 Lanzando alerta de proximidad para:', mystery.titulo);

    // 1. Vibración inmediata (hilo principal)
    this.vibrar([200, 100, 200, 100, 200]);

    // 2. Notificación vía Service Worker (API Recomendada)
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification('📍 ¡Misterio Cerca!', {
          body: `Estás a ${Math.round(distance)}m de "${mystery.titulo}". ¡Ábrelo para ver el acertijo!`,
          icon: '/logoMistery.png',
          badge: '/assets/locked.png',
          vibrate: [200, 100, 200, 100, 200],
          tag: `proximity-${mystery.id}`, // Evita duplicados
          renotify: true,
          data: { mysteryId: mystery.id },
        } as any);

        console.log('✅ Notificación de proximidad enviada con éxito');
      } catch (error) {
        console.error('❌ Error al usar Service Worker para proximidad:', error);
        this.mostrarNotificacionNormal(mystery, distance); // Fallback
      }
    } else {
      this.mostrarNotificacionNormal(mystery, distance);
    }
  }

  // Notificación normal (fallback)
  // Notificación normal (fallback)
  private mostrarNotificacionNormal(mystery: any, distance: number) {
    try {
      // Cast a 'any' para evitar que TS valide las propiedades contra la interfaz estándar
      const notification = new Notification('📍 ¡Misterio Cerca!', {
        body: `Estás a ${Math.round(distance)}m de "${mystery.titulo}". ¡Acércate más!`,
        icon: '/public/logoMistery.png',
        badge: '/assets/locked.png',
        tag: `proximity-${mystery.id}`,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200, 100, 200], // TypeScript ya no marcará rojo aquí
        renotify: true,
      } as any);

      setTimeout(() => notification.close(), 5000);

      notification.onclick = () => {
        window.focus();
        const marker = this.markers.get(mystery.id);
        if (marker && this.map) {
          this.map.setView(marker.getLatLng(), 17, {
            animate: true,
            duration: 0.5,
          });
          marker.openPopup();
        }
        notification.close();
      };
    } catch (error) {
      console.error('❌ Error al crear notificación normal:', error);
    }
  }

  updateMysteriesDistance(userLocation: any) {
    if (!this.L || this.misteriosList.length === 0) return;

    const isLocationReliable = this.lastAccuracy > 0.1 && this.lastAccuracy < 250;

    this.loadedMysteries.forEach((mysteryId) => {
      const m = this.misteriosList.find((mystery) => mystery.id === mysteryId);
      if (!m || m.desbloqueado) return;

      const marker = this.markers.get(m.id);
      if (!marker) return;

      const distance = userLocation.distanceTo(this.L.latLng(m.latitud, m.longitud));

      // --- LÓGICA DE RADIOS ---
      const unlockRadius = m.radioDesbloqueo || 50; // El de Firebase
      const proximityZone = unlockRadius + 100; // Avisamos 100m antes

      // A. ZONA DE AVISO (Bolsillo)
      if (distance < proximityZone && distance >= unlockRadius) {
        if (!this.notifiedMysteries.has(m.id)) {
          // ✅ Forzamos la notificación moderna que sí suena/vibra en bolsillo
          this.mostrarNotificacionProximidad(m, distance);
          this.notifiedMysteries.add(m.id);
        }
      }

      // B. ZONA DE DESBLOQUEO
      else if (distance < unlockRadius && isLocationReliable) {
        if (!this.vibratedMysteries.has(m.id)) {
          // ✅ Vibración extra fuerte al llegar
          this.vibrar([500, 100, 500]);
          this.vibratedMysteries.add(m.id);


            marker.openPopup();
        }

      

        if (!marker.isPopupOpen()) {
          const popupContent = `
          <div style="text-align: center; min-width: 180px;">
            <h3 style="color: #d4af37;">🔍 ${m.titulo}</h3>
            <p><i>"${m.acertijo}"</i></p>
            <input type="text" id="ans-${m.titulo}" placeholder="Tu respuesta..." style="width: 80%; margin-bottom: 8px;">
            <button onclick="window.checkAnswerPopup('${m.titulo}')" style="background: #d4af37; border: none; padding: 8px; width: 100%; border-radius: 4px; font-weight: bold;">RESOLVER</button>
          </div>`;
          marker.bindPopup(popupContent);
        }
      }
    });
  }

  checkAnswer(inputValue: string) {
    const misterioActual = this.selectedMystery();
    if (misterioActual) {
      this.validarDesdePopup(misterioActual.titulo, inputValue);
    }
  }

  loadMysteries(L: any) {
    if (!this.map) {
      console.error('❌ El mapa no está inicializado');
      return;
    }

    this.mysteryService.getMysteries().subscribe((misterios) => {
      console.log('📦 Misterios cargados desde Firebase:', misterios.length);

      this.misteriosList = misterios.map((m) => ({
        ...m,
        desbloqueado: this.userProgress.unlockedMysteries.includes(m.id),
      }));

      this.markers.forEach((marker) => {
        this.map.removeLayer(marker);
      });
      this.markers.clear();
      this.loadedMysteries.clear();

      if (this.currentUserLocation) {
        const unlockedMysteries = this.misteriosList.filter((m) => m.desbloqueado);
        unlockedMysteries.forEach((m) => {
          this.addMysteryMarker(m);
          this.loadedMysteries.add(m.id);
        });

        this.loadNearbyMysteries(this.currentUserLocation);

        console.log(
          `✅ Carga inicial: ${unlockedMysteries.length} desbloqueados + misterios cercanos`,
        );
      } else {
        this.misteriosList.slice(0, 10).forEach((m) => {
          this.addMysteryMarker(m);
          this.loadedMysteries.add(m.id);
        });

        console.log('✅ Carga inicial: primeros 10 misterios (sin ubicación)');
      }

      if (this.playerMarker) {
        const userLocation = this.playerMarker.getLatLng();
        this.updateMysteriesDistance(userLocation);
      }
    });
  }

  async testNotification() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🔍 Test Mystery Hunter', {
          body: '¡Nuevo misterio cerca por resolver!',
          icon: '/logoMistery.png', // ✅ Tu icono aquí
          vibrate: [200, 100, 200],
          tag: 'test-notification',
        } as any);
      }
    } catch (e) {
      alert('❌ Error: ' + (e as Error).message);
    }
  }
}
