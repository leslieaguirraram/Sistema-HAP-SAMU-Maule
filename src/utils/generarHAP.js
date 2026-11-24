import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generarHAP(datos) {
  const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: [215.9, 330.2]
});


  // Cargar insignia institucional para el membrete
  let logoData = null;

  try {
    const imagenLogo = new Image();
    imagenLogo.src = '/insignia-samu.png';
    await imagenLogo.decode();

    const canvas = document.createElement('canvas');
    canvas.width = imagenLogo.naturalWidth;
    canvas.height = imagenLogo.naturalHeight;

    const contexto = canvas.getContext('2d');
    contexto.drawImage(imagenLogo, 0, 0);

    logoData = canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('No se pudo cargar la insignia SAMU:', error);
  }


  // MEMBRETE INSTITUCIONAL
  if (logoData) {
    pdf.addImage(logoData, 'PNG', 14, 7, 23, 23);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('SAMU MAULE', 125, 14, { align: 'center' });

  pdf.setFontSize(11);
  pdf.text('HOJA DE ATENCIÓN PREHOSPITALARIA', 125, 22, {
    align: 'center'
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('SISTEMA DE ATENCIÓN MÉDICA DE URGENCIA · LÍNEA 131', 125, 28, {
    align: 'center'
  });

  pdf.setDrawColor(20, 65, 105);
  pdf.setLineWidth(0.5);
  pdf.line(14, 33, 202, 33);


  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  
// 1. IDENTIFICACIÓN DE LA ATENCIÓN

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('IDENTIFICACIÓN DE LA ATENCIÓN', 14, 42);

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);

const columnaIzquierda = 14;
const columnaDerecha = 110;

pdf.text(`Fecha de atención: ${datos.fechaAtencion || 'No registrada'}`, columnaIzquierda, 50);
pdf.text(`Base: ${datos.base || 'No registrada'}`, columnaIzquierda, 57);
pdf.text(`Móvil: ${datos.movil || 'No registrado'}`, columnaIzquierda, 64);
pdf.text(`Complejidad: ${datos.complejidad || 'No registrada'}`, columnaIzquierda, 71);

pdf.text(`Clave: ${datos.clave || 'No registrada'}`, columnaDerecha, 50);
pdf.text(`Prioridad: ${datos.prioridad || 'No registrada'}`, columnaDerecha, 57);
pdf.text(`Comuna: ${datos.comuna || 'No registrada'}`, columnaDerecha, 64);
pdf.text(`Dirección: ${datos.direccion || 'No registrada'}`, columnaDerecha, 71);



// 2. IDENTIFICACIÓN DEL PACIENTE

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('IDENTIFICACIÓN DEL PACIENTE', 14, 84);

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);

const paciente = datos.pacienteId || {};

pdf.text(`Nombre: ${paciente.nombre || 'No registrado'}`, 14, 92);
pdf.text(`RUT: ${paciente.rut || 'No registrado'}`, 110, 92);

pdf.text(`Edad: ${paciente.edad || 'No registrada'}`, 14, 99);
pdf.text(`Sexo: ${paciente.sexo || 'No registrado'}`, 110, 99);


// 3. EVALUACIÓN CLÍNICA
let y = 111;

const evaluacion = datos.evaluacionId || {};
const pacienteDatos = datos.pacienteId || {};

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('DESCRIPCIÓN Y EVALUACIÓN CLÍNICA', 14, y);

y += 8;
pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);

const agregarCampo = (etiqueta, valor) => {
  const texto = `${etiqueta}: ${valor || 'No registrado'}`;
  const lineas = pdf.splitTextToSize(texto, 185);
  pdf.text(lineas, 14, y);
  y += lineas.length * 4 + 2;
};

agregarCampo('Evaluación primaria', evaluacion.evaluacionPrimaria);

y += 2;
pdf.setFont('helvetica', 'bold');
pdf.text('EVALUACIÓN SECUNDARIA', 14, y);
y += 6;
pdf.setFont('helvetica', 'normal');


const camposEvaluacion = [
  ['Cincinnati', evaluacion.cincinnati],
  ['Conciencia', evaluacion.conciencia],
  ['Ventilación', evaluacion.ventilacion],
  ['Hemodinamia', evaluacion.hemodinamia],
  ['Trazado ECG', evaluacion.trazadoECG],
  ['Cabeza', evaluacion.cabeza],
  ['Cuello', evaluacion.cuello],
  ['Vía aérea difícil', evaluacion.viaAereaDificil],
  ['Tórax', evaluacion.torax],
  ['Dorso', evaluacion.dorso],
  ['Abdomen', evaluacion.abdomen],
  ['Pelvis', evaluacion.pelvis],
  ['Extremidades superiores', evaluacion.extremidadesSuperiores],
  ['Extremidades inferiores', evaluacion.extremidadesInferiores],
  ['Genitales', evaluacion.genitales],
  ['Piel y mucosas', evaluacion.pielMucosas]
];

