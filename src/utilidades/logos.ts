// Utilidad para convertir logos (importados por Vite) a base64,
// necesario para incrustarlos en PDF (jsPDF) y en Excel (ExcelJS).
export const cargarLogoBase64 = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No se pudo crear el canvas'));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });

// Estilos compartidos del membrete oficial de la iglesia
export const MEMBRETE = {
  organizacion: 'LAS ASAMBLEAS DE DIOS DE BOLIVIA',
  juridica: 'PERS. JURÍDICA No. 101452/61 – 215651/95',
  centro: 'CENTRO EVANGELÍSTICO “FILADELFIA” FILIAL 104',
  lema: 'UNA IGLESIA CON PROPÓSITO',
  direccion: 'EL ALTO URB- ORO NEGRO PLAZA CÍVICA Nº 17',
};
