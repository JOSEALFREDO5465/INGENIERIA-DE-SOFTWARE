// Membrete oficial compartido para los documentos PDF generados con jsPDF.
// Replica la cabecera del archivo Cabecera_Inventario.xlsx:
// ambos logos + líneas de la organización centradas y línea divisoria azul marino.
import { cargarLogoBase64, MEMBRETE } from './logos';
import logoAsambleas from '../img/logo-asambleas.png';
import logoFiladelfia from '../img/logo-filadelfia.png';

// jsPDF acepta "any" porque los tipos vienen con jspdf pero son amplios.
export const agregarMembretePdf = async (
  doc: any,
  anchoPagina: number,
) => {
  const [logoAsam, logoFil] = await Promise.all([
    cargarLogoBase64(logoAsambleas),
    cargarLogoBase64(logoFiladelfia),
  ]);

  try {
    doc.addImage(logoAsam, 'PNG', 12, 8, 22, 21);
  } catch {
    /* logo opcional */
  }
  try {
    doc.addImage(logoFil, 'PNG', anchoPagina - 34, 6, 22, 26);
  } catch {
    /* logo opcional */
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(0, 32, 96);
  doc.text(MEMBRETE.organizacion, anchoPagina / 2, 16, { align: 'center' });

  doc.setFontSize(9);
  doc.text(MEMBRETE.juridica, anchoPagina / 2, 22, { align: 'center' });

  doc.setFontSize(11);
  doc.text(MEMBRETE.centro, anchoPagina / 2, 28, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(64, 64, 224);
  doc.text(MEMBRETE.lema, anchoPagina / 2, 34.5, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(0, 32, 96);
  doc.text(MEMBRETE.direccion, anchoPagina / 2, 40, { align: 'center' });

  doc.setDrawColor(0, 32, 96);
  doc.setLineWidth(1.4);
  doc.line(12, 43.5, anchoPagina - 12, 43.5);
};
