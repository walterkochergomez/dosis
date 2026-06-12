// ─── Estado ──────────────────────────────────────
let historialPeso = [];
let chartInstance = null;

// ─── DOM ──────────────────────────────────────────
const pesoInput     = document.getElementById('peso-input');
const btnAplicarPeso= document.getElementById('btn-aplicar-peso');
const errorMsgPeso  = document.getElementById('error-msg-peso');
const historialLista= document.getElementById('historial-peso-lista');
const btnBorrarPesos= document.getElementById('btn-borrar-pesos');
const ctx           = document.getElementById('pesoChart').getContext('2d');

// ─── Persistencia ────────────────────────────────
function cargarDatos() {
  const raw = localStorage.getItem('lapizPeso');
  if (raw) {
    historialPeso = JSON.parse(raw);
  }
  actualizarUI();
}

function guardarDatos() {
  localStorage.setItem('lapizPeso', JSON.stringify(historialPeso));
}

// ─── Gráfico ──────────────────────────────────────
function inicializarGrafico() {
  // Configuración de colores basados en tu CSS
  const colorMint = '#00BFA5';
  const colorMintLight = 'rgba(0, 191, 165, 0.2)';
  const colorNavy = '#1B2D4F';
  const colorGrid = '#E2E8F0';

  const fechas = historialPeso.map(item => item.fechaCortada);
  const pesos = historialPeso.map(item => item.peso);

  if (chartInstance) {
    chartInstance.destroy(); // Destruir instancia anterior si existe
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Peso (kg)',
        data: pesos,
        borderColor: colorMint,
        backgroundColor: colorMintLight,
        pointBackgroundColor: colorNavy,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colorNavy,
        borderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.3 // Hace que la curva sea suave
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colorNavy,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) { return context.parsed.y + ' kg'; }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: "'Inter', sans-serif" } }
        },
        y: {
          grid: { color: colorGrid },
          ticks: { font: { family: "'Inter', sans-serif" } },
          // Sugerir un rango para que el gráfico no se vea plano
          suggestedMin: pesos.length ? Math.min(...pesos) - 2 : 0,
          suggestedMax: pesos.length ? Math.max(...pesos) + 2 : 100
        }
      }
    }
  });
}

// ─── UI ───────────────────────────────────────────
function actualizarUI() {
  // Actualizar historial
  historialLista.innerHTML = '';

  if (historialPeso.length === 0) {
    historialLista.innerHTML = `
      <div class="historial-empty">
        Aún no hay pesos registrados
      </div>`;
    // Gráfico vacío
    inicializarGrafico();
    return;
  }

  // Renderizar historial (más reciente primero)
  [...historialPeso].reverse().forEach((item, idx) => {
    const realIdx = historialPeso.length - idx;
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="hist-label">
        <span class="hist-num">Registro #${realIdx}</span>
        <span class="hist-time">${item.fechaCompleta}</span>
      </div>
      <span class="hist-dose">${item.peso.toFixed(1)} kg</span>
    `;
    historialLista.appendChild(li);
  });

  // Renderizar Gráfico
  inicializarGrafico();
}

// ─── Helpers ──────────────────────────────────────
function obtenerFechasFormateadas() {
  const now = new Date();
  const fechaCompleta = now.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) + ' · ' + now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const fechaCortada = now.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }); // Para el gráfico
  return { fechaCompleta, fechaCortada };
}

// ─── Eventos ──────────────────────────────────────
btnAplicarPeso.addEventListener('click', () => {
  const peso = parseFloat(pesoInput.value);
  errorMsgPeso.textContent = '';

  if (isNaN(peso) || peso <= 10) {
    errorMsgPeso.textContent = 'Ingresa un peso válido.';
    return;
  }

  const { fechaCompleta, fechaCortada } = obtenerFechasFormateadas();

  historialPeso.push({ 
    peso: parseFloat(peso.toFixed(2)), 
    fechaCompleta, 
    fechaCortada 
  });
  
  pesoInput.value = '';
  
  guardarDatos();
  actualizarUI();
});

btnBorrarPesos.addEventListener('click', () => {
  if (confirm('¿Borrar todo el historial de peso? Esta acción no se puede deshacer.')) {
    historialPeso = [];
    localStorage.removeItem('lapizPeso');
    actualizarUI();
  }
});

// ─── Init ─────────────────────────────────────────
cargarDatos();
