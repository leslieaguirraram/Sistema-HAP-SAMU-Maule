
import { useState, useRef } from 'react'
import './App.css'
import { db } from './firebase';
import { collection, doc, writeBatch, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';

function App() {
  
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

 async function iniciarSesionPrueba(evento) {
  evento.preventDefault();

  try {
    const credenciales = await signInWithEmailAndPassword(auth, correo, clave);

    setUsuarioActual(credenciales.user);
    setSesionIniciada(true);

    alert('Sesión iniciada correctamente.');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('No se pudo iniciar sesión. Revisa tus credenciales.');
  }
}

  const [pantalla, setPantalla] = useState('inicio')
  const [pagina, setPagina] = useState(1)
  const [guardando, setGuardando] = useState(false);
  const [atenciones, setAtenciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [detalleHAP, setDetalleHAP] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cargandoAtenciones, setCargandoAtenciones] = useState(false);
  const bloqueoGuardado = useRef(false);

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

const limpiarFormulario = () => {
  setHap({
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
  });

  setPagina(1);
};

  function actualizar(campo, valor) {
    setHap((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function cerrarSesion() {
  try {
    await signOut(auth);
    setSesionIniciada(false);
    setUsuarioActual(null);
    setCorreo('');
    setClave('');
    setPantalla('inicio');
    setPagina(1);

    alert('Sesión cerrada correctamente.');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('No se pudo cerrar la sesión.');
  }
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

  if (bloqueoGuardado.current) return;

  bloqueoGuardado.current = true;
  setGuardando(true);

  try {

    const lote = writeBatch(db);

    // 1. Crear identificador de la atención
    const atencionRef = doc(collection(db, 'ATENCIONES_HAP'));
    const atencionId = atencionRef.id;

    // 2. Crear referencias para los documentos relacionados
    const pacienteRef = doc(collection(db, 'PACIENTES_HAP'));
    const evaluacionRef = doc(collection(db, 'EVALUACIONES_CLINICAS'));
    const procedimientoRef = doc(collection(db, 'PROCEDIMIENTOS_HAP'));
    const trasladoRef = doc(collection(db, 'TRASLADOS_HAP'));
    const qtrRef = doc(collection(db, 'TIEMPOS_QTR'));

    // 3. Guardar los datos generales de la atención
    lote.set(atencionRef, {
      fechaAtencion: hap.fechaAtencion,
      base: hap.base,
      movil: hap.movil,
      complejidad: hap.complejidad,
      clave: hap.clave,
      prioridad: hap.prioridad,
      comuna: hap.comuna,
      direccion: hap.direccion,
      pacienteId: pacienteRef.id,
      evaluacionId: evaluacionRef.id,
      procedimientoId: procedimientoRef.id,
      trasladoId: trasladoRef.id,
      tiempoQtrId: qtrRef.id,
      estado_transcripcion: 'borrador',
      fecha_creacion: serverTimestamp(),
      usuario_creacion: usuarioActual.uid,
      usuario_confirmacion: null,
      fecha_confirmacion: null
    });

    // 4. Guardar los datos del paciente
    lote.set(pacienteRef, {
      atencionId,
      nombre: hap.paciente,
      rut: hap.rut,
      edad: hap.edad,
      sexo: hap.sexo,
      antecedentes: hap.antecedentes,
      alergias: hap.alergias
    });

    // 5. Guardar la evaluación clínica
    lote.set(evaluacionRef, {
      atencionId,
      motivo: hap.motivo,
      evaluacionPrimaria: hap.evaluacionPrimaria,
      evaluacionSecundaria: hap.evaluacionSecundaria,
      signosVitales: hap.signosVitales,
      medicamentosHabituales: hap.medicamentosHabituales
    });

    // 6. Guardar procedimientos y medicamentos
    lote.set(procedimientoRef, {
      atencionId,
      procedimientos: hap.procedimientos,
      medicamentos: hap.medicamentos
    });

    // 7. Guardar información del traslado
    lote.set(trasladoRef, {
      atencionId,
      destino: hap.destino,
      estadoTraslado: hap.estadoTraslado,
      observaciones: hap.observaciones
    });

    // 8. Guardar los doce tiempos QTR
    lote.set(qtrRef, {
      atencionId,
      qtr: hap.qtr
    });

    // 9. Guardar todos los documentos en una operación
    await lote.commit();

    alert(`HAP guardada correctamente. ID: ${atencionId}`);

    limpiarFormulario();

    } catch (error) {
    console.error('Error al guardar la HAP:', error);
    alert('No se pudo guardar la HAP. Revisa las reglas de Firestore y la conexión.');
  } finally {
    setGuardando(false);
    bloqueoGuardado.current = false;
  }
}

async function cargarAtenciones() {
  setCargandoAtenciones(true);

  try {
    const [consulta, consultaPacientes] = await Promise.all([
      getDocs(collection(db, 'ATENCIONES_HAP')),
      getDocs(collection(db, 'PACIENTES_HAP'))
    ]);

    const pacientes = {};

    consultaPacientes.docs.forEach((documento) => {
      const paciente = documento.data();
      pacientes[paciente.atencionId] = paciente;
    });

    const registros = consulta.docs.map((documento) => {
      const atencion = documento.data();
      const paciente = pacientes[documento.id];

      return {
        id: documento.id,
        ...atencion,
        rut: paciente?.rut || '',
        nombrePaciente: paciente?.nombre || ''
      };
    });

    setAtenciones(registros);

  } catch (error) {
    console.error('Error al consultar las HAP:', error);
    alert('No se pudieron cargar las atenciones.');
  } finally {
    setCargandoAtenciones(false);
  }
}

async function cargarDetalleHAP(atencion) {
  setCargandoDetalle(true);
  setDetalleHAP(null);

  try {
    const referencias = [
      { campo: 'pacienteId', coleccion: 'PACIENTES_HAP' },
      { campo: 'evaluacionId', coleccion: 'EVALUACIONES_CLINICAS' },
      { campo: 'procedimientoId', coleccion: 'PROCEDIMIENTOS_HAP' },
      { campo: 'trasladoId', coleccion: 'TRASLADOS_HAP' },
      { campo: 'tiempoQtrId', coleccion: 'TIEMPOS_QTR' }
    ];

    const detalle = {};

    for (const referencia of referencias) {

  const identificador = atencion[referencia.campo];

  if (!identificador) {
    detalle[referencia.campo] = null;
    continue;
  }

  const documentoRef = doc(
    db,
    referencia.coleccion,
    identificador
  );

      const resultado = await getDoc(documentoRef);

      detalle[referencia.campo] = resultado.exists()
        ? resultado.data()
        : null;
    }

    const detalleCompleto = {
      ...atencion,
      ...detalle
    };

    setDetalleHAP(detalleCompleto);
    setPantalla('detalle');

    console.log('Detalle completo de la HAP:', detalleCompleto);

  } catch (error) {
    console.error('Error al consultar el detalle de la HAP:', error);
    alert('No se pudo recuperar el detalle de la HAP.');
  } finally {
    setCargandoDetalle(false);
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
            <img
            src="/insignia-samu.png"
            alt="Insignia SAMU Región del Maule"
            className="insignia-samu"
          />
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

          <div className="formulario-hap">
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
                <button
                  type="button"
                  disabled={guardando}
                  onClick={guardarBorrador}
                >
                  {guardando ? 'Guardando...' : 'Probar formulario'}
                </button>

              )}
            </div>
          </div>

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

      const atencionesFiltradas = atenciones.filter((atencion) => {
        const termino = busqueda.toLowerCase().trim();

        if (!termino) return true;

        return [
          atencion.rut,
          atencion.fechaAtencion,
          atencion.base,
          atencion.movil,
          atencion.nombrePaciente
        ].some((valor) =>
          String(valor ?? '').toLowerCase().includes(termino)
        );
      });

  if (pantalla === 'registros') {
  return (
    <div className="aplicacion">
      <header className="encabezado">
        <div className="identidad">
            <img
              src="/insignia-samu.png"
              alt="Insignia SAMU Región del Maule"
              className="insignia-samu"
            />

            <div>
              <h1>SAMU MAULE</h1>
              <p>Consulta de Hojas de Atención Prehospitalaria</p>
            </div>
          </div>

        <button
          className="boton-volver"
          onClick={() => setPantalla('inicio')}
        >
          Volver al inicio
        </button>
      </header>

      <main className="contenido">
        <h2>HAP registradas</h2>

      <div className="buscador-hap">
            <div className="buscador-campo">
              <span className="icono-busqueda">⌕</span>

              <input
                type="text"
                placeholder="Buscar por RUT, fecha, base, móvil o paciente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              {busqueda && (
                <button
                  type="button"
                  className="boton-limpiar"
                  onClick={() => setBusqueda('')}
                >
                  Limpiar
                </button>
              )}
            </div>

            <p>Puede ingresar uno o varios datos para localizar una atención.</p>
          </div>

        {cargandoAtenciones ? (
          <p>Cargando atenciones...</p>
        ) : atencionesFiltradas.length === 0 ? (
          <p>No existen atenciones registradas.</p>
        ) : (
          <div className="campos">
            {atencionesFiltradas.map((atencion) => (
              <article className="tarjeta" key={atencion.id}>
                <h3>Atención {atencion.id}</h3>
                <p>Fecha: {atencion.fechaAtencion || 'No registrada'}</p>
                <p>Base: {atencion.base || 'No registrada'}</p>
                <p>Móvil: {atencion.movil || 'No registrado'}</p>
                <p>Estado: {atencion.estado_transcripcion || 'Sin estado'}</p>

                <button
                  type="button"
                  onClick={() => cargarDetalleHAP(atencion)}
                >
                  Ver detalle
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="pie">SAMU Maule · Proyecto de Titulación · IPLACEX · 2026</footer>
    </div>
  );
}

if (pantalla === 'detalle') {
  return (
    <div className="aplicacion">
      <header className="encabezado">
        <div className="identidad">
          <img
            src="/insignia-samu.png"
            alt="Insignia SAMU Región del Maule"
            className="insignia-samu"
          />
          <div>
            <h1>SAMU MAULE</h1>
            <p>Detalle de Hoja de Atención Prehospitalaria</p>
          </div>
        </div>

        <button
          className="boton-volver"
          onClick={() => setPantalla('registros')}
        >
          Volver a registros
        </button>
      </header>

      <main className="contenido">
        <h2>Detalle de la atención</h2>

     {cargandoDetalle ? (
      <p>Cargando detalle...</p>
    ) : detalleHAP ? (
<>
  {/* 1. DATOS GENERALES */}
<section className="tarjeta">
  <h3>Identificación de la atención</h3>

  <div className="datos-grid">
    <div className="dato-item">
      <strong>Fecha</strong>
      <span>{detalleHAP.fechaAtencion || 'No registrada'}</span>
    </div>

    <div className="dato-item">
      <strong>Base</strong>
      <span>{detalleHAP.base || 'No registrada'}</span>
    </div>

    <div className="dato-item">
      <strong>Móvil</strong>
      <span>{detalleHAP.movil || 'No registrado'}</span>
    </div>

    <div className="dato-item">
      <strong>Complejidad</strong>
      <span>{detalleHAP.complejidad || 'No registrada'}</span>
    </div>

    <div className="dato-item">
      <strong>Clave</strong>
      <span>{detalleHAP.clave || 'No registrada'}</span>
    </div>

    <div className="dato-item">
      <strong>Prioridad</strong>
      <span>{detalleHAP.prioridad || 'No registrada'}</span>
    </div>

    <div className="dato-item">
      <strong>Comuna</strong>
      <span>{detalleHAP.comuna || 'No registrada'}</span>
    </div>

    <div className="dato-item">
      <strong>Dirección</strong>
      <span>{detalleHAP.direccion || 'No registrada'}</span>
    </div>
  </div>
</section>

 {/* 2. DATOS DEL PACIENTE */}
<section className="tarjeta">
  <h3>Identificación del paciente</h3>

  {detalleHAP.pacienteId ? (
    <div className="datos-grid">

      <div className="dato-item">
        <strong>Nombre</strong>
        <span>{detalleHAP.pacienteId.nombre || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>RUT</strong>
        <span>{detalleHAP.pacienteId.rut || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Edad</strong>
        <span>{detalleHAP.pacienteId.edad || 'No registrada'}</span>
      </div>

      <div className="dato-item">
        <strong>Sexo</strong>
        <span>{detalleHAP.pacienteId.sexo || 'No registrado'}</span>
      </div>

    </div>
  ) : (
    <p>No hay datos del paciente asociados.</p>
  )}
</section>

  {/* 3. EVALUACIÓN CLÍNICA */}
<section className="tarjeta">
  <h3>Descripción y evaluación clínica</h3>

  {detalleHAP.evaluacionId ? (
    <div className="datos-grid datos-grid-dos">

      <div className="dato-item">
        <strong>Motivo de atención</strong>
        <span>{detalleHAP.evaluacionId.motivo || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Evaluación primaria</strong>
        <span>{detalleHAP.evaluacionId.evaluacionPrimaria || 'No registrada'}</span>
      </div>

      <div className="dato-item">
        <strong>Evaluación secundaria</strong>
        <span>{detalleHAP.evaluacionId.evaluacionSecundaria || 'No registrada'}</span>
      </div>

      <div className="dato-item">
        <strong>Signos vitales</strong>
        <span>{detalleHAP.evaluacionId.signosVitales || 'No registrados'}</span>
      </div>

      <div className="dato-item">
        <strong>Antecedentes</strong>
        <span>{detalleHAP.pacienteId?.antecedentes || 'No registrados'}</span>
      </div>

      <div className="dato-item">
        <strong>Medicamentos habituales</strong>
        <span>{detalleHAP.evaluacionId.medicamentosHabituales || 'No registrados'}</span>
      </div>

      <div className="dato-item">
        <strong>Alergias</strong>
        <span>{detalleHAP.pacienteId?.alergias || 'No registradas'}</span>
      </div>

    </div>
  ) : (
    <p>No hay evaluación clínica asociada.</p>
  )}
</section>

 {/* 4. PROCEDIMIENTOS Y MEDICAMENTOS */}
<section className="tarjeta">
  <h3>Procedimientos y medicamentos</h3>

  {detalleHAP.procedimientoId ? (
    <div className="datos-grid datos-grid-dos">

      <div className="dato-item">
        <strong>Procedimientos realizados</strong>
        <span>
          {detalleHAP.procedimientoId.procedimientos || 'No registrados'}
        </span>
      </div>

      <div className="dato-item">
        <strong>Medicamentos administrados</strong>
        <span>
          {detalleHAP.procedimientoId.medicamentos || 'No registrados'}
        </span>
      </div>

    </div>
  ) : (
    <p>No hay procedimientos asociados.</p>
  )}
</section>

 {/* 5. TIEMPOS QTR */}
<section className="tarjeta">
  <h3>Registro de tiempos QTR</h3>

  {detalleHAP.tiempoQtrId?.qtr ? (
    <div className="qtr-detalle">
      {detalleHAP.tiempoQtrId.qtr.map((tiempo, indice) => (
        <div className="qtr-detalle-item" key={indice}>
          <strong>QTR {indice + 1}</strong>
          <span>{tiempo || 'Sin registro'}</span>
        </div>
      ))}
    </div>
  ) : (
    <p>No hay tiempos QTR asociados.</p>
  )}
</section>

  {/* 6. TRASLADO */}
<section className="tarjeta">
  <h3>Información del traslado</h3>

  {detalleHAP.trasladoId ? (
    <div className="datos-grid datos-grid-tres">

      <div className="dato-item">
        <strong>Destino</strong>
        <span>
          {detalleHAP.trasladoId.destino || 'No registrado'}
        </span>
      </div>

      <div className="dato-item">
        <strong>Estado del traslado</strong>
        <span>
          {detalleHAP.trasladoId.estadoTraslado || 'No registrado'}
        </span>
      </div>

      <div className="dato-item">
        <strong>Observaciones</strong>
        <span>
          {detalleHAP.trasladoId.observaciones || 'Sin observaciones'}
        </span>
      </div>

    </div>
  ) : (
    <p>No hay información del traslado asociada.</p>
  )}
</section>
</>
  ) : (
   <p>No hay información disponible.</p>
  )}
      </main>

      <footer className="pie">
        SAMU Maule · Proyecto de Titulación · IPLACEX · 2026
      </footer>
    </div>
  );
}
 
  return (
    <div className="aplicacion">
      <header className="encabezado">
        <div className="identidad">
          <img
          src="/insignia-samu.png"
          alt="Insignia SAMU Región del Maule"
          className="insignia-samu"
        />
          <div>
            <h1>SAMU Maule | Registro HAP</h1>
            <p>Sistema de Atención Médica de Urgencia</p>
          </div>
        </div>
        <div className="acciones-encabezado">
          <span className="estado">Prototipo académico</span>

          <button
            className="boton-cerrar-sesion"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      
      </header>

      <div className="estructura-panel">
        <aside className="menu-lateral">
          <button className="opcion-menu activa" onClick={() => setPantalla('inicio')}>
            🏠 Inicio
          </button>
          <button className="opcion-menu" onClick={() => { setPagina(1); setPantalla('formulario') }}>
            📋 Registrar HAP
          </button>
          <button
            className="opcion-menu"
            onClick={() => {
              setPantalla('registros');
              cargarAtenciones();
            }}
          >
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
            <img
              src="/ambulancia_samu.png"
              alt="Ambulancia SAMU"
              className="ambulancia-lateral"
            />
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

            <button
              className="atajo-secundario"
              onClick={() => {
                setPantalla('registros');
                cargarAtenciones();
              }}
            >
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