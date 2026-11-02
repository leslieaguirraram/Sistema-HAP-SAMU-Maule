
import { useState } from 'react'
import './App.css'
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

function App() {
  
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');

 async function iniciarSesionPrueba(evento) {
  evento.preventDefault();

  try {
    await signInWithEmailAndPassword(auth, correo, clave);
    setSesionIniciada(true);
    alert('Sesión iniciada correctamente.');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('No se pudo iniciar sesión. Revisa tus credenciales.');
  }
}

  const [pantalla, setPantalla] = useState('inicio')
  const [pagina, setPagina] = useState(1)

    const [hap, setHap] = useState({
    fechaAtencion: '',
    base: '',
    movil: '',
    complejidad: '',
    clave: '',
    prioridad: '',
    comuna: '',
    direccion: '',
    paciente: '',
    rut: '',
    edad: '',
    sexo: '',
    motivo: '',
    evaluacionPrimaria: '',
    evaluacionSecundaria: '',
    antecedentes: '',
    medicamentosHabituales: '',
    alergias: '',
    signosVitales: '',
    procedimientos: '',
    medicamentos: '',
    destino: '',
    estadoTraslado: '',
    observaciones: '',
    qtr: Array(12).fill(''),
  })

  function actualizar(campo, valor) {
    setHap((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function actualizarQTR(indice, valor) {
    setHap((anterior) => {
      const nuevosQTR = [...anterior.qtr]
      nuevosQTR[indice] = valor
      return { ...anterior, qtr: nuevosQTR }
    })
  }

  
async function guardarBorrador(evento) {
  evento.preventDefault();

  try {
    const referencia = await addDoc(collection(db, 'ATENCIONES_HAP'), {
      ...hap,
      estado_transcripcion: 'borrador',
      fecha_creacion: serverTimestamp(),
      usuario_creacion: 'prototipo-academico',
      usuario_confirmacion: null,
      fecha_confirmacion: null,
    });

    alert(`Borrador guardado correctamente. ID: ${referencia.id}`);
  } catch (error) {
    console.error('Error al guardar la HAP:', error);
    alert('No se pudo guardar el borrador. Revisa las reglas de Firestore y la conexión.');
  }
}

if (!sesionIniciada) {
  return (
    <div className="contenido">
      <h2>Acceso al sistema HAP</h2>
      <p>Ingresa tus credenciales para continuar.</p>

      <form onSubmit={iniciarSesionPrueba}>
        <label>
          Correo electrónico
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </label>

        <button type="submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

  if (pantalla === 'formulario') {
    return (
      <div className="aplicacion">
        <header className="encabezado">
          <div className="identidad">
            <div className="simbolo">131</div>
            <div>
              <h1>SAMU MAULE</h1>
              <p>Sistema de Registro Digital HAP</p>
            </div>
          </div>
          <button className="boton-volver" onClick={() => setPantalla('inicio')}>
            Volver al inicio
          </button>
        </header>

        <main className="contenido">
          <section className="bienvenida">
            <p className="etiqueta">FORMULARIO DE PRUEBA</p>
            <h2>Transcripción de Atención Prehospitalaria</h2>
            <p>Ingrese solamente información ficticia durante esta etapa académica.</p>
          </section>

          <div className="progreso">
            <span className={pagina === 1 ? 'paso activo' : 'paso'}>1. Datos y evaluación</span>
            <span className={pagina === 2 ? 'paso activo' : 'paso'}>2. Procedimientos y traslado</span>
          </div>

          <form className="formulario-hap" onSubmit={guardarBorrador}>
            {pagina === 1 ? (
              <>
                <h3>1. Identificación de la atención</h3>
                <div className="campos">
                  <label>
                    Fecha de atención
                    <input
                      type="date"
                      value={hap.fechaAtencion}
                      onChange={(e) => actualizar('fechaAtencion', e.target.value)}
                    />
                  </label>

                  <label>
                    Base SAMU
                    <input
                      value={hap.base}
                      onChange={(e) => actualizar('base', e.target.value)}
                      placeholder="Ej.: Talca"
                    />
                  </label>

                  <label>
                    Móvil
                    <input
                      value={hap.movil}
                      onChange={(e) => actualizar('movil', e.target.value)}
                      placeholder="Identificación del móvil"
                    />
                  </label>

                  <label>
                    Complejidad
                    <input
                      value={hap.complejidad}
                      onChange={(e) => actualizar('complejidad', e.target.value)}
                      placeholder="Complejidad"
                    />
                  </label>

                  <label>
                    Clave
                    <input
                      value={hap.clave}
                      onChange={(e) => actualizar('clave', e.target.value)}
                      placeholder="Clave"
                    />
                  </label>

                  <label>
                    Prioridad
                    <input
                      value={hap.prioridad}
                      onChange={(e) => actualizar('prioridad', e.target.value)}
                      placeholder="Prioridad"
                    />
                  </label>

                  <label>
                    Comuna
                    <input
                      value={hap.comuna}
                      onChange={(e) => actualizar('comuna', e.target.value)}
                      placeholder="Comuna"
                    />
                  </label>

                  <label className="ancho-completo">
                    Dirección del evento
                    <input
                      value={hap.direccion}
                      onChange={(e) => actualizar('direccion', e.target.value)}
                      placeholder="Dirección del evento"
                    />
                  </label>
                </div>
                <h3>2. Registro de tiempos QTR</h3>
                <p className="ayuda">Ingrese la hora correspondiente a cada código QTR según la HAP original.</p>
                <div className="campos qtr-grid">
                  {hap.qtr.map((hora, indice) => (
                    <label key={indice}>
                      QTR{indice + 1}
                      <input type="time" value={hora} onChange={(e) => actualizarQTR(indice, e.target.value)} />
                    </label>
                  ))}
                </div>
                <h3>3. Identificación del paciente</h3>
                <div className="campos">
                  <label>
                    Nombre ficticio
                    <input value={hap.paciente} onChange={(e) => actualizar('paciente', e.target.value)} placeholder="Paciente de prueba" />
                  </label>
                  <label>
                    RUT ficticio
                    <input value={hap.rut} onChange={(e) => actualizar('rut', e.target.value)} placeholder="12.345.678-5 (ejemplo)" />
                  </label>
                  <label>
                    Edad
                    <input type="number" min="0" value={hap.edad} onChange={(e) => actualizar('edad', e.target.value)} />
                  </label>
                  <label>
                    Sexo registrado
                    <select value={hap.sexo} onChange={(e) => actualizar('sexo', e.target.value)}>
                      <option value="">Seleccione</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="No consignado">No consignado</option>
                    </select>
                  </label>
                </div>

                  <h3>4. Evaluación clínica</h3>
                  <div className="campos">
                    <label className="ancho-completo">
                      Motivo de atención
                      <textarea
                        value={hap.motivo}
                        onChange={(e) => actualizar('motivo', e.target.value)}
                        rows="2"
                      />
                    </label>

                    <label className="ancho-completo">
                      Antecedentes mórbidos
                      <textarea
                        value={hap.antecedentes}
                        onChange={(e) => actualizar('antecedentes', e.target.value)}
                        rows="2"
                        placeholder="Antecedentes del paciente (datos ficticios)"
                      />
                    </label>

                    <label className="ancho-completo">
                      Medicamentos habituales
                      <textarea
                        value={hap.medicamentosHabituales}
                        onChange={(e) => actualizar('medicamentosHabituales', e.target.value)}
                        rows="2"
                        placeholder="Medicamentos habituales (datos ficticios)"
                      />
                    </label>

                    <label className="ancho-completo">
                      Alergias
                      <textarea
                        value={hap.alergias}
                        onChange={(e) => actualizar('alergias', e.target.value)}
                        rows="2"
                        placeholder="Alergias conocidas o no consignadas"
                      />
                    </label>

                    <label className="ancho-completo">
                      Evaluación primaria
                      <textarea
                        value={hap.evaluacionPrimaria}
                        onChange={(e) => actualizar('evaluacionPrimaria', e.target.value)}
                        rows="3"
                      />
                    </label>

                    <label className="ancho-completo">
                    Evaluación secundaria
                    <textarea
                      value={hap.evaluacionSecundaria}
                      onChange={(e) => actualizar('evaluacionSecundaria', e.target.value)}
                      rows="3"
                      placeholder="Evaluación secundaria del paciente (datos ficticios)"
                    />
                  </label>

                    <label className="ancho-completo">
                      Signos vitales
                      <textarea
                        value={hap.signosVitales}
                        onChange={(e) => actualizar('signosVitales', e.target.value)}
                        rows="2"
                        placeholder="Datos ficticios para pruebas"
                      />
                    </label>
                  </div>

              </>
            ) : (
              <>
                <h3>5. Procedimientos y medicamentos</h3>
                <div className="campos">
                  <label className="ancho-completo">
                    Procedimientos realizados
                    <textarea value={hap.procedimientos} onChange={(e) => actualizar('procedimientos', e.target.value)} rows="3" />
                  </label>
                  <label className="ancho-completo">
                    Medicamentos registrados
                    <textarea value={hap.medicamentos} onChange={(e) => actualizar('medicamentos', e.target.value)} rows="3" />
                  </label>
                 <label className="ancho-completo">
                  Estado del paciente durante el traslado
                  <textarea
                    value={hap.estadoTraslado}
                    onChange={(e) => actualizar('estadoTraslado', e.target.value)}
                    rows="3"
                    placeholder="Describa el estado del paciente durante el traslado (datos ficticios)"
                  />
                </label> 
                </div>

                <h3>6. Traslado y observaciones</h3>
                <div className="campos">
                  <label className="ancho-completo">
                    Destino o centro receptor
                    <input value={hap.destino} onChange={(e) => actualizar('destino', e.target.value)} />
                  </label>
                  <label className="ancho-completo">
                    Observaciones
                    <textarea value={hap.observaciones} onChange={(e) => actualizar('observaciones', e.target.value)} rows="3" />
                  </label>
                </div>

              </>
            )}

            <div className="acciones-formulario">
              {pagina === 2 && (
                <button type="button" className="boton-secundario" onClick={() => setPagina(1)}>
                  Página anterior
                </button>
              )}
              {pagina === 1 ? (
                <button type="button" onClick={() => setPagina(2)}>
                  Continuar a página 2
                </button>
              ) : (
                <button type="submit">Probar formulario</button>
              )}
            </div>
          </form>

            <div className="aviso">
            <strong>Prototipo académico:</strong> Los datos ficticios ingresados
            se almacenan en Firebase para pruebas.
            La HAP en papel se mantiene como documento original.
          </div>
        </main>
        <footer className="pie">SAMU Maule · Proyecto de Titulación · IPLACEX · 2026</footer>
      </div>
    )
  }

 
  return (
    <div className="aplicacion">
      <header className="encabezado">
        <div className="identidad">
          <div className="simbolo">131</div>
          <div>
            <h1>SAMU Maule | Registro HAP</h1>
            <p>Sistema de Atención Médica de Urgencia</p>
          </div>
        </div>
        <span className="estado">Prototipo académico</span>
      </header>

      <div className="estructura-panel">
        <aside className="menu-lateral">
          <button className="opcion-menu activa" onClick={() => setPantalla('inicio')}>
            🏠 Inicio
          </button>
          <button className="opcion-menu" onClick={() => { setPagina(1); setPantalla('formulario') }}>
            📋 Registrar HAP
          </button>
          <button className="opcion-menu" onClick={() => alert('La búsqueda se implementará en una siguiente etapa.')}>
            🔎 Buscar registros
          </button>
          <button className="opcion-menu" onClick={() => alert('Los reportes se implementarán en una siguiente etapa.')}>
            📊 Reportes
          </button>
          <button className="opcion-menu" onClick={() => alert('La administración de usuarios se implementará posteriormente.')}>
            👥 Usuarios
          </button>
          <button className="opcion-menu" onClick={() => alert('Sistema académico en desarrollo. No ingresar datos reales.')}>
            ❔ Ayuda
          </button>

          <div className="marca-lateral">
            <div className="simbolo grande">131</div>
            <strong>SAMU Maule</strong>
            <span>Línea 131</span>
            <span>Reanimación</span>
          </div>
        </aside>

        <main className="contenido panel-contenido">
          <section className="titulo-panel">
            <h2>Panel principal</h2>
            <p>Bienvenida al sistema de registro y respaldo digital de las Hojas de Atención Prehospitalaria (HAP).</p>
          </section>

          <div className="aviso">
            <strong>Importante: la HAP en papel se mantiene como documento original.</strong>
            <br />
            Este prototipo académico permite avanzar en el diseño de la transcripción digital. No utilizar datos reales de pacientes.
          </div>

          <section className="resumen">
            <article className="tarjeta tarjeta-azul">
              <span className="icono">📄</span>
              <h3>Borradores</h3>
              <p className="numero">0</p>
              <p>Transcripciones pendientes de continuar.</p>
            </article>

            <article className="tarjeta tarjeta-amarilla">
              <span className="icono">🕒</span>
              <h3>Pendientes de revisión</h3>
              <p className="numero">0</p>
              <p>Registros que requieren revisión.</p>
            </article>

            <article className="tarjeta tarjeta-verde">
              <span className="icono">✓</span>
              <h3>Registros confirmados</h3>
              <p className="numero">0</p>
              <p>Transcripciones confirmadas.</p>
            </article>
          </section>

          <section className="atajos-panel">
            <button className="atajo-principal" onClick={() => { setPagina(1); setPantalla('formulario') }}>
              <span className="atajo-icono">＋</span>
              <span>
                <strong>Nueva transcripción HAP</strong>
                <small>Ingresar información desde una hoja de atención en papel.</small>
              </span>
              <span>→</span>
            </button>

            <button className="atajo-secundario" onClick={() => alert('La búsqueda de registros se desarrollará más adelante.')}>
              <span className="atajo-icono">🔎</span>
              <span>
                <strong>Buscar registros</strong>
                <small>La consulta se habilitará cuando conectemos la base de datos.</small>
              </span>
              <span>→</span>
            </button>
          </section>

          <div className="pie-panel">
            <strong>Sistema de Atención Médica de Urgencia — SAMU Maule</strong>
            <p>Proyecto de Titulación · IPLACEX · 2026</p>
          </div>
        </main>
      </div>
      <footer className="pie">Prototipo académico en desarrollo · SAMU Maule</footer>
    </div>
  )
}
export default App