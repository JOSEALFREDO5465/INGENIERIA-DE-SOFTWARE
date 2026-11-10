// Generador de EXCEL oficial de la Iglesia Filadelfia.
// Replica el formato de la cabecera oficial de inventario:
// - Hoja horizontal, sin líneas de cuadrícula, ajustada a 1 página de ancho
// - Logos de Las Asambleas de Dios y Filadelfia en las esquinas superiores
// - Membrete con datos de la organización centrados
// - Datos de revisión/reporte y tabla con bordes
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import logoAsambleas from '../img/logo-asambleas.png';
import logoFiladelfia from '../img/logo-filadelfia.png';
import { MEMBRETE, cargarLogoBase64 } from './logos';

export interface ExcelOficialOptions {
  titulo: string;       // e.g. "INVENTARIO REVISADO EL PRIMER BIMESTRE DE 2024"
  seccion: string;      // e.g. "ESCUELA BIBLICA y DISCIPULADO"
  columnas: string[];   // encabezados de la tabla
  datos: (string | number | null | undefined)[][];
  nombreArchivo: string;
  pistas?: (string | null)[];  // fila subordinada de pistas (opcional)
  anchos?: number[];    // anchos de columna (opcional; incluye A..I)
  totalRegs?: number;
}

const COLUMNAS_A_I = 9;

