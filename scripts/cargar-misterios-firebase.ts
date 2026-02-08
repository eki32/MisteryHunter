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
    titulo: "El Guardián de la Alhambra",
    acertijo: "Entre patios de agua y muros de estrellas, busco la torre que al cielo se asoma. Trece son mis hermanas y mi nombre es de vigilancia. ¿Quién soy?",
    respuesta: "Torre de la Vela",
    latitud: 37.1760,
    longitud: -3.5881,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "La majestuosa Alhambra de Granada esconde secretos entre sus palacios nazaríes. Este misterio te llevará a descubrir uno de sus rincones más emblemáticos.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Alhambra_in_the_evening.jpg/1280px-Alhambra_in_the_evening.jpg"
  },
  {
    titulo: "El Secreto de la Sagrada Familia",
    acertijo: "Cuatro torres por fachada, doce apóstoles en total. La más alta toca el cielo, pero aún no está terminada. ¿Cuántas torres tendrá cuando se complete mi catedral soñada?",
    respuesta: "18",
    latitud: 41.4036,
    longitud: 2.1744,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "La obra maestra de Gaudí continúa en construcción después de más de un siglo. Este enigma te desafiará a conocer los secretos de su diseño.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Sagrada_Familia_8-12-21_%281%29.jpg/1280px-Sagrada_Familia_8-12-21_%281%29.jpg"
  },
  {
    titulo: "El Enigma del Acueducto",
    acertijo: "Sin una gota de argamasa, piedra sobre piedra alzada. Romana soy de nacimiento, con arcos que el cielo tocan. Más de cien arcos me sostienen. ¿En qué ciudad me encuentras?",
    respuesta: "Segovia",
    latitud: 40.9480,
    longitud: -4.1177,
    radioDesbloqueo: 80,
    desbloqueado: false,
    descripcion: "Una de las obras de ingeniería romana mejor conservadas del mundo. Sus piedras guardan historias de casi 2000 años.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Acueducto_de_Segovia_02.jpg/1280px-Acueducto_de_Segovia_02.jpg"
  },
  {
    titulo: "La Mezquita de los Arcos",
    acertijo: "Mil columnas de mármol sostienen mi techo, arcos rojos y blancos danzan en mi interior. Primero fui templo romano, luego cristiana catedral, pero mi nombre árabe prevalece. ¿Qué soy?",
    respuesta: "Mezquita de Córdoba",
    latitud: 37.8789,
    longitud: -4.7795,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "Un bosque de columnas y arcos bicolores te espera en esta maravilla arquitectónica que mezcla culturas y religiones.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Mosque-Cathedral_of_C%C3%B3rdoba%2C_Columns.jpg/1280px-Mosque-Cathedral_of_C%C3%B3rdoba%2C_Columns.jpg"
  },
  {
    titulo: "El Camino de las Estrellas",
    acertijo: "Mil años guiando peregrinos, una concha es mi símbolo. Santiago me espera al final del camino. ¿Cuántos kilómetros tiene la ruta francesa desde los Pirineos?",
    respuesta: "800",
    latitud: 42.8805,
    longitud: -8.5447,
    radioDesbloqueo: 150,
    desbloqueado: false,
    descripcion: "La Catedral de Santiago de Compostela marca el fin de uno de los peregrinajes más importantes del mundo cristiano.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Catedral_de_Santiago_de_Compostela_agosto_2018_%28cropped%29.jpg/1280px-Catedral_de_Santiago_de_Compostela_agosto_2018_%28cropped%29.jpg"
  },
  {
    titulo: "El Palacio del Rey Loco",
    acertijo: "Un rey construyó este castillo soñando con Versalles. Jardines con fuentes cantarinas y un palacio de cristal. En tierras segovianas me encuentro. ¿Quién fue mi creador real?",
    respuesta: "Felipe V",
    latitud: 40.8988,
    longitud: -4.0199,
    radioDesbloqueo: 120,
    desbloqueado: false,
    descripcion: "El Palacio Real de La Granja de San Ildefonso es una joya barroca rodeada de jardines espectaculares.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Palacio_Real_de_La_Granja_de_San_Ildefonso_-_Fachada.jpg/1280px-Palacio_Real_de_La_Granja_de_San_Ildefonso_-_Fachada.jpg"
  },
  {
    titulo: "La Torre de Oro",
    acertijo: "A orillas del Guadalquivir me alzo dorada al sol. Almohade es mi origen, vigilante del río soy. Doce lados tiene mi planta. ¿En qué ciudad andaluza me hallo?",
    respuesta: "Sevilla",
    latitud: 37.3826,
    longitud: -5.9963,
    radioDesbloqueo: 70,
    desbloqueado: false,
    descripcion: "Esta torre defensiva del siglo XIII brilla junto al río que fue puerta de las Américas.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Torre_del_Oro%2C_Seville%2C_Spain.jpg/1280px-Torre_del_Oro%2C_Seville%2C_Spain.jpg"
  },
  {
    titulo: "El Monasterio de Piedra",
    acertijo: "Cascadas y grutas en un vergel escondido. Monjes cistercienses cultivaron mi jardín. El río Piedra me da nombre y vida. ¿En qué provincia de Aragón me encuentras?",
    respuesta: "Zaragoza",
    latitud: 41.1944,
    longitud: -1.7878,
    radioDesbloqueo: 150,
    desbloqueado: false,
    descripcion: "Un oasis natural donde el agua esculpe cascadas y grutas en un antiguo monasterio del siglo XII.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Monasterio_de_Piedra_-_Cola_de_Caballo.jpg/1280px-Monasterio_de_Piedra_-_Cola_de_Caballo.jpg"
  },
  {
    titulo: "Las Casas Colgadas",
    acertijo: "Desafiando la gravedad sobre el precipicio estoy. Mi balcón de madera asoma al río Huécar. En la ciudad de las casas imposibles me encuentro. ¿Qué ciudad soy?",
    respuesta: "Cuenca",
    latitud: 40.0789,
    longitud: -2.1324,
    radioDesbloqueo: 80,
    desbloqueado: false,
    descripcion: "Estas casas medievales cuelgan literalmente sobre el acantilado, desafiando las leyes de la física.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Casas_Colgadas_%28Cuenca%29.jpg/1280px-Casas_Colgadas_%28Cuenca%29.jpg"
  },
  {
    titulo: "El Teatro Romano",
    acertijo: "Dos mil años de historia en mis gradas de piedra. Los romanos aquí aplaudían tragedias y comedias. En la ciudad emeritense me levanto orgulloso. ¿Cuántos espectadores cabían en mi graderío?",
    respuesta: "6000",
    latitud: 38.9159,
    longitud: -6.3400,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "El teatro romano de Mérida sigue siendo escenario de representaciones, manteniendo vivo su propósito original.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Teatro_romano_de_M%C3%A9rida.jpg/1280px-Teatro_romano_de_M%C3%A9rida.jpg"
  },
  {
    titulo: "La Ciudad de las Tres Culturas",
    acertijo: "Judíos, cristianos y musulmanes convivieron en mis calles. Un alcázar, una catedral y una sinagoga me adornan. Capital de Castilla fui. ¿Qué ciudad soy?",
    respuesta: "Toledo",
    latitud: 39.8628,
    longitud: -4.0273,
    radioDesbloqueo: 200,
    desbloqueado: false,
    descripcion: "Toledo, la ciudad imperial, conserva el legado de las tres culturas que la hicieron grande.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Panoramic_of_Toledo%2C_Spain_-_Dec_2006.jpg/1280px-Panoramic_of_Toledo%2C_Spain_-_Dec_2006.jpg"
  },
  {
    titulo: "El Palacio de los Leones",
    acertijo: "Doce leones sostienen mi fuente de mármol, bajo un cielo de mocárabes y arcos de encaje. En el corazón de la Alhambra descanso. ¿Cuántos leones me rodean?",
    respuesta: "12",
    latitud: 37.1770,
    longitud: -3.5880,
    radioDesbloqueo: 80,
    desbloqueado: false,
    descripcion: "El Patio de los Leones es la joya de la Alhambra, con su fuente rodeada de esbeltas columnas.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Spain_Andalusia_Granada_BW_2015-10-25_11-26-31.jpg/1280px-Spain_Andalusia_Granada_BW_2015-10-25_11-26-31.jpg"
  },
  {
    titulo: "La Ciudad de las Artes",
    acertijo: "Un arquitecto visionario creó mi ciudad del futuro. Junto al antiguo cauce del Turia me extiendo blanca y azul. Ciencia, ópera y oceanografía albergo. ¿Quién fue mi creador?",
    respuesta: "Calatrava",
    latitud: 39.4545,
    longitud: -0.3490,
    radioDesbloqueo: 200,
    desbloqueado: false,
    descripcion: "La Ciudad de las Artes y las Ciencias de Valencia es un complejo futurista que desafía la imaginación.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Valencia_CdlC.jpg/1280px-Valencia_CdlC.jpg"
  },
  {
    titulo: "El Puente de Hierro",
    acertijo: "Un discípulo de Eiffel me diseñó en metal rojizo. El río Nervión fluye bajo mis vigas. Peatones y trenes cruzan mi estructura gótica. ¿En qué ciudad vasca me encuentro?",
    respuesta: "Bilbao",
    latitud: 43.3230,
    longitud: -2.9749,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "El Puente de Vizcaya es el puente transbordador más antiguo del mundo aún en funcionamiento.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Puente_Colgante%2C_Vizcaya_Bridge.jpg/1280px-Puente_Colgante%2C_Vizcaya_Bridge.jpg"
  },
  {
    titulo: "El Museo del Titanio",
    acertijo: "Mi piel de titanio brilla junto a la ría. Guggenheim es mi nombre, arte contemporáneo mi tesoro. Un perro gigante de flores me cuida. ¿Qué artista creó mi guardián floral?",
    respuesta: "Jeff Koons",
    latitud: 43.2687,
    longitud: -2.9339,
    radioDesbloqueo: 90,
    desbloqueado: false,
    descripcion: "El Museo Guggenheim de Bilbao revolucionó la arquitectura moderna con sus formas imposibles.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bilbao_-_Guggenheim_aurore.jpg/1280px-Bilbao_-_Guggenheim_aurore.jpg"
  },
  {
    titulo: "La Playa de las Catedrales",
    acertijo: "Arcos de piedra tallados por el mar y el tiempo. Cuando la marea baja, un templo natural se revela. En las costas gallegas me encuentro. ¿En qué provincia estoy?",
    respuesta: "Lugo",
    latitud: 43.5497,
    longitud: -7.1561,
    radioDesbloqueo: 120,
    desbloqueado: false,
    descripcion: "Los acantilados de esta playa forman arcos monumentales que recuerdan a una catedral gótica.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Playa_de_las_Catedrales.jpg/1280px-Playa_de_las_Catedrales.jpg"
  },
  {
    titulo: "La Muralla Romana",
    acertijo: "Más de dos kilómetros de muralla romana intacta. Ochenta y cinco torres me defienden. Capital de Galicia soy. ¿Qué ciudad protejo desde hace dos mil años?",
    respuesta: "Lugo",
    latitud: 43.0120,
    longitud: -7.5567,
    radioDesbloqueo: 150,
    desbloqueado: false,
    descripcion: "La Muralla Romana de Lugo es la única en el mundo que conserva todo su perímetro original.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Muralla_de_Lugo%2C_Galicia%2C_Espa%C3%B1a.jpg/1280px-Muralla_de_Lugo%2C_Galicia%2C_Espa%C3%B1a.jpg"
  },
  {
    titulo: "El Parque del Retiro",
    acertijo: "Ciento veinticinco hectáreas de jardines reales. Un palacio de cristal refleja el cielo en mi estanque. En el corazón de Madrid descanso. ¿En qué siglo abrí mis puertas al público?",
    respuesta: "XIX",
    latitud: 40.4153,
    longitud: -3.6844,
    radioDesbloqueo: 300,
    desbloqueado: false,
    descripcion: "El Parque del Retiro es el pulmón verde de Madrid, con monumentos, jardines y el famoso Palacio de Cristal.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Palacio_de_Cristal_-_Parque_del_Retiro%2C_Madrid%2C_Espa%C3%B1a.jpg/1280px-Palacio_de_Cristal_-_Parque_del_Retiro%2C_Madrid%2C_Espa%C3%B1a.jpg"
  },
  {
    titulo: "La Catedral del Mar",
    acertijo: "Piedra sobre piedra levantada por el pueblo llano. Gótica catalana, sin torres gemelas. En el barrio de la Ribera me encuentro. ¿Qué basílica barcelonesa soy?",
    respuesta: "Santa María del Mar",
    latitud: 41.3839,
    longitud: 2.1825,
    radioDesbloqueo: 80,
    desbloqueado: false,
    descripcion: "Esta basílica gótica fue construida en tiempo récord por los habitantes del barrio marinero de Barcelona.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Barcelona_-_Santa_Maria_del_Mar_-_Interior.jpg/1280px-Barcelona_-_Santa_Maria_del_Mar_-_Interior.jpg"
  },
  {
    titulo: "El Acantilado de los Gigantes",
    acertijo: "Paredes verticales de hasta seiscientos metros caen al océano. En la isla de los volcanes me levanto. Los guanches me conocían bien. ¿En qué isla canaria estoy?",
    respuesta: "Tenerife",
    latitud: 28.2439,
    longitud: -16.8393,
    radioDesbloqueo: 150,
    desbloqueado: false,
    descripcion: "Estos impresionantes acantilados en la costa oeste de Tenerife se alzan majestuosos sobre el Atlántico.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Los_Gigantes_Tenerife_2.jpg/1280px-Los_Gigantes_Tenerife_2.jpg"
  },
  {
    titulo: "El Palacio de la Música",
    acertijo: "Un jardín de cristal y hierro forjado alberga conciertos. Modernista catalán, obra de Domènech. Mi sala de conciertos brilla con vidrieras de colores. ¿Qué palacio soy?",
    respuesta: "Palau de la Música Catalana",
    latitud: 41.3875,
    longitud: 2.1754,
    radioDesbloqueo: 70,
    desbloqueado: false,
    descripcion: "Una joya del modernismo catalán donde la música y la arquitectura se fusionan en armonía perfecta.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Palau_de_la_M%C3%BAsica_Catalana_-_Interior_general.jpg/1280px-Palau_de_la_M%C3%BAsica_Catalana_-_Interior_general.jpg"
  },
  {
    titulo: "Las Médulas",
    acertijo: "Montañas rojas esculpidas por la ambición romana. Buscaban oro bajo mi tierra. Castaños centenarios crecen en mis terrazas. ¿En qué provincia leonesa me encuentro?",
    respuesta: "León",
    latitud: 42.4703,
    longitud: -6.7592,
    radioDesbloqueo: 200,
    desbloqueado: false,
    descripcion: "Antiguas minas romanas de oro que transformaron el paisaje en formaciones rojizas espectaculares.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Las_M%C3%A9dulas_-_07.jpg/1280px-Las_M%C3%A9dulas_-_07.jpg"
  },
  {
    titulo: "El Cabo de Gata",
    acertijo: "Tierras volcánicas, playas vírgenes y aguas cristalinas. El desierto más árido de Europa soy. Almería me abraza. ¿Qué parque natural formo?",
    respuesta: "Parque Natural Cabo de Gata-Níjar",
    latitud: 36.7599,
    longitud: -2.1180,
    radioDesbloqueo: 250,
    desbloqueado: false,
    descripcion: "Un paraíso natural donde el desierto se encuentra con el Mediterráneo en paisajes de otro planeta.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Playa_de_los_Genoveses%2C_Cabo_de_Gata%2C_Almer%C3%ADa%2C_Espa%C3%B1a.jpg/1280px-Playa_de_los_Genoveses%2C_Cabo_de_Gata%2C_Almer%C3%ADa%2C_Espa%C3%B1a.jpg"
  },
  {
    titulo: "El Peine del Viento",
    acertijo: "Tres garras de acero se aferran a las rocas del Cantábrico. Chillida me esculpió para dialogar con el mar. En el monte Igueldo termino. ¿En qué ciudad vasca me sitúo?",
    respuesta: "San Sebastián",
    latitud: 43.3139,
    longitud: -2.0003,
    radioDesbloqueo: 80,
    desbloqueado: false,
    descripcion: "Esta escultura icónica de Eduardo Chillida se fusiona con las rocas y el océano en San Sebastián.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Peine_del_Viento_de_Chillida.jpg/1280px-Peine_del_Viento_de_Chillida.jpg"
  },
  {
    titulo: "El Parque de Ordesa",
    acertijo: "Cascadas, cañones y picos de más de tres mil metros. El reino del quebrantahuesos. En los Pirineos aragoneses me extiendo. ¿Qué monte da nombre a mi parque?",
    respuesta: "Monte Perdido",
    latitud: 42.6521,
    longitud: -0.0518,
    radioDesbloqueo: 500,
    desbloqueado: false,
    descripcion: "Uno de los parques nacionales más espectaculares de España, con paisajes alpinos de ensueño.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Valle_de_Ordesa%2C_Parque_Nacional_de_Ordesa_y_Monte_Perdido%2C_Huesca%2C_Espa%C3%B1a.jpg/1280px-Valle_de_Ordesa%2C_Parque_Nacional_de_Ordesa_y_Monte_Perdido%2C_Huesca%2C_Espa%C3%B1a.jpg"
  },
  {
    titulo: "La Universidad Histórica",
    acertijo: "La universidad más antigua de España aún en funcionamiento. Fray Luis de León enseñó entre mis muros dorados. 'Como decíamos ayer' es mi frase célebre. ¿Qué ciudad universitaria soy?",
    respuesta: "Salamanca",
    latitud: 40.9637,
    longitud: -5.6641,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "La Universidad de Salamanca, fundada en 1218, es una de las más antiguas de Europa.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Universidad_de_Salamanca%2C_fachada.jpg/1280px-Universidad_de_Salamanca%2C_fachada.jpg"
  },
  {
    titulo: "El Teide Volcánico",
    acertijo: "La cima más alta de España, un volcán dormido. Más de tres mil setecientos metros sobre el mar. Los guanches me consideraban sagrado. ¿Cuántos metros exactos tengo de altura?",
    respuesta: "3718",
    latitud: 28.2722,
    longitud: -16.6414,
    radioDesbloqueo: 200,
    desbloqueado: false,
    descripcion: "El volcán Teide domina la isla de Tenerife y es el pico más alto de España.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Teide_from_La_Gomera.jpg/1280px-Teide_from_La_Gomera.jpg"
  },
  {
    titulo: "La Lonja de la Seda",
    acertijo: "Columnas helicoidales sostienen mi techo gótico. Mercaderes comerciaban seda bajo mis bóvedas. En Valencia me alzo orgullosa. ¿En qué siglo me construyeron?",
    respuesta: "XV",
    latitud: 39.4745,
    longitud: -0.3783,
    radioDesbloqueo: 70,
    desbloqueado: false,
    descripcion: "Este edificio gótico civil fue el centro del comercio de la seda en el Mediterráneo medieval.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Lonja_de_la_Seda%2C_Valencia%2C_Espa%C3%B1a%2C_2014-06-30%2C_DD_112.JPG/1280px-Lonja_de_la_Seda%2C_Valencia%2C_Espa%C3%B1a%2C_2014-06-30%2C_DD_112.JPG"
  },
  {
    titulo: "Los Picos de Europa",
    acertijo: "Tres macizos de piedra caliza donde viven osos y rebecos. Covadonga y sus lagos me coronan. Entre Asturias, León y Cantabria me extiendo. ¿Qué pico es el más alto?",
    respuesta: "Torre Cerredo",
    latitud: 43.1992,
    longitud: -4.8476,
    radioDesbloqueo: 400,
    desbloqueado: false,
    descripcion: "El primer Parque Nacional de España, con paisajes montañosos de belleza sobrecogedora.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Naranjo_de_Bulnes%2C_Picos_de_Europa%2C_Asturias%2C_Espa%C3%B1a.jpg/1280px-Naranjo_de_Bulnes%2C_Picos_de_Europa%2C_Asturias%2C_Espa%C3%B1a.jpg"
  },
  {
    titulo: "El Acueducto de los Milagros",
    acertijo: "Hermano menor del acueducto segoviano, también romano soy. Ladrillo y granito me componen, del Proserpina traía agua. ¿En qué ciudad emeritense me encuentro?",
    respuesta: "Mérida",
    latitud: 38.9199,
    longitud: -6.3545,
    radioDesbloqueo: 100,
    desbloqueado: false,
    descripcion: "Este acueducto romano se refleja en las aguas del embalse, creando una imagen espectacular.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Acueducto_de_los_Milagros%2C_M%C3%A9rida%2C_Espa%C3%B1a.jpg/1280px-Acueducto_de_los_Milagros%2C_M%C3%A9rida%2C_Espa%C3%B1a.jpg"
  }
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