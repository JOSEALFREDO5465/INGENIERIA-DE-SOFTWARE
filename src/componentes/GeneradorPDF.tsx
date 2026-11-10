// ESTE COMPONENTE MUESTRA LA VISTA PREVIA DE REPORTES OFICIALES DE LA IGLESIA FILADELFIA
// Y PERMITE IMPRIMIR / EXPORTAR ÚNICAMENTE A PDF CON EL MEMBRETE OFICIAL.
// El documento se pagina solo: genera tantas hojas como sean necesarias, repite el
// encabezado de la tabla en cada hoja y deja la FIRMA al final del documento.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, HelpCircle, Minus, Plus } from 'lucide-react';
import { useApp } from '../contextos/AppContexto';
import { MEMBRETE } from '../utilidades/logos';
import logoAsambleas from '../img/logo-asambleas.png';
import logoFiladelfia from '../img/logo-filadelfia.png';

interface GeneradorPDFProps {
  titulo: string;
  columnas: string[];
  datos: any[][];
  alCerrar: () => void;
  seccion?: string;          // e.g. "LIBRO DE REGISTRO DE MIEMBROS"
  pistas?: (string | null)[]; // fila subordinada de pistas (subtítulo de columna)
}

// CONSTANTES DE MAQUETACIÓN (hoja A4 horizontal)
const CM = 37.795;                       // píxeles por centímetro (96 dpi)
const ANCHO_HOJA_CM = 29.7;               // ancho A4 horizontal
const ALTO_HOJA_CM = 21;                  // alto A4 horizontal
const MARGEN_INTERNO_CM = 1.2;            // margen interno de la hoja
const ALTO_HOJA_IMP_CM = 20.95;           // alto real impreso (holgura anti hoja en blanco)
const ALTO_UTIL_PX = (ALTO_HOJA_IMP_CM - MARGEN_INTERNO_CM * 2) * CM;
const ALTO_CAB_CONT_CM = 1.5;             // alto del encabezado de continuación
const MARGEN_SEGURIDAD_PX = 10;           // colchón para que nada toque el borde
const SEPARACION_HOJAS_PX = 24;           // separación visual entre hojas (no se imprime)

interface CotasMedicion {
  theadH: number;
  cabeceraH: number;
  tituloH: number;
  firmaH: number;
  pieH: number;
}

