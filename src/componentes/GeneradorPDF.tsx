// ESTE COMPONENTE PERMITE VISUALIZAR Y GENERAR UN REPORTE PDF OFICIAL DE LOS REGISTROS DE LA IGLESIA.
// UTILIZA ESTILOS DE IMPRESIÓN Y LA FUNCIÓN DE NAVEGADOR PARA GUARDAR COMO PDF O IMPRIMIR.

import React, { useRef } from 'react';
import { Printer, Download, X, HelpCircle } from 'lucide-react';
import { useApp } from '../contextos/AppContexto';

interface GeneradorPDFProps {
  titulo: string;
  columnas: string[];
  datos: any[][];
  alCerrar: () => void;
}

export const GeneradorPDF: React.FC<GeneradorPDFProps> = ({ titulo, columnas, datos, alCerrar }) => {
  const { usuarioActual } = useApp();
  const fechaActual = new Date().toLocaleString('es-BO', { timeZone: 'UTC' });

  // ACTIVAR EL DIÁLOGO DE IMPRESIÓN NATIVO DEL NAVEGADOR ASOCIADO A LOS ESTILOS PRINT DE TAILWIND
  const manejarImpresion = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col max-h-[90vh]">
             {/* CABECERA DEL MODAL DE PREVISUALIZACIÓN DE REPORTE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl no-print">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Vista Previa del Documento Oficial</h2>
            <p className="text-xs text-slate-500">Este documento cumple con el formato oficial para su exportación a PDF.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={manejarImpresion}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
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

        {/* CUERPO DEL MODAL QUE EMULA UNA HOJA CARTA DE PDF */}
        <div className="p-8 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
          <div 
            id="area-impresion" 
            className="bg-white w-[21cm] min-h-[29.7cm] p-[2cm] shadow-lg text-black font-sans relative border border-slate-300"
            style={{ color: '#000' }}
          >
             {/* ENCABEZADO MEMBRETADO OFICIAL DE LA IGLESIA FILADELFIA */}
            <div className="text-center mb-6 border-b-2 border-indigo-900 pb-4">
              <h1 className="text-2xl font-extrabold text-indigo-950 uppercase tracking-widest">IGLESIA EVANGÉLICA FILADELFIA</h1>
              <p className="text-xs text-slate-705 tracking-tight mt-1">"Proclamando la verdad y sirviendo con amor" · La Paz, Bolivia</p>
              <div className="mt-4 flex justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
                <span>REPORTE DE ACCIÓN</span>
                <span>FECHA: {fechaActual}</span>
              </div>
            </div>

            {/* TÍTULO DEL DOCUMENTO */}
            <div className="my-6">
              <h2 className="text-lg font-bold uppercase text-slate-900 text-center tracking-wider bg-slate-100 py-2 border-y border-dashed border-slate-400">
                {titulo}
              </h2>
            </div>

            {/* DATOS DEL USUARIO EMISOR DE REPORTE */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="font-bold text-slate-700">GENERADO POR:</span> {usuarioActual?.nombre_completo || 'Administrador Sistema'}
              </div>
              <div>
                <span className="font-bold text-slate-700">ROL OPERATIVO:</span> {usuarioActual?.rol?.toUpperCase() || 'ADMINISTRADOR'}
              </div>
              <div>
                <span className="font-bold text-slate-700">CONGREGACIÓN:</span> FILADELFIA
              </div>
              <div>
                <span className="font-bold text-slate-700">REGISTROS TOTALES:</span> {datos.length} filas
              </div>
            </div>

            {/* TABLA HISTÓRICA CON FUENTE LEGIBLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 bg-slate-50">
                    {columnas.map((col, index) => (
                      <th key={index} className="py-2 px-3 font-extrabold uppercase text-slate-850 border border-slate-350">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((fila, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-slate-300 hover:bg-slate-50">
                      {fila.map((celda, colIndex) => (
                        <td key={colIndex} className="py-2 px-3 border border-slate-350 text-slate-902">
                          {typeof celda === 'boolean' ? (celda ? 'SÍ' : 'NO') : String(celda ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PIE DE HOJA HISTÓRICO Y SELLO */}
            <div className="absolute bottom-[2cm] left-[2cm] right-[2cm]">
              <div className="flex justify-between items-end border-t border-slate-300 pt-6">
                <div className="text-[10px] text-slate-500 font-mono">
                  <span>Iglesia Filadelfia · Sistema de Control</span>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-black mx-auto mb-1"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Sello y Firma Responsable</span>
                  <span className="text-[9px] text-slate-450 font-mono block">({usuarioActual?.nombre_completo})</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BARRA DE AYUDA AL EXTRAER EN EL NAVEGADOR */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-55 py-2 text-slate-500 flex items-center justify-between text-xs no-print">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>¿Cómo guardar como PDF? En el cuadro de impresión, seleccione <strong>"Guardar como PDF"</strong> como destino.</span>
          </div>
          <button 
            onClick={manejarImpresion}
            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-705 px-3 py-1 rounded transition-colors cursor-pointer"
          >
            Configuración Rápida
          </button>
        </div>

      </div>

      {/* ESTILOS INYECTADOS EXCLUSIVOS PARA IMPRESIÓN SOBERANA */}
      <style>{`
        @media print {
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
