<template>
  <div class="py-4 container-fluid">
    <!-- WELCOME BANNER -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card bg-gradient-primary">
          <div class="card-body p-4">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <p class="text-white text-sm mb-1 opacity-8">Buenos dias, profesora 👋</p>
                <h4 class="text-white font-weight-bold mb-1">{{ riskStudents }} estudiantes requieren atencion</h4>
                <p class="text-white text-sm opacity-8 mb-3">El promedio del aula subio a {{ aulaAvg }} (+7.5 vs pretest)</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-white mb-0">
                    <i class="ni ni-chart-bar-32 me-1"></i> Ver reportes
                  </button>
                  <button class="btn btn-sm btn-outline-white mb-0">
                    <i class="ni ni-single-copy-04 me-1"></i> Programar evaluacion
                  </button>
                </div>
              </div>
              <div class="col-lg-4 text-end d-none d-lg-block">
                <img :src="teacherImg" alt="Docente" style="max-height: 180px; margin-top: -40px; margin-bottom: -40px;" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STATS ROW -->
    <div class="row mb-4">
      <div v-for="(stat, i) in stats" :key="i" class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-uppercase font-weight-bold text-muted">{{ stat.label }}</p>
                  <h5 class="font-weight-bolder mb-0">{{ stat.value }}</h5>
                  <p class="mb-0 text-sm">
                    <span :class="stat.up ? 'text-success' : 'text-danger'" class="font-weight-bold">{{ stat.up ? '▲' : '▼' }}</span>
                    <span class="text-muted ms-1">{{ stat.delta }}</span>
                  </p>
                </div>
              </div>
              <div class="col-4 text-end">
                <div :class="`icon icon-shape bg-gradient-${stat.color} shadow-${stat.color} text-center border-radius-xl`">
                  <i :class="`ni ${stat.icon} text-lg opacity-10`" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="row">
      <div class="col-lg-8">
        <!-- Chart -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-0">Evolucion del Promedio del Aula</h6>
                <p class="text-sm text-muted mb-0">Pretest - Postest · 1°A Matematica</p>
              </div>
              <span class="badge bg-gradient-primary">+84.2%</span>
            </div>
          </div>
          <div class="card-body p-3">
            <div class="chart">
              <canvas id="chart-aula" class="chart-canvas" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Rendimiento de Estudiantes</h6>
              <div>
                <span class="badge bg-gradient-success me-1">30 aprobados</span>
                <span class="badge bg-gradient-danger">2 en riesgo</span>
              </div>
            </div>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estudiante</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Promedio</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Participacion</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tendencia</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(st, i) in students" :key="i">
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div :class="`avatar avatar-sm me-3 bg-gradient-${st.risk ? 'danger' : 'success'} border-radius-lg`">
                          <span class="text-white text-xs font-weight-bold" style="line-height:36px;">{{ st.name.charAt(0) }}</span>
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">{{ st.name }}</h6>
                          <p class="text-xs text-muted mb-0">{{ st.code }}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="st.risk ? 'text-danger' : 'text-success'" class="font-weight-bold text-sm">{{ st.avg }}</span>
                      <span class="text-xs text-muted">/20</span>
                    </td>
                    <td class="align-middle text-center">
                      <div class="progress-wrapper w-75 mx-auto">
                        <div class="progress" style="height: 6px;">
                          <div
                            :class="`progress-bar bg-gradient-${st.participation >= 70 ? 'success' : st.participation >= 50 ? 'warning' : 'danger'}`"
                            :style="{ width: st.participation + '%' }"
                          ></div>
                        </div>
                        <span class="text-xs text-muted">{{ st.participation }}%</span>
                      </div>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-sm font-weight-bold" :class="st.trend === 'up' ? 'text-success' : st.trend === 'down' ? 'text-danger' : 'text-muted'">
                        {{ st.trend === 'up' ? '▲ Subiendo' : st.trend === 'down' ? '▼ Bajando' : '— Estable' }}
                      </span>
                    </td>
                    <td class="align-middle text-center">
                      <span v-if="st.risk" class="badge badge-sm bg-gradient-danger">RIESGO</span>
                      <span v-else class="badge badge-sm bg-gradient-success">Normal</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-center py-3">
              <button class="btn btn-sm btn-outline-primary mb-0">Ver los 32 estudiantes</button>
            </div>
          </div>
        </div>

        <!-- Rendimiento por Tema -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Rendimiento por Tema</h6>
          </div>
          <div class="card-body p-3">
            <div v-for="(t, i) in topThemes" :key="i" class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-sm">{{ t.name }}</span>
                <span class="text-sm font-weight-bold">{{ t.avg }}/20</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div
                  :class="`progress-bar bg-gradient-${t.avg >= 16 ? 'success' : t.avg >= 13 ? 'warning' : 'danger'}`"
                  :style="{ width: (t.avg / 20 * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="col-lg-4">
        <!-- Evaluaciones programadas -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Evaluaciones Programadas</h6>
          </div>
          <div class="card-body p-3">
            <div v-for="(ev, i) in evalsProgramadas" :key="i" class="d-flex align-items-center mb-3">
              <div :class="`icon icon-shape icon-sm me-3 bg-gradient-${ev.done ? 'success' : 'warning'} shadow text-center border-radius-xl`">
                <i :class="`ni ${ev.done ? 'ni-check-bold' : 'ni-calendar-grid-61'} text-white opacity-10`" style="line-height:32px;"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="text-sm mb-0">{{ ev.tema }}</h6>
                <p class="text-xs text-muted mb-0">{{ ev.done ? `${ev.completed}/32 completaron` : `Fecha: ${ev.day}/${ev.month}` }}</p>
              </div>
              <span :class="`badge badge-sm bg-gradient-${ev.done ? 'success' : 'warning'}`">
                {{ ev.done ? 'Listo' : 'Pendiente' }}
              </span>
            </div>
            <button class="btn btn-sm bg-gradient-primary w-100 mb-0 mt-2">
              <i class="ni ni-fat-add me-1"></i> Programar nueva evaluacion
            </button>
          </div>
        </div>

        <!-- Acciones Rapidas -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Acciones Rapidas</h6>
          </div>
          <div class="card-body p-3">
            <div class="row">
              <div v-for="(action, i) in quickActions" :key="i" class="col-6 mb-2">
                <button class="btn btn-outline-primary btn-sm w-100 mb-0">
                  <i :class="`ni ${action.icon} d-block mb-1`" style="font-size: 1.2rem;"></i>
                  <span class="text-xs">{{ action.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Alertas de Riesgo -->
        <div class="card border border-danger">
          <div class="card-header pb-0">
            <h6 class="text-danger mb-0">Alertas de Riesgo Academico</h6>
          </div>
          <div class="card-body p-3">
            <div v-for="(alert, i) in alerts" :key="i" class="d-flex align-items-start mb-3 p-3 border-radius-lg" style="background: rgba(245,54,92,0.06);">
              <div class="icon icon-shape icon-sm me-3 bg-gradient-danger shadow text-center border-radius-xl flex-shrink-0">
                <i class="ni ni-bell-55 text-white opacity-10" style="line-height:32px;"></i>
              </div>
              <div>
                <h6 class="text-danger text-sm mb-0">{{ alert.name }}</h6>
                <p class="text-xs text-muted mb-1">{{ alert.detail }}</p>
                <a href="#" class="text-primary text-xs font-weight-bold">Ver estrategia de intervencion</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Chart from 'chart.js/auto'
import teacherImg from '@/assets/img/Docente.png'

const aulaAvg = '16.4'
const riskStudents = 2

const stats = [
  { label: 'Estudiantes', value: '32', delta: '1°A Matematica', up: true, icon: 'ni-hat-3', color: 'info' },
  { label: 'Promedio Aula', value: '16.4', delta: '+7.5 vs pretest', up: true, icon: 'ni-chart-bar-32', color: 'success' },
  { label: 'Eval. Pendientes', value: '2', delta: 'Estadistica y Prob.', up: false, icon: 'ni-single-copy-04', color: 'warning' },
  { label: 'En Riesgo', value: '2', delta: 'Requieren atencion', up: false, icon: 'ni-bell-55', color: 'danger' },
]

const students = [
  { name: 'Valentina Quispe Rojas', code: 'A25748291', avg: 18.5, trend: 'up', risk: false, participation: 95 },
  { name: 'Lesly Sanchez Vera', code: 'A25719664', avg: 17.8, trend: 'up', risk: false, participation: 85 },
  { name: 'Adriana Quijano S.', code: 'A25513883', avg: 17.1, trend: 'up', risk: false, participation: 88 },
  { name: 'Sebastian Torres M.', code: 'A25637291', avg: 16.2, trend: 'up', risk: false, participation: 78 },
  { name: 'Camila Huaman Flores', code: 'A25482910', avg: 15.8, trend: 'stable', risk: false, participation: 72 },
  { name: 'Mateo Condori Paredes', code: 'A25391047', avg: 10.2, trend: 'down', risk: true, participation: 35 },
  { name: 'Nicolas Pacheco Vega', code: 'A25284719', avg: 11.5, trend: 'down', risk: true, participation: 40 },
]

const topThemes = [
  { name: 'Proporcionalidad', avg: 17.8 },
  { name: 'Areas y perimetros', avg: 17.2 },
  { name: 'Numeros enteros', avg: 16.5 },
  { name: 'Fracciones y decimales', avg: 15.9 },
  { name: 'Geometria basica', avg: 15.4 },
  { name: 'Ecuaciones lineales', avg: 13.1 },
]

const evalsProgramadas = [
  { tema: 'Areas y perimetros', day: '25', month: 'Mar', done: true, completed: 30 },
  { tema: 'Estadistica descriptiva', day: '28', month: 'Mar', done: false, completed: 0 },
  { tema: 'Probabilidad', day: '30', month: 'Mar', done: false, completed: 0 },
]

const quickActions = [
  { icon: 'ni-single-copy-04', label: 'Nueva evaluacion' },
  { icon: 'ni-chart-pie-35', label: 'Generar reporte' },
  { icon: 'ni-cloud-upload-96', label: 'Subir material' },
  { icon: 'ni-chat-round', label: 'Retroalimentar' },
]

const alerts = [
  { name: 'Mateo Condori Paredes', detail: 'Promedio 10.2 · Participacion 35% · Tendencia descendente' },
  { name: 'Nicolas Pacheco Vega', detail: 'Promedio 11.5 · Participacion 40% · No ingresa hace 5 dias' },
]

onMounted(() => {
  const ctx = document.getElementById('chart-aula')
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Pre', 'Sem 2', 'Sem 4', 'Sem 6', 'Sem 8', 'Sem 10', 'Post'],
        datasets: [{
          label: 'Promedio Aula',
          data: [8.9, 10.2, 12.5, 14.1, 15.3, 16.0, 16.4],
          tension: 0.4, borderWidth: 3, pointRadius: 5,
          pointBackgroundColor: '#5e72e4', borderColor: '#5e72e4',
          backgroundColor: 'rgba(94, 114, 228, 0.1)', fill: true,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { drawBorder: false, color: 'rgba(0,0,0,0.05)' }, ticks: { padding: 10, font: { size: 11 }, color: '#8392AB' }, min: 0, max: 20 },
          x: { grid: { drawBorder: false, display: false }, ticks: { font: { size: 11 }, color: '#8392AB' } }
        }
      }
    })
  }
})
</script>

<style scoped lang="scss">
.avatar-sm {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
}
.gap-2 { gap: 0.5rem; }
</style>
