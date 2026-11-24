
import { useState, useRef } from 'react'
import './App.css'
import { db } from './firebase';
import { collection, doc, writeBatch, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { generarHAP } from './utils/generarHAP';

function App() {
  
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [usuarioActual, setUsuarioActual] = useState(null);

 
async function iniciarSesionPrueba(evento) {
  evento.preventDefault();

  try {
    const credenciales = await signInWithEmailAndPassword(
      auth,
      correo,
      clave
    );

    const usuario = credenciales.user;

    // Buscar el perfil asociado al UID del usuario
    const referenciaUsuario = doc(db, 'usuarios', usuario.uid);
    const documentoUsuario = await getDoc(referenciaUsuario);

    if (!documentoUsuario.exists()) {
      await signOut(auth);
      alert('El usuario no tiene un perfil asignado.');
      return;
    }

    const datosUsuario = documentoUsuario.data();

    if (datosUsuario.activo !== true) {
      await signOut(auth);
      alert('Esta cuenta se encuentra desactivada.');
      return;
    }

    setUsuarioActual({
      ...usuario,
      perfil: datosUsuario.perfil,
      nombre: datosUsuario.nombre
    });

    setSesionIniciada(true);

    alert(`Sesión iniciada correctamente. Perfil: ${datosUsuario.perfil}`);

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
    r: '',
    t: '',
    f: '',
    mr: '',
    pr: '',
    ot: '',
    paciente: '',
    rut: '',
    edad: '',
    sexo: '',
    descripcionCR: '',
    evaluacionPrimaria: '',
    cincinnati: '',
    conciencia: '',
    ventilacion: '',
    hemodinamia: '',
    trazadoECG: '',
    cabeza: '',
    cuello: '',
    viaAereaDificil: '',
    torax: '',
    dorso: '',
    abdomen: '',
    pelvis: '',
    extremidadesSuperiores: '',
    extremidadesInferiores: '',
    genitales: '',
    pielMucosas: '',
    antecedentes: [],
    antecedentesOtros: '',
    medicamentosHabituales: '',
    alergias: '',
    signosVitales: Array(3).fill({
      hora: '',
      glasgow: '',
      fr: '',
      fc: '',
      pa: '',
      pam: '',
      llCapilar: '',
      glicemia: '',
      fio2: '',
      sat: '',
      co2: '',
      temperatura: '',
      eva: '',
      triage: ''
    }),
    procedimientos: [],
    medicamentos: Array(5).fill({
      hora: '',
      medicamento: '',
      via: '',
      dosis: '',
      respuesta: ''
    }),
    traslado: '',
    categorizacionCR: '',
    entregadoUEH: '',
    destinos: [],
    apoyos: [],
    claveReal: '',
    profesionalReceptorUEH: '',
    profesionalEntregaSAPU: '',
    responsableRegistro: '',
    estadoEscena: '',
    estadoDuranteTraslado: '',
    estadoUnidadEmergencia: '',
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
    r: '',
    t: '',
    f: '',
    mr: '',
    pr: '',
    ot: '',
    paciente: '',
    rut: '',
    edad: '',
    sexo: '',
    descripcionCR: '',
    evaluacionPrimaria: '',
    cincinnati: '',
    conciencia: '',
    ventilacion: '',
    hemodinamia: '',
    trazadoECG: '',
    cabeza: '',
    cuello: '',
    viaAereaDificil: '',
    torax: '',
    dorso: '',
    abdomen: '',
    pelvis: '',
    extremidadesSuperiores: '',
    extremidadesInferiores: '',
    genitales: '',
    pielMucosas: '',
    antecedentes: [],
    antecedentesOtros: '',
    medicamentosHabituales: '',
    alergias: '',
    signosVitales: Array(3).fill({
      hora: '',
      glasgow: '',
      fr: '',
      fc: '',
      pa: '',
      pam: '',
      llCapilar: '',
      glicemia: '',
      fio2: '',
      sat: '',
      co2: '',
      temperatura: '',
      eva: '',
      triage: ''
    }),
    procedimientos: [],
    medicamentos: Array(5).fill({
      hora: '',
      medicamento: '',
      via: '',
      dosis: '',
      respuesta: ''
    }),
    traslado: '',
    categorizacionCR: '',
    entregadoUEH: '',
    destinos: [],
    apoyos: [],
    claveReal: '',
    profesionalReceptorUEH: '',
    profesionalEntregaSAPU: '',
    responsableRegistro: '',
    estadoEscena: '',
    estadoDuranteTraslado: '',
    estadoUnidadEmergencia: '',
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
      r: hap.r,
      t: hap.t,
      f: hap.f,
      mr: hap.mr,
      pr: hap.pr,
      ot: hap.ot,
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
      antecedentesOtros: hap.antecedentesOtros,
      alergias: hap.alergias
    });

   
    // 5. Guardar la evaluación clínica
    lote.set(evaluacionRef, {
      atencionId,
      descripcionCR: hap.descripcionCR,
      evaluacionPrimaria: hap.evaluacionPrimaria,

      cincinnati: hap.cincinnati,
      conciencia: hap.conciencia,
      ventilacion: hap.ventilacion,
      hemodinamia: hap.hemodinamia,
      trazadoECG: hap.trazadoECG,
      cabeza: hap.cabeza,
      cuello: hap.cuello,
      viaAereaDificil: hap.viaAereaDificil,
      torax: hap.torax,
      dorso: hap.dorso,
      abdomen: hap.abdomen,
      pelvis: hap.pelvis,
      extremidadesSuperiores: hap.extremidadesSuperiores,
      extremidadesInferiores: hap.extremidadesInferiores,
      genitales: hap.genitales,
      pielMucosas: hap.pielMucosas,

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
      traslado: hap.traslado,
      categorizacionCR: hap.categorizacionCR,
      entregadoUEH: hap.entregadoUEH,
      destinos: hap.destinos,
      apoyos: hap.apoyos,
      destino: hap.destino,
      claveReal: hap.claveReal,
      profesionalReceptorUEH: hap.profesionalReceptorUEH,
      profesionalEntregaSAPU: hap.profesionalEntregaSAPU,
      responsableRegistro: hap.responsableRegistro,
      estadoEscena: hap.estadoEscena,
      estadoDuranteTraslado: hap.estadoDuranteTraslado,
      estadoUnidadEmergencia: hap.estadoUnidadEmergencia,
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
                  <select
                    value={hap.base}
                    onChange={(e) => actualizar('base', e.target.value)}
                  >
                    <option value="">Seleccione una base</option>
                    <option value="TALCA BASE 1">TALCA BASE 1</option>
                    <option value="LINARES BASE 2">LINARES BASE 2</option>
                    <option value="CURICÓ BASE 3">CURICÓ BASE 3</option>
                    <option value="CAUQUENES BASE 4">CAUQUENES BASE 4</option>
                    <option value="CONSTITUCIÓN BASE 5">CONSTITUCIÓN BASE 5</option>
                    <option value="PARRAL BASE 6">PARRAL BASE 6</option>
                    <option value="LICANTÉN BASE 7">LICANTÉN BASE 7</option>
                    <option value="MOLINA BASE 8">MOLINA BASE 8</option>
                    <option value="SAN JAVIER BASE 9">SAN JAVIER BASE 9</option>
                    <option value="TENO BASE 10">TENO BASE 10</option>
                    <option value="SAN CLEMENTE BASE 11">SAN CLEMENTE BASE 11</option>
                    <option value="LONGAVÍ BASE 12">LONGAVÍ BASE 12</option>
                    <option value="CHANCO BASE 13">CHANCO BASE 13</option>
                  </select>
                </label>

                  <label>
                  Móvil
                  <select
                    value={hap.movil}
                    onChange={(e) => actualizar('movil', e.target.value)}
                  >
                    <option value="">Seleccione un móvil</option>
                    <option value="7-638">7-638</option>
                    <option value="7-639">7-639</option>
                    <option value="7-623">7-623</option>
                    <option value="7-627">7-627</option>
                    <option value="7-628">7-628</option>
                    <option value="7-614">7-614</option>
                    <option value="7-624">7-624</option>
                    <option value="7-625">7-625</option>
                    <option value="7-616">7-616</option>
                    <option value="7-626">7-626</option>
                    <option value="7-610">7-610</option>
                    <option value="7-615">7-615</option>
                    <option value="7-587">7-587</option>
                    <option value="7-612">7-612</option>
                    <option value="7-595">7-595</option>
                    <option value="7-592">7-592</option>
                    <option value="7-591">7-591</option>
                    <option value="7-611">7-611</option>
                    <option value="7-593">7-593</option>
                  </select>
                </label>

                  <label>
                  Complejidad
                  <select
                    value={hap.complejidad}
                    onChange={(e) => actualizar('complejidad', e.target.value)}
                  >
                    <option value="">Seleccione complejidad</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
                </label>

                  <label>
                Clave
                <select
                  value={hap.clave}
                  onChange={(e) => actualizar('clave', e.target.value)}
                >
                  <option value="">Seleccione clave</option>

                  <option value="100">100</option>
                  <option value="101">101</option>
                  <option value="102">102</option>
                  <option value="103">103</option>
                  <option value="104">104</option>
                  <option value="105">105</option>
                  <option value="106">106</option>
                  <option value="107">107</option>
                  <option value="108">108</option>
                  <option value="109">109</option>
                  <option value="110">110</option>
                  <option value="111">111</option>
                  <option value="112">112</option>
                  <option value="114">114</option>
                  <option value="115">115</option>
                  <option value="116">116</option>
                  <option value="117">117</option>
                  <option value="118">118</option>
                  <option value="119">119</option>
                  <option value="120">120</option>
                  <option value="121">121</option>
                  <option value="122">122</option>
                  <option value="123">123</option>
                  <option value="124">124</option>
                  <option value="125">125</option>
                  <option value="129">129</option>
                  <option value="130">130</option>

                  <option value="200">200</option>
                  <option value="201">201</option>
                  <option value="202">202</option>
                  <option value="203">203</option>
                  <option value="204">204</option>
                  <option value="205">205</option>
                  <option value="206">206</option>
                  <option value="207">207</option>
                  <option value="208">208</option>
                  <option value="209">209</option>
                  <option value="210">210</option>
                  <option value="211">211</option>
                  <option value="212">212</option>
                  <option value="213">213</option>
                  <option value="214">214</option>
                  <option value="215">215</option>
                  <option value="216">216</option>
                  <option value="217">217</option>
                  <option value="218">218</option>
                  <option value="219">219</option>
                  <option value="220">220</option>
                  <option value="221">221</option>
                  <option value="222">222</option>
                  <option value="223">223</option>
                  <option value="224">224</option>
                  <option value="225">225</option>
                  <option value="226">226</option>
                  <option value="227">227</option>
                  <option value="228">228</option>
                  <option value="229">229</option>
                  <option value="230">230</option>
                  <option value="231">231</option>
                  <option value="232">232</option>
                  <option value="233">233</option>
                  <option value="234">234</option>
                  <option value="235">235</option>
                  <option value="236">236</option>
                  <option value="237">237</option>
                  <option value="238">238</option>
                  <option value="239">239</option>
                  <option value="240">240</option>
                  <option value="241">241</option>

                  <option value="300">300</option>
                  <option value="301">301</option>
                  <option value="302">302</option>
                  <option value="303">303</option>
                  <option value="304">304</option>

                  <option value="400">400</option>
                  <option value="401">401</option>
                  <option value="402">402</option>

                  <option value="501">501</option>
                  <option value="502">502</option>

                  <option value="601">601</option>
                  <option value="602">602</option>
                  <option value="603">603</option>

                  <option value="801">801</option>
                  <option value="802">802</option>

                  <option value="901">901</option>
                  <option value="902">902</option>
                </select>
              </label>

              
              <label>
                Clave real
                <select
                  value={hap.claveReal}
                  onChange={(e) => actualizar('claveReal', e.target.value)}
                >
                  <option value="">Seleccione clave real</option>

                  <option value="100">100</option>
                  <option value="101">101</option>
                  <option value="102">102</option>
                  <option value="103">103</option>
                  <option value="104">104</option>
                  <option value="105">105</option>
                  <option value="106">106</option>
                  <option value="107">107</option>
                  <option value="108">108</option>
                  <option value="109">109</option>
                  <option value="110">110</option>
                  <option value="111">111</option>
                  <option value="112">112</option>
                  <option value="114">114</option>
                  <option value="115">115</option>
                  <option value="116">116</option>
                  <option value="117">117</option>
                  <option value="118">118</option>
                  <option value="119">119</option>
                  <option value="120">120</option>
                  <option value="121">121</option>
                  <option value="122">122</option>
                  <option value="123">123</option>
                  <option value="124">124</option>
                  <option value="125">125</option>
                  <option value="129">129</option>
                  <option value="130">130</option>

                  <option value="200">200</option>
                  <option value="201">201</option>
                  <option value="202">202</option>
                  <option value="203">203</option>
                  <option value="204">204</option>
                  <option value="205">205</option>
                  <option value="206">206</option>
                  <option value="207">207</option>
                  <option value="208">208</option>
                  <option value="209">209</option>
                  <option value="210">210</option>
                  <option value="211">211</option>
                  <option value="212">212</option>
                  <option value="213">213</option>
                  <option value="214">214</option>
                  <option value="215">215</option>
                  <option value="216">216</option>
                  <option value="217">217</option>
                  <option value="218">218</option>
                  <option value="219">219</option>
                  <option value="220">220</option>
                  <option value="221">221</option>
                  <option value="222">222</option>
                  <option value="223">223</option>
                  <option value="224">224</option>
                  <option value="225">225</option>
                  <option value="226">226</option>
                  <option value="227">227</option>
                  <option value="228">228</option>
                  <option value="229">229</option>
                  <option value="230">230</option>
                  <option value="231">231</option>
                  <option value="232">232</option>
                  <option value="233">233</option>
                  <option value="234">234</option>
                  <option value="235">235</option>
                  <option value="236">236</option>
                  <option value="237">237</option>
                  <option value="238">238</option>
                  <option value="239">239</option>
                  <option value="240">240</option>
                  <option value="241">241</option>

                  <option value="300">300</option>
                  <option value="301">301</option>
                  <option value="302">302</option>
                  <option value="303">303</option>
                  <option value="304">304</option>

                  <option value="400">400</option>
                  <option value="401">401</option>
                  <option value="402">402</option>

                  <option value="501">501</option>
                  <option value="502">502</option>

                  <option value="601">601</option>
                  <option value="602">602</option>
                  <option value="603">603</option>

                  <option value="801">801</option>
                  <option value="802">802</option>

                  <option value="901">901</option>
                  <option value="902">902</option>
                </select>
              </label>



                  <label>
                    Prioridad
                    <select
                      value={hap.prioridad}
                      onChange={(e) => actualizar('prioridad', e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      <option value="SI">SÍ</option>
                      <option value="NO">NO</option>
                    </select>
                  </label>

                  <label>
                  Comuna
                  <select
                    value={hap.comuna}
                    onChange={(e) => actualizar('comuna', e.target.value)}
                  >
                    <option value="">Seleccione una comuna</option>

                    <optgroup label="Provincia de Talca">
                      <option value="Talca">Talca</option>
                      <option value="Constitución">Constitución</option>
                      <option value="Curepto">Curepto</option>
                      <option value="Empedrado">Empedrado</option>
                      <option value="Maule">Maule</option>
                      <option value="Pelarco">Pelarco</option>
                      <option value="Pencahue">Pencahue</option>
                      <option value="Río Claro">Río Claro</option>
                      <option value="San Clemente">San Clemente</option>
                      <option value="San Rafael">San Rafael</option>
                    </optgroup>

                    <optgroup label="Provincia de Curicó">
                      <option value="Curicó">Curicó</option>
                      <option value="Hualañé">Hualañé</option>
                      <option value="Licantén">Licantén</option>
                      <option value="Molina">Molina</option>
                      <option value="Rauco">Rauco</option>
                      <option value="Romeral">Romeral</option>
                      <option value="Sagrada Familia">Sagrada Familia</option>
                      <option value="Teno">Teno</option>
                      <option value="Vichuquén">Vichuquén</option>
                    </optgroup>

                    <optgroup label="Provincia de Linares">
                      <option value="Linares">Linares</option>
                      <option value="Colbún">Colbún</option>
                      <option value="Longaví">Longaví</option>
                      <option value="Parral">Parral</option>
                      <option value="Retiro">Retiro</option>
                      <option value="San Javier">San Javier</option>
                      <option value="Villa Alegre">Villa Alegre</option>
                      <option value="Yerbas Buenas">Yerbas Buenas</option>
                    </optgroup>

                    <optgroup label="Provincia de Cauquenes">
                      <option value="Cauquenes">Cauquenes</option>
                      <option value="Chanco">Chanco</option>
                      <option value="Pelluhue">Pelluhue</option>
                    </optgroup>
                  </select>
                </label>

                  <div className="personal-hap-grid">
                  <label>
                    R
                    <input
                      value={hap.r}
                      onChange={(e) => actualizar('r', e.target.value)}
                      placeholder="Código R"
                    />
                  </label>

                  <label>
                    T
                    <input
                      value={hap.t}
                      onChange={(e) => actualizar('t', e.target.value)}
                      placeholder="Código T"
                    />
                  </label>

                  <label>
                    F 
                    <input
                      value={hap.f}
                      onChange={(e) => actualizar('f', e.target.value)}
                      placeholder="Código F"
                    />
                  </label>

                  <label>
                    MR
                    <input
                      value={hap.mr}
                      onChange={(e) => actualizar('mr', e.target.value)}
                      placeholder="Código MR"
                    />
                  </label>

                  <label>
                    PR
                    <input
                      value={hap.pr}
                      onChange={(e) => actualizar('pr', e.target.value)}
                      placeholder="Código PR"
                    />
                  </label>

                  <label>
                    OT
                    <input
                      value={hap.ot}
                      onChange={(e) => actualizar('ot', e.target.value)}
                      placeholder="Código OT"
                    />
                  </label>
                  </div>

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
                    Descripción del evento por CR
                    <textarea
                      value={hap.descripcionCR}
                      onChange={(e) => actualizar('descripcionCR', e.target.value)}
                      rows="2"
                      placeholder="Descripción entregada por el Centro Regulador"
                    />
                  </label>

                                        
                  <div className="ancho-completo">
                    <label>Antecedentes mórbidos</label>

                    <div className="antecedentes-grid">
                      {['HTA-AVE', 'DM', 'Epilepsia', 'Ginecológico', 'Asma',
                        'Cardiológicos', 'Renal', 'Psiquiátricos', 'CA', 'Otros'].map((opcion) => (
                        <label key={opcion}>
                          <input
                            type="checkbox"
                            checked={hap.antecedentes.includes(opcion)}
                            onChange={(e) => {
                              const nuevosAntecedentes = e.target.checked
                                ? [...hap.antecedentes, opcion]
                                : hap.antecedentes.filter((item) => item !== opcion);

                              actualizar('antecedentes', nuevosAntecedentes);
                            }}
                          />
                          {opcion}
                        </label>
                      ))}
                    </div>
                  

                  {hap.antecedentes.includes('Otros') && (
                      <label className="ancho-completo">
                        Especifique otros antecedentes
                        <textarea
                          value={hap.antecedentesOtros}
                          onChange={(e) => actualizar('antecedentesOtros', e.target.value)}
                          rows="2"
                          placeholder="Describa los otros antecedentes"
                        />
                      </label>
                    )}

                    </div>                    


                    <label className="ancho-completo">
                      Medicamentos
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

                   
                    <div className="ancho-completo">
                      <label>Evaluación secundaria</label>

                      <div className="evaluacion-secundaria-grid">
                        <label>Cincinnati
                          <textarea value={hap.cincinnati} onChange={(e) => actualizar('cincinnati', e.target.value)} rows="2" />
                        </label>
                        <label>Tórax
                          <textarea value={hap.torax} onChange={(e) => actualizar('torax', e.target.value)} rows="2" />
                        </label>

                        <label>Conciencia
                          <textarea value={hap.conciencia} onChange={(e) => actualizar('conciencia', e.target.value)} rows="2" />
                        </label>
                        <label>Dorso
                          <textarea value={hap.dorso} onChange={(e) => actualizar('dorso', e.target.value)} rows="2" />
                        </label>

                        <label>Ventilación
                          <textarea value={hap.ventilacion} onChange={(e) => actualizar('ventilacion', e.target.value)} rows="2" />
                        </label>
                        <label>Abdomen
                          <textarea value={hap.abdomen} onChange={(e) => actualizar('abdomen', e.target.value)} rows="2" />
                        </label>

                        <label>Hemodinamia
                          <textarea value={hap.hemodinamia} onChange={(e) => actualizar('hemodinamia', e.target.value)} rows="2" />
                        </label>
                        <label>Pelvis
                          <textarea value={hap.pelvis} onChange={(e) => actualizar('pelvis', e.target.value)} rows="2" />
                        </label>

                        <label>Trazado-ECG
                          <textarea value={hap.trazadoECG} onChange={(e) => actualizar('trazadoECG', e.target.value)} rows="2" />
                        </label>
                        <label>Extremidades superiores
                          <textarea value={hap.extremidadesSuperiores} onChange={(e) => actualizar('extremidadesSuperiores', e.target.value)} rows="2" />
                        </label>

                        <label>Cabeza
                          <textarea value={hap.cabeza} onChange={(e) => actualizar('cabeza', e.target.value)} rows="2" />
                        </label>
                        <label>Extremidades inferiores
                          <textarea value={hap.extremidadesInferiores} onChange={(e) => actualizar('extremidadesInferiores', e.target.value)} rows="2" />
                        </label>

                        <label>Cuello
                          <textarea value={hap.cuello} onChange={(e) => actualizar('cuello', e.target.value)} rows="2" />
                        </label>
                        <label>Genitales
                          <textarea value={hap.genitales} onChange={(e) => actualizar('genitales', e.target.value)} rows="2" />
                        </label>

                        <label>Vía aérea difícil
                          <textarea value={hap.viaAereaDificil} onChange={(e) => actualizar('viaAereaDificil', e.target.value)} rows="2" />
                        </label>
                        <label>Piel y mucosas
                          <textarea value={hap.pielMucosas} onChange={(e) => actualizar('pielMucosas', e.target.value)} rows="2" />
                        </label>
                      </div>
                    </div>


                    
                    <div className="ancho-completo">
                      <label>Signos vitales</label>

                      <div className="tabla-signos-vitales">
                        <table>
                          <thead>
                            <tr>
                              {['Hora', 'Glasgow', 'FR', 'FC', 'P.A.', 'PAM',
                                'LL capilar', 'Glicemia', 'FiO2', 'SAT', 'CO2',
                                'Temperatura', 'EVA', 'Triage'].map((campo) => (
                                <th key={campo}>{campo}</th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {hap.signosVitales.map((fila, indice) => (
                              <tr key={indice}>
                                {[
                                  'hora', 'glasgow', 'fr', 'fc', 'pa', 'pam',
                                  'llCapilar', 'glicemia', 'fio2', 'sat', 'co2',
                                  'temperatura', 'eva', 'triage'
                                ].map((campo) => (
                                  <td key={campo}>
                                    <input
                                      type={campo === 'hora' ? 'time' : 'text'}
                                      value={fila[campo]}
                                      onChange={(e) => {
                                        const nuevasFilas = hap.signosVitales.map((registro, i) =>
                                          i === indice
                                            ? { ...registro, [campo]: e.target.value }
                                            : registro
                                        );

                                        actualizar('signosVitales', nuevasFilas);
                                      }}
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

              </>
            ) : (
              <>
                <h3>5. Procedimientos y medicamentos</h3>
                <div className="campos">
                  
                <div className="ancho-completo">
                  <label>Procedimientos realizados</label>

                  <div className="procedimientos-grid">
                    {[
                      'CSV',
                      'Aspiración orofaríngea',
                      'Vía básica',
                      'Vía avanzada',
                      'SIR',
                      'RCP básica-DEA',
                      'RCP avanzada',
                      'Compresor torácico automático',
                      'Oxigenoterapia',
                      'Monitorización ECG',
                      'Desfibrilación',
                      'Cardioversión eléctrica',
                      'Cardioversión farmacológica',
                      'Compresión torácica',
                      'Marcapaso externo',
                      'Nebulización',
                      'Electrocardiograma',
                      'Toracocentesis',
                      'Vía venosa/Osteoclisis',
                      'Compresión de hemorragias',
                      'Empaquetamiento/CC',
                      'Ferulación',
                      'Glicemia capilar',
                      'Atención de parto',
                      'Atención de quemados',
                      'Lavado gástrico',
                      'Punción cricoidea',
                      'Torniquete'
                    ].map((opcion) => (
                      <label key={opcion}>
                        <input
                          type="checkbox"
                          checked={hap.procedimientos.includes(opcion)}
                          onChange={(e) => {
                            const nuevosProcedimientos = e.target.checked
                              ? [...hap.procedimientos, opcion]
                              : hap.procedimientos.filter((item) => item !== opcion);

                            actualizar('procedimientos', nuevosProcedimientos);
                          }}
                        />
                        {opcion}
                      </label>
                    ))}
                  </div>
                </div>


                  
                <div className="ancho-completo">
                  <label>Medicamentos y terapias administradas</label>

                  <div className="tabla-medicamentos">
                    <table>
                      <thead>
                        <tr>
                          <th>Hora</th>
                          <th>Medicamento / Terapia eléctrica</th>
                          <th>Vía</th>
                          <th>Dosis</th>
                          <th>Respuesta</th>
                        </tr>
                      </thead>

                      <tbody>
                        {hap.medicamentos.map((fila, indice) => (
                          <tr key={indice}>
                            {['hora', 'medicamento', 'via', 'dosis', 'respuesta'].map((campo) => (
                              <td key={campo}>
                                <input
                                  type={campo === 'hora' ? 'time' : 'text'}
                                  value={fila[campo]}
                                  onChange={(e) => {
                                    const nuevosMedicamentos = hap.medicamentos.map((registro, i) =>
                                      i === indice
                                        ? { ...registro, [campo]: e.target.value }
                                        : registro
                                    );

                                    actualizar('medicamentos', nuevosMedicamentos);
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>


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

                    <label>
                      ¿Se realizó traslado?
                      <select
                        value={hap.traslado}
                        onChange={(e) => actualizar('traslado', e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="SI">SÍ</option>
                        <option value="NO">NO</option>
                      </select>
                    </label>

                    <label>
                      Categorización CR
                      <select
                        value={hap.categorizacionCR}
                        onChange={(e) => actualizar('categorizacionCR', e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                        <option value="C3">C3</option>
                        <option value="C4">C4</option>
                        <option value="C5">C5</option>
                      </select>
                    </label>

                    <label>
                      Paciente entregado en selector de demanda UEH
                      <select
                        value={hap.entregadoUEH}
                        onChange={(e) => actualizar('entregadoUEH', e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="SI">SÍ</option>
                        <option value="NO">NO</option>
                      </select>
                    </label>

                    
                    <label>
                      Destino del traslado
                      <select
                        value={hap.destinos[0] || ''}
                        onChange={(e) => actualizar('destinos', e.target.value ? [e.target.value] : [])}
                      >
                        <option value="">Seleccione destino</option>
                        <option value="UEH">UEH</option>
                        <option value="SAPU">SAPU</option>
                        <option value="SUR">SUR</option>
                        <option value="Clínica">Clínica</option>
                      </select>
                    </label>


                    <div className="ancho-completo">
                      <strong>Apoyos</strong>
                      <div className="procedimientos-grid">
                        {['Bomberos', 'Carabineros', 'Ambulancia'].map((apoyo) => (
                          <label key={apoyo}>
                            <input
                              type="checkbox"
                              checked={hap.apoyos.includes(apoyo)}
                              onChange={(e) => {
                                const nuevosApoyos = e.target.checked
                                  ? [...hap.apoyos, apoyo]
                                  : hap.apoyos.filter((a) => a !== apoyo);
                                actualizar('apoyos', nuevosApoyos);
                              }}
                            />
                            {apoyo}
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="ancho-completo">
                      Profesional receptor UEH
                      <input
                        value={hap.profesionalReceptorUEH}
                        onChange={(e) => actualizar('profesionalReceptorUEH', e.target.value)}
                      />
                    </label>

                    <label className="ancho-completo">
                      Profesional que entrega en SAPU
                      <input
                        value={hap.profesionalEntregaSAPU}
                        onChange={(e) => actualizar('profesionalEntregaSAPU', e.target.value)}
                      />
                    </label>

                    <label className="ancho-completo">
                      Responsable del registro
                      <input
                        value={hap.responsableRegistro}
                        onChange={(e) => actualizar('responsableRegistro', e.target.value)}
                      />
                    </label>

                    <label>
                      Estado del paciente en escena
                      <select
                        value={hap.estadoEscena}
                        onChange={(e) => actualizar('estadoEscena', e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="E">E - Estable</option>
                        <option value="I">I - Inestable</option>
                        <option value="F">F - Fallecido</option>
                      </select>
                    </label>

                    <label>
                      Estado del paciente durante el traslado
                      <select
                        value={hap.estadoDuranteTraslado}
                        onChange={(e) => actualizar('estadoDuranteTraslado', e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="E">E - Estable</option>
                        <option value="I">I - Inestable</option>
                        <option value="F">F - Fallecido</option>
                      </select>
                    </label>

                    <label>
                      Estado del paciente en unidad de emergencia
                      <select
                        value={hap.estadoUnidadEmergencia}
                        onChange={(e) => actualizar('estadoUnidadEmergencia', e.target.value)}
                      >
                        <option value="">Seleccione</option>
                        <option value="E">E - Estable</option>
                        <option value="I">I - Inestable</option>
                        <option value="F">F - Fallecido</option>
                      </select>
                    </label>

                    <label className="ancho-completo">
                      Destino o centro receptor
                      <input
                        value={hap.destino}
                        onChange={(e) => actualizar('destino', e.target.value)}
                      />
                    </label>

                    <label className="ancho-completo">
                      Observaciones
                      <textarea
                        value={hap.observaciones}
                        onChange={(e) => actualizar('observaciones', e.target.value)}
                        rows="3"
                      />
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
                  {guardando ? 'Guardando...' : 'GUARDAR HAP'}
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

        {detalleHAP && (
          <button
            type="button"
            onClick={() => generarHAP(detalleHAP)}
          >
            GENERAR PDF
          </button>
        )}

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
        <strong>Evaluación primaria</strong>
        <span>{detalleHAP.evaluacionId.evaluacionPrimaria || 'No registrada'}</span>
      </div>

      
            <div className="ancho-completo">
              <strong>Evaluación secundaria</strong>

              <div className="evaluacion-secundaria-grid">
                <div className="dato-item">
                  <strong>Cincinnati</strong>
                  <span>{detalleHAP.evaluacionId?.cincinnati || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Tórax</strong>
                  <span>{detalleHAP.evaluacionId?.torax || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Conciencia</strong>
                  <span>{detalleHAP.evaluacionId?.conciencia || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Dorso</strong>
                  <span>{detalleHAP.evaluacionId?.dorso || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Ventilación</strong>
                  <span>{detalleHAP.evaluacionId?.ventilacion || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Abdomen</strong>
                  <span>{detalleHAP.evaluacionId?.abdomen || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Hemodinamia</strong>
                  <span>{detalleHAP.evaluacionId?.hemodinamia || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Pelvis</strong>
                  <span>{detalleHAP.evaluacionId?.pelvis || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Trazado-ECG</strong>
                  <span>{detalleHAP.evaluacionId?.trazadoECG || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Extremidades superiores</strong>
                  <span>{detalleHAP.evaluacionId?.extremidadesSuperiores || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Cabeza</strong>
                  <span>{detalleHAP.evaluacionId?.cabeza || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Extremidades inferiores</strong>
                  <span>{detalleHAP.evaluacionId?.extremidadesInferiores || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Cuello</strong>
                  <span>{detalleHAP.evaluacionId?.cuello || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Genitales</strong>
                  <span>{detalleHAP.evaluacionId?.genitales || 'No registrada'}</span>
                </div>

                <div className="dato-item">
                  <strong>Vía aérea difícil</strong>
                  <span>{detalleHAP.evaluacionId?.viaAereaDificil || 'No registrada'}</span>
                </div>
                <div className="dato-item">
                  <strong>Piel y mucosas</strong>
                  <span>{detalleHAP.evaluacionId?.pielMucosas || 'No registrada'}</span>
                </div>
              </div>
            </div>


      
                <div className="ancho-completo">
                  <strong>Signos vitales</strong>

                  <div className="tabla-signos-vitales">
                    <table>
                      <thead>
                        <tr>
                          {['Hora', 'Glasgow', 'FR', 'FC', 'P.A.', 'PAM',
                            'LL capilar', 'Glicemia', 'FiO2', 'SAT', 'CO2',
                            'Temperatura', 'EVA', 'Triage'].map((campo) => (
                            <th key={campo}>{campo}</th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {(detalleHAP.evaluacionId?.signosVitales || []).map((fila, indice) => (
                          <tr key={indice}>
                            {[
                              'hora', 'glasgow', 'fr', 'fc', 'pa', 'pam',
                              'llCapilar', 'glicemia', 'fio2', 'sat', 'co2',
                              'temperatura', 'eva', 'triage'
                            ].map((campo) => (
                              <td key={campo}>
                                {fila[campo] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

        {Array.isArray(detalleHAP.procedimientoId.procedimientos) &&
        detalleHAP.procedimientoId.procedimientos.length > 0 ? (
          <ul>
            {detalleHAP.procedimientoId.procedimientos.map((procedimiento, indice) => (
              <li key={indice}>{procedimiento}</li>
            ))}
          </ul>
        ) : (
          <span>No registrados</span>
        )}
      </div>

    
        <div className="ancho-completo">
          <strong>Medicamentos administrados</strong>

          <div className="tabla-medicamentos">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Medicamento / Terapia eléctrica</th>
                  <th>Vía</th>
                  <th>Dosis</th>
                  <th>Respuesta</th>
                </tr>
              </thead>

              <tbody>
                {(detalleHAP.procedimientoId?.medicamentos || []).map((fila, indice) => (
                  <tr key={indice}>
                    {['hora', 'medicamento', 'via', 'dosis', 'respuesta'].map((campo) => (
                      <td key={campo}>
                        {fila[campo] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <strong>¿Se realizó traslado?</strong>
        <span>{detalleHAP.trasladoId.traslado || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Categorización CR</strong>
        <span>{detalleHAP.trasladoId.categorizacionCR || 'No registrada'}</span>
      </div>

      <div className="dato-item">
        <strong>Entregado en selector UEH</strong>
        <span>{detalleHAP.trasladoId.entregadoUEH || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Destinos del traslado</strong>
        <span>
          {detalleHAP.trasladoId.destinos?.join(', ') || 'No registrados'}
        </span>
      </div>

      <div className="dato-item">
        <strong>Apoyos</strong>
        <span>
          {detalleHAP.trasladoId.apoyos?.join(', ') || 'No registrados'}
        </span>
      </div>

      <div className="dato-item">
        <strong>Destino o centro receptor</strong>
        <span>{detalleHAP.trasladoId.destino || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Clave real</strong>
        <span>{detalleHAP.trasladoId.claveReal || 'No registrada'}</span>
      </div>

      <div className="dato-item">
        <strong>Profesional receptor UEH</strong>
        <span>{detalleHAP.trasladoId.profesionalReceptorUEH || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Profesional que entrega en SAPU</strong>
        <span>{detalleHAP.trasladoId.profesionalEntregaSAPU || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Responsable del registro</strong>
        <span>{detalleHAP.trasladoId.responsableRegistro || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Estado del paciente en escena</strong>
        <span>{detalleHAP.trasladoId.estadoEscena || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Estado durante el traslado</strong>
        <span>{detalleHAP.trasladoId.estadoDuranteTraslado || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Estado en unidad de emergencia</strong>
        <span>{detalleHAP.trasladoId.estadoUnidadEmergencia || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Estado del traslado</strong>
        <span>{detalleHAP.trasladoId.estadoTraslado || 'No registrado'}</span>
      </div>

      <div className="dato-item">
        <strong>Observaciones</strong>
        <span>{detalleHAP.trasladoId.observaciones || 'Sin observaciones'}</span>
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

                    <button
                      className="opcion-menu activa"
                      onClick={() => setPantalla('inicio')}
                    >
                      🏠 Inicio
                    </button>

                    {usuarioActual?.perfil === 'DIGITADOR' && (
                      <button
                        className="opcion-menu"
                        onClick={() => {
                          setPagina(1);
                          setPantalla('formulario');
                        }}
                      >
                        📋 Registrar HAP
                      </button>
                    )}

                    {usuarioActual?.perfil === 'SUPERVISOR' && (
                      <>
                        <button
                          className="opcion-menu"
                          onClick={() => {
                            setPantalla('registros');
                            cargarAtenciones();
                          }}
                        >
                          🔎 Buscar registros
                        </button>

                        <button
                          className="opcion-menu"
                          onClick={() => alert('Los reportes se implementarán en una siguiente etapa.')}
                        >
                          📊 Reportes
                        </button>
                      </>
                    )}

                    <button
                      className="opcion-menu"
                      onClick={() => alert('Sistema académico en desarrollo. No ingresar datos reales.')}
                    >
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

  {usuarioActual?.perfil === 'DIGITADOR' && (
    <button
      className="atajo-principal"
      onClick={() => {
        setPagina(1);
        setPantalla('formulario');
      }}
    >
      <span className="atajo-icono">＋</span>
      <span>
        <strong>Nueva transcripción HAP</strong>
        <small>Ingresar información desde una hoja de atención en papel.</small>
      </span>
      <span>→</span>
    </button>
  )}

    {usuarioActual?.perfil === 'SUPERVISOR' && (
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
          <small>Consultar las transcripciones de atención HAP.</small>
        </span>
        <span>→</span>
      </button>
    )}

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