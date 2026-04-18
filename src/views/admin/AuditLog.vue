<template>
  <div class="py-4 container-fluid">
    <!-- STATS -->
    <div class="row mb-4 g-3">
      <div class="col-xl-3 col-sm-6">
        <div class="glow-card glow-violet">
          <div class="glow-ring"></div>
          <div class="glow-body">
            <div class="glow-icon"><i class="ni ni-world"></i></div>
            <div class="glow-data">
              <span class="glow-num">{{ stats.accesosHoy }}</span>
              <span class="glow-label">Accesos Hoy</span>
            </div>
          </div>
          <div class="glow-pulse"></div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6">
        <div class="glow-card glow-emerald">
          <div class="glow-ring"></div>
          <div class="glow-body">
            <div class="glow-icon"><i class="ni ni-single-02"></i></div>
            <div class="glow-data">
              <span class="glow-num">{{ stats.usuariosActivos }}</span>
              <span class="glow-label">Activos (24h)</span>
            </div>
          </div>
          <div class="glow-pulse"></div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6">
        <div class="glow-card glow-rose">
          <div class="glow-ring"></div>
          <div class="glow-body">
            <div class="glow-icon"><i class="ni ni-lock-circle-open"></i></div>
            <div class="glow-data">
              <span class="glow-num">{{ stats.cuentasBloqueadas }}</span>
              <span class="glow-label">Bloqueadas</span>
            </div>
          </div>
          <div class="glow-pulse"></div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6">
        <div class="glow-card glow-sky">
          <div class="glow-ring"></div>
          <div class="glow-body">
            <div class="glow-icon"><i class="ni ni-archive-2"></i></div>
            <div class="glow-data">
              <span class="glow-num">{{ totalRegistros }}</span>
              <span class="glow-label">Total Registros</span>
            </div>
          </div>
          <div class="glow-pulse"></div>
        </div>
      </div>
    </div>

    <!-- CARD PRINCIPAL CON TABS -->
    <div class="card shadow-lg border-0">
      <!-- Header -->
      <div class="card-header header-animated d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #1e1b4b, #4338ca, #6366f1); border-radius: 12px 12px 0 0; position: relative; overflow: hidden;">
        <div class="header-particles"></div>
        <div class="d-flex align-items-center" style="position: relative; z-index: 2;">
          <div class="header-icon-box me-3"><i class="ni ni-bullet-list-67"></i></div>
          <div>
            <h5 class="text-white mb-0 font-weight-bold">Auditoría de Accesos</h5>
            <p class="text-white text-sm mb-0" style="opacity: 0.7;">Registro completo de actividad del sistema</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="card-header pb-0 pt-0" style="border-bottom: 2px solid #f1f5f9;">
        <div class="d-flex gap-0">
          <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
            <i :class="tab.icon" class="me-1"></i> {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- TAB: Registro de Actividad -->
      <template v-if="activeTab === 'registro'">
        <!-- Filtros -->
        <div class="card-body pb-0 pt-3">
          <div class="d-flex align-items-end gap-2 flex-wrap">
            <div>
              <label class="form-label text-xs text-uppercase font-weight-bolder opacity-7 mb-1">Desde</label>
              <input v-model="filters.fechaDesde" type="date" class="form-control form-control-sm" @change="aplicarFiltros" />
            </div>
            <div>
              <label class="form-label text-xs text-uppercase font-weight-bolder opacity-7 mb-1">Hasta</label>
              <input v-model="filters.fechaHasta" type="date" class="form-control form-control-sm" @change="aplicarFiltros" />
            </div>
            <div class="flex-grow-1">
              <label class="form-label text-xs text-uppercase font-weight-bolder opacity-7 mb-1">Buscar acción</label>
              <input v-model="filters.accion" type="text" class="form-control form-control-sm" placeholder="Ej: Listar usuarios, Crear..." @input="filtrarConDebounce" />
            </div>
            <button class="btn btn-sm btn-outline-secondary mb-0" @click="limpiarFiltros">
              <i class="fas fa-eraser me-1" style="color: #e74c3c;"></i> Limpiar
            </button>
            <div class="d-flex gap-2 ms-auto">
              <div class="dropdown-export" style="position: relative;">
                <button class="btn btn-sm mb-0" style="background: linear-gradient(135deg, #4338ca, #6366f1); color: #fff;" @click="showExportDropdown = !showExportDropdown">
                  <i class="ni ni-cloud-download-95 me-1"></i> Exportar <i class="ni ni-bold-down ms-1" style="font-size: 0.6rem;"></i>
                </button>
                <div v-if="showExportDropdown" class="export-dropdown">
                  <button class="export-dropdown-item" @click="exportarPDF(); showExportDropdown = false;">
                    <div class="export-dd-icon" style="background: #ef4444;"><i class="ni ni-cloud-download-95"></i></div>
                    <span>Exportar PDF</span>
                  </button>
                  <button class="export-dropdown-item" @click="exportarExcel(); showExportDropdown = false;">
                    <div class="export-dd-icon" style="background: #10b981;"><i class="ni ni-collection"></i></div>
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-primary mb-0" @click="cargarRegistros" :disabled="loading">
                <i :class="['ni ni-curved-next me-1', { 'spin': loading }]"></i> Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="card-body px-0 pt-3 pb-2">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted text-sm">Cargando registros...</p>
          </div>
          <div v-else class="table-responsive p-0">
            <table class="table align-items-center mb-0">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-3">Fecha / Hora</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Usuario</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Acción</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Ruta</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Método</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">IP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in registros" :key="log.id_auditoria">
                  <td class="ps-3">
                    <span class="text-xs font-weight-bold">{{ formatFecha(log.fecha) }}</span>
                    <span class="text-xxs text-muted font-monospace d-block">{{ formatHora(log.fecha) }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-xs me-2 rounded-circle d-flex align-items-center justify-content-center" :class="'bg-gradient-' + getRolColor(log.rol)">
                        <span class="text-white" style="font-size:9px;font-weight:700;">{{ log.nombres?.charAt(0) || '?' }}</span>
                      </div>
                      <div>
                        <span class="text-xs font-weight-bold d-block">{{ log.nombres }} {{ log.apellido }}</span>
                        <span class="text-xxs text-muted font-monospace">{{ log.codigo }} · {{ log.rol }}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="text-sm">{{ log.accion }}</span></td>
                  <td>
                    <p class="text-xs text-muted mb-0 font-monospace" style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ log.ruta }}</p>
                  </td>
                  <td class="align-middle text-center">
                    <span class="badge badge-sm" :class="getMetodoBadge(log.metodo)">{{ log.metodo }}</span>
                  </td>
                  <td class="align-middle text-center">
                    <span class="text-xs font-monospace text-muted">{{ log.ip }}</span>
                  </td>
                </tr>
                <tr v-if="registros.length === 0 && !loading">
                  <td colspan="6" class="text-center py-5">
                    <i class="ni ni-zoom-split-in text-3xl text-muted opacity-5 d-block mb-2"></i>
                    <p class="text-sm text-muted mb-0">No se encontraron registros</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="d-flex justify-content-between align-items-center px-4 py-3 border-top" v-if="totalPages > 1">
            <span class="text-sm text-muted">Página {{ currentPage }} de {{ totalPages }}</span>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li :class="['page-item', { disabled: currentPage === 1 }]">
                  <a class="page-link" href="#" @click.prevent="irPagina(currentPage - 1)"><i class="ni ni-bold-left text-xs"></i></a>
                </li>
                <li v-for="page in visiblePages" :key="page" :class="['page-item', { active: currentPage === page }]">
                  <a class="page-link" href="#" @click.prevent="irPagina(page)">{{ page }}</a>
                </li>
                <li :class="['page-item', { disabled: currentPage === totalPages }]">
                  <a class="page-link" href="#" @click.prevent="irPagina(currentPage + 1)"><i class="ni ni-bold-right text-xs"></i></a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </template>

      <!-- TAB: Estadísticas -->
      <template v-if="activeTab === 'estadisticas'">
        <div class="card-body">
          <div class="row g-4">
            <div class="col-lg-5">
              <h6 class="text-sm mb-3">Accesos por Rol (Hoy)</h6>
              <div class="chart" style="height: 220px;">
                <canvas id="chart-accesos-rol" class="chart-canvas"></canvas>
              </div>
              <div class="mt-3">
                <div v-for="(item, i) in accesosPorRolDisplay" :key="i" class="d-flex align-items-center mb-2">
                  <div class="rounded-circle me-2" :style="{ width: '10px', height: '10px', background: item.color }"></div>
                  <span class="text-sm text-muted flex-grow-1">{{ item.label }}</span>
                  <span class="text-sm font-weight-bold">{{ item.value }}</span>
                </div>
              </div>
            </div>
            <div class="col-lg-7">
              <h6 class="text-sm mb-3">Actividad por Hora (Hoy)</h6>
              <div class="chart" style="height: 220px;">
                <canvas id="chart-accesos-hora" class="chart-canvas"></canvas>
              </div>
            </div>
          </div>
          <hr class="horizontal dark my-4">
          <h6 class="text-sm mb-3">Últimos 7 Días</h6>
          <div class="row">
            <div class="col-lg-8">
              <div v-for="(d, i) in resumenSemanal" :key="i" class="d-flex align-items-center mb-3">
                <span class="text-sm text-muted me-3" style="width: 80px;">{{ formatDiaSemana(d.dia) }}</span>
                <div class="progress flex-grow-1 me-3" style="height: 8px;">
                  <div class="progress-bar bg-gradient-primary" :style="{ width: (d.total / maxSemanal * 100) + '%' }"></div>
                </div>
                <span class="text-sm font-weight-bold" style="width: 40px; text-align: right;">{{ d.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import auditoriaService from '@/services/auditoria.service';

// Tabs
const activeTab = ref('estadisticas');
const tabs = [
  { id: 'estadisticas', label: 'Estadísticas', icon: 'ni ni-chart-bar-32' },
  { id: 'registro', label: 'Registro de Actividad', icon: 'ni ni-bullet-list-67' },
];

// Stats
const stats = ref({ accesosHoy: 0, usuariosActivos: 0, cuentasBloqueadas: 0 });
const accesosPorRolData = ref([]);
const accesosPorHoraData = ref([]);
const resumenSemanal = ref([]);

// Table
const registros = ref([]);
const totalRegistros = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const loading = ref(false);
const perPage = 10;

// Filters
const filters = ref({ fechaDesde: '', fechaHasta: '', accion: '' });

// Export dropdown
const showExportDropdown = ref(false);

// Charts
let chartHora = null;
let chartRol = null;

const maxSemanal = computed(() => {
  const vals = resumenSemanal.value.map(d => d.total);
  return vals.length ? Math.max(...vals) : 1;
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const rolColors = { Administrador: '#8b5cf6', Docente: '#3b82f6', Estudiante: '#10b981' };

const accesosPorRolDisplay = computed(() => {
  return accesosPorRolData.value.map(r => ({
    label: r.rol,
    value: parseInt(r.cantidad),
    color: rolColors[r.rol] || '#94a3b8',
  }));
});

// Render charts cuando se cambia a tab estadísticas
watch(activeTab, async (val) => {
  if (val === 'estadisticas') {
    await nextTick();
    renderCharts();
  }
});

async function cargarStats() {
  try {
    const data = await auditoriaService.estadisticas();
    stats.value = {
      accesosHoy: data.accesosHoy,
      usuariosActivos: data.usuariosActivos,
      cuentasBloqueadas: data.cuentasBloqueadas,
    };
    accesosPorRolData.value = data.accesosPorRol || [];
    accesosPorHoraData.value = data.accesosPorHora || [];
    resumenSemanal.value = (data.resumenSemanal || []).map(r => ({
      dia: r.dia,
      total: parseInt(r.total),
    }));
    await nextTick();
    if (activeTab.value === 'estadisticas') renderCharts();
  } catch (err) {
    console.error('Error cargando stats:', err);
  }
}

async function cargarRegistros() {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: perPage };
    if (filters.value.fechaDesde) params.fechaDesde = filters.value.fechaDesde;
    if (filters.value.fechaHasta) params.fechaHasta = filters.value.fechaHasta + 'T23:59:59';
    if (filters.value.accion) params.accion = filters.value.accion;

    const data = await auditoriaService.listar(params);
    registros.value = data.registros;
    totalRegistros.value = data.total;
    totalPages.value = data.totalPages;
  } catch (err) {
    console.error('Error cargando registros:', err);
  } finally {
    loading.value = false;
  }
}

function irPagina(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  cargarRegistros();
}

let debounceTimer = null;
function filtrarConDebounce() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    cargarRegistros();
  }, 400);
}