// DISTRIBUYE LAS FILAS EN TANTAS HOJAS COMO SEAN NECESARIAS
const dividirEnHojas = (alturasFilas: number[], c: CotasMedicion): number[][] => {
  const altoUtil = ALTO_UTIL_PX - MARGEN_SEGURIDAD_PX;
  const cabContinuacion = ALTO_CAB_CONT_CM * CM;

  // Espacio reservado por bloque en cada tipo de hoja
  const overheadPrimera = c.cabeceraH + c.tituloH + c.theadH + c.pieH;
  // En las hojas de continuación se reserva también el bloque de firma (va al final del documento)
  const overheadContinuacion = cabContinuacion + c.theadH + c.pieH + c.firmaH;

  const limitePrimeraHoja = altoUtil - overheadPrimera;
  const limiteMedioHoja = altoUtil - overheadContinuacion;

  // 1) Número mínimo de hojas necesarias (reparto voraz: llena cada hoja al máximo)
  const voraz = (limitePrimera: number, limiteMedio: number): number[][] => {
    const hojas: number[][] = [];
    let actual: number[] = [];
    let usado = 0;
    let limite = Math.max(limitePrimera, 40);

    alturasFilas.forEach((h, i) => {
      if (actual.length > 0 && usado + h > limite) {
        hojas.push(actual);
        actual = [];
        usado = 0;
        limite = Math.max(limiteMedio, 40);
      }
      actual.push(i);
      usado += h;
    });
    if (actual.length > 0) hojas.push(actual);
    if (hojas.length === 0) hojas.push([]);
    return hojas;
  };

  let minimoHojas = voraz(limitePrimeraHoja, limiteMedioHoja).length;
  // Si todo cabe en una sola hoja, también debe caber ahí el bloque de firma
  if (minimoHojas === 1) {
    minimoHojas = voraz(limitePrimeraHoja - c.firmaH, limiteMedioHoja).length;
  }

  // 2) Reparto equilibrado: las hojas quedan lo más parecidas posible entre sí
  const limites: number[] = [];
  for (let i = 0; i < minimoHojas; i++) {
    if (i === 0) {
      limites.push(minimoHojas === 1 ? limitePrimeraHoja - c.firmaH : limitePrimeraHoja);
    } else {
      limites.push(limiteMedioHoja);
    }
  }

  // Altura acumulada de las filas que faltan (para no dejar resto imposible)
  const alturaRestante = new Array<number>(alturasFilas.length + 1).fill(0);
  for (let i = alturasFilas.length - 1; i >= 0; i--) {
    alturaRestante[i] = alturaRestante[i + 1] + alturasFilas[i];
  }

  const totalAltura = alturaRestante[0];
  const objetivo = minimoHojas > 0 ? totalAltura / minimoHojas : 0;

  const hojas: number[][] = [];
  let indiceFila = 0;
  for (let p = 0; p < minimoHojas; p++) {
    const limite = limites[p];
    const capacidadHojasRestantes = limites.slice(p + 1).reduce((a, b) => a + b, 0);
    const actual: number[] = [];
    let usado = 0;

    while (indiceFila < alturasFilas.length) {
      const h = alturasFilas[indiceFila];
      if (usado + h > limite) break;
      // Si ya se superó el objetivo equilibrado, solo se sigue llenando cuando
      // el resto de las filas NO cabría en las hojas siguientes
      if (usado + h > objetivo && alturaRestante[indiceFila + 1] <= capacidadHojasRestantes) break;
      actual.push(indiceFila);
      usado += h;
      indiceFila++;
    }
    hojas.push(actual);
  }

  // Si por algún motivo sobraran filas, se anexan a la última hoja
  while (indiceFila < alturasFilas.length) {
    hojas[hojas.length - 1].push(indiceFila);
    indiceFila++;
  }

  return hojas;
};

