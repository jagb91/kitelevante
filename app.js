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
  const url = `https://open-meteo.com{spot.lat}&longitude=${spot.lon}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=knots`;

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Fallo de red");
    const datos = await respuesta.json();
    
    if (!datos.current) throw new Error("Datos incompletos");

    const velocidad = Math.round(datos.current.wind_speed_10m);
    let grados = datos.current.wind_direction_10m;
    
    const direcciones = ["N", "NE", "E", "SE", "S", "SO", "W", "NW"];
    grados = ((grados % 360) + 360) % 360;
    const indice = Math.round(grados / 45) % 8;
    
    let estadoKite = velocidad >= 15 ? "• 🏄‍♂️ ÓPTIMO" : (velocidad >= 10 ? "• 🛹 FOIL" : "• ☕ MODO CAFÉ");
    reporteDiv.innerText = `${velocidad} KNTS • DIRECCIÓN: ${direcciones[indice]} ${estadoKite}`;
  } catch (e) {
    reporteDiv.innerText = "❌ ERROR AL LEER EL ANEMÓMETRO";
  }
}

// Vinculación global segura en modo modular externo
window.onload = () => {
  actualizarViento('medano');
};