function aplicarFiltros() {
  currentPage.value = 1;
  cargarRegistros();
}

function limpiarFiltros() {
  filters.value = { fechaDesde: '', fechaHasta: '', accion: '' };
  currentPage.value = 1;
  cargarRegistros();
}

async function obtenerDatosExportar() {
  const params = {};
  if (filters.value.fechaDesde) params.fechaDesde = filters.value.fechaDesde;
  if (filters.value.fechaHasta) params.fechaHasta = filters.value.fechaHasta;
  if (filters.value.accion) params.accion = filters.value.accion;
  return await auditoriaService.exportarJSON(params);
}

async function exportarPDF() {
  try {
    const datos = await obtenerDatosExportar();
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.setTextColor(30, 27, 75);
    doc.text('MattLearn - Auditoría de Accesos', 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')} · Total: ${datos.length} registros`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [['Fecha', 'Hora', 'Código', 'Usuario', 'Rol', 'Acción', 'Método', 'Ruta', 'IP']],
      body: datos.map(r => [
        formatFecha(r.fecha), formatHora(r.fecha), r.codigo,
        `${r.nombres} ${r.apellido}`, r.rol, r.accion,
        r.metodo || '', r.ruta || '', r.ip || '',
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Error exportando PDF:', err);
  }
}

async function exportarExcel() {
  try {
    const datos = await obtenerDatosExportar();
    const wsData = datos.map(r => ({
      'Fecha': formatFecha(r.fecha), 'Hora': formatHora(r.fecha),
      'Código': r.codigo, 'Nombres': r.nombres, 'Apellido': r.apellido,
      'Rol': r.rol, 'Acción': r.accion, 'Ruta': r.ruta || '',
      'Método': r.metodo || '', 'IP': r.ip || '', 'Detalles': r.detalles || '',
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 16 },
      { wch: 14 }, { wch: 25 }, { wch: 35 }, { wch: 8 }, { wch: 15 }, { wch: 30 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
    XLSX.writeFile(wb, `auditoria_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Error exportando Excel:', err);
  }
}

// Helpers
function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatHora(fecha) {
  return new Date(fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDiaSemana(dia) {
  return new Date(dia).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' });
}
function getRolColor(rol) {
  return { Administrador: 'primary', Docente: 'info', Estudiante: 'success' }[rol] || 'secondary';
}
function getMetodoBadge(metodo) {
  return { GET: 'bg-gradient-info', POST: 'bg-gradient-success', PUT: 'bg-gradient-warning', DELETE: 'bg-gradient-danger' }[metodo] || 'bg-gradient-secondary';
}

// Charts
function renderCharts() {
  const ctx1 = document.getElementById('chart-accesos-hora');
  if (ctx1) {
    if (chartHora) chartHora.destroy();
    const horasData = new Array(24).fill(0);
    accesosPorHoraData.value.forEach(h => { horasData[parseInt(h.hora)] = parseInt(h.cantidad); });
    chartHora = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
        datasets: [{ label: 'Accesos', data: horasData, backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 4, maxBarThickness: 14 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, color: '#8392AB' }, beginAtZero: true },
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#8392AB', maxRotation: 0 } },
        },
      }
    });
  }

  const ctx2 = document.getElementById('chart-accesos-rol');
  if (ctx2 && accesosPorRolData.value.length > 0) {
    if (chartRol) chartRol.destroy();
    chartRol = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: accesosPorRolData.value.map(r => r.rol),
        datasets: [{
          data: accesosPorRolData.value.map(r => parseInt(r.cantidad)),
          backgroundColor: accesosPorRolData.value.map(r => rolColors[r.rol] || '#94a3b8'),
          borderWidth: 0, spacing: 2,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } },
      }
    });
  }
}

onMounted(() => {
  cargarStats();
  cargarRegistros();
});
</script>

<style scoped>
/* Header */
.header-animated { padding: 20px 24px; }
.header-particles {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 60% 30%, rgba(255,255,255,0.25), transparent),
    radial-gradient(2px 2px at 80% 80%, rgba(255,255,255,0.15), transparent);
  animation: float-particles 6s ease-in-out infinite;
}
@keyframes float-particles {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.header-icon-box {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.1rem;
}

/* Tabs */
.tab-btn {
  background: none; border: none; border-bottom: 3px solid transparent;
  padding: 14px 24px; font-size: 0.85rem; font-weight: 600;
  color: #8898aa; cursor: pointer; transition: all 0.3s;
  white-space: nowrap;
}
.tab-btn:hover { color: #4338ca; }
.tab-btn.active {
  color: #4338ca; border-bottom-color: #4338ca;
}

/* Glow Cards */
.glow-card {
  position: relative; border-radius: 18px; padding: 22px 24px;
  overflow: hidden; border: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.glow-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0,0,0,0.18);
}
.glow-violet { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.glow-emerald { background: linear-gradient(135deg, #059669, #34d399); }
.glow-rose { background: linear-gradient(135deg, #dc2626, #f87171); }
.glow-sky { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.glow-ring {
  position: absolute; top: -25px; right: -25px;
  width: 90px; height: 90px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.2);
}
.glow-pulse {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: glowSweep 3s ease-in-out infinite;
}
@keyframes glowSweep {
  0%, 100% { opacity: 0.2; transform: scaleX(0.5); }
  50% { opacity: 0.8; transform: scaleX(1); }
}
.glow-body { position: relative; z-index: 2; display: flex; align-items: center; gap: 16px; }
.glow-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: #fff; flex-shrink: 0;
  background: rgba(255,255,255,0.2); backdrop-filter: blur(6px);
  transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
}
.glow-card:hover .glow-icon { transform: rotateY(180deg); }
.glow-data { display: flex; flex-direction: column; }
.glow-num { font-size: 1.6rem; font-weight: 800; color: #fff; line-height: 1.1; }
.glow-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-top: 2px; }

/* Export Dropdown */
.export-dropdown {
  position: absolute; top: 100%; right: 0; margin-top: 6px;
  background: #fff; border-radius: 12px; padding: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 100;
  min-width: 180px;
  animation: ddIn 0.2s ease-out;
}
@keyframes ddIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.export-dropdown-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 12px; border: none; background: none;
  border-radius: 8px; cursor: pointer; transition: background 0.2s;
  font-size: 0.85rem; font-weight: 500; color: #344767;
}
.export-dropdown-item:hover { background: #f8fafc; }
.export-dd-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.75rem; flex-shrink: 0;
}

/* Table */
.avatar-xs { width: 26px; height: 26px; min-width: 26px; }
.text-xxs { font-size: 0.65rem !important; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Pagination */
.page-item.active .page-link {
  background: linear-gradient(135deg, #4338ca, #6366f1);
  border-color: #4338ca; color: #fff;
}
</style>
