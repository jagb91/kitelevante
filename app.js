// Algoritmo matemático para calcular el ciclo lunar actual de forma local
function obtenerFaseLunar() {
  const fecha = new Date();
  let y = fecha.getFullYear();
  let m = fecha.getMonth() + 1;
  let d = fecha.getDate();
  
  if (m <= 2) { 
    y--; 
    m += 12; 
  }
  
  let c = 365.25 * y;
  let e = 30.6 * m;
  let jd = c + e + d - 694039.09; 
  jd /= 29.530588853; // Duración del mes sinódico
  
  let b = parseInt(jd); 
  jd -= b; 
  
  let fase = Math.round(jd * 8); 
  if (fase >= 8) fase = 0;

  const fases = [
    { name: "Nueva", icon: "🌑" },
    { name: "Creciente", icon: "🌒" },
    { name: "Cuarto Creciente", icon: "🌓" },
    { name: "Giba Creciente", icon: "🌔" },
    { name: "Llena", icon: "🌕" },
    { name: "Giba Menguante", icon: "🌖" },
    { name: "Cuarto Menguante", icon: "🌗" },
    { name: "Menguante", icon: "🌘" }
  ];
  
  return `Ciclo natural hoy: ${fases[fase].icon} Luna ${fases[fase].name}`;
}

// Inyectar el estado al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('luna-hoy').innerText = obtenerFaseLunar();
});

// Diccionario de coordenadas geográficas de tus spots de navegación
const spots = {
  medano: { lat: 28.0444, lon: -16.5389 },
  tarifa: { lat: 36.0143, lon: -5.6044 },
  loscanos: { lat: 36.1856, lon: -6.0192 },
  rota: { lat: 36.6214, lon: -6.3614 },
  valdelagrana: { lat: 36.5819, lon: -6.2206 },
  puertoreal: { lat: 36.5281, lon: -6.1925 }
};

async function actualizarViento(spotKey) {
  const reporteDiv = document.getElementById('viento-reporte');
  if (!reporteDiv) return;
  
  reporteDiv.innerText = "💨 Midiendo rachas...";
  
  const spot = spots[spotKey];
  // URL oficial optimizada para leer las condiciones "current" de viento
  const url = `https://open-meteo.com{spot.lat}&longitude=${spot.lon}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=knots`;

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Fallo en la red");
    
    const datos = await respuesta.json();
    
    // Validamos que la API devuelva la estructura correcta antes de operar
    if (!datos.current || datos.current.wind_speed_10m === undefined) {
      throw new Error("Datos incompletos");
    }

    const velocidad = Math.round(datos.current.wind_speed_10m);
    let grados = datos.current.wind_direction_10m;
    
    // Conversión matemática robusta de grados a direcciones cardinales
    const direcciones = ["N", "NE", "E", "SE", "S", "SO", "W", "NW"];
    grados = ((grados % 360) + 360) % 360; // Asegura grados positivos
    const indice = Math.round(grados / 45) % 8;
    const direccionText = direcciones[indice];

    // Asignación de etiquetas según la intensidad náutica en nudos
    let estadoKite = "";
    if (velocidad >= 15) {
      estadoKite = "• 🏄‍♂️ ÓPTIMO";
    } else if (velocidad >= 10 && velocidad < 15) {
      estadoKite = "• 🛹 GLASSY / FOIL";
    } else {
      estadoKite = "• ☕ MODO CAFÉ";
    }

    reporteDiv.innerText = `${velocidad} KNTS • DIRECCIÓN: ${direccionText} ${estadoKite}`;

  } catch (error) {
    console.error("Error original:", error);
    reporteDiv.innerText = "❌ ERROR AL LEER EL ANEMÓMETRO";
  }
}

// Inicialización segura del primer spot al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
  actualizarViento('medano');
});
