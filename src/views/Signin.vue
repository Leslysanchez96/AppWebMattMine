<script setup>
import { onBeforeUnmount, onBeforeMount, ref, computed } from "vue";
import { useStore } from "vuex";
import Navbar from "@/examples/PageLayout/Navbar.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import loginBg from "@/assets/img/login-school.jpg";
const body = document.getElementsByTagName("body")[0];

const store = useStore();
const showResetModal = ref(false);
const documentNumber = ref("");
const showTermsModal = ref(false);
const selectedRole = ref("Alumno");
const password = ref("");
const showPassword = ref(false);
const documentTouched = ref(false);
const passwordTouched = ref(false);

const placeholderText = computed(() => {
  if (selectedRole.value === "Docente") {
    return "Ingresa tu Codigo de Docente";
  } else if (selectedRole.value === "Administrador") {
    return "Ingresa tu codigo de Administrador";
  }
  return "Nro. de documento";
});

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});
onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});
</script>
<style scoped>
.btn-custom-gold {
  background: linear-gradient(310deg, #8B6508 0%, #996515 100%) !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

.btn-custom-gold:hover:not(:disabled) {
  background: linear-gradient(310deg, #002366 0%, #003d99 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 35, 102, 0.3) !important;
}

.btn-custom-gold:active:not(:disabled),
.btn-custom-gold:focus:not(:disabled) {
  background: linear-gradient(310deg, #001a4d 0%, #002366 100%) !important;
  transform: translateY(0);
}

.role-button {
  background: white !important;
  color: #8B6508 !important;
  border: 2px solid #e0e0e0 !important;
  border-radius: 50px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  min-width: 120px !important;
}

.role-button:hover {
  border-color: #8B6508 !important;
  background: #FFF8E1 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 101, 8, 0.2) !important;
}

.role-button.active {
  background: linear-gradient(310deg, #8B6508 0%, #996515 100%) !important;
  color: white !important;
  border-color: #8B6508 !important;
  box-shadow: 0 4px 12px rgba(139, 101, 8, 0.3) !important;
}
</style>
<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar
          isBlur="blur  border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
          v-bind:darkMode="true"
          isBtn="bg-gradient-warning"
        />
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="col-12 d-lg-none d-flex justify-content-center mb-4">
              <div 
                class="position-relative w-100 border-radius-lg overflow-hidden" 
                style="height: 300px; background-size: cover; background-position: center;"
                :style="{ backgroundImage: `url(${loginBg})` }"
              >
              </div>
            </div>
            <div
              class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0"
            >
              <div class="card card-plain">
                  <div class="mb-4">
                      <h4 class="font-weight-bolder mb-3 text-center" style="font-size: 4.5rem; line-height: 1.2; color: #002366 !important;">
                        ¡ BIENVENIDO A MATTMINE !
                      </h4>
                       <div class="d-flex flex-column align-items-start justify-content-center mt-3">
                         <div class="mb-2">
                           <span class="font-weight-bolder" style="font-size: 2rem; line-height: 1.2; color: #B8860B !important;">
                             Colegio
                           </span>
                           <span class="font-weight-bolder ms-2" style="font-size: 2rem; line-height: 1; color: #B8860B !important;">
                             Privado
                           </span>
                         </div>
                       </div>
                  </div>

                  <!-- Role Selection Buttons -->
                  <div class="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                    <button 
                      type="button"
                      class="role-button"
                      :class="{ active: selectedRole === 'Alumno' }"
                      @click="selectedRole = 'Alumno'"
                    >
                      Alumno
                    </button>
                    <button 
                      type="button"
                      class="role-button"
                      :class="{ active: selectedRole === 'Docente' }"
                      @click="selectedRole = 'Docente'"
                    >
                      Docente
                    </button>
                    <button 
                      type="button"
                      class="role-button"
                      :class="{ active: selectedRole === 'Administrador' }"
                      @click="selectedRole = 'Administrador'"
                    >
                      Administrador
                    </button>
                  </div>

                  <p class="mb-0 text-center">Estimado {{ selectedRole }}, ingresa tus credenciales</p>

                <div class="card-body">
                  <form role="form">
                    <div class="mb-3">
                      <input
                        id="documentNumber"
                        type="text"
                        class="form-control form-control-lg"
                        :placeholder="placeholderText"
                        v-model="documentNumber"
                        @blur="documentTouched = true"
                      />
                      <p v-if="!documentNumber && documentTouched" class="text-danger text-xs mt-1 mb-0">
                        *Completa este campo
                      </p>
                    </div>
                    <div class="mb-3">
                      <div class="input-group">
                        <input
                          id="password"
                          :type="showPassword ? 'text' : 'password'"
                          class="form-control form-control-lg"
                          placeholder="Contraseña"
                          v-model="password"
                          @blur="passwordTouched = true"
                        />
                        <span class="input-group-text cursor-pointer" @click="showPassword = !showPassword">
                          <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                        </span>
                      </div>
                      <p v-if="!password && passwordTouched" class="text-danger text-xs mt-1 mb-0">
                        *Completa este campo
                      </p>
                    </div>
                    <argon-switch id="rememberMe" name="remember-me"
                      >Recordarme</argon-switch
                    >

                    <div class="text-center">
                      <argon-button
                        class="mt-4 btn-custom-gold"
                        variant="gradient"
                        fullWidth
                        size="lg"
                        :disabled="!documentNumber || !password"
                        >Iniciar Sesión</argon-button
                      >
                    </div>
                  </form>
                </div>
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    <a
                      href="javascript:;"
                      class="font-weight-bold"
                      :class="documentNumber ? '' : 'text-secondary opacity-5'"
                      :style="{ 
                        cursor: documentNumber ? 'pointer' : 'not-allowed',
                        color: documentNumber ? '#002366' : '',
                        textDecoration: 'none'
                      }"
                      @click="documentNumber ? showResetModal = true : null"
                      >Restablecer contraseña</a
                    >
                  </p>
                  <p class="mx-auto mb-4 text-sm">
                    <a
                      href="javascript:;"
                      class="text-secondary me-3"
                      @click="showTermsModal = true"
                      >Terminos y condiciones</a
                    >
                    <a href="javascript:;" class="text-secondary">Política de protección de datos</a>
                  </p>
                </div>
              </div>
            </div>
            <div
              class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column"
            >
              <div
                class="position-relative h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                :style="{
                  backgroundImage: `url(${loginBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }"
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Reset Password Modal -->
  <div v-if="showResetModal" class="modal-backdrop fade show"></div>
  <div
    v-if="showResetModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-default"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header bg-warning">
          <h5 class="modal-title text-white" id="modal-title-default">Restablecer contraseña</h5>
          <button
            type="button"
            class="btn-close text-dark"
            @click="showResetModal = false"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="font-weight-bold mb-3">Elija su pregunta de verificación de perfil</p>
          
          <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="securityQuestion" id="q1" checked>
            <label class="form-check-label" for="q1">
              ¿Segundo apellido de su madre?
            </label>
          </div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="radio" name="securityQuestion" id="q2">
            <label class="form-check-label" for="q2">
              ¿Nombre de mascota favorita?
            </label>
          </div>
          <div class="form-check mb-4">
            <input class="form-check-input" type="radio" name="securityQuestion" id="q3">
            <label class="form-check-label" for="q3">
              ¿Último año que estudió en el colegio?
            </label>
          </div>

          <div class="mb-3">
            <label class="form-label text-secondary">Respuesta:</label>
            <input type="text" class="form-control" placeholder="Respuesta" />
            <hr class="horizontal dark mt-0">
          </div>

          <div class="text-center">
             <!-- Using a custom style to match the salmon/light-orange verification button in the image if needed, 
                  or standard warning button -->
            <button type="button" class="btn bg-gradient-warning w-50 mb-4">Verificar</button>
          </div>

          <p class="text-xs text-center text-secondary fst-italic">
            *IMPORTANTE: En caso de olvidar su pregunta y/o respuesta de seguridad comunicarse con la sede para restablecer su contraseña.
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- Terms Modal -->
  <div v-if="showTermsModal" class="modal-backdrop fade show"></div>
  <div
    v-if="showTermsModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-terms"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modal-terms">Terminos y Condiciones</h5>
          <button
            type="button"
            class="btn-close text-dark"
            @click="showTermsModal = false"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body text-start">
          <p><strong>¡Bienvenido a los términos y condiciones de la Plataforma Virtual MATTMINE!</strong></p>
          <p>
            En esta oportunidad agradecemos el empleo de nuestra Plataforma Virtual MattMine. Asimismo, hacemos de su conocimiento que el uso de nuestra plataforma Virtual MattMine implica la aceptación de los TÉRMINOS Y CONDICIONES correspondientes, por lo que recomendamos que los lea detenidamente. En ese sentido, cualquier persona que haga uso de nuestra plataforma Virtual MattMine declara y reconoce que ha leído y acepta todos y cada uno de los TÉRMINOS Y CONDICIONES descritos a continuación.
          </p>

          <p><strong>1. TÉRMINOS DE USO</strong></p>
          <p>
            La utilización del sitio web (página web de la plataforma virtual MattMine ), propiedad de (propietario del sitio web o plataforma) (en adelante EL PRESTATARIO), es absolutamente voluntaria y supone la aceptación plena por quien accede al mismo (en adelante EL USUARIO) de todas las Condiciones Generales de Uso vigentes en cada momento que se encuentre en el dominio (denominación del dominio web); por lo cual EL USUARIO deberá leer detenidamente y aceptar sin ningún tipo de reservas la presente declaración de TÉRMINOS Y CONDICIONES antes de realizar cualquier tipo de operación, visionado, utilización, etc., dentro de este sitio web.
          </p>
          <ol type="a">
            <li>EL USUARIO se compromete a utilizar la plataforma de forma responsable y sin la intención de alterar, vulnerar y/o manipular la información contenida de conformidad con la legislación vigente, así como respetar las normas de convivencia, la moral y buenas costumbres generalmente aceptadas.</li>
            <li>EL USUARIO se obliga y compromete a NO utilizar la plataforma con fines o efectos ilícitos, prohibidos por la legislación vigente, lesivos de los derechos e intereses de terceros.</li>
            <li>EL PRESTATARIO se reserva el derecho a retirar el acceso a la plataforma, sin necesidad de previo aviso, a cualquier USUARIO que contravenga lo dispuesto en estas Condiciones Generales de Uso.</li>
            <li>EL PRESTATARIO se reserva el derecho de modificar en cualquier momento los TÉRMINOS Y CONDICIONES, así como cualquier otro requerimiento general o particular, reglamento de uso o aviso que resulte aplicable.</li>
            <li>EL PRESTATARIO, se reserva el derecho a modificar en cualquier momento la presentación, configuración y localización de la plataforma, así como los contenidos y las condiciones requeridas para utilizar la misma.</li>
          </ol>

          <p><strong>2. SOBRE EL CONTENIDO DE LA PLATAFORMA</strong></p>
          <ol type="a">
            <li>EL PRESTATARIO proporciona información clara a LOS USUARIOS sobre los servicios que pone a disposición de los miembros de la Institución Educativa, así como sus respectivas características y datos sobre la propia entidad.</li>
            <li>Al ingresar o durante el uso de (página web de la plataforma virtual MattMine) podrían mostrarse enlaces a otras páginas, las cuales no son gestionadas por EL PRESTATARIO. Dichos enlaces o hipervínculos provienen de otras fuentes de información, no suponiendo su inclusión, recomendación, invitación o sugerencia de visita un requerimiento por parte de EL PRESTATARIO; por lo tanto, EL PRESTATARIO declina toda responsabilidad que pudiese surgir al acceder a las páginas de terceros. Asimismo, se excluye de cualquier responsabilidad por los daños de cualquier clase causados a EL USUARIO por este motivo.</li>
            <li>EL PRESTATARIO no garantiza la inexistencia de interrupciones o errores en el acceso a la plataforma, aunque desarrollará sus mejores esfuerzos para, en su caso, evitarlos, subsanarlos o actualizarlos. Por consiguiente, EL PRESTATARIO no se responsabiliza de los daños o perjuicios de cualquier tipo producidos en EL USUARIO debido a fallos o desconexiones en las redes de telecomunicaciones que produzcan la suspensión, cancelación o interrupción del servicio de la plataforma durante la prestación del mismo o con carácter previo.</li>
            <li>EL PRESTATARIO se excluye cualquier responsabilidad por los daños y perjuicios de toda naturaleza que puedan deberse a la falta de disponibilidad, continuidad o calidad del funcionamiento de la plataforma y al no cumplimiento de la expectativa de utilidad que los usuarios hubieren podido atribuir a la plataforma.</li>
            <li>El acceso a la plataforma no implica la obligación por parte de EL PRESTATARIO de controlar la ausencia de virus, gusanos o cualquier otro elemento informático dañino, a pesar de las buenas prácticas establecidas por EL PRESTATARIO para el control y mejoramiento de nuestros servidores. Corresponde al Usuario, en todo caso, la disponibilidad de herramientas adecuadas para la detección y desinfección de programas informáticos dañinos.</li>
            <p>Por lo tanto, EL PRESTATARIO no se hace responsable de los posibles errores de seguridad que se puedan producir durante la prestación del servicio de la plataforma, ni de los posibles daños que puedan causarse al sistema informático de EL USUARIO o de terceros (hardware y software), los ficheros o documentos almacenados en el mismo, como consecuencia de la presencia de virus en el ordenador de EL USUARIO utilizado para la conexión a los servicios de la plataforma, de un mal funcionamiento del navegador o del uso de versiones no actualizadas del mismo.</p>
            <li>La Plataforma Virtual constituye un espacio integral diseñado para facilitar la interacción, comunicación y gestión educativa entre la institución, los estudiantes y sus familias. Con el objetivo de brindar un servicio eficiente y transparente, la plataforma pone a disposición de LOS USUARIOS diversos módulos digitales, cada uno con funciones específicas orientadas al acompañamiento del proceso formativo, la gestión administrativa y la participación en la vida escolar.</li>
            <p>Los módulos que tiene la presente plataforma son los siguientes:</p>
            <ul>
                <li>Horario: Permite consultar la programación académica del estudiante, incluyendo horarios de clases, actividades y modificaciones que la institución considere necesarias.</li>
                <li>Informe de progreso (notas): Facilita el acceso a los resultados académicos y reportes de desempeño emitidos oficialmente por la institución.</li>
                <li>Asistencia: Proporciona información actualizada sobre el registro de asistencia y puntualidad del estudiante.</li>
                <li>Acciones Positivas / Incidencias conductuales: Permite visualizar reconocimientos, observaciones o reportes relacionados con el comportamiento del estudiante dentro del entorno escolar.</li>
                <li>Libros: Brinda información sobre los textos escolares y materiales bibliográficos asignados a cada nivel o curso.</li>
                <li>Calendario académico: Ofrece el cronograma oficial de actividades institucionales, evaluaciones, eventos y periodos administrativos.</li>
                <li>Encuestas: Herramienta de participación mediante la cual los usuarios pueden emitir opiniones o responder formularios relacionados con la gestión educativa.</li>
                <li>Documentos: Espacio para la descarga y consulta de documentos oficiales, comunicados, reglamentos y otros archivos relevantes.</li>
                <li>Pagos: Permite visualizar el estado de cuenta, realizar el seguimiento de obligaciones económicas y registrar pagos efectuados a la institución.</li>
                <li>Matrícula: Gestiona el proceso de inscripción anual de los estudiantes, conforme a las disposiciones establecidas por la institución.</li>
                <li>Matrícula Vacacional y/o Talleres: Facilita la inscripción en programas complementarios, actividades extracurriculares o talleres vacacionales.</li>
                <li>Citas: Herramienta destinada a solicitar, agendar y gestionar reuniones con el personal docente, administrativo o directivo.</li>
                <li>Tópico: Registro informativo relacionado con las atenciones de salud escolar y reportes médicos que se generen dentro del ámbito institucional.</li>
                <li>Avisos y mensajes: Canal oficial de comunicación a través del cual la institución emite comunicados, recordatorios, alertas o notificaciones importantes.</li>
            </ul>
            <p>El acceso a cada uno de estos módulos estará disponible conforme a las políticas internas de la institución educativa y podrá ser modificado, ampliado o restringido por EL PRESTATARIO en cualquier momento, sin necesidad de previo aviso. El uso de los servicios implica la aceptación expresa de los presentes Términos y Condiciones y del reglamento interno institucional.</p>
          </ol>

          <p><strong>3. SOBRE LA PROPIEDAD INTELECTUAL E INDUSTRIAL</strong></p>
          <ol type="a">
            <li>EL USUARIO reconoce y acepta que todos los derechos de propiedad intelectual sobre la plataforma virtual MattMine pertenecen a EL PRESTATARIO; así como todas las marcas, nombres comerciales o signos distintivos de cualquier clase que aparecen en la plataforma son propiedad de EL PRESTATARIO o, en su caso, de terceros que han autorizado su uso.</li>
            <p>Por tanto, los derechos de propiedad intelectual son titularidad de EL PRESTATARIO o de terceros que han autorizado su uso, a quienes corresponde el ejercicio exclusivo de los derechos de explotación de los mismos en cualquier forma y, en especial, los derechos de reproducción, distribución, comunicación pública y transformación, salvo en lo mencionado en el literal b) del apartado anterior referente a enlaces o hipervínculos.</p>
            <li>EL PRESTATARIO es titular de los elementos que integran el diseño gráfico de la plataforma virtual MattMine, los menús, botones de navegación, el código HTML, los textos, las imágenes, las texturas, los gráficos y cualquier otro contenido de la plataforma u otro material al que tuviera acceso EL USUARIO durante el uso de la misma, sin que esta enumeración tenga carácter limitativo. En cualquier caso, EL PRESTATARIO dispone de la correspondiente autorización para la utilización de dichos elementos.</li>
            <li>EL USUARIO solo está autorizado a visualizar todo el material y contenido de la plataforma virtual MattMine tal y como se presenta y a descargar copias del material para su uso personal y privado, nunca con propósitos comerciales, siempre que EL USUARIO cumpla con todas las normativas de propiedad intelectual.</li>
            <p>De igual manera, queda prohibido suprimir, eludir o manipular el copyright y demás datos identificativos, así como los dispositivos técnicos de protección o cualquier mecanismo de información que pudiera contener los contenidos.</p>
            <li>La utilización no autorizada de la plataforma, así como la lesión de los derechos de propiedad intelectual o industrial de EL PRESTATARIO o de terceros que han autorizado elementos incluidos en la plataforma, dará lugar a las responsabilidades legalmente establecidas.</li>
          </ol>
          <p>EL PRESTATARIO autoriza el establecimiento de enlaces o hipervínculos hacia otras páginas webs y la suya, siempre que se respeten las siguientes condiciones:</p>
          <ul>
            <li>Que el enlace no se establezca desde una web cuyos contenidos resulten contrarios a la Ley, a la moral y al orden público;</li>
            <li>Que no se ofrezca una imagen de EL PRESTATARIO o de sus servicios que resulte distorsionada, perjudicial o equivocada;</li>
            <li>Que no se cree la impresión de que concurre una inexistente relación o vinculación comercial entre EL PRESTATARIO y los titulares, responsables o anunciantes desde la que se crea el enlace o hipervínculo, cuando este no sea el caso.</li>
          </ul>

          <p><strong>4. SOBRE EL USO DE DATOS PERSONALES</strong></p>
          <p>En cumplimiento de la Ley N° 29733 se informa, a los usuarios de esta plataforma, que los datos personales, propios o de aquellos menores de edad cuya patria potestad y/o tutela ostenta, que han sido proporcionados a EL PRESTATARIO, serán tratados en forma estrictamente confidencial y respetando las medidas de seguridad técnicas y jurídicas aplicables.</p>
          <p>Asimismo, el titular de los datos personales autoriza a EL PRESTATARIO a utilizar sus datos personales y los datos personales de los menores de edad cuya patria potestad y/o tutela ostenta, que hubieran sido proporcionados directamente a EL PRESTATARIO, para el envío de información sobre servicios de EL PRESTATARIO.</p>
          <p>El titular de los datos personales podrá revocar la presente autorización para el tratamiento de sus datos personales en cualquier momento, de conformidad con lo previsto en la Ley. Para ejercer este derecho, o cualquier otro previsto en dichas normas, el titular de los datos personales podrá solicitarlo a EL PRESTATARIO.</p>
          <p>Para más información revisar el contenido de la POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES de la plataforma.</p>
          
          <p><strong>5. CONDICIONES DE USO DEL SERVICIO</strong></p>
          <p>Las condiciones de acceso y uso de la plataforma virtual MattMine se rigen estrictamente por la legalidad vigente y por el principio de buena fe comprometiéndose EL USUARIO a realizar un buen uso de la web y de los servicios que se ofrecen.</p>
          <p>Quedan prohibidos todos los actos que vulneren la legalidad, los derechos o intereses de terceros, prohibiéndose expresamente:</p>
          <ul>
            <li>Realizar actuaciones que puedan producir en la web o a través de la misma y por cualquier medio algún tipo de daño a los sistemas de EL PRESTATARIO o a terceros.</li>
            <li>Realizar publicidad o información comercial directamente o de forma encubierta o el envío de grandes mensajes con el fin de bloquear los servidores de la red.</li>
          </ul>
          <p>EL PRESTATARIO no puede asumir ninguna responsabilidad derivada del uso incorrecto, inapropiado o ilícito de la información aparecida en las páginas de esta web.</p>
          <p>EL USUARIO debe leer los TÉRMINOS Y CONDICIONES, cada vez que ingrese a la plataforma virtual MattMine, puesto que estas podrían tener cambios y/o actualizaciones al momento de ingresar a la misma.</p>
          <p>EL PRESTATARIO no se responsabiliza por las acciones o decisiones que EL USUARIO tome o asuma, basado en información de la plataforma, así como por los posibles errores ortográficos que puedan contener los documentos. La información está sometida a posibles cambios periódicos sin previo aviso de su contenido por ampliación, mejora, corrección o actualización.</p>
          <p>Si EL USUARIO no se encuentra de acuerdo con los TÉRMINOS Y CONDICIONES debe abstenerse del uso de la plataforma.</p>

        </div>
        <div class="modal-footer justify-content-center">
            <button type="button" class="btn bg-gradient-warning" @click="showTermsModal = false">Aceptar</button>
        </div>
      </div>
    </div>
  </div>
</template>