// Distribuir campos en dos columnas
for (let i = 0; i < camposEvaluacion.length; i += 2) {
  const izquierda = camposEvaluacion[i];
  const derecha = camposEvaluacion[i + 1];

  const textoIzquierda = `${izquierda[0]}: ${izquierda[1] || 'No registrado'}`;
  const lineasIzquierda = pdf.splitTextToSize(textoIzquierda, 88);

  const textoDerecha = `${derecha[0]}: ${derecha[1] || 'No registrado'}`;
  const lineasDerecha = pdf.splitTextToSize(textoDerecha, 88);

  pdf.text(lineasIzquierda, 14, y);
  pdf.text(lineasDerecha, 110, y);

  y += Math.max(lineasIzquierda.length, lineasDerecha.length) * 4 + 2;
}


y += 3;


pdf.setFont('helvetica', 'bold');
pdf.text('SIGNOS VITALES', 14, y + 5);

y += 9;

const signosVitales = evaluacion.signosVitales || [];

autoTable(pdf, {
  startY: y,
  head: [[
    'Hora', 'Glasgow', 'FR', 'FC', 'P.A.', 'PAM',
    'LL cap.', 'Glicemia', 'FiO2', 'SAT', 'CO2',
    'Temp.', 'EVA', 'Triage'
  ]],
  body: signosVitales.map(fila => [
    fila.hora || '—',
    fila.glasgow || '—',
    fila.fr || '—',
    fila.fc || '—',
    fila.pa || '—',
    fila.pam || '—',
    fila.llCapilar || '—',
    fila.glicemia || '—',
    fila.fio2 || '—',
    fila.sat || '—',
    fila.co2 || '—',
    fila.temperatura || '—',
    fila.eva || '—',
    fila.triage || '—'
  ]),
  theme: 'grid',
  styles: {
    fontSize: 5,
    cellPadding: 1,
    overflow: 'linebreak'
  },
  headStyles: {
    fontSize: 5,
    fontStyle: 'bold'
  },
  margin: { left: 14, right: 14 }
});

y = pdf.lastAutoTable.finalY + 8;




pdf.setFont('helvetica', 'bold');
pdf.text('ANTECEDENTES Y OTROS DATOS', 14, y);
y += 7;

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);

const antecedentes = [
  ['Antecedentes', pacienteDatos.antecedentes],
  ['Medicamentos habituales', evaluacion.medicamentosHabituales],
  ['Alergias', pacienteDatos.alergias]
];

antecedentes.forEach(([etiqueta, valor], indice) => {
  const columna = indice === 1 ? 110 : 14;
  const texto = `${etiqueta}: ${valor || 'No registrado'}`;
  const lineas = pdf.splitTextToSize(texto, 88);

  pdf.text(lineas, columna, y);

  if (indice === 0) {
    y += 6;
  } else if (indice === 1) {
    y -= 6;
    y += lineas.length * 4 + 2;
  }
});

y += 5;



// 4. PROCEDIMIENTOS Y MEDICAMENTOS
if (y > 285) {
  pdf.addPage();
  y = 18;
}

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('PROCEDIMIENTOS Y MEDICAMENTOS', 14, y);
y += 7;

const procedimiento = datos.procedimientoId || [];

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);

const listaProcedimientos = procedimiento.procedimientos || [];

pdf.text('Procedimientos realizados:', 14, y);
y += 5;

if (listaProcedimientos.length > 0) {
  listaProcedimientos.forEach((item) => {
    const lineas = pdf.splitTextToSize(`- ${item}`, 180);
    if (y > 310) {
      pdf.addPage();
      y = 18;
    }
    pdf.text(lineas, 17, y);
    y += lineas.length * 4 + 1;
  });
} else {
  pdf.text('No registrados', 17, y);
  y += 6;
}

pdf.setFont('helvetica', 'bold');
pdf.text('MEDICAMENTOS ADMINISTRADOS', 14, y);
y += 5;

autoTable(pdf, {
  startY: y,
  head: [[
    'Hora',
    'Medicamento / Terapia eléctrica',
    'Vía',
    'Dosis',
    'Respuesta'
  ]],
  body: (procedimiento.medicamentos || []).map(fila => [
    fila.hora || '—',
    fila.medicamento || '—',
    fila.via || '—',
    fila.dosis || '—',
    fila.respuesta || '—'
  ]),
  theme: 'grid',
  styles: { fontSize: 7, cellPadding: 2 },
  headStyles: { fontSize: 7 },
  margin: { left: 14, right: 14 }
});

y = pdf.lastAutoTable.finalY + 9;


// Separación después del personal de la atención
y += 5;

// PERSONAL DE LA ATENCIÓN

if (y > 250) {
  pdf.addPage();
  y = 18;
}

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('PERSONAL DE LA ATENCIÓN', 14, y);

y += 8;

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(9);

