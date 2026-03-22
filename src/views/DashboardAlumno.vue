<template>
  <div class="py-4 container-fluid">
    <!-- WELCOME BANNER -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card bg-gradient-success">
          <div class="card-body p-4">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <p class="text-white text-sm mb-1 opacity-8">¡Hola de nuevo, {{ studentName }}! 🎉</p>
                <h4 class="text-white font-weight-bold mb-1">Tienes {{ pendingEvals }} evaluaciones pendientes</h4>
                <p class="text-white text-sm opacity-8 mb-3">Tu promedio actual es {{ avgGeneral }} — ¡vas excelente!</p>
                <button class="btn btn-sm btn-white mb-0" @click="$router.push('/evaluaciones/pendientes')">
                  <i class="ni ni-single-copy-04 me-1"></i> Ir a evaluaciones
                </button>
              </div>
              <div class="col-lg-4 text-end d-none d-lg-block">
                <img :src="studentImg" alt="Estudiante" style="max-height: 180px; margin-top: -40px; margin-bottom: -40px;" />
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
                    <span :class="stat.up ? 'text-success' : 'text-danger'" class="font-weight-bold">
                      {{ stat.up ? '▲' : '▼' }}
                    </span>
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
      <!-- LEFT: Chart + Evaluaciones -->
      <div class="col-lg-8">
        <!-- Progress Chart -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-0">Mi Progreso Academico</h6>
                <p class="text-sm text-muted mb-0">Evolucion de mi promedio por evaluacion</p>
              </div>
              <span class="badge bg-gradient-success">+{{ deltaProgress }}% vs inicio</span>
            </div>
          </div>
          <div class="card-body p-3">
            <div class="chart">
              <canvas id="chart-progress" class="chart-canvas" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- Evaluaciones Table -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Mis Evaluaciones</h6>
              <span class="text-sm text-muted">{{ completedEvals }}/{{ totalEvals }} completadas</span>
            </div>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tema</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Nota</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Progreso</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ev, i) in evaluaciones" :key="i">
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div :class="`icon icon-shape icon-sm me-3 bg-gradient-${ev.nota === null ? 'warning' : ev.nota >= 17 ? 'success' : ev.nota >= 14 ? 'warning' : 'danger'} shadow text-center border-radius-xl`">
                          <i class="ni ni-single-copy-04 text-white opacity-10" style="line-height:32px;"></i>
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">{{ ev.tema }}</h6>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="font-weight-bold text-sm">{{ ev.nota !== null ? `${ev.nota}/${ev.max}` : '—' }}</span>
                    </td>
                    <td class="align-middle text-center">
                      <div v-if="ev.nota !== null" class="progress-wrapper w-75 mx-auto">
                        <div class="progress" style="height: 6px;">
                          <div
                            :class="`progress-bar bg-gradient-${ev.nota >= 17 ? 'success' : ev.nota >= 14 ? 'warning' : 'danger'}`"
                            role="progressbar"
                            :style="{ width: (ev.nota / ev.max * 100) + '%' }"
                          ></div>
                        </div>
                      </div>
                      <span v-else class="text-xs text-muted">Sin realizar</span>
                    </td>
                    <td class="align-middle text-center text-sm">
                      <span :class="`badge badge-sm bg-gradient-${ev.nota !== null ? 'success' : 'warning'}`">
                        {{ ev.nota !== null ? 'Completada' : 'Pendiente' }}
                      </span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">{{ ev.fecha }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Fortalezas y Debilidades -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header pb-0">
                <h6 class="mb-0">Fortalezas</h6>
              </div>
              <div class="card-body p-3">
                <div v-for="(f, i) in fortalezas" :key="i" class="d-flex align-items-center mb-3 p-3 bg-gradient-success border-radius-lg" style="--bs-bg-opacity: .08;">
                  <span class="me-3 fs-5">🏆</span>
                  <div>
                    <h6 class="text-success text-sm mb-0">{{ f.tema }}</h6>
                    <p class="text-xs text-muted mb-0">Nota: {{ f.nota }}/20 — {{ f.msg }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header pb-0">
                <h6 class="mb-0">Por Mejorar</h6>
              </div>
              <div class="card-body p-3">
                <div v-for="(d, i) in debilidades" :key="i" class="d-flex align-items-center mb-3 p-3 bg-gradient-danger border-radius-lg" style="--bs-bg-opacity: .08;">
                  <span class="me-3 fs-5">📚</span>
                  <div>
                    <h6 class="text-danger text-sm mb-0">{{ d.tema }}</h6>
                    <p class="text-xs text-muted mb-0">Nota: {{ d.nota }}/20 — {{ d.msg }}</p>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline-primary w-100 mb-0 mt-2">
                  Ver materiales recomendados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="col-lg-4">
        <!-- Racha -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Mi Racha</h6>
          </div>
          <div class="card-body p-3">
            <div class="d-flex justify-content-between">
              <div
                v-for="(d, i) in weekDays"
                :key="i"
                :class="[
                  'text-center rounded-3 p-2 flex-fill mx-1',
                  i < streakDays ? 'bg-gradient-success text-white' : 'bg-light text-muted'
                ]"
                style="min-width: 36px;"
              >
                <small class="font-weight-bold">{{ d }}</small>
              </div>
            </div>
            <p class="text-sm text-muted mt-3 mb-0">{{ streakDays }} dias consecutivos - ¡Tu mejor racha! 🎉</p>
          </div>
        </div>

        <!-- Perfil IA -->
        <div class="card mb-4 bg-gradient-dark">
          <div class="card-body p-3">
            <h6 class="text-white mb-1">Mi Perfil IA</h6>
            <p class="text-white text-xs opacity-7 mb-3">Tus preferencias personalizan las preguntas</p>
            <div class="d-flex flex-wrap gap-2">
              <span v-for="(tag, i) in iaTags" :key="i" class="badge bg-white text-dark font-weight-normal">
                {{ tag }}
              </span>
            </div>
            <button class="btn btn-sm btn-outline-white w-100 mt-3 mb-0">
              Editar preferencias
            </button>
          </div>
        </div>

        <!-- Recursos Recomendados -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Recursos Recomendados</h6>
          </div>
          <div class="card-body p-3">
            <ul class="list-group">
              <li v-for="(r, i) in recursos" :key="i" class="list-group-item border-0 d-flex align-items-center px-0 py-2">
                <div :class="`icon icon-shape icon-sm me-3 bg-gradient-${r.type === 'video' ? 'danger' : r.type === 'pdf' ? 'info' : 'warning'} shadow text-center border-radius-xl`">
                  <i :class="`ni ${r.type === 'video' ? 'ni-button-play' : r.type === 'pdf' ? 'ni-single-copy-04' : 'ni-trophy'} text-white opacity-10`" style="line-height:32px;"></i>
                </div>
                <div class="d-flex flex-column">
                  <h6 class="mb-0 text-sm">{{ r.title }}</h6>
                  <p class="text-xs text-muted mb-0">{{ r.tema }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Proximas evaluaciones -->
        <div class="card">
          <div class="card-header pb-0">
            <h6 class="mb-0">Proximas Evaluaciones</h6>
          </div>
          <div class="card-body p-3">
            <div v-for="(ev, i) in pendingList" :key="i" class="timeline-block mb-3">
              <div class="d-flex align-items-center">
                <div class="icon icon-shape icon-sm bg-gradient-warning shadow text-center border-radius-xl me-3">
                  <i class="ni ni-calendar-grid-61 text-white opacity-10" style="line-height:32px;"></i>
                </div>
                <div>
                  <h6 class="text-sm mb-0">{{ ev.tema }}</h6>
                  <p class="text-xs text-muted mb-0">Vence: {{ ev.fecha }} · {{ ev.max }} pts</p>
                </div>
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
import studentImg from '@/assets/img/Alumna.png'

const studentName = 'Lesly'
const avgGeneral = '17.8'
const pendingEvals = 2
const completedEvals = 6
const totalEvals = 8
const deltaProgress = '100'
const streakDays = 5
const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const stats = [
  { label: 'Promedio General', value: '17.8', delta: '+8.9 vs inicio', up: true, icon: 'ni-trophy', color: 'success' },
  { label: 'Evaluaciones', value: '6/8', delta: '2 pendientes', up: true, icon: 'ni-single-copy-04', color: 'info' },
  { label: 'Participacion', value: '85%', delta: '+48% vs inicio', up: true, icon: 'ni-like-2', color: 'primary' },
  { label: 'Racha', value: '5 dias', delta: '¡Tu mejor racha!', up: true, icon: 'ni-spaceship', color: 'warning' },
]

const evaluaciones = [
  { tema: 'Numeros enteros', nota: 18, max: 20, fecha: '03/11/24' },
  { tema: 'Fracciones y decimales', nota: 17, max: 20, fecha: '08/12/24' },
  { tema: 'Proporcionalidad', nota: 19, max: 20, fecha: '12/01/25' },
  { tema: 'Ecuaciones lineales', nota: 16, max: 20, fecha: '17/02/25' },
  { tema: 'Geometria basica', nota: 18, max: 20, fecha: '22/02/25' },
  { tema: 'Areas y perimetros', nota: 19, max: 20, fecha: '25/03/25' },
  { tema: 'Estadistica descriptiva', nota: null, max: 20, fecha: '28/03/25' },
  { tema: 'Probabilidad', nota: null, max: 20, fecha: '30/03/25' },
]

const pendingList = evaluaciones.filter(e => e.nota === null)

const fortalezas = [
  { tema: 'Proporcionalidad', nota: 19, msg: 'Excelente dominio de razones y proporciones' },
  { tema: 'Areas y perimetros', nota: 19, msg: 'Muy buen calculo de figuras planas' },
]

const debilidades = [
  { tema: 'Ecuaciones lineales', nota: 16, msg: 'Reforzar despeje de variables' },
]

const recursos = [
  { title: 'Video: Ecuaciones paso a paso', type: 'video', tema: 'Ecuaciones lineales' },
  { title: 'Ejercicios de Estadistica', type: 'pdf', tema: 'Estadistica descriptiva' },
  { title: 'Quiz de Probabilidad', type: 'quiz', tema: 'Probabilidad' },
]

const iaTags = ['Voley', 'Series', 'Morado', 'Gato', 'Ceviche', 'Taylor Swift', 'Tecnologia']

onMounted(() => {
  const ctx = document.getElementById('chart-progress')
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Inicio', 'Eval 2', 'Eval 3', 'Eval 4', 'Eval 5', 'Eval 6'],
        datasets: [{
          label: 'Mi Promedio',
          data: [8.9, 12.0, 14.5, 16.0, 17.2, 17.8],
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#2dce89',
          borderColor: '#2dce89',
          backgroundColor: 'rgba(45, 206, 137, 0.1)',
          fill: true,
          maxBarThickness: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            grid: { drawBorder: false, color: 'rgba(0,0,0,0.05)' },
            ticks: { padding: 10, font: { size: 11 }, color: '#8392AB' },
            min: 0, max: 20,
          },
          x: {
            grid: { drawBorder: false, display: false },
            ticks: { font: { size: 11 }, color: '#8392AB' },
          }
        }
      }
    })
  }
})
</script>

<style scoped lang="scss">
.gap-2 {
  gap: 0.5rem;
}
</style>
