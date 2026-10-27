// ESTE COMPONENTE ADMINISTRA EL CRUD COMPLETO PARA LA TABLA MINISTERIOS
// EXPONE VISTAS DE ANÁLISIS, EDICIÓN Y EXPORTACIÓN DE DIÁSPORAS DE SERVICIO EN PDF

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { Ministerio } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, AlertTriangle, Users, Package } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

export const MinisteriosTab: React.FC = () => {
  const { ministerios, crearMinisterio, actualizarMinisterio, eliminarMinisterio, miembros, inventario } = useApp();

  // --- ESTADOS NAVEGACIÓN FORMULARIO ---
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [minSeleccionadoId, setMinSeleccionadoId] = useState<number | null>(null);

  // --- DETALLE ---
  const [minVerDetalle, setMinVerDetalle] = useState<Ministerio | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<'info' | 'miembros' | 'inventario'>('info');

  // --- REPORTE PDF ---
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);

  // --- BUSCADOR ---
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // --- CAMPOS FORM MINISTERIO (PDF) ---
  const [nombreMinisterio, setNombreMinisterio] = useState<string>('');
  const [mision, setMision] = useState<string>('');
  const [vision, setVision] = useState<string>('');
  const [lider, setLider] = useState<string>('');
  const [secretario, setSecretario] = useState<string>('');
  const [tesorero, setTesorero] = useState<string>('');
  const [vocal1, setVocal1] = useState<string>('');
  const [vocal2, setVocal2] = useState<string>('');

  const [errValidacion, setErrValidacion] = useState<string>('');

  // FILTRAR MINISTERIOS
  const ministeriosFiltrados = ministerios.filter(m => 
    m.nombre_ministerio.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    m.lider.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  const perteneceAlMinisterio = (miembro: any, ministerioNombre: string) => {
    if (!miembro.ministerios_activos) return false;
    const nMin = ministerioNombre.toLowerCase();
    
    return miembro.ministerios_activos.some((ma: string) => {
      const nMa = ma.toLowerCase();
      
      // Exact or direct inclusion check
      if (nMa.includes(nMin) || nMin.includes(nMa)) return true;
      
      // Accent-insensitive and key terms mapping
      const hasAlabanza = (nMa.includes("alabanza") || nMa.includes("adoracion")) && (nMin.includes("alabanza") || nMin.includes("adoracion"));
      const hasEducacion = (nMa.includes("educacio") || nMa.includes("discipulado") || nMa.includes("disimulado")) && (nMin.includes("educacio") || nMin.includes("discipulado") || nMin.includes("disimulado"));
      const hasJovenes = nMa.includes("joven") && nMin.includes("joven");
      const hasDamas = nMa.includes("dama") && nMin.includes("dama");

      return hasAlabanza || hasEducacion || hasJovenes || hasDamas;
    });
  };

  // LIMPIAR FORMULARIO
  const limpiarFormulario = () => {
    setNombreMinisterio('');
    setMision('');
    setVision('');
    setLider('');
    setSecretario('');
    setTesorero('');
    setVocal1('');
    setVocal2('');
    setErrValidacion('');
  };

  // NUEVO
  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setMinSeleccionadoId(null);
    setModalAbierto(true);
  };

  // EDITAR
  const abrirFormEditar = (m: Ministerio) => {
    setNombreMinisterio(m.nombre_ministerio);
    setMision(m.mision);
    setVision(m.vision);
    setLider(m.lider);
    setSecretario(m.secretario);
    setTesorero(m.tesorero);
    setVocal1(m.vocal_1);
    setVocal2(m.vocal_2);

    setMinSeleccionadoId(m.id_ministerio);
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  // GUARDAR
  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    if (!nombreMinisterio.trim() || !mision.trim() || !vision.trim() || !lider.trim()) {
      setErrValidacion('Nombre del Ministerio, Misión, Visión y Nombre del Líder son campos requeridos.');
      return;
    }

    const datosForm = {
      nombre_ministerio: nombreMinisterio.trim(),
      mision: mision.trim(),
      vision: vision.trim(),
      lider: lider.trim(),
      secretario: secretario.trim(),
      tesorero: tesorero.trim(),
      vocal_1: vocal1.trim(),
      vocal_2: vocal2.trim()
    };

    if (modoEdicion && minSeleccionadoId !== null) {
      actualizarMinisterio(minSeleccionadoId, datosForm);
    } else {
      crearMinisterio(datosForm);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  // ELIMINAR MINISTERIO
  const manejarEliminar = (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente el "${nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarMinisterio(id);
    }
  };

  // COLUMNAS PARA EXPORTAR EN REPORTE PDF
  const columnasPdf = ['ID Min', 'Ministerio', 'Líder General', 'Secretario', 'Tesorero', 'Vocal 1', 'Vocal 2'];
  const datosPdf = ministeriosFiltrados.map(m => [
    m.id_ministerio,
    m.nombre_ministerio,
    m.lider,
    m.secretario,
    m.tesorero,
    m.vocal_1,
    m.vocal_2
  ]);

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN ENCABEZADO CON BOTONES ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Ministerios de la Iglesia</h1>
          <p className="text-xs text-slate-500">Mapeo de actividades de servicio, juntas de directiva y responsabilidades operativas.</p>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => setReportePdfAbierto(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Generar Reporte PDF</span>
          </button>
          <button
            onClick={abrirFormNuevo}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-indigo-650 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Ministerio</span>
          </button>
        </div>
      </div>

      {/* MANDOS BUSCADOR */}
      <div className="relative rounded-2xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Filtrar por nombre de ministerio o líder asignado..."
          className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
      </div>

      {/* SECCIÓN TABLA MINISTERIOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        {ministeriosFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 font-mono">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">Ministerio</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60 font-mono">Líder General</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60 font-mono">Junta de Directiva</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs text-slate-800">
                {ministeriosFiltrados.map((m) => {
                  return (
                    <tr key={m.id_ministerio} className="hover:bg-slate-50/50 transition">
                      {/* MINISTERIO */}
                      <td className="px-5 py-4 border-r border-slate-100 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#1565c0] text-sm uppercase tracking-wide">
                            {m.nombre_ministerio}
                          </span>
                          <span className="text-[10px] text-slate-450 font-mono italic mt-0.5 max-w-sm truncate block" title={m.mision}>
                            Misión: <span className="text-slate-600">"{m.mision}"</span>
                          </span>
                        </div>
                      </td>

                      {/* LIDER GENERAL */}
                      <td className="px-5 py-4 border-r border-slate-100 font-mono text-xs whitespace-nowrap">
                        <span className="font-bold text-slate-800">{m.lider}</span>
                      </td>

                      {/* JUNTA */}
                      <td className="px-5 py-4 border-r border-slate-100 font-mono text-[10px] text-slate-600 leading-normal">
                        <div><strong className="text-slate-400 uppercase text-[9px]">Sec:</strong> {m.secretario || 'Inexistente'}</div>
                        <div><strong className="text-slate-400 uppercase text-[9px]">Tes:</strong> {m.tesorero || 'Inexistente'}</div>
                        {m.vocal_1 && <div><strong className="text-slate-400 uppercase text-[9px]">Voc 1:</strong> {m.vocal_1}</div>}
                        {m.vocal_2 && <div><strong className="text-slate-400 uppercase text-[9px]">Voc 2:</strong> {m.vocal_2}</div>}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-5 py-4 text-right text-xs font-medium space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setMinVerDetalle(m);
                            setSeccionActiva('info');
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer inline-block"
                          title="Ver Detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirFormEditar(m)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer inline-block"
                          title="Editar Propiedades"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => manejarEliminar(m.id_ministerio, m.nombre_ministerio)}
                          className="p-1.5 text-red-650 hover:bg-red-50 hover:text-red-850 rounded-lg transition cursor-pointer inline-block text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-450 italic text-xs bg-slate-50 rounded-3xl border border-slate-200">
            Ningún ministerio coincide con el criterio de búsqueda establecido.
          </div>
        )}
      </div>

      {/* MODAL: DETALLES EXPUESTOS DE UN MINISTERIO */}
      {minVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center bg-white rounded-t-3xl">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-650 font-black">Ficha Técnica de Servicio</span>
                <h3 className="text-base font-black text-slate-800">Ministerio General</h3>
              </div>
              <button onClick={() => setMinVerDetalle(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-850">
              <div className="bg-[#1565c0] p-4 rounded-lg border border-indigo-700 shadow-sm text-center" style={{ backgroundColor: '#1565c0' }}>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">{minVerDetalle.nombre_ministerio}</h2>
              </div>

              {/* ACCIONES DE SECCIÓN (2 BOTONES + INFORMACIÓN) */}
              <div className="grid grid-cols-3 gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setSeccionActiva('info')}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl border text-center transition cursor-pointer ${
                    seccionActiva === 'info'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <FileText className={`w-4 h-4 mb-1 ${seccionActiva === 'info' ? 'text-white' : 'text-slate-400'}`} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Ficha General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeccionActiva('miembros')}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl border text-center transition cursor-pointer relative ${
                    seccionActiva === 'miembros'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Users className={`w-4 h-4 mb-1 ${seccionActiva === 'miembros' ? 'text-white' : 'text-slate-400'}`} />
                  {miembros.filter(miem => perteneceAlMinisterio(miem, minVerDetalle.nombre_ministerio)).length > 0 && (
                    <span className="absolute top-1 right-1.5 bg-rose-600 text-white text-[8px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center select-none shadow-xs">
                      {miembros.filter(miem => perteneceAlMinisterio(miem, minVerDetalle.nombre_ministerio)).length}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider">Ver Miembros</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeccionActiva('inventario')}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl border text-center transition cursor-pointer relative ${
                    seccionActiva === 'inventario'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Package className={`w-4 h-4 mb-1 ${seccionActiva === 'inventario' ? 'text-white' : 'text-slate-400'}`} />
                  {inventario.filter(item => Number(item.id_ministerio) === Number(minVerDetalle.id_ministerio)).length > 0 && (
                    <span className="absolute top-1 right-1.5 bg-emerald-600 text-white text-[8px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center select-none shadow-xs">
                      {inventario.filter(item => Number(item.id_ministerio) === Number(minVerDetalle.id_ministerio)).length}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider">Inventario</span>
                </button>
              </div>

              {/* SECCIÓN CONDICIONAL */}
              {seccionActiva === 'info' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="p-3 bg-slate-50 rounded-xl italic border border-slate-150"><strong>Misión:</strong> "{minVerDetalle.mision}"</p>
                    <p className="p-3 bg-slate-50 rounded-xl italic border border-slate-150"><strong>Visión:</strong> "{minVerDetalle.vision}"</p>
                  </div>

                  {/* DIRECTIVA MINISTERIO */}
                  <div className="space-y-2 border-t pt-3 border-slate-150">
                    <h4 className="font-bold text-slate-900 font-mono text-[10px] uppercase tracking-wider">Composición de Junta de Directiva</h4>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <span className="block text-slate-400 uppercase text-[8px]">Líder principal</span>
                        <span className="font-bold text-slate-800">{minVerDetalle.lider}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <span className="block text-slate-400 uppercase text-[8px]">Secretario de Actas</span>
                        <span className="font-bold text-slate-800">{minVerDetalle.secretario || 'Inexistente'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <span className="block text-slate-400 uppercase text-[8px]">Tesorero de Comisión</span>
                        <span className="font-bold text-slate-800">{minVerDetalle.tesorero || 'Inexistente'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <span className="block text-slate-400 uppercase text-[8px]">Vocal 1</span>
                        <span className="font-bold text-slate-800">{minVerDetalle.vocal_1 || 'Inexistente'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 col-span-2">
                        <span className="block text-slate-400 uppercase text-[8px]">Vocal 2</span>
                        <span className="font-bold text-slate-800">{minVerDetalle.vocal_2 || 'Inexistente'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {seccionActiva === 'miembros' && (() => {
                const miembrosDelMin = miembros.filter(miem => perteneceAlMinisterio(miem, minVerDetalle.nombre_ministerio));
                return (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 font-mono text-[10px] uppercase tracking-wider">Miembros del Ministerio ({miembrosDelMin.length})</h4>
                    {miembrosDelMin.length > 0 ? (
                      <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
                        {miembrosDelMin.map(miem => (
                          <div key={miem.id_miembro} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs">
                                {miem.nombres.charAt(0)}{miem.apellidos.charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800 text-xs">{miem.nombres} {miem.apellidos}</h5>
                                <p className="text-[9px] text-slate-500 font-mono font-bold uppercase">{miem.tipo_miembro} · {miem.estado_miembro}</p>
                              </div>
                            </div>
                            <div className="text-right text-[10px] font-mono text-slate-500">
                              <p className="font-semibold text-slate-700">{miem.ci}</p>
                              <p className="text-[9px]">{miem.telefono || 'Sin telf.'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 italic text-[11px] bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Ningún miembro tiene asignado este ministerio actualmente.
                      </div>
                    )}
                  </div>
                );
              })()}

              {seccionActiva === 'inventario' && (() => {
                const inventarioDelMin = inventario.filter(item => Number(item.id_ministerio) === Number(minVerDetalle.id_ministerio));
                return (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 font-mono text-[10px] uppercase tracking-wider">Inventario del Ministerio ({inventarioDelMin.length})</h4>
                    {inventarioDelMin.length > 0 ? (
                      <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
                        {inventarioDelMin.map(item => (
                          <div key={item.codigo} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-black">
                                Art: #{item.codigo}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${
                                item.estado === 'disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                                item.estado === 'en_uso' ? 'bg-sky-50 text-sky-700 border border-sky-250' :
                                item.estado === 'dano' ? 'bg-rose-50 text-rose-700 border border-rose-250' :
                                'bg-amber-50 text-amber-700 border border-amber-250'
                              }`}>
                                {item.estado}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-[11px]/[13px]">{item.descripcion}</h5>
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-200/60 font-semibold">
                              <span>Cant: <strong className="text-slate-700">{item.cantidad} {item.unidad}</strong></span>
                              <span>Valor: <strong className="text-slate-700">{item.precio} {item.moneda}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-450 italic text-[11px] bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Ningún bien instrumental está asignado a este ministerio.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-3xl">
              <button onClick={() => setMinVerDetalle(null)} className="bg-slate-900 text-white font-bold py-1.5 px-4 text-xs rounded-xl cursor-pointer">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORMULARIO CRUD CREAR/EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-sm font-black text-slate-850">
                {modoEdicion ? 'Actualizar Directivas Ministerio' : 'Añadir Registro Ministerio'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardado} className="p-6 space-y-4 text-xs text-slate-800 font-sans">
              
              {errValidacion && (
                <div className="bg-red-50 text-red-800 border p-2.5 rounded-lg font-mono">
                  ⚠️ {errValidacion}
                </div>
              )}

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Nombre del Ministerio único</label>
                <input
                  type="text"
                  required
                  value={nombreMinisterio}
                  onChange={(e) => setNombreMinisterio(e.target.value)}
                  placeholder="ejemplo: Ministerio de Alabanza, Ministerio Infantil"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Declaración de Misión</label>
                  <textarea
                    required
                    value={mision}
                    onChange={(e) => setMision(e.target.value)}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Declaración de Visión</label>
                  <textarea
                    required
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <span className="block font-bold text-indigo-900 text-[10px] uppercase font-mono tracking-wider">Asignación de Cargos de Comisión Directiva</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Nombre del Líder encargado</label>
                    <input
                      type="text"
                      required
                      value={lider}
                      onChange={(e) => setLider(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Nombre del Secretario</label>
                    <input
                      type="text"
                      required
                      value={secretario}
                      onChange={(e) => setSecretario(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Nombre del Tesorero</label>
                    <input
                      type="text"
                      required
                      value={tesorero}
                      onChange={(e) => setTesorero(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Primer Vocal (Vocal 1)</label>
                    <input
                      type="text"
                      required
                      value={vocal1}
                      onChange={(e) => setVocal1(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 font-mono font-semibold">Segundo Vocal (Vocal 2) (Opcional)</label>
                    <input
                      type="text"
                      value={vocal2}
                      onChange={(e) => setVocal2(e.target.value)}
                      placeholder="ej: Nombre del segundo vocal"
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t mt-4 -mx-6 px-6 bg-slate-50 py-3 -mb-6 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-slate-205 border text-slate-750 px-4 py-2 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL RECONSTITUCIÓN DE PDF */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Libro de Actas y Composición de Ministerios Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}

    </div>
  );
};