export const generarExcelOficial = async (opciones: ExcelOficialOptions) => {
  const {
    titulo,
    seccion,
    columnas,
    datos,
    nombreArchivo,
    pistas,
    anchos,
    totalRegs,
  } = opciones;

  const [imgAsam, imgFil] = await Promise.all([
    cargarLogoBase64(logoAsambleas),
    cargarLogoBase64(logoFiladelfia),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistema de Gestión Eclesiástica Filadelfia';
  wb.created = new Date();

  const ws = wb.addWorksheet('Reporte', {
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.75,
        right: 0.75,
        top: 1,
        bottom: 1,
        header: 0.5,
        footer: 0.5,
      },
    },
    properties: {
      outlineLevelCol: 0,
      outlineLevelRow: 0,
      defaultRowHeight: 15,
    },
  } as any);

  ws.views = [{ showGridLines: false }];

  // Anchos de columna (en caracteres)
  const anchosPorDefecto = [14, 60, 9, 10, 14, 10, 18, 15, 30];
  (anchos ?? anchosPorDefecto).forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // Imágenes del membrete (logo izquierdo = asambleas, logo derecho = filadelfia)
  const idAsam = wb.addImage({ base64: imgAsam.split(',')[1], extension: 'png' });
  const idFil = wb.addImage({ base64: imgFil.split(',')[1], extension: 'png' });
  ws.addImage(idAsam, { tl: { col: 0, row: 0 }, ext: { width: 100, height: 95 } });
  ws.addImage(idFil, { tl: { col: 7.2, row: 0 }, ext: { width: 96, height: 115 } });

  const azulOscuro = 'FF002060';
  const azulElectrico = 'FF4040E0';
  const grisClaro = 'FFF5F6FF';

  const bordeInferiorMedio = { style: 'medium' as const, color: { argb: azulOscuro } };
  const bordeFino = { style: 'thin' as const, color: { argb: 'FFD6D6D6' } };
  const bordeMedio = { style: 'medium' as const, color: { argb: azulOscuro } };

  const fondoEncabezado = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: azulOscuro },
  };

  // Fila 1: nombre de la organización
  ws.getRow(1).height = 32;
  ws.mergeCells('B1:G1');
  const c1 = ws.getCell('B1');
  c1.value = MEMBRETE.organizacion;
  c1.font = { name: 'Arial Black', bold: true, size: 22, color: { argb: azulOscuro } };
  c1.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Fila 2: personería jurídica
  ws.getRow(2).height = 20;
  ws.mergeCells('B2:G2');
  const c2 = ws.getCell('B2');
  c2.value = MEMBRETE.juridica;
  c2.font = { name: 'Arial', bold: true, size: 12, color: { argb: azulOscuro } };
  c2.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Fila 3: nombre del centro
  ws.getRow(3).height = 22;
  ws.mergeCells('B3:G3');
  const c3 = ws.getCell('B3');
  c3.value = MEMBRETE.centro;
  c3.font = { name: 'Arial', bold: true, size: 14, color: { argb: azulOscuro } };
  c3.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Fila 4: lema
  ws.getRow(4).height = 26;
  ws.mergeCells('B4:G4');
  const c4 = ws.getCell('B4');
  c4.value = MEMBRETE.lema;
  c4.font = { name: 'Arial', bold: true, italic: true, size: 16, color: { argb: azulElectrico } };
  c4.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Fila 5: dirección + línea divisoria media
  ws.getRow(5).height = 18;
  ws.mergeCells('B5:G5');
  const c5 = ws.getCell('B5');
  c5.value = MEMBRETE.direccion;
  c5.font = { name: 'Arial', bold: true, size: 10, color: { argb: azulOscuro } };
  c5.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  ['A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5', 'I5'].forEach((ref) => {
    ws.getCell(ref).border = { bottom: bordeInferiorMedio };
  });

  // Fila 7: título del reporte
  ws.getRow(7).height = 26;
  ws.mergeCells('A7:I7');
  const c7 = ws.getCell('A7');
  c7.value = titulo.toUpperCase();
  c7.font = { name: 'Arial', bold: true, italic: true, size: 16, color: { argb: azulOscuro } };
  c7.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Fila 8: fecha de generación
  ws.getRow(8).height = 26;
  ws.mergeCells('A8:I8');
  const c8 = ws.getCell('A8');
  c8.value = `( Fecha de generación: ${new Date().toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} )`;
  c8.font = { name: 'Arial', bold: true, italic: true, size: 14, color: { argb: azulOscuro } };
  c8.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Fila 10: departamento
  ws.getRow(10).height = 24;
  ws.mergeCells('F10:I10');
  const c10 = ws.getCell('F10');
  c10.value = 'DEPARTAMENTO DE: C. E. Filadelfia';
  c10.font = { name: 'Arial', size: 13, color: { argb: 'FF333333' } };
  c10.alignment = { horizontal: 'left', vertical: 'middle' };

  // Fila 11: sección / pastor
  ws.getRow(11).height = 24;
  ws.mergeCells('A11:D11');
  const c11a = ws.getCell('A11');
  c11a.value = seccion.toUpperCase();
  c11a.font = { name: 'Arial', bold: true, size: 14, underline: true, color: { argb: azulOscuro } };
  c11a.alignment = { horizontal: 'left', vertical: 'middle' };
  ws.mergeCells('F11:I11');
  const c11b = ws.getCell('F11');
  c11b.value = 'PASTOR: Pastor Principal';
  c11b.font = { name: 'Arial', size: 14, color: { argb: 'FF333333' } };
  c11b.alignment = { horizontal: 'left', vertical: 'middle' };

  // Fila 12: responsable
  ws.getRow(12).height = 24;
  ws.mergeCells('F12:I12');
  const c12 = ws.getCell('F12');
  c12.value = `TOTAL DE REGISTROS: ${totalRegs ?? datos.length}`;
  c12.font = { name: 'Arial', size: 12, color: { argb: 'FF333333' } };
  c12.alignment = { horizontal: 'left', vertical: 'middle' };

  // Fila 13: encabezados de la tabla
  ws.getRow(13).height = 30;
  columnas.forEach((col, i) => {
    const colLetra = String.fromCharCode(65 + i);
    const cell = ws.getCell(`${colLetra}13`);
    cell.value = col.toUpperCase();
    cell.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = fondoEncabezado;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    // Bordes con línea superior media (como el membrete oficial)
    cell.border = {
      top: bordeMedio,
      bottom: bordeFino,
      left: bordeFino,
      right: bordeFino,
    };
  });
  // Relleno del resto de columnas A..I si hay menos columnas que 9
  for (let i = columnas.length; i < COLUMNAS_A_I; i++) {
    const colLetra = String.fromCharCode(65 + i);
    const cell = ws.getCell(`${colLetra}13`);
    cell.fill = fondoEncabezado;
    cell.border = {
      top: bordeMedio,
      bottom: bordeFino,
      left: bordeFino,
      right: bordeFino,
    };
  }

  // Fila 14: pistas opcionales (p.ej. inventario)
  if (pistas && pistas.length > 0) {
    ws.getRow(14).height = 30;
    pistas.forEach((p, i) => {
      if (i >= columnas.length) return;
      const colLetra = String.fromCharCode(65 + i);
      const cell = ws.getCell(`${colLetra}14`);
      cell.value = p ?? '';
      cell.font = { name: 'Arial', italic: true, size: 9, color: { argb: 'FF555555' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: bordeFino,
        bottom: bordeFino,
        left: bordeFino,
        right: bordeFino,
      };
    });
  }

  // Filas de datos
  const filaInicial = pistas && pistas.length > 0 ? 15 : 14;
  datos.forEach((fila, idx) => {
    const r = filaInicial + idx;
    const row = ws.getRow(r);
    row.height = 18;
    fila.forEach((valor, i) => {
      if (i >= columnas.length) return;
      const colLetra = String.fromCharCode(65 + i);
      const cell = ws.getCell(`${colLetra}${r}`);
      cell.value = valor ?? '';
      cell.font = {
        name: 'Arial',
        size: 10,
        color: { argb: 'FF1F2937' },
      };
      cell.alignment =
        i === 0 || i === columnas.length - 1
          ? { horizontal: 'center', vertical: 'middle', wrapText: true }
          : { horizontal: i > 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: bordeFino,
        bottom: bordeFino,
        left: bordeFino,
        right: bordeFino,
      };
      if (idx % 2 === 1) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: grisClaro },
        };
      }
    });
  });

  // Pie: membrete discreto
  const filaPie = Math.max(filaInicial + datos.length + 2, 25);
  ws.getRow(filaPie).height = 18;
  ws.mergeCells(`A${filaPie}:I${filaPie}`);
  const cPie = ws.getCell(`A${filaPie}`);
  cPie.value = 'Iglesia Filadelfia · Sistema de Gestión Eclesiástica · Documento oficial de control interno';
  cPie.font = { name: 'Arial', italic: true, size: 8, color: { argb: 'FF9CA3AF' } };
  cPie.alignment = { horizontal: 'center', vertical: 'middle' };

  // Descargar
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombreArchivo}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
