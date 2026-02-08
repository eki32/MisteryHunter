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
  titulo: "El Palacio del Jardín Secreto",
  acertijo: "Entre árboles centenarios y senderos silenciosos, un palacio burgués descansa oculto del ruido. ¿Qué palacio barakaldés soy?",
  respuesta: "Palacio Munoa",
  latitud: 43.28955,
  longitud: -2.99160,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "El Palacio Munoa es una joya arquitectónica rodeada de jardines históricos, uno de los rincones más elegantes de Barakaldo.",
  imagen: "https://visitbarakaldo.eus/wp-content/uploads/2019/11/Munoa2.jpg"
},
{
  titulo: "El Jardín del Mundo",
  acertijo: "Más de 300 especies de plantas conviven en mis senderos. Soy un viaje botánico sin salir de Barakaldo. ¿Qué jardín soy?",
  respuesta: "Jardín Botánico Ramón Rubial",
  latitud: 43.28910,
  longitud: -2.98690,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Jardín Botánico Ramón Rubial es uno de los espacios verdes más importantes de Barakaldo, con flora de todo el mundo.",
  imagen: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgIstoOhB1rFT5KYFAK0TevED9Gp7rGL6jUvmaYXnndOTnF-lG8xPPQLwciLtuNwQYkc6v30C7dD2SCvdIP0tJBqiCBqvukD6mVdfkrNLptr3xIoTvVzOucIexthfecJRDq8-ihMZxijJNm/w1200-h630-p-k-no-nu/Beurko+5-4-11,1.jpg"
},
{
  titulo: "El Teatro del Nervión",
  acertijo: "Aquí se aplaude, se canta y se sueña. Soy el corazón cultural de la ciudad. ¿Qué teatro soy?",
  respuesta: "Barakaldo Antzokia",
  latitud: 43.29620,
  longitud: -2.98940,
  radioDesbloqueo: 100,
  desbloqueado: false,
  descripcion: "El Barakaldo Antzokia es el principal teatro del municipio y un referente cultural en Bizkaia.",
  imagen: "https://www.redescena.net/imagenes/contenido/sala/teatro-barakaldo-antzokia.jpg"
},
{
  titulo: "La Plaza del Encuentro",
  acertijo: "Soy punto de paso, de compras y de vida. Mi nombre recuerda un antiguo cruce de caminos. ¿Qué plaza soy?",
  respuesta: "Bide Onera",
  latitud: 43.29680,
  longitud: -2.98900,
  radioDesbloqueo: 80,
  desbloqueado: false,
  descripcion: "La plaza Bide Onera es uno de los centros neurálgicos de Barakaldo, llena de actividad comercial.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Baracaldo_-_Plaza_Bide_Onera_1.jpg"
},
{
  titulo: "La Casa del Vapor",
  acertijo: "Nací como edificio industrial, pero hoy soy innovación y futuro. ¿Qué edificio emblemático soy?",
  respuesta: "Edificio Ilgner",
  latitud: 43.29730,
  longitud: -3.00880,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "El Edificio Ilgner es un icono industrial reconvertido en centro tecnológico y de emprendimiento.",
  imagen: "https://www.bilbaoria2000.org/assets/media/galeria-barakaldo-edificioilger-7-992x662.jpg"
},
{
  titulo: "El Parque de los Hermanos",
  acertijo: "Soy verde, amplio y lleno de vida. Mis caminos unen generaciones. ¿Qué parque céntrico soy?",
  respuesta: "Parque de los Hermanos",
  latitud: 43.29610,
  longitud: -2.98780,
  radioDesbloqueo: 120,
  desbloqueado: false,
  descripcion: "El Parque de los Hermanos es uno de los espacios verdes más concurridos del centro de Barakaldo.",
  imagen: "https://argazkiak.barakaldo.eus/wp-content/uploads/A.04.11.010WEB.jpg"
},
{
  titulo: "El Templo del Pueblo",
  acertijo: "Mis campanas han marcado siglos de historia. Soy el corazón espiritual del casco urbano. ¿Qué iglesia soy?",
  respuesta: "Iglesia de San Vicente Mártir",
  latitud: 43.29700,
  longitud: -2.98850,
  radioDesbloqueo: 100,
  desbloqueado: false,
  descripcion: "La Iglesia de San Vicente Mártir es uno de los edificios religiosos más importantes de Barakaldo.",
  imagen: "https://turismo.euskadi.eus/contenidos/h_cultura_y_patrimonio/0000050541_h5_rec_turismo/es_50541/images/sanvicente_H.jpg"
},
{
  titulo: "La Torre del Hospital",
  acertijo: "Desde mis ventanas se ve media comarca. Soy uno de los hospitales más importantes del norte. ¿Qué centro sanitario soy?",
  respuesta: "Hospital de Cruces",
  latitud: 43.28380,
  longitud: -2.98940,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Hospital de Cruces es un referente sanitario en Euskadi y uno de los más grandes de España.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Baracaldo_-_Hospital_de_Cruces_3.JPG"
},
{
  titulo: "El Gigante de las Ferias",
  acertijo: "Congresos, conciertos y ferias internacionales llenan mis pabellones. ¿Qué recinto soy?",
  respuesta: "BEC! Bilbao Exhibition Centre",
  latitud: 43.28740,
  longitud: -2.98990,
  radioDesbloqueo: 250,
  desbloqueado: false,
  descripcion: "El BEC es el mayor recinto ferial de Euskadi y uno de los más importantes de Europa.",
  imagen: "https://bilbaoexhibitioncentre.com/wp-content/uploads/2021/06/fachada-bec.jpg"
},
{
  titulo: "El Mirador del Rontegi",
  acertijo: "No soy puente, pero desde mis orillas lo contemplo. Soy paseo, soy ría, soy horizonte. ¿Qué lugar soy?",
  respuesta: "Paseo de la Ría de Barakaldo",
  latitud: 43.29890,
  longitud: -3.00650,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El paseo de la ría ofrece vistas al Puente de Rontegi y a la zona industrial de Barakaldo.",
  imagen: "https://www.naiz.eus/media/asset_publics/resources/001/226/959/article_main_landscape/0425_azpiegitura_zamalanda.jpg"
},
{
  titulo: "La Plaza del Cruce",
  acertijo: "Soy el corazón de un barrio lleno de vida. Aquí confluyen caminos, historias y generaciones. ¿Qué plaza soy?",
  respuesta: "Plaza de Cruces",
  latitud: 43.28440,
  longitud: -2.98910,
  radioDesbloqueo: 100,
  desbloqueado: false,
  descripcion: "La Plaza de Cruces es uno de los puntos más transitados y emblemáticos del barrio del mismo nombre.",
  imagen: "https://s3.ppllstatics.com/elcorreo/www/multimedia/202108/27/media/cortadas/cruces27-k5sF-U1503488752955iE-1248x770@El%20Correo.jpg"
},
{
  titulo: "El Estadio del Baraka",
  acertijo: "Mis gradas han visto goles, ascensos y tardes de gloria. ¿Qué estadio soy?",
  respuesta: "Estadio de Lasesarre",
  latitud: 43.29670,
  longitud: -2.99570,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "El Estadio de Lasesarre es la casa del Barakaldo CF y uno de los campos más reconocibles de Bizkaia.",
  imagen: "https://covertiaenvolventes.com/wp-content/uploads/2022/07/image56-scaled.jpg"
},
{
  titulo: "El Centro de la Cultura Viva",
  acertijo: "Soy biblioteca, sala de exposiciones y corazón cultural de un barrio entero. ¿Qué centro soy?",
  respuesta: "Casa de Cultura Clara Campoamor",
  latitud: 43.29630,
  longitud: -2.98390,
  radioDesbloqueo: 120,
  desbloqueado: false,
  descripcion: "La Casa de Cultura Clara Campoamor es uno de los espacios culturales más activos de Barakaldo.",
  imagen: "https://www.enbarakaldo.com/asset/thumbnail,1280,720,center,center/media/enbarakaldo/images/2024/04/25/2024042514583438451.jpg"
},
{
  titulo: "El Gigante del Comercio",
  acertijo: "Soy un laberinto de tiendas, ocio y luces. Miles me visitan cada día. ¿Qué centro comercial soy?",
  respuesta: "Max Center",
  latitud: 43.28780,
  longitud: -2.99790,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "Max Center es uno de los centros comerciales más grandes y concurridos de Bizkaia.",
  imagen: "https://www.enbarakaldo.com/media/enbarakaldo/images/2022/12/21/2022122110441349521.jpg"
}
,

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