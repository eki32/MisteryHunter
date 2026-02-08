import { Component, inject, afterNextRender, signal, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MysteryService } from './services/mystery';

declare global {
  interface Window {
    checkAnswerPopup: (titulo: string) => void;
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
  private mysteryService = inject(MysteryService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  userId = 'jugador1'; // ✅ Ahora público para usarlo en el template

  totalPoints = signal(0);
  selectedMystery = signal<any>(null);
  private awardedMysteries: Set<string> = new Set();

  showSuccessModal = signal(false);
  solvedMysteryTitle = signal('');
  earnedPoints = signal(0);

  // ✅ NUEVOS SIGNALS PARA EL RANKING
  showRanking = signal(false);
  topPlayers = signal<any[]>([]);
  loadingRanking = signal(false);
  userRank = signal<number | null>(null);

  private map: any;
  private playerMarker: any;
  private L: any;
  misteriosList: any[] = [];
  private markers: Map<string, any> = new Map();

  private userProgress: { puntos: number; unlockedMysteries: string[] } = {
    puntos: 0,
    unlockedMysteries: [],
  };

  constructor() {
    window.checkAnswerPopup = (titulo: string) => {
      this.ngZone.run(() => {
        const inputElement = document.getElementById(`ans-${titulo}`) as HTMLInputElement;
        if (!inputElement) return;

        const respuestaUser = inputElement.value.trim();
        this.validarDesdePopup(titulo, respuestaUser);
      });
    };

    afterNextRender(async () => {
      this.L = await import('leaflet');

      this.userProgress = await this.mysteryService.getUserProgress(this.userId);
      this.totalPoints.set(this.userProgress.puntos);
      console.log('📊 Progreso cargado:', this.userProgress);

      this.initMap(this.L);
      this.loadMysteries(this.L);
      
      // ✅ Cargar ranking inicial
      this.loadRanking();
    });
  }

  closeWelcome() {
    this.showWelcome.set(false);
  }

  // ✅ TOGGLE RANKING
  toggleRanking() {
    this.showRanking.update(v => !v);
    if (this.showRanking()) {
      this.loadRanking();
    }
  }

  // ✅ CARGAR RANKING DESDE FIREBASE
  async loadRanking() {
    this.loadingRanking.set(true);
    try {
      const ranking = await this.mysteryService.getTopPlayers(10);
      this.topPlayers.set(ranking);

      // Calcular posición del usuario
      const allPlayers = await this.mysteryService.getAllPlayers();
      const userIndex = allPlayers.findIndex(p => p.nombre === this.userId);
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

    console.log('🔍 Validando:');
    console.log('   Usuario escribió:', respuestaUser.toLowerCase());
    console.log('   Respuesta correcta:', misterio.respuesta.toLowerCase());

    if (respuestaUser.toLowerCase() === misterio.respuesta.toLowerCase()) {
      console.log('✅ ¡Respuesta correcta!');

      this.map.closePopup();
      misterio.desbloqueado = true;

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
            <img src="${misterio.imagen}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;">
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
          // ✅ Actualizar ranking después de ganar puntos
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

    const misterioResuelto = this.misteriosList.find(
      (m) => m.titulo === this.solvedMysteryTitle()
    );

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

initMap(L: any) {
  // 1. Intentamos obtener la ubicación real del usuario
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.finishMapSetup(L, latitude, longitude);
      },
      () => {
        // Si falla o deniega, usamos Bilbao por defecto
        console.warn("Ubicación denegada.");
        this.finishMapSetup(L, 43.2630, -2.9350);
      },
      { enableHighAccuracy: true }
    );
  } else {
    this.finishMapSetup(L, 43.2630, -2.9350);
  }
}

// He extraído el resto de tu configuración para que no se repita código
private finishMapSetup(L: any, lat: number, lng: number) {
  this.map = L.map('map', {
    center: [lat, lng],
    zoom: 14,
    zoomControl: false,
  });

  const iconDefault = L.icon({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',  // ← Cambio
  iconUrl: '/leaflet/marker-icon.png',            // ← Cambio
  shadowUrl: '/leaflet/marker-shadow.png',        // ← Cambio
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

  // Activamos el rastreo para el punto azul
  this.map.locate({
    setView: false, // Importante: que no mueva la cámara cada vez que camines
    watch: true,
    enableHighAccuracy: true,
  });

  this.map.on('locationfound', (e: any) => {
    if (!this.playerMarker) {
      this.playerMarker = L.circleMarker(e.latlng, {
        radius: 8,
        color: '#007bff',
        fillColor: '#007bff',
        fillOpacity: 0.8,
      }).addTo(this.map);
    } else {
      this.playerMarker.setLatLng(e.latlng);
    }
    this.updateMysteriesDistance(e.latlng);
  });
}

  updateMysteriesDistance(userLocation: any) {
    if (!this.L || this.misteriosList.length === 0) return;

    const lockedIcon = this.L.icon({
      iconUrl: 'assets/locked.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    this.misteriosList.forEach((m) => {
      if (m.desbloqueado) {
        return;
      }

      const marker = this.markers.get(m.id);
      if (!marker) return;

      const mysteryPos = this.L.latLng(m.latitud, m.longitud);
      const distance = userLocation.distanceTo(mysteryPos);
      const unlockRadius = m.radioDesbloqueo || 50;

      console.log(`📍 ${m.titulo}: ${Math.round(distance)}m - Resuelto: ${m.desbloqueado}`);

      marker.setIcon(lockedIcon);

      if (distance < unlockRadius) {

        const popupContent = `
          <div class="popup-mystery" style="padding: 12px; text-align: center; min-width: 200px;">
            <h3 style="color: #d4af37; margin: 0 0 10px 0; font-size: 16px;">🔍 ${m.titulo}</h3>
            <p style="font-style: italic; margin: 10px 0; font-size: 14px; line-height: 1.4;">"${m.acertijo}"</p>
            <p style="font-size: 11px; color: #4ade80; margin: 5px 0; font-weight: bold;">✓ Estás en el lugar correcto</p>
            <input type="text" id="ans-${m.titulo}" placeholder="Respuesta..." 
                   style="width: calc(100% - 16px); padding: 8px; margin: 10px 0; border: 2px solid #d4af37; border-radius: 6px;">
            <button onclick="window.checkAnswerPopup('${m.titulo}')" 
                    style="padding: 10px 20px; background: #d4af37; color: #1a1a1a; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">
              Resolver
            </button>
          </div>`;
        marker.bindPopup(popupContent);
      } else {
        marker.bindPopup(`
          <div style="text-align: center; padding: 10px;">
            <b>🔒 Bloqueado</b><br>
            <span style="font-size: 12px;">Estás a ${Math.round(distance)}m</span>
          </div>`);

        const proximityRadius = unlockRadius * 3;
        if (distance < proximityRadius && navigator.vibrate) {
          navigator.vibrate(100);
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
    const lockedIcon = L.icon({
      iconUrl: 'assets/locked.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const unlockedIcon = L.icon({
      iconUrl: 'assets/unlocked.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    this.mysteryService.getMysteries().subscribe((misterios) => {
      console.log('📦 Misterios cargados:', misterios);

      // ✅ Marcar como desbloqueados según progreso del usuario
      this.misteriosList = misterios.map((m) => ({
        ...m,
        desbloqueado: this.userProgress.unlockedMysteries.includes(m.id),
      }));

      this.misteriosList.forEach((m) => {
        console.log(`${m.titulo} - Desbloqueado: ${m.desbloqueado} - Radio: ${m.radioDesbloqueo}m`);

        const mysteryPos = L.latLng(m.latitud, m.longitud);
        const initialIcon = m.desbloqueado ? unlockedIcon : lockedIcon;
        const marker = L.marker(mysteryPos, { icon: initialIcon }).addTo(this.map);

        this.markers.set(m.id, marker);

        if (m.desbloqueado) {
          const popupContent = `
            <div class="popup-info" style="width: 220px; padding: 10px;">
              <img src="${m.imagen}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" alt="${m.titulo}">
              <h3 style="margin: 0 0 8px 0; color: #d4af37;">${m.titulo}</h3>
              <p style="font-size: 13px; line-height: 1.4; margin: 0;">${m.descripcion}</p>
            </div>`;
          marker.bindPopup(popupContent);
        } else {
          marker.bindPopup(`
            <div style="text-align: center; padding: 10px;">
              <b>🔒 Bloqueado</b><br>
              <span style="font-size: 12px;">Acércate a ${m.radioDesbloqueo || 50}m para desbloquear</span>
            </div>`);
        }
      });

      if (this.playerMarker) {
        const userLocation = this.playerMarker.getLatLng();
        this.updateMysteriesDistance(userLocation);
      }
    });
  }
}