pdf.text(`R: ${datos.r || 'No registrado'}`, 14, y);
pdf.text(`T: ${datos.t || 'No registrado'}`, 65, y);
pdf.text(`F: ${datos.f || 'No registrado'}`, 125, y);

y += 7;

pdf.text(`MR: ${datos.mr || 'No registrado'}`, 14, y);
pdf.text(`PR: ${datos.pr || 'No registrado'}`, 65, y);
pdf.text(`OT: ${datos.ot || 'No registrado'}`, 125, y);

y += 12;




// 5. TIEMPOS QTR
if (y > 285) {
  pdf.addPage();
  y = 18;
}

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('REGISTRO DE TIEMPOS QTR', 14, y);
y += 7;

const tiemposQTR = datos.tiempoQtrId?.qtr || [];


autoTable(pdf, {
  startY: y,
  head: [['Código', 'Hora', 'Código', 'Hora']],
  body: Array.from({ length: 6 }, (_, i) => [
    `QTR ${i + 1}`,
    tiemposQTR[i] || 'Sin registro',
    `QTR ${i + 7}`,
    tiemposQTR[i + 6] || 'Sin registro'
  ]),
  theme: 'grid',
  styles: {
    fontSize: 8,
    cellPadding: 2
  },
  headStyles: {
    fontSize: 8
  },
  columnStyles: {
    0: { cellWidth: 30 },
    1: { cellWidth: 40 },
    2: { cellWidth: 30 },
    3: { cellWidth: 40 }
  },
  margin: { left: 14, right: 14 }
});


y = pdf.lastAutoTable.finalY + 9;


// 6. INFORMACIÓN DEL TRASLADO
if (y > 285) {
  pdf.addPage();
  y = 18;
}

const traslado = datos.trasladoId || {};

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('INFORMACIÓN DEL TRASLADO', 14, y);
y += 7;

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);


const camposTraslado = [
  ['¿Se realizó traslado?', traslado.traslado],
  ['Categorización CR', traslado.categorizacionCR],
  ['Entregado en selector UEH', traslado.entregadoUEH],
  ['Destinos del traslado', traslado.destinos?.join(', ')],
  ['Apoyos', traslado.apoyos?.join(', ')],
  ['Destino o centro receptor', traslado.destino],
  ['Clave real', traslado.claveReal],
  ['Profesional receptor UEH', traslado.profesionalReceptorUEH],
  ['Profesional que entrega en SAPU', traslado.profesionalEntregaSAPU],
  ['Responsable del registro', traslado.responsableRegistro],
  ['Estado del paciente en escena', traslado.estadoEscena],
  ['Estado durante el traslado', traslado.estadoDuranteTraslado],
  ['Estado en unidad de emergencia', traslado.estadoUnidadEmergencia],
  ['Estado del traslado', traslado.estadoTraslado],
  ['Observaciones', traslado.observaciones]
];

camposTraslado.forEach(([etiqueta, valor], indice) => {
  // Observaciones y estado del traslado ocupan el ancho completo
  if (indice >= 12) {
    const texto = `${etiqueta}: ${valor || 'No registrado'}`;
    const lineas = pdf.splitTextToSize(texto, 185);
    pdf.text(lineas, 14, y);
    y += lineas.length * 4 + 2;
    return;
  }

  const columna = indice % 2 === 0 ? 14 : 110;
  const texto = `${etiqueta}: ${valor || 'No registrado'}`;
  const lineas = pdf.splitTextToSize(texto, 88);

  pdf.text(lineas, columna, y);

  if (indice % 2 === 1) {
    y += Math.max(
      pdf.splitTextToSize(
        `${camposTraslado[indice - 1][0]}: ${camposTraslado[indice - 1][1] || 'No registrado'}`,
        88
      ).length,
      lineas.length
    ) * 4 + 2;
  }
});



 
// 7. PIE DE FIRMA DEL PROFESIONAL RESPONSABLE

if (y > 285) {
  pdf.addPage();
  y = 20;
} else {
  y += 5;
}

pdf.setFont('helvetica', 'bold');
pdf.setFontSize(10);
pdf.text('FIRMA Y VALIDACIÓN DEL REGISTRO', 14, y);

const lineaFirma = y + 20;

pdf.setDrawColor(60, 60, 60);
pdf.setLineWidth(0.3);

pdf.line(18, lineaFirma, 95, lineaFirma);
pdf.line(120, lineaFirma, 197, lineaFirma);

pdf.setFont('helvetica', 'normal');
pdf.setFontSize(8);

pdf.text('Firma del profesional responsable', 56.5, lineaFirma + 5, {
  align: 'center'
});

pdf.text('Nombre y cargo', 158.5, lineaFirma + 5, {
  align: 'center'
});

pdf.setFontSize(7);
pdf.text('SAMU Región del Maule · Línea 131', 107.95, lineaFirma + 13, {
  align: 'center'
});


  pdf.save('HAP_SAMU_Maule.pdf');
}