export const GeneradorPDF: React.FC<GeneradorPDFProps> = ({
  titulo,
  columnas,
  datos,
  alCerrar,
  seccion = 'REPORTE OFICIAL',
  pistas,
}) => {
  const { usuarioActual } = useApp();

  const [zoom, setZoom] = useState<number>(0.68);
  const [hojas, setHojas] = useState<number[][] | null>(null);
  const [versionMedida, setVersionMedida] = useState<number>(0);

  const refCabecera = useRef<HTMLDivElement>(null);
  const refTitulo = useRef<HTMLDivElement>(null);
  const refTabla = useRef<HTMLTableElement>(null);
  const refFirma = useRef<HTMLDivElement>(null);
  const refPie = useRef<HTMLDivElement>(null);

  // CUANDO TERMINAN DE CARGAR LAS FUENTES SE VUELVE A MEDIR (si no, las filas
  // se miden con la tipografía provisional y el contenido se desborda)
  useEffect(() => {
    let cancelado = false;
    const remedir = () => {
      if (!cancelado) setVersionMedida((v) => v + 1);
    };
    const fuentes = (document as any).fonts;
    if (fuentes?.ready) {
      fuentes.ready.then(remedir).catch(() => {});
    }
    window.addEventListener('resize', remedir);
    return () => {
      cancelado = true;
      window.removeEventListener('resize', remedir);
    };
  }, []);

  // MEDICIÓN REAL DE ALTURAS PARA PAGINAR SIN CORTAR NI SOLAPAR NADA
  useLayoutEffect(() => {
    const tabla = refTabla.current;
    if (!tabla) return;

    const filas = Array.from(tabla.querySelectorAll('tbody tr')) as HTMLElement[];
    // offsetHeight NO se ve afectado por el zoom (transform) de la vista previa
    const alturas = filas.map((f) => f.offsetHeight || 18);

    const cotas: CotasMedicion = {
      theadH: (tabla.querySelector('thead') as HTMLElement)?.offsetHeight || 0,
      cabeceraH: refCabecera.current?.offsetHeight || 0,
      tituloH: refTitulo.current?.offsetHeight || 0,
      firmaH: refFirma.current?.offsetHeight || 0,
      pieH: refPie.current?.offsetHeight || 0,
    };

    setHojas(dividirEnHojas(alturas, cotas));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, columnas, pistas, versionMedida]);

  const indicesHojas: number[][] = hojas ?? [datos.map((_, i) => i)];
  const totalHojas = indicesHojas.length;

  const manejarImpresion = () => {
    window.print();
  };

  // BLOQUE: MEMBRETE OFICIAL (solo en la primera hoja)
  const membreteOficial = (
    <div ref={refCabecera} className="relative text-center border-b-2 border-[#002060] pb-2">
      <div className="absolute left-0 top-0">
        <img src={logoAsambleas} alt="Las Asambleas de Dios de Bolivia" className="w-20 h-20 object-contain" />
      </div>
      <div className="absolute right-0 top-0">
        <img src={logoFiladelfia} alt="Centro Evangelístico Filadelfia" className="w-16 h-20 object-contain" />
      </div>
      <p className="text-xl font-black tracking-widest text-[#002060] leading-tight mt-1">{MEMBRETE.organizacion}</p>
      <p className="text-[11px] font-bold text-[#002060] leading-tight">{MEMBRETE.juridica}</p>
      <p className="text-sm font-extrabold text-[#002060] leading-tight mt-1">{MEMBRETE.centro}</p>
      <p className="text-base font-bold italic text-[#4040E0] leading-tight">{MEMBRETE.lema}</p>
      <p className="text-[9px] font-bold text-[#002060] leading-tight">{MEMBRETE.direccion}</p>
    </div>
  );

  // BLOQUE: ENCABEZADO DE CONTINUACIÓN (hojas siguientes)
  const cabeceraContinuacion = (
    <div
      className="flex items-center justify-between border-b-2 border-[#002060]"
      style={{ height: `${ALTO_CAB_CONT_CM}cm` }}
    >
      <img src={logoAsambleas} alt="Logo Asambleas de Dios" className="h-[1.05cm] w-auto object-contain" />
      <div className="text-center leading-tight">
        <p className="text-[11px] font-black tracking-widest text-[#002060]">{MEMBRETE.organizacion}</p>
        <p className="text-[9px] font-bold text-[#002060]">{MEMBRETE.centro}</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-[#4040E0]">Continuación del reporte</p>
      </div>
      <img src={logoFiladelfia} alt="Logo Filadelfia" className="h-[1.05cm] w-auto object-contain" />
    </div>
  );

  // BLOQUE: TÍTULO Y DATOS DE EMISIÓN (solo en la primera hoja)
  const bloqueTitulo = (
    <div ref={refTitulo}>
      <div className="my-3 text-center">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#002060]">{titulo.toUpperCase()}</h2>
        <p className="text-xs italic text-[#002060]">
          ( Fecha de generación: {new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })} )
        </p>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-mono text-[#333333]">
        <div><span className="font-bold text-[#002060]">DEPARTAMENTO DE:</span> C. E. Filadelfia</div>
        <div className="text-right"><span className="font-bold text-[#002060]">PASTOR:</span> Pastor Principal</div>
        <div><span className="font-bold text-[#002060]">SECCIÓN:</span> {seccion.toUpperCase()}</div>
        <div className="text-right"><span className="font-bold text-[#002060]">TOTAL DE REGISTROS:</span> {datos.length}</div>
      </div>
    </div>
  );

  // BLOQUE: FIRMA (siempre al final del documento)
  const bloqueFirma = (
    <div ref={refFirma} className="pt-4 border-t border-[#4040E0] flex items-end justify-between gap-6">
      <p className="text-[9px] text-slate-500 font-mono leading-tight">
        Documento generado por el Sistema de Gestión Eclesiástica.<br />
        Iglesia Centro Evangélico Filadelfia · {seccion.toUpperCase()}
      </p>
      <div className="text-center w-56 shrink-0">
        <div className="h-7" />
        <div className="w-56 border-b border-black mx-auto" />
        <span className="text-[10px] uppercase font-bold text-slate-600 block mt-1">Sello y Firma Responsable</span>
        <span className="text-[9px] text-slate-500 font-mono block">{usuarioActual?.nombre_completo}</span>
      </div>
    </div>
  );

  // BLOQUE: PIE DE PÁGINA (número de hoja)
  const bloquePie = (numHoja: number) => (
    <div
      ref={numHoja === 1 ? refPie : undefined}
      className="absolute left-[1.2cm] right-[1.2cm] bottom-[0.55cm] flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-[#CBD3F0] pt-1"
    >
      <span>Iglesia Filadelfia · Sistema de Gestión Eclesiástica</span>
      <span>Hoja {numHoja} de {totalHojas}</span>
    </div>
  );

  const renderTabla = (indices: number[]) => (
    <table className="w-full text-left text-[10px] border-collapse border-2 border-[#002060]">
      <thead>
        <tr className="bg-[#002060]">
          {columnas.map((col, index) => (
            <th key={index} className="py-1.5 px-1.5 font-bold uppercase text-white border border-[#4040E0] text-center">
              {col}
            </th>
          ))}
        </tr>
        {pistas && pistas.length === columnas.length && (
          <tr className="bg-[#EEF1FE]">
            {pistas.map((p, index) => (
              <th key={index} className="py-1 px-1.5 italic font-semibold text-[#555] border border-[#CBD3F0] text-center text-[9px]">
                {p ?? ''}
              </th>
            ))}
          </tr>
        )}
      </thead>
      <tbody>
        {indices.map((filaIndex) => {
          const fila = datos[filaIndex];
          return (
            <tr key={filaIndex} className={filaIndex % 2 === 1 ? 'bg-[#F5F6FF]' : 'bg-white'}>
              {fila.map((celda, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-1 px-1.5 border border-[#E4E8F8] text-[#1F2937] ${
                    colIndex === 0 || colIndex === columnas.length - 1 ? 'text-center' : 'text-left'
                  }`}
                >
                  {typeof celda === 'boolean' ? (celda ? 'SÍ' : 'NO') : String(celda ?? '')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderHoja = (indices: number[], numHoja: number) => {
    const esPrimera = numHoja === 1;
    const esUltima = numHoja === totalHojas;

    return (
      <div
        key={numHoja}
        className="hoja-impresion bg-white relative overflow-hidden text-black font-sans shadow-lg border border-slate-300"
        style={{
          width: `${ANCHO_HOJA_CM}cm`,
          height: `${ALTO_HOJA_IMP_CM}cm`,
          padding: `${MARGEN_INTERNO_CM}cm`,
          color: '#002060',
        }}
      >
        {esPrimera ? membreteOficial : cabeceraContinuacion}
        {esPrimera && bloqueTitulo}

        {/* TABLA CON ENCABEZADO REPETIDO EN CADA HOJA */}
        {renderTabla(indices)}

        {esUltima && bloqueFirma}
        {bloquePie(numHoja)}
      </div>
    );
  };

  const anchoEscalado = ANCHO_HOJA_CM * CM * zoom;
  const altoEscalado = (ALTO_HOJA_IMP_CM * CM + SEPARACION_HOJAS_PX) * totalHojas * zoom;

  return createPortal(
    <div className="modal-overlay generador-modal fixed inset-0 bg-slate-900/60 backdrop-blur-sm overscroll-contain flex items-center justify-center z-50 p-4 no-print">
      {/* TABLA DE MEDICIÓN (oculta): sirve para calcular la paginación real */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none font-sans"
        style={{ left: '-20000px', top: '0px', width: `${ANCHO_HOJA_CM - MARGEN_INTERNO_CM * 2}cm` }}
      >
        <table ref={refTabla} className="w-full text-left text-[10px] border-collapse border-2 border-[#002060]">
          <thead>
            <tr className="bg-[#002060]">
              {columnas.map((col, index) => (
                <th key={index} className="py-1.5 px-1.5 font-bold uppercase text-white border border-[#4040E0] text-center">
                  {col}
                </th>
              ))}
            </tr>
            {pistas && pistas.length === columnas.length && (
              <tr className="bg-[#EEF1FE]">
                {pistas.map((p, index) => (
                  <th key={index} className="py-1 px-1.5 italic font-semibold text-[#555] border border-[#CBD3F0] text-center text-[9px]">
                    {p ?? ''}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {datos.map((fila, filaIndex) => (
              <tr key={filaIndex} className={filaIndex % 2 === 1 ? 'bg-[#F5F6FF]' : 'bg-white'}>
                {fila.map((celda, colIndex) => (
                  <td
                    key={colIndex}
                    className={`py-1 px-1.5 border border-[#E4E8F8] text-[#1F2937] ${
                      colIndex === 0 || colIndex === columnas.length - 1 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {typeof celda === 'boolean' ? (celda ? 'SÍ' : 'NO') : String(celda ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="generador-caja bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh]">
        {/* CABECERA DEL MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl no-print">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento Oficial</h2>
            <p className="text-xs text-slate-500">
              Membrete oficial de la Iglesia · {datos.length} registros · {totalHojas} {totalHojas === 1 ? 'hoja' : 'hojas'}.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={manejarImpresion}
              className="flex items-center space-x-2 bg-[#4040E0] hover:bg-[#2F34C4] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-4 font-bold h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
            <button
              onClick={alCerrar}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUERPO: HOJAS QUE SE IMPRIMEN COMO PDF */}
        <div className="generador-preview flex-1 overflow-auto bg-slate-100 p-6">
          <div className="generador-escala mx-auto" style={{ width: anchoEscalado, height: altoEscalado }}>
            <div
              id="area-impresion"
              className="flex flex-col"
              style={{
                gap: SEPARACION_HOJAS_PX,
                width: ANCHO_HOJA_CM * CM,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              {indicesHojas.map((indices, i) => renderHoja(indices, i + 1))}
            </div>
          </div>
        </div>

        {/* BARRA DE AYUDA Y ZOOM */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-slate-500 flex items-center justify-between gap-4 text-xs no-print">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-[#4040E0] shrink-0" />
            <span>
              Para guardar: elija <strong>"Guardar como PDF"</strong> como destino de impresión. El documento se
              pagina solo y la firma queda al final.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zoom</span>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
              title="Alejar"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono text-[11px] font-bold text-slate-700">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
              title="Acercar"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={manejarImpresion}
              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* ESTILOS DE IMPRESIÓN: UNA HOJA POR PÁGINA, SIN CORTES NI SOLAPES */}
      <style>{`
        @media print {
          @page {
            size: ${ANCHO_HOJA_CM}cm ${ALTO_HOJA_CM}cm;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
          }
          /* Se desbloquea el scroll del fondo (si no, el PDF se corta en la 1ª hoja) */
          html:has(.modal-overlay),
          body:has(.modal-overlay),
          main:has(.modal-overlay) {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          #area-impresion, #area-impresion * {
            visibility: visible !important;
          }
          .generador-modal {
            position: static !important;
            inset: auto !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            overflow: visible !important;
          }
          .generador-caja {
            position: static !important;
            display: block !important;
            max-width: none !important;
            max-height: none !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
          .generador-preview {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: transparent !important;
            display: block !important;
            height: auto !important;
          }
          /* El contenedor escalado no debe generar páginas vacías al imprimir */
          .generador-escala {
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #area-impresion {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${ANCHO_HOJA_CM}cm !important;
            display: block !important;
            gap: 0 !important;
            transform: none !important;
          }
          .hoja-impresion {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            break-after: page;
            page-break-after: always;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .hoja-impresion:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          thead { display: table-header-group; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          /* La aplicación (contenedor #root) no se imprime: evita hojas en blanco */
          #root { display: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
};
