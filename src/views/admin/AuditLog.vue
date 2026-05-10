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
              <span class="glow-trend" :class="trendCls(tendencias.accesos)">
                <i :class="trendIcon(tendencias.accesos)"></i> {{ trendTxt(tendencias.accesos) }} vs ayer
              </span>
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
              <span class="glow-trend">
                <i class="fas fa-circle pulse-dot"></i> {{ stats.conectadosAhora }} en línea ahora
              </span>
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
              <span class="glow-trend">
                <i class="fas fa-exclamation-triangle"></i> {{ stats.intentosPendientes }} con intentos
              </span>
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
              <span class="glow-trend">
                <i class="fas fa-database"></i> Histórico completo
              </span>
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
                    <span class="text-xs font-monospace text-muted">{{ formatIP(log.ip) }}</span>
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

          <!-- 3 Detail Cards: Acciones Recientes | Intentos Fallidos | Resumen Semanal -->
          <div class="row g-3">
            <!-- Acciones Recientes (timeline) -->
            <div class="col-lg-4">
              <div class="detail-card h-100">
                <div class="detail-card-header">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-stream text-primary me-2"></i>
                    <h6 class="mb-0">Acciones Recientes</h6>
                  </div>
                  <span class="badge bg-gradient-primary">{{ accionesRecientes.length }}</span>
                </div>
                <div class="detail-card-body">
                  <div v-if="accionesRecientes.length === 0" class="empty-state">
                    <i class="fas fa-history"></i>
                    <p class="mb-0">Sin actividad registrada todavía</p>
                  </div>
                  <ul v-else class="timeline">
                    <li v-for="a in accionesRecientes" :key="a.id_auditoria" class="timeline-item">
                      <span class="timeline-dot" :class="'bg-' + getRolColor(a.rol)"></span>
                      <div class="timeline-content">
                        <div class="d-flex justify-content-between align-items-start">
                          <span class="text-xs font-weight-bold text-truncate" style="max-width: 70%;">{{ a.nombres }} {{ a.apellido }}</span>
                          <span class="text-xxs text-muted" :title="formatFecha(a.fecha) + ' ' + formatHora(a.fecha)">{{ haceTiempo(a.fecha) }}</span>
                        </div>
                        <p class="text-xs mb-0 mt-1" style="line-height: 1.3;">
                          <span class="badge badge-sm me-1" :class="getMetodoBadge(a.metodo)" style="font-size: 8px;">{{ a.metodo }}</span>
                          {{ a.accion }}
                        </p>
                        <span class="text-xxs text-muted font-monospace">{{ a.codigo }} · {{ a.rol }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Intentos Fallidos / Bloqueados -->
            <div class="col-lg-4">
              <div class="detail-card h-100" style="border: 1px solid rgba(245,54,92,0.2);">
                <div class="detail-card-header">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle text-danger me-2"></i>
                    <h6 class="mb-0 text-danger">Intentos Fallidos / Bloqueados</h6>
                  </div>
                  <span class="badge bg-gradient-danger">{{ intentosFallidos.length }}</span>
                </div>
                <div class="detail-card-body">
                  <div v-if="intentosFallidos.length === 0" class="empty-state">
                    <i class="fas fa-shield-alt"></i>
                    <p class="mb-0">Todo en orden — sin intentos pendientes</p>
                  </div>
                  <div v-else>
                    <div v-for="u in intentosFallidos" :key="u.id_usuario" class="alert-row">
                      <span class="alert-icon"><i :class="u.estado === 'Bloqueado' ? 'fas fa-lock' : 'fas fa-exclamation-circle'"></i></span>
                      <div class="flex-grow-1 min-width-0">
                        <h6 class="text-sm mb-0 text-truncate">{{ u.nombres }} {{ u.apellido }}</h6>
                        <p class="text-xxs text-muted mb-1">
                          <span class="font-monospace">{{ u.codigo }}</span> ·
                          <span :class="u.estado === 'Bloqueado' ? 'text-danger fw-bold' : 'text-warning fw-bold'">
                            {{ u.estado === 'Bloqueado' ? 'Bloqueado' : `${u.intentos_fallidos} intento(s)` }}
                          </span>
                        </p>
                        <button v-if="u.estado === 'Bloqueado' || u.intentos_fallidos > 0" class="btn btn-xs btn-outline-success me-1" @click="desbloquearUsuario(u)" :disabled="desbloqueandoId === u.id_usuario">
                          <i :class="['fas', desbloqueandoId === u.id_usuario ? 'fa-spinner fa-spin' : 'fa-unlock']" class="me-1"></i>
                          Desbloquear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen Semanal -->
            <div class="col-lg-4">
              <div class="detail-card h-100">
                <div class="detail-card-header">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-chart-line text-primary me-2"></i>
                    <h6 class="mb-0">Resumen Semanal</h6>
                  </div>
                </div>
                <div class="detail-card-body">
                  <div v-if="resumenSemanal.length === 0" class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <p class="mb-0">Sin datos en los últimos 7 días</p>
                  </div>
                  <div v-else>
                    <div v-for="(d, i) in resumenSemanal" :key="i" class="week-row">
                      <div class="d-flex justify-content-between mb-1">
                        <span class="text-xs">{{ formatDiaSemana(d.dia) }}</span>
                        <span class="text-xs font-weight-bold">{{ d.total }} accesos</span>
                      </div>
                      <div class="progress" style="height: 5px;">
                        <div class="progress-bar bg-gradient-primary" :style="{ width: (d.total / maxSemanal * 100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje desbloqueo -->
          <div v-if="msgDesbloqueo" class="alert alert-success alert-sm mt-3 mb-0 d-flex align-items-center" style="padding: 0.6rem 1rem;">
            <i class="fas fa-check-circle me-2"></i>{{ msgDesbloqueo }}
          </div>

          <!-- Últimas Conexiones por Usuario -->
          <div class="row mt-3">
            <div class="col-12">
              <div class="detail-card">
                <div class="detail-card-header">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-history text-info me-2"></i>
                    <h6 class="mb-0">Últimas Conexiones por Usuario</h6>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <input
                      v-model="filtroUltimos"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Buscar por nombre o código..."
                      style="width: 240px;"
                    />
                    <select v-model="filtroRolUltimos" class="form-select form-select-sm" style="width: 150px;">
                      <option value="">Todos los roles</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Docente">Docente</option>
                      <option value="Estudiante">Estudiante</option>
                    </select>
                  </div>
                </div>
                <div class="detail-card-body" style="max-height: 400px;">
                  <div v-if="ultimosAccesosFiltrados.length === 0" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p class="mb-0">No hay usuarios que coincidan con el filtro</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-sm align-items-center mb-0">
                      <thead>
                        <tr>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Usuario</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Rol</th>
                          <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                          <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Última conexión</th>
                          <th class="text-end text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 pe-3">Hace</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="u in ultimosAccesosFiltrados" :key="u.id_usuario">
                          <td class="ps-2">
                            <div class="d-flex align-items-center">
                              <div class="avatar-xs me-2 rounded-circle d-flex align-items-center justify-content-center" :class="'bg-gradient-' + getRolColor(u.rol)">
                                <span class="text-white" style="font-size:9px;font-weight:700;">{{ u.nombres?.charAt(0) || '?' }}</span>
                              </div>
                              <div>
                                <span class="text-xs font-weight-bold d-block">{{ u.nombres }} {{ u.apellido }}</span>
                                <span class="text-xxs text-muted font-monospace">{{ u.codigo }}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge badge-sm" :class="'bg-gradient-' + getRolColor(u.rol)">{{ u.rol }}</span>
                          </td>
                          <td class="text-center">
                            <span class="badge badge-sm" :class="u.estado === 'Activo' ? 'bg-gradient-info' : 'bg-gradient-danger'">{{ u.estado }}</span>
                          </td>
                          <td>
                            <span v-if="u.ultimo_acceso" class="text-xs">
                              {{ formatFecha(u.ultimo_acceso) }} <span class="text-muted">{{ formatHora(u.ultimo_acceso) }}</span>
                            </span>
                            <span v-else class="text-xs text-muted fst-italic">
                              <i class="fas fa-minus-circle me-1"></i>Nunca
                            </span>
                          </td>
                          <td class="text-end pe-3">
                            <span v-if="u.ultimo_acceso" class="text-xxs" :class="haceClase(u.ultimo_acceso)">{{ haceTiempo(u.ultimo_acceso) }}</span>
                            <span v-else class="text-xxs text-muted">—</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
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
import usuarioService from '@/services/usuario.service';

// Tabs
const activeTab = ref('estadisticas');
const tabs = [
  { id: 'estadisticas', label: 'Estadísticas', icon: 'ni ni-chart-bar-32' },
  { id: 'registro', label: 'Registro de Actividad', icon: 'ni ni-bullet-list-67' },
];

// Stats
const stats = ref({
  accesosHoy: 0,
  accesosAyer: 0,
  usuariosActivos: 0,
  conectadosAhora: 0,
  cuentasBloqueadas: 0,
  intentosPendientes: 0,
});
const accesosPorRolData = ref([]);
const accesosPorHoraData = ref([]);
const resumenSemanal = ref([]);
const accionesRecientes = ref([]);
const intentosFallidos = ref([]);
const desbloqueandoId = ref(null);
const msgDesbloqueo = ref('');
const ultimosAccesos = ref([]);
const filtroUltimos = ref('');
const filtroRolUltimos = ref('');

const ultimosAccesosFiltrados = computed(() => {
  let lista = ultimosAccesos.value;
  if (filtroRolUltimos.value) {
    lista = lista.filter(u => u.rol === filtroRolUltimos.value);
  }
  if (filtroUltimos.value) {
    const q = filtroUltimos.value.toLowerCase();
    lista = lista.filter(u =>
      `${u.nombres} ${u.apellido}`.toLowerCase().includes(q) ||
      (u.codigo || '').toLowerCase().includes(q)
    );
  }
  return lista;
});

// Tendencia accesos vs ayer
const tendencias = computed(() => ({
  accesos: stats.value.accesosHoy - stats.value.accesosAyer,
}));

function trendCls(diff) {
  if (diff > 0) return 'trend-up';
  if (diff < 0) return 'trend-down';
  return 'trend-flat';
}
function trendIcon(diff) {
  if (diff > 0) return 'fas fa-arrow-up';
  if (diff < 0) return 'fas fa-arrow-down';
  return 'fas fa-minus';
}
function trendTxt(diff) {
  if (diff === 0) return 'igual';
  return (diff > 0 ? '+' : '') + diff;
}

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
      accesosAyer: data.accesosAyer || 0,
      usuariosActivos: data.usuariosActivos,
      conectadosAhora: data.conectadosAhora || 0,
      cuentasBloqueadas: data.cuentasBloqueadas,
      intentosPendientes: data.intentosPendientes || 0,
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

async function cargarAccionesRecientes() {
  try {
    accionesRecientes.value = await auditoriaService.accionesRecientes();
  } catch (err) {
    console.error('Error cargando acciones recientes:', err);
  }
}

async function cargarIntentosFallidos() {
  try {
    intentosFallidos.value = await auditoriaService.intentosFallidos();
  } catch (err) {
    console.error('Error cargando intentos fallidos:', err);
  }
}

async function cargarUltimosAccesos() {
  try {
    ultimosAccesos.value = await auditoriaService.ultimosAccesos();
  } catch (err) {
    console.error('Error cargando últimos accesos:', err);
  }
}

async function desbloquearUsuario(u) {
  desbloqueandoId.value = u.id_usuario;
  msgDesbloqueo.value = '';
  try {
    await usuarioService.desbloquear(u.id_usuario);
    msgDesbloqueo.value = `${u.nombres} ${u.apellido} desbloqueado correctamente.`;
    await Promise.all([cargarStats(), cargarIntentosFallidos()]);
    setTimeout(() => { msgDesbloqueo.value = ''; }, 4000);
  } catch (err) {
    msgDesbloqueo.value = err.response?.data?.error || 'No se pudo desbloquear el usuario.';
  } finally {
    desbloqueandoId.value = null;
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
        r.metodo || '', r.ruta || '', formatIP(r.ip),
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
      'Método': r.metodo || '', 'IP': formatIP(r.ip), 'Detalles': r.detalles || '',
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

function formatIP(ip) {
  if (!ip) return '—';
  // Loopback: ::1, 127.0.0.1, ::ffff:127.0.0.1
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') return 'localhost';
  // IPv4-mapped IPv6 (::ffff:192.168.x.x) → mostrar solo IPv4
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
}

function haceTiempo(fecha) {
  if (!fecha) return '';
  const ahora = new Date();
  const f = new Date(fecha);
  const segs = Math.floor((ahora - f) / 1000);
  if (segs < 60) return 'hace segundos';
  const mins = Math.floor(segs / 60);
  if (mins < 60) return `hace ${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} d`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `hace ${semanas} sem`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `hace ${meses} m`;
  return `hace ${Math.floor(dias / 365)} a`;
}

function haceClase(fecha) {
  if (!fecha) return 'text-muted';
  const segs = Math.floor((new Date() - new Date(fecha)) / 1000);
  if (segs < 3600) return 'text-success fw-bold';      // < 1h
  if (segs < 86400) return 'text-info fw-bold';        // < 1d
  if (segs < 604800) return 'text-secondary';          // < 1 sem
  return 'text-muted';
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
  cargarAccionesRecientes();
  cargarIntentosFallidos();
  cargarUltimosAccesos();
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
.glow-trend { font-size: 0.65rem; color: rgba(255,255,255,0.85); margin-top: 6px; display: flex; align-items: center; gap: 4px; }
.glow-trend i { font-size: 0.6rem; }
.trend-up i { color: #d1fae5; }
.trend-down i { color: #fecaca; }
.trend-flat i { color: rgba(255,255,255,0.6); }
.pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; color: #34d399; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }

/* Detail cards */
.detail-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 14px; overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.detail-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99, 102, 241, 0.1); }
.detail-card-header {
  padding: 14px 16px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
}
.detail-card-header h6 { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.detail-card-body { padding: 12px 16px; max-height: 300px; overflow-y: auto; }
.alert-row {
  display: flex; align-items: flex-start; padding: 10px;
  background: rgba(245, 54, 92, 0.03); border-radius: 8px;
  margin-bottom: 8px;
}
.alert-row:last-child { margin-bottom: 0; }

/* Timeline */
.timeline {
  list-style: none; padding: 0; margin: 0; position: relative;
}
.timeline::before {
  content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px;
  width: 2px; background: #e2e8f0;
}
.timeline-item {
  position: relative; padding-left: 26px; padding-bottom: 14px;
}
.timeline-item:last-child { padding-bottom: 0; }
.timeline-dot {
  position: absolute; left: 0; top: 4px;
  width: 16px; height: 16px; border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px #e2e8f0;
}
.timeline-dot.bg-primary { background: #5e72e4; }
.timeline-dot.bg-info { background: #11cdef; }
.timeline-dot.bg-success { background: #2dce89; }
.timeline-dot.bg-secondary { background: #94a3b8; }
.timeline-content { font-size: 0.8rem; }
.alert-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(245, 54, 92, 0.1); color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  margin-right: 10px; flex-shrink: 0; font-size: 0.8rem;
}
.btn-xs {
  padding: 0.2rem 0.6rem; font-size: 0.7rem;
  line-height: 1.4; border-radius: 0.4rem;
}
.min-width-0 { min-width: 0; }
.empty-state {
  text-align: center; padding: 24px 16px;
  color: #94a3b8;
}
.empty-state i { font-size: 1.8rem; opacity: 0.3; display: block; margin-bottom: 8px; }
.empty-state p { font-size: 0.8rem; margin: 0; }
.week-row { margin-bottom: 12px; }
.week-row:last-child { margin-bottom: 0; }

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
