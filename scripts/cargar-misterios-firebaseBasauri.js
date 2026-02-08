const admin = require('firebase-admin');

// Inicializar Firebase Admin
// IMPORTANTE: Descarga tu serviceAccountKey.json desde Firebase Console
// Firebase Console > Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Misterios por toda la península ibérica
const misterios = [
{
  titulo: "El Guardián del Casco Viejo",
  acertijo: "En lo alto de una colina vigilo Basauri desde hace siglos. Mi espada no es de hierro, pero mi nombre recuerda a un arcángel guerrero. ¿Qué templo soy?",
  respuesta: "Iglesia de San Miguel Arcángel",
  latitud: 43.23655,
  longitud: -2.88547,
  radioDesbloqueo: 120,
  desbloqueado: false,
  descripcion: "La Iglesia de San Miguel Arcángel es uno de los edificios más emblemáticos de Basauri, situada en una posición elevada con vistas al municipio.",
  imagen: "https://bizkeliza.org/wp-content/uploads/lekeitio-san_miguel_042-5-scaled.jpg"
},
{
  titulo: "El Santuario de las Fiestas",
  acertijo: "Cada octubre mis campanas anuncian celebración. Soy pequeño, blanco y querido, y mi nombre está ligado al patrón del pueblo. ¿Qué ermita soy?",
  respuesta: "Ermita de San Fausto",
  latitud: 43.23602,
  longitud: -2.88298,
  radioDesbloqueo: 100,
  desbloqueado: false,
  descripcion: "La Ermita de San Fausto es un símbolo de las fiestas de Basauri y uno de sus rincones más tradicionales.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Ariz_%281%29.jpg/760px-Mapcarta.jpg"
},
{
  titulo: "El Palacio de Ariz",
  acertijo: "Soy casa torre, soy historia. Mis muros han visto pasar siglos y doy nombre al barrio que me rodea. ¿Qué edificio soy?",
  respuesta: "Casa Torre de Ariz",
  latitud: 43.23690,
  longitud: -2.89060,
  radioDesbloqueo: 100,
  desbloqueado: false,
  descripcion: "La Casa Torre de Ariz es uno de los edificios históricos más importantes de Basauri, origen del barrio de Ariz.",
  imagen: "https://photos.wikimapia.org/p/00/00/11/00/75_big.jpg"
},
{
  titulo: "El Parque del Estanque",
  acertijo: "Entre patos, esculturas y senderos tranquilos, soy el pulmón verde más artístico del municipio. ¿Qué parque soy?",
  respuesta: "Parque de Soloarte",
  latitud: 43.23390,
  longitud: -2.88360,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "El Parque de Soloarte es un espacio verde con estanque, esculturas y zonas de paseo, muy querido por los vecinos.",
  imagen: "https://static.elcorreo.com/www/multimedia/201712/20/media/cortadas/parquesoloarte-kBc--624x385@El%20Correo.jpg"
},
{
  titulo: "El Mirador del Nervión",
  acertijo: "A mis pies fluye un río que baja desde el interior. Soy un puente antiguo que une caminos y barrios. ¿Qué puente soy?",
  respuesta: "Puente de Ariz",
  latitud: 43.23640,
  longitud: -2.88780,
  radioDesbloqueo: 80,
  desbloqueado: false,
  descripcion: "El Puente de Ariz es uno de los pasos históricos sobre el río Nervión en Basauri.",
  imagen: "https://rpopular.mediasector.es/estaticos/2026/01/29145956/imgi_2_623360245_1387207660112280_9084024630956987990_n-e1769695215992-880x495.jpg"
},
{
  titulo: "El Parque del Tren",
  acertijo: "Estoy junto a las vías y soy lugar de juegos, sombra y descanso. Mi nombre recuerda a un dulce tradicional. ¿Qué parque soy?",
  respuesta: "Parque de Bizkotxalde",
  latitud: 43.23790,
  longitud: -2.88420,
  radioDesbloqueo: 120,
  desbloqueado: false,
  descripcion: "El Parque de Bizkotxalde es uno de los parques más céntricos y concurridos de Basauri.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Parque_Bizkotxalde_Basauri.JPG"
},
{
  titulo: "La Cima de Basauri",
  acertijo: "No soy muy alto, pero desde mi cima se ve toda la comarca. Soy monte, soy frontera y soy mirador. ¿Qué monte soy?",
  respuesta: "Monte Malmasín",
  latitud: 43.24380,
  longitud: -2.90040,
  radioDesbloqueo: 300,
  desbloqueado: false,
  descripcion: "El Monte Malmasín es una de las cumbres más accesibles desde Basauri, con vistas panorámicas del Gran Bilbao.",
  imagen: "https://s1.wklcdn.com/image_75/2253862/46864149/30905644.400x300.jpg"
},
{
  titulo: "La Plaza del Corazón",
  acertijo: "Soy punto de encuentro, de fiestas, de pasos y de vida. Aquí empieza y termina todo. ¿Qué plaza soy?",
  respuesta: "Plaza Arizgoiti",
  latitud: 43.23740,
  longitud: -2.88500,
  radioDesbloqueo: 80,
  desbloqueado: false,
  descripcion: "La Plaza Arizgoiti es el centro neurálgico de Basauri, rodeada de comercios y actividad constante.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Basauri%2C_barrio_de_Arizgoiti.jpg"
},

];

// Función para cargar los misterios en Firebase
async function cargarMisteriosEnFirebase() {
  try {
    console.log('🔄 Iniciando carga de misterios en Firebase...');
    console.log(`📊 Total de misterios a cargar: ${misterios.length}`);
    
    // Usar batch para operaciones más eficientes
    // Firebase limita los batch a 500 operaciones, pero tenemos menos
    const batch = db.batch();
    
    misterios.forEach((misterio, index) => {
      const docRef = db.collection('misterios').doc();
      batch.set(docRef, misterio);
      console.log(`✅ Preparado misterio ${index + 1}/${misterios.length}: ${misterio.titulo}`);
    });
    
    // Ejecutar el batch
    await batch.commit();
    
    console.log('\n🎉 ¡Todos los misterios se han cargado exitosamente en Firebase!');
    console.log(`📍 ${misterios.length} misterios distribuidos por toda la península`);
    console.log('\n📋 Resumen de ubicaciones:');
    console.log('   - Andalucía: Granada, Sevilla, Córdoba, Cabo de Gata');
    console.log('   - Cataluña: Barcelona, Valencia');
    console.log('   - Madrid: Parque del Retiro');
    console.log('   - Castilla y León: Segovia, Salamanca, León');
    console.log('   - Galicia: Santiago, Lugo, Playa de las Catedrales');
    console.log('   - País Vasco: Bilbao, San Sebastián');
    console.log('   - Aragón: Zaragoza, Ordesa');
    console.log('   - Extremadura: Mérida');
    console.log('   - Castilla-La Mancha: Toledo, Cuenca');
    console.log('   - Canarias: Tenerife');
    console.log('   - Asturias/Cantabria: Picos de Europa');
    
  } catch (error) {
    console.error('❌ Error al cargar los misterios:', error);
    throw error;
  } finally {
    // Cerrar la app de Firebase
    await admin.app().delete();
    console.log('\n👋 Conexión con Firebase cerrada');
  }
}

// Ejecutar la función
cargarMisteriosEnFirebase()
  .then(() => {
    console.log('\n✨ Proceso completado con éxito');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });