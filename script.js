// ─── Estado ──────────────────────────────────────
let remanente = 4.0;
let historial = [];
let capacidadMaxima = 4.0; // para la barra de nivel

// ─── DOM ──────────────────────────────────────────
const remanenteEl    = document.getElementById('remanente');
const penFill        = document.getElementById('pen-fill');
const levelPct       = document.getElementById('level-pct');
const tickMax        = document.getElementById('tick-max');
const dosisInput     = document.getElementById('dosis-input');
const btnAplicar     = document.getElementById('btn-aplicar');
const errorMsg       = document.getElementById('error-msg');
const historialLista = document.getElementById('historial-lista');
const capacidadInput = document.getElementById('capacidad-input');
const btnSumarLapiz  = document.getElementById('btn-sumar-lapiz');
const btnBorrarTodo  = document.getElementById('btn-borrar-todo');

// ─── Persistencia ────────────────────────────────
function cargarDatos() {
  const raw = localStorage.getItem('lapizMedicamento');
  if (raw) {
    const datos = JSON.parse(raw);
    remanente        = datos.remanente        ?? 4.0;
    historial        = datos.historial        ?? [];
    capacidadMaxima  = datos.capacidadMaxima  ?? 4.0;
  }
  actualizarUI();
}

function guardarDatos() {
  localStorage.setItem('lapizMedicamento', JSON.stringify({
    remanente,
    historial,
    capacidadMaxima
  }));
}

// ─── UI ───────────────────────────────────────────
function actualizarUI() {
  // Número principal
  remanenteEl.textContent = remanente.toFixed(2);

  // Barra de nivel
  const pct = capacidadMaxima > 0
    ? Math.max(0, Math.min(100, (remanente / capacidadMaxima) * 100))
    : 0;

  penFill.style.width = pct.toFixed(1) + '%';
  levelPct.textContent = Math.round(pct) + '%';
  tickMax.textContent  = capacidadMaxima.toFixed(1) + ' ml';

  // Color de la barra según nivel
  penFill.classList.remove('low', 'medium');
  if (pct <= 20)      penFill.classList.add('low');
  else if (pct <= 50) penFill.classList.add('medium');

  // Color del número según nivel
  if (pct <= 20)      remanenteEl.style.color = 'var(--danger)';
  else if (pct <= 50) remanenteEl.style.color = 'var(--amber)';
  else                remanenteEl.style.color  = 'var(--navy)';

  // Historial
  historialLista.innerHTML = '';

  if (historial.length === 0) {
    historialLista.innerHTML = `
      <div class="historial-empty">
        No hay dosis registradas aún
      </div>`;
    return;
  }

  // Mostrar historial en orden inverso (más reciente primero)
  [...historial].reverse().forEach((item, idx) => {
    const realIdx = historial.length - idx;
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="hist-label">
        <span class="hist-num">Dosis #${realIdx}</span>
        <span class="hist-time">${item.fecha ?? '—'}</span>
      </div>
      <span class="hist-dose">${parseFloat(item.dosis ?? item).toFixed(2)} ml</span>
    `;
    historialLista.appendChild(li);
  });
}

// ─── Helpers ──────────────────────────────────────
function ahoraFormateado() {
  const now = new Date();
  return now.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) +
    ' · ' +
    now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

// ─── Normalizar historial heredado ────────────────
// (por si ya había datos guardados sin timestamp)
function normalizar(item) {
  if (typeof item === 'number') {
    return { dosis: item, fecha: '—' };
  }
  return item;
}

// ─── Eventos ──────────────────────────────────────

// Aplicar dosis
btnAplicar.addEventListener('click', () => {
  const dosis = parseFloat(dosisInput.value);
  errorMsg.textContent = '';

  if (isNaN(dosis) || dosis <= 0) {
    errorMsg.textContent = 'Ingresa una cantidad válida mayor a 0.';
    return;
  }
  if (dosis > remanente) {
    errorMsg.textContent = 'La dosis supera el remanente disponible.';
    return;
  }

  remanente = parseFloat((remanente - dosis).toFixed(4));
  historial.push({ dosis, fecha: ahoraFormateado() });
  dosisInput.value = '';

  guardarDatos();
  actualizarUI();
});

// Sumar nuevo lápiz
btnSumarLapiz.addEventListener('click', () => {
  const nuevaCapacidad = parseFloat(capacidadInput.value);

  if (isNaN(nuevaCapacidad) || nuevaCapacidad <= 0) {
    alert('Ingresa una capacidad válida para el nuevo lápiz.');
    return;
  }

  const nuevaTotal = parseFloat((remanente + nuevaCapacidad).toFixed(4));

  if (confirm(`¿Agregar ${nuevaCapacidad.toFixed(1)} ml?\nNuevo total: ${nuevaTotal.toFixed(2)} ml`)) {
    remanente       = nuevaTotal;
    capacidadMaxima = nuevaTotal; // la nueva capacidad máxima refleja el total
    guardarDatos();
    actualizarUI();
  }
});

// Borrar todo
btnBorrarTodo.addEventListener('click', () => {
  if (confirm('¿Borrar todos los datos? El remanente volverá a 0 y se perderá el historial completo.')) {
    remanente       = 0;
    historial       = [];
    capacidadMaxima = 4.0;
    localStorage.removeItem('lapizMedicamento');
    actualizarUI();
  }
});

// ─── Init ─────────────────────────────────────────
// Normalizar datos viejos al cargar
const raw = localStorage.getItem('lapizMedicamento');
if (raw) {
  const datos = JSON.parse(raw);
  if (datos.historial) {
    datos.historial = datos.historial.map(normalizar);
    localStorage.setItem('lapizMedicamento', JSON.stringify(datos));
  }
}

cargarDatos();
