<template>
  <div class="py-4 container-fluid">
    <!-- WELCOME BANNER -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card bg-gradient-dark">
          <div class="card-body p-4">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <p class="text-white text-sm mb-1 opacity-8">Bienvenido, administrador</p>
                <h4 class="text-white font-weight-bold mb-1">Sistema operando con normalidad</h4>
                <p class="text-white text-sm opacity-8 mb-3">1 incidencia pendiente · Ultimo backup: hoy 03:00 AM</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-white mb-0">
                    <i class="ni ni-single-02 me-1"></i> Gestionar usuarios
                  </button>
                  <button class="btn btn-sm btn-outline-white mb-0">
                    <i class="ni ni-bullet-list-67 me-1"></i> Ver auditoria
                  </button>
                </div>
              </div>
              <div class="col-lg-4 text-end d-none d-lg-block">
                <img :src="adminImg" alt="Administrador" style="max-height: 180px; margin-top: -40px; margin-bottom: -40px;" />
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
                <h6 class="mb-0">Crecimiento de Usuarios</h6>
                <p class="text-sm text-muted mb-0">Usuarios registrados por mes</p>
              </div>
              <span class="badge bg-gradient-dark">34 activos</span>
            </div>
          </div>
          <div class="card-body p-3">
            <div class="chart">
              <canvas id="chart-users" class="chart-canvas" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Estado del Sistema</h6>
          </div>
          <div class="card-body p-3">
            <div class="row">
              <div v-for="(srv, i) in systemHealth" :key="i" class="col-md-3 col-sm-6 mb-3">
                <div class="card card-body border p-3 text-center h-100">
                  <div class="d-flex justify-content-center mb-2">
                    <div
                      :class="[
                        'rounded-circle d-inline-block',
                        srv.status === 'ok' ? 'bg-success' : srv.status === 'warning' ? 'bg-warning' : 'bg-danger'
                      ]"
                      :style="{ width: '12px', height: '12px', animation: srv.status !== 'ok' ? 'pulse 2s infinite' : 'none' }"
                    ></div>
                  </div>
                  <h5 class="font-weight-bolder mb-0">{{ srv.value }}</h5>
                  <p class="text-xs text-uppercase font-weight-bold text-muted mb-1">{{ srv.name }}</p>
                  <span :class="`badge badge-sm bg-gradient-${srv.status === 'ok' ? 'success' : srv.status === 'warning' ? 'warning' : 'danger'}`">
                    {{ srv.status === 'ok' ? 'Operativo' : srv.status === 'warning' ? 'Atencion' : 'Critico' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Log -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Registro de Actividad</h6>
              <a href="#" class="text-primary text-sm font-weight-bold">Ver auditoria completa</a>
            </div>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Hora</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Accion</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, i) in activityLog" :key="i">
                    <td>
                      <span class="text-xs font-weight-bold text-muted ps-3 font-monospace">{{ log.time }}</span>
                    </td>
                    <td>
                      <span :class="log.type === 'error' ? 'text-danger font-weight-bold' : ''" class="text-sm">{{ log.action }}</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="badge badge-sm bg-light text-dark">{{ log.user }}</span>
                    </td>
                    <td class="align-middle text-center">
                      <div
                        :class="`rounded-circle d-inline-block bg-${log.type === 'success' ? 'success' : log.type === 'error' ? 'danger' : log.type === 'warning' ? 'warning' : 'info'}`"
                        style="width: 8px; height: 8px;"
                      ></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Users Table -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Ultimos Usuarios Registrados</h6>
              <button class="btn btn-sm bg-gradient-dark mb-0">
                <i class="ni ni-fat-add me-1"></i> Crear usuario
              </button>
            </div>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Codigo</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">DNI</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Rol</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Estado</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, i) in recentUsers" :key="i">
                    <td>
                      <div class="d-flex px-2 py-1">
                        <div class="avatar avatar-sm me-3 bg-gradient-primary border-radius-lg">
                          <span class="text-white text-xs font-weight-bold" style="line-height:36px;">{{ u.name.charAt(0) }}</span>
                        </div>
                        <div class="d-flex flex-column justify-content-center">
                          <h6 class="mb-0 text-sm">{{ u.name }}</h6>
                        </div>
                      </div>
                    </td>
                    <td><span class="text-xs font-weight-bold font-monospace">{{ u.code }}</span></td>
                    <td><span class="text-xs text-muted font-monospace">{{ u.dni }}</span></td>
                    <td class="align-middle text-center">
                      <span class="badge badge-sm bg-gradient-info">{{ u.role }}</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="badge badge-sm bg-gradient-success">Activo</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">{{ u.date }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="col-lg-4">
        <!-- Quick Actions -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Acciones Rapidas</h6>
          </div>
          <div class="card-body p-3">
            <button v-for="(action, i) in quickActions" :key="i" class="btn btn-outline-dark btn-sm w-100 mb-2 text-start d-flex align-items-center">
              <i :class="`ni ${action.icon} me-2`"></i>
              <span>{{ action.label }}</span>
              <i class="ni ni-bold-right ms-auto text-xs opacity-5"></i>
            </button>
          </div>
        </div>

        <!-- Backups -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Copias de Seguridad</h6>
          </div>
          <div class="card-body p-3">
            <ul class="list-group">
              <li v-for="(bk, i) in backups" :key="i" class="list-group-item border-0 d-flex align-items-center px-0 py-2">
                <div :class="`icon icon-shape icon-sm me-3 bg-gradient-${bk.ok ? 'success' : 'danger'} shadow text-center border-radius-xl`">
                  <i :class="`ni ${bk.ok ? 'ni-check-bold' : 'ni-fat-remove'} text-white opacity-10`" style="line-height:32px;"></i>
                </div>
                <div class="d-flex flex-column flex-grow-1">
                  <h6 class="mb-0 text-sm">{{ bk.label }}</h6>
                  <p class="text-xs text-muted mb-0">{{ bk.date }}</p>
                </div>
                <span class="text-xs text-muted">{{ bk.size }}</span>
              </li>
            </ul>
            <button class="btn btn-sm bg-gradient-dark w-100 mb-0 mt-3">
              <i class="ni ni-archive-2 me-1"></i> Generar backup ahora
            </button>
          </div>
        </div>

        <!-- Distribucion de roles -->
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6 class="mb-0">Distribucion de Usuarios</h6>
          </div>
          <div class="card-body p-3">
            <div v-for="(role, i) in rolesDistribution" :key="i" class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-sm">{{ role.label }}</span>
                <span class="text-sm font-weight-bold">{{ role.count }}</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div
                  :class="`progress-bar bg-gradient-${role.color}`"
                  :style="{ width: (role.count / 34 * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Incidencias -->
        <div class="card border border-warning">
          <div class="card-header pb-0">
            <h6 class="text-warning mb-0">Incidencias Pendientes</h6>
          </div>
          <div class="card-body p-3">
            <div class="d-flex align-items-start p-3 border-radius-lg" style="background: rgba(251,189,8,0.08);">
              <div class="icon icon-shape icon-sm me-3 bg-gradient-warning shadow text-center border-radius-xl flex-shrink-0">
                <i class="ni ni-lock-circle-open text-white opacity-10" style="line-height:32px;"></i>
              </div>
              <div>
                <h6 class="text-sm mb-0">Cuenta bloqueada</h6>
                <p class="text-xs text-muted mb-1">A25482910 — 3 intentos fallidos · Hace 3h</p>
                <div class="d-flex gap-2">
                  <button class="btn btn-xs btn-success mb-0">Desbloquear</button>
                  <button class="btn btn-xs btn-outline-secondary mb-0">Investigar</button>
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
import adminImg from '@/assets/img/Administrador.png'

const stats = [
  { label: 'Usuarios Activos', value: '34', delta: '+2 esta semana', up: true, icon: 'ni-world', color: 'primary' },
  { label: 'Evaluaciones Hoy', value: '3', delta: '2 en curso', up: true, icon: 'ni-paper-diploma', color: 'success' },
  { label: 'Backups', value: '12', delta: 'Ultimo: 03:00 AM', up: true, icon: 'ni-archive-2', color: 'info' },
  { label: 'Incidencias', value: '1', delta: '1 pendiente', up: false, icon: 'ni-bell-55', color: 'warning' },
]

const systemHealth = [
  { name: 'Base de Datos', status: 'ok', value: '98%' },
  { name: 'API / Express', status: 'ok', value: '99.9%' },
  { name: 'Almacenamiento', status: 'warning', value: '72%' },
  { name: 'IA (NLP)', status: 'ok', value: '100%' },
]

const activityLog = [
  { time: '08:30', action: 'Backup automatico completado', user: 'Sistema', type: 'success' },
  { time: '09:15', action: 'Login exitoso', user: 'C257512', type: 'info' },
  { time: '09:18', action: '3 intentos fallidos — cuenta bloqueada', user: 'A25482910', type: 'error' },
  { time: '10:00', action: 'Evaluacion publicada: Estadistica Descriptiva', user: 'C257512', type: 'info' },
  { time: '11:45', action: 'Permisos actualizados para rol Docente', user: 'ADM257528', type: 'success' },
  { time: '14:20', action: 'Modulo de Reportes activado', user: 'ADM257528', type: 'success' },
]

const recentUsers = [
  { name: 'Lesly Sanchez', code: 'A25719664', dni: '78719664', role: 'Estudiante', date: '15/03/25' },
  { name: 'Adriana Quijano', code: 'A25513883', dni: '70513883', role: 'Estudiante', date: '15/03/25' },
  { name: 'Santiago Hancco', code: 'A25482910', dni: '74482910', role: 'Estudiante', date: '14/03/25' },
  { name: 'Victoria Luna', code: 'A25637291', dni: '76637291', role: 'Estudiante', date: '14/03/25' },
]

const quickActions = [
  { icon: 'ni-fat-add', label: 'Crear Usuario' },
  { icon: 'ni-archive-2', label: 'Generar Backup' },
  { icon: 'ni-bullet-list-67', label: 'Ver Auditoria' },
  { icon: 'ni-settings-gear-65', label: 'Configurar Sistema' },
  { icon: 'ni-key-25', label: 'Gestionar Roles' },
  { icon: 'ni-world', label: 'Integraciones' },
]

const backups = [
  { label: 'Backup diario', date: 'Hoy 03:00 AM', size: '245 MB', ok: true },
  { label: 'Backup diario', date: 'Ayer 03:00 AM', size: '243 MB', ok: true },
  { label: 'Backup semanal', date: '16/03/25', size: '1.2 GB', ok: true },
  { label: 'Backup mensual', date: '01/03/25', size: '1.1 GB', ok: true },
]

const rolesDistribution = [
  { label: 'Estudiantes', count: 32, color: 'success' },
  { label: 'Docentes', count: 1, color: 'info' },
  { label: 'Administradores', count: 1, color: 'primary' },
]

onMounted(() => {
  const ctx = document.getElementById('chart-users')
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
        datasets: [{
          label: 'Usuarios registrados',
          data: [12, 18, 24, 28, 30, 32, 34],
          backgroundColor: 'rgba(94, 114, 228, 0.8)',
          borderColor: '#5e72e4',
          borderWidth: 2,
          borderRadius: 6,
          maxBarThickness: 30,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { drawBorder: false, color: 'rgba(0,0,0,0.05)' }, ticks: { padding: 10, font: { size: 11 }, color: '#8392AB' }, beginAtZero: true },
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
.btn-xs { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
