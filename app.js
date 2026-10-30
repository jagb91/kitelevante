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
    if (!respuesta.ok) throw new Error("Fallo en la consulta de red");
    const datos = await respuesta.json();
    
    if (!datos.current || datos.current.wind_speed_10m === undefined) {
      throw new Error("Datos incompletos");
    }

    const velocidad = Math.round(datos.current.wind_speed_10m);
    let grados = datos.current.wind_direction_10m;
    
    // Conversión de grados a direcciones cardinales
    const direcciones = ["N", "NE", "E", "SE", "S", "SO", "W", "NW"];
    grados = ((grados % 360) + 360) % 360;
    const indice = Math.round(grados / 45) % 8;
    const direccionText = direcciones[indice];

    // Asignación de estados dinámicos
    let estadoKite = "";
    if (velocidad >= 15) {
      estadoKite = "• 🏄‍♂️ ÓPTIMO";
    } else if (velocidad >= 10 && velocidad < 15) {
      estadoKite = "• 🛹 FOIL";
    } else {
      estadoKite = "• ☕ MODO CAFÉ";
    }

    reporteDiv.innerText = `${velocidad} KNTS • DIRECCIÓN: ${direccionText} ${estadoKite}`;

  } catch (error) {
    console.error("Error original:", error);
    reporteDiv.innerText = "❌ ERROR AL LEER EL ANEMÓMETRO";
  }
}

// Hacemos que la función sea visible globalmente para el entorno del HTML
window.actualizarViento = actualizarViento;

// Carga inicial segura del primer spot por defecto
window.addEventListener("load", () => {
  actualizarViento('medano');
});
