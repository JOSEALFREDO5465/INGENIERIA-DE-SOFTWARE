// ESTE COMPONENTE MUESTRA LA VISTA PREVIA DE REPORTES OFICIALES DE LA IGLESIA FILADELFIA
// Y PERMITE IMPRIMIR/EXPORTAR A PDF O AL FORMATO EXCEL OFICIAL (con el mismo membrete).
import React from 'react';
import { Printer, Download, X, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../contextos/AppContexto';
import { generarExcelOficial } from '../utilidades/generarExcelOficial';
import { MEMBRETE } from '../utilidades/logos';
import logoAsambleas from '../img/logo-asambleas.png';
import logoFiladelfia from '../img/logo-filadelfia.png';

interface GeneradorPDFProps {
  titulo: string;
  columnas: string[];
  datos: any[][];
  alCerrar: () => void;
  seccion?: string;          // e.g. "LIBRO DE REGISTRO DE MIEMBROS"
  pistas?: (string | null)[]; // fila subordinada de pistas (solo inventario)
  anchos?: number[];         // anchos de las columnas A..I (solo inventario)
  excelColumnas?: string[];  // columnas para el Excel (si distinto del PDF)
  excelDatos?: any[][];      // datos para el Excel (si distinto del PDF)
}

export const GeneradorPDF: React.FC<GeneradorPDFProps> = ({
  titulo,
  columnas,
  datos,
  alCerrar,
  seccion = 'REPORTE OFICIAL',
  pistas,
  anchos,
  excelColumnas,
  excelDatos,
}) => {
  const { usuarioActual } = useApp();
  const fechaActual = new Date().toLocaleString('es-BO', { timeZone: 'UTC' });

  const manejarImpresion = () => {
    window.print();
  };

  const manejarExcel = () => {
    const nombreArchivo = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    generarExcelOficial({
      titulo,
      seccion,
      columnas: excelColumnas ?? columnas,
      datos: excelDatos ?? datos,
      nombreArchivo: `reporte_${nombreArchivo}_${new Date().toISOString().split('T')[0]}`,
      pistas,
      anchos,
      totalRegs: datos.length,
    }).catch((err) => {
      console.error('Error al generar el Excel oficial:', err);
      alert('No se pudo generar el Excel. Revise la consola del navegador.');
    });
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-slate-900/60 backdrop-blur-sm overscroll-contain flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh]">
        {/* CABECERA DEL MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl no-print">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento Oficial</h2>
            <p className="text-xs text-slate-500">Membrete oficial de la Iglesia · Exporte a PDF o a Excel.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={manejarExcel}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Excel</span>
            </button>
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

        {/* CUERPO: HOJA QUE SE IMPRIME COMO PDF */}
        <div className="p-8 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
          <div
            id="area-impresion"
            className="bg-white w-[29.7cm] min-h-[21cm] p-[1.2cm] shadow-lg text-black font-sans relative border border-slate-300"
            style={{ color: '#002060' }}
          >
            {/* MEMBRETE OFICIAL CON AMBOS LOGOS */}
            <div className="relative text-center mb-4 border-b-2 border-[#002060] pb-3">
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

            {/* TÍTULO DEL DOCUMENTO */}
            <div className="my-4 text-center">
              <h2 className="text-lg font-black uppercase tracking-wider text-[#002060]">
                {titulo.toUpperCase()}
              </h2>
              <p className="text-xs italic text-[#002060]">
                ( Fecha de generación: {new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })} )
              </p>
            </div>

            {/* DATOS DE EMISIÓN */}
            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-mono text-[#333333]">
              <div><span className="font-bold text-[#002060]">DEPARTAMENTO DE:</span> C. E. Filadelfia</div>
              <div className="text-right"><span className="font-bold text-[#002060]">PASTOR:</span> Pastor Principal</div>
              <div><span className="font-bold text-[#002060]">SECCIÓN:</span> {seccion.toUpperCase()}</div>
              <div className="text-right"><span className="font-bold text-[#002060]">TOTAL DE REGISTROS:</span> {datos.length}</div>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-collapse border-2 border-[#002060]">
                <thead>
                  <tr className="bg-[#002060]">
                    {columnas.map((col, index) => (
                      <th
                        key={index}
                        className="py-2 px-2 font-bold uppercase text-white border border-[#4040E0] text-center"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                  {pistas && pistas.length === columnas.length && (
                    <tr className="bg-[#EEF1FE]">
                      {pistas.map((p, index) => (
                        <th
                          key={index}
                          className="py-1 px-2 italic font-semibold text-[#555] border border-[#CBD3F0] text-center text-[9px]"
                        >
                          {p ?? ''}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {datos.map((fila, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 1 ? 'bg-[#F5F6FF]' : 'bg-white'}
                    >
                      {fila.map((celda, colIndex) => (
                        <td
                          key={colIndex}
                          className={`py-1.5 px-2 border border-[#E4E8F8] text-[#1F2937] ${
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

            {/* PIE */}
            <div className="absolute bottom-[1.2cm] left-[1.2cm] right-[1.2cm]">
              <div className="flex justify-between items-end border-t border-[#4040E0] pt-4">
                <div className="text-[9px] text-slate-500 font-mono">
                  <span>Iglesia Filadelfia · Sistema de Gestión Eclesiástica</span>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-black mx-auto mb-1"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Sello y Firma Responsable</span>
                  <span className="text-[9px] text-slate-500 font-mono block">{usuarioActual?.nombre_completo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE AYUDA */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-55 py-2 text-slate-500 flex items-center justify-between text-xs no-print">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-[#4040E0]" />
            <span>
              ¿Cómo guardar como PDF? En el cuadro de impresión, seleccione <strong>"Guardar como PDF"</strong> como destino.
            </span>
          </div>
          <button
            onClick={manejarImpresion}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-705 px-3 py-1 rounded transition-colors cursor-pointer"
          >
            Configuración Rápida
          </button>
        </div>
      </div>

      {/* ESTILOS DE IMPRESIÓN: HORIZONTAL COMO EL REPORTE OFICIAL */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #area-impresion, #area-impresion * {
            visibility: visible;
          }
          #area-impresion {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: none;
            box-shadow: none;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};
