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
  titulo: "El Sendero del Abismo",
  acertijo: "Cuelgo de paredes verticales sobre un desfiladero. Fui considerado el camino más peligroso del mundo. ¿Qué ruta malagueña soy?",
  respuesta: "Caminito del Rey",
  latitud: 36.9149,
  longitud: -4.7849,
  radioDesbloqueo: 250,
  desbloqueado: false,
  descripcion: "El Caminito del Rey es una pasarela suspendida sobre el desfiladero de los Gaitanes, famosa por sus vistas espectaculares.",
  imagen: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2019/09/caminito-del-rey-texto1.jpg"
},
{
  titulo: "El Pueblo Bajo la Roca",
  acertijo: "Mis casas se esconden bajo enormes bloques de piedra. Parezco un refugio natural. ¿Qué pueblo gaditano soy?",
  respuesta: "Setenil de las Bodegas",
  latitud: 36.8642,
  longitud: -5.1817,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "Setenil de las Bodegas es famoso por sus viviendas construidas bajo gigantescas rocas.",
  imagen: "https://bodegasmorosanto.com/wp-content/uploads/2025/01/f46f881a-a1ec-4d00-baea-ab5ae0eea674_16-9-aspect-ratio_default_0.jpg"
},
{
  titulo: "Los Gigantes de Piedra",
  acertijo: "Tres monumentos prehistóricos se alzan en la llanura. Fui declarado Patrimonio de la Humanidad. ¿Qué conjunto arqueológico soy?",
  respuesta: "Dólmenes de Antequera",
  latitud: 37.0244,
  longitud: -4.5631,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "Los Dólmenes de Antequera son uno de los conjuntos megalíticos más importantes de Europa.",
  imagen: "https://lagarganta.com/wp-content/uploads/2019/03/dolmenes-de-antequera-900x600.jpg"
},
{
  titulo: "El Santuario de las Aves",
  acertijo: "Entre marismas, dunas y bosques, soy refugio de miles de especies. ¿Qué parque nacional andaluz soy?",
  respuesta: "Parque Nacional de Doñana",
  latitud: 36.9950,
  longitud: -6.4400,
  radioDesbloqueo: 500,
  desbloqueado: false,
  descripcion: "Doñana es uno de los humedales más importantes de Europa, hogar del lince ibérico.",
  imagen: "https://static-resources-elementor.mirai.com/wp-content/uploads/sites/638/shutterstock_1107116156.jpg"
},
{
  titulo: "La Fortaleza del Mediterráneo",
  acertijo: "Desde mis murallas se domina la bahía. Soy hermana de la Alcazaba de Almería. ¿Qué alcazaba soy?",
  respuesta: "Alcazaba de Málaga",
  latitud: 36.7213,
  longitud: -4.4150,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "La Alcazaba de Málaga es una fortaleza palaciega de época musulmana con vistas al puerto.",
  imagen: "https://cdn-imgix.headout.com/media/images/730f487f14f24aa76980f845ba58ec81-24034-1.5-HourWalkingTourofRomanTheater-AlcazabaCastle-004.jpg"
},
{
  titulo: "El Monasterio de los Reyes",
  acertijo: "Entre viñedos y bosques, guardo tumbas reales y siglos de historia. ¿Qué monasterio catalán soy?",
  respuesta: "Monasterio de Poblet",
  latitud: 41.3814,
  longitud: 1.0883,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Monasterio de Poblet es uno de los conjuntos monásticos cistercienses más importantes de Europa.",
  imagen: "https://saposyprincesas.elmundo.es/assets/2019/04/SantaMariadePoblet.jpg"
},
{
  titulo: "El Lago de los Remeros",
  acertijo: "Soy el lago natural más grande de Cataluña. Mis aguas han visto competiciones internacionales. ¿Qué lago soy?",
  respuesta: "Lago de Banyoles",
  latitud: 42.1167,
  longitud: 2.7647,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "El Lago de Banyoles es un espacio natural emblemático y sede de competiciones de remo.",
  imagen: "https://www.naturaki.com/fotografies/s/94264concurs-estiu-0045-online.jpg"
},
{
  titulo: "El Castillo del Río Ebro",
  acertijo: "Me alzo sobre un meandro del Ebro. Fui bastión templario y mirador natural. ¿Qué castillo soy?",
  respuesta: "Castillo de Miravet",
  latitud: 41.0464,
  longitud: 0.6000,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Castillo de Miravet es una fortaleza templaria situada sobre un acantilado junto al Ebro.",
  imagen: "https://www.turismoextremadura.com/viajar/shared/galerias/rrtt/monumentos/monumento_00088/img/A_CASTILLO-DE-MIRABEL_01.jpg"
},
{
  titulo: "El Puente Medieval",
  acertijo: "Mis arcos de piedra cruzan un río tranquilo. Soy uno de los pueblos medievales mejor conservados de Cataluña. ¿Qué villa soy?",
  respuesta: "Besalú",
  latitud: 42.1980,
  longitud: 2.6990,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "Besalú es famoso por su puente románico y su casco medieval perfectamente conservado.",
  imagen: "https://es.turismegarrotxa.com/img-municipi-3200-1800/besalu-005_001.jpg"
},
{
  titulo: "El Delta del Gran Río",
  acertijo: "Soy un laberinto de arrozales, lagunas y aves. El Mediterráneo me abraza. ¿Qué delta soy?",
  respuesta: "Delta del Ebro",
  latitud: 40.7100,
  longitud: 0.7200,
  radioDesbloqueo: 400,
  desbloqueado: false,
  descripcion: "El Delta del Ebro es uno de los humedales más importantes del Mediterráneo occidental.",
  imagen: "https://www.karinatours.com/media/k2/galleries/11/FLAMENCO%20TOUR%20%20FLAMINGO%20TOUR%20%20DELTA%20DEL%20EBRO%20www.karinatours.com%2013.jpg"
},
{
  titulo: "El Castillo Rojo",
  acertijo: "Mis muros rojizos se alzan sobre un cerro solitario. Soy una de las fortalezas más fotogénicas de Aragón. ¿Qué castillo soy?",
  respuesta: "Castillo de Peracense",
  latitud: 40.6510,
  longitud: -1.3010,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Castillo de Peracense destaca por su color rojizo y su integración con la roca natural.",
  imagen: "https://www.escapadarural.com/blog/wp-content/uploads/castillo-de-peracense-rojo-scaled.jpg"
},
{
  titulo: "El Salto del Paraíso",
  acertijo: "Mis aguas caen en un entorno natural único. Soy destino de senderistas y aventureros. ¿Qué salto soy?",
  respuesta: "Salto de Bierge",
  latitud: 42.1710,
  longitud: -0.0380,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Salto de Bierge es una cascada natural muy popular en la Sierra de Guara.",
  imagen: "https://www.excursionesporhuesca.es/wp-content/uploads/2010/07/Presa-de-Bierge-1.jpg"
},
{
  titulo: "El Castillo del Gran Río",
  acertijo: "Domino la confluencia del Ebro, el Segre y el Cinca. ¿Qué castillo aragonés soy?",
  respuesta: "Castillo de Mequinenza",
  latitud: 41.3740,
  longitud: 0.2980,
  radioDesbloqueo: 250,
  desbloqueado: false,
  descripcion: "El Castillo de Mequinenza es una fortaleza medieval situada en un enclave estratégico.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Mequinenza_Castle.jpg"
},
{
  titulo: "Las Torres de los Gigantes",
  acertijo: "Mis paredes verticales atraen escaladores de todo el mundo. Soy un icono natural de Aragón. ¿Qué formación soy?",
  respuesta: "Mallos de Riglos",
  latitud: 42.3350,
  longitud: -0.7310,
  radioDesbloqueo: 300,
  desbloqueado: false,
  descripcion: "Los Mallos de Riglos son formaciones rocosas de gran altura, famosas por la escalada.",
  imagen: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2023/10/mallos-de-riglos.jpg"
},
{
  titulo: "La Fortaleza del Mediterráneo Valenciano",
  acertijo: "Mis murallas cuentan historias romanas, árabes y medievales. ¿Qué castillo valenciano soy?",
  respuesta: "Castillo de Sagunto",
  latitud: 39.6830,
  longitud: -0.2780,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Castillo de Sagunto domina la ciudad desde lo alto de una colina.",
  imagen: "https://saguntoturismoblog.wordpress.com/wp-content/uploads/2015/02/c.jpg"
},
{
  titulo: "El Coloso del Mediterráneo",
  acertijo: "Soy una roca gigante que emerge del mar. Desde mi cima se ve toda la costa. ¿Qué peñón soy?",
  respuesta: "Peñón de Ifach",
  latitud: 38.6447,
  longitud: -0.0700,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Peñón de Ifach es un parque natural y uno de los símbolos de la Costa Blanca.",
  imagen: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2020/02/Pe%C3%B1%C3%B3n-de-Ifach-1.jpg"
},
{
  titulo: "La Cueva de la Luz",
  acertijo: "Mis bóvedas iluminadas parecen un templo subterráneo. ¿Qué cueva alicantina soy?",
  respuesta: "Cuevas de Canelobre",
  latitud: 38.4680,
  longitud: -0.4150,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "Las Cuevas de Canelobre son famosas por su enorme bóveda y sus formaciones calcáreas.",
  imagen: "https://www.escapadarural.com/blog/wp-content/uploads/cuevas-de-canelobre-scaled.jpg"
},
{
  titulo: "La Fortaleza de los Dos Castillos",
  acertijo: "Mis murallas se extienden por una colina entera. Fui prisión, palacio y bastión. ¿Qué castillo valenciano soy?",
  respuesta: "Castillo de Xàtiva",
  latitud: 38.9900,
  longitud: -0.5180,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Castillo de Xàtiva es una doble fortaleza con vistas espectaculares del valle.",
  imagen: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2022/09/castillo-de-xativa-sc2.jpg"
},
{
  titulo: "El Espejo del Atardecer",
  acertijo: "Mis aguas reflejan el sol como un espejo dorado. Soy hogar de aves y arrozales. ¿Qué lugar soy?",
  respuesta: "Albufera de Valencia",
  latitud: 39.3290,
  longitud: -0.3320,
  radioDesbloqueo: 300,
  desbloqueado: false,
  descripcion: "La Albufera es un gran lago costero rodeado de arrozales y fauna única.",
  imagen: "https://www.barcelo.com/guia-turismo/wp-content/uploads/2019/06/valencia_albufera_888_1.jpg"
},
{
  titulo: "La Catedral de la Luz",
  acertijo: "Mis agujas góticas se elevan hacia el cielo. Soy una de las catedrales más bellas de España. ¿Qué catedral soy?",
  respuesta: "Catedral de Burgos",
  latitud: 42.3409,
  longitud: -3.7058,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "La Catedral de Burgos es Patrimonio de la Humanidad y un icono del gótico español.",
  imagen: "https://www.turismocastillayleon.com/es/patrimonio-cultura/catedral-burgos.ficheros/267476-hq_Catedral%20de%20Burgos02.jpg/h,267476-hq_Catedral%20de%20Burgos02.jpg"
},
{
  titulo: "El Cañón del Silencio",
  acertijo: "Un río serpentea entre paredes de roca donde anidan buitres. ¿Qué paraje natural soy?",
  respuesta: "Hoces del Duratón",
  latitud: 41.3200,
  longitud: -3.8030,
  radioDesbloqueo: 300,
  desbloqueado: false,
  descripcion: "Las Hoces del Duratón son un impresionante cañón fluvial en Segovia.",
  imagen: "https://www.escapadarural.com/blog/wp-content/uploads/2024/10/Segovia-7-1024x678-2.jpg"
},
{
  titulo: "El Castillo del Temple",
  acertijo: "Mis murallas protegieron a los templarios. Soy símbolo del Bierzo. ¿Qué castillo soy?",
  respuesta: "Castillo de Ponferrada",
  latitud: 42.5463,
  longitud: -6.5908,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "El Castillo de Ponferrada es una fortaleza templaria situada en el corazón del Bierzo.",
  imagen: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Castillo_de_los_Templarios_de_Ponferrada.jpg"
},
{
  titulo: "El Pueblo de Piedra",
  acertijo: "Calles empedradas, balcones de madera y tradiciones vivas. Soy uno de los pueblos más bonitos de España. ¿Qué pueblo soy?",
  respuesta: "La Alberca",
  latitud: 40.4890,
  longitud: -6.1110,
  radioDesbloqueo: 150,
  desbloqueado: false,
  descripcion: "La Alberca es un pueblo histórico de Salamanca con arquitectura tradicional serrana.",
  imagen: "https://www.senditur.com/multimedia/uploads/images/Localidades/Espa%C3%B1a/Castilla%20y%20Le%C3%B3n/Salamanca/La%20Alberca/La-Alberca.jpg"
},
{
  titulo: "La Cueva del León",
  acertijo: "Mis estalactitas y ríos subterráneos forman un mundo oculto bajo la montaña. ¿Qué cueva soy?",
  respuesta: "Cueva de Valporquero",
  latitud: 42.8830,
  longitud: -5.5710,
  radioDesbloqueo: 200,
  desbloqueado: false,
  descripcion: "La Cueva de Valporquero es una de las cuevas más espectaculares de Castilla y León.",
  imagen: "https://www.tuscasasrurales.com/blog/wp-content/uploads/2025/09/como-visitar-la-cueva-de-valporquero.jpg"
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