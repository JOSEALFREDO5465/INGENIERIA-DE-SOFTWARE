// ESTE COMPONENTE ADMINISTRA EL CRUD DE GRUPOS DE CRECIMIENTO DE LA IGLESIA FILADELFIA
// CONTIENE EL FORMULARIO INTEGRAL BASADO EN LA TABLA DEL PDF, INCLUYENDO LOS INTEGRANTES DE LA JUNTA CELULAR Y EL PASTOR ENCARGADO

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { GrupoCrecimiento } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, AlertTriangle, Users, Package } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

export const GruposTab: React.FC = () => {
  const { grupos, crearGrupo, actualizarGrupo, eliminarGrupo, miembros, inventario } = useApp();

  // --- ESTADOS NAVEGACIÓN FORMULARIO ---
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | null>(null);

  // --- DETALLE ---
  const [grupoVerDetalle, setGrupoVerDetalle] = useState<GrupoCrecimiento | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<'info' | 'miembros' | 'inventario'>('info');

  // --- REPORTE PDF ---
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);

  // --- BUSCADOR ---
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [categoriaActiva, setCategoriaActiva] = useState<'Jóvenes' | 'Mayores'>('Jóvenes');

  // --- CAMPOS FORM GRUPO (PDF) ---
  const [nombreGrupo, setNombreGrupo] = useState<string>('');
  const [lider, setLider] = useState<string>('');
  const [secretario, setSecretario] = useState<string>('');
  const [tesorero, setTesorero] = useState<string>('');
  const [vocal1, setVocal1] = useState<string>('');
  const [vocal2, setVocal2] = useState<string>('');
  const [pastorEncargado, setPastorEncargado] = useState<string>('');
  const [fechaFundacion, setFechaFundacion] = useState<string>('');
  const [categoria, setCategoria] = useState<'Jóvenes' | 'Mayores'>('Jóvenes');

  const [errValidacion, setErrValidacion] = useState<string>('');

  // FILTRAR GRUPOS POR CATEGORÍA Y BUSCADOR
  const gruposFiltrados = grupos.filter(g => {
    const coincideTexto = (
      g.nombre_grupo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      g.lider.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      g.pastor_encargado.toLowerCase().includes(filtroTexto.toLowerCase())
    );
    const cat = g.categoria || 'Jóvenes';
    return coincideTexto && cat === categoriaActiva;
  });

  // LIMPIAR FORMULARIO
  const limpiarFormulario = () => {
    setNombreGrupo('');
    setLider('');
    setSecretario('');
    setTesorero('');
    setVocal1('');
    setVocal2('');
    setPastorEncargado('');
    setFechaFundacion('');
    setCategoria('Jóvenes');
    setErrValidacion('');
  };

  // NUEVO
  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setGrupoSeleccionadoId(null);
    setModalAbierto(true);
  };

  // EDITAR
  const abrirFormEditar = (g: GrupoCrecimiento) => {
    setNombreGrupo(g.nombre_grupo);
    setLider(g.lider);
    setSecretario(g.secretario);
    setTesorero(g.tesorero);
    setVocal1(g.vocal_1);
    setVocal2(g.vocal_2);
    setPastorEncargado(g.pastor_encargado);
    setFechaFundacion(g.fecha_fundacion);
    setCategoria(g.categoria || 'Jóvenes');

    setGrupoSeleccionadoId(g.id_grupo);
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  // GUARDAR
  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    if (!nombreGrupo.trim() || !lider.trim() || !pastorEncargado.trim() || !fechaFundacion) {
      setErrValidacion('Nombre del Grupo, Líder, Pastor Encargado y Fecha de Fundación son requeridos obligatoriamente.');
      return;
    }

    const datosForm = {
      nombre_grupo: nombreGrupo.trim(),
      lider: lider.trim(),
      secretario: secretario.trim(),
      tesorero: tesorero.trim(),
      vocal_1: vocal1.trim(),
      vocal_2: vocal2.trim(),
      pastor_encargado: pastorEncargado.trim(),
      fecha_fundacion: fechaFundacion,
      categoria: categoria
    };

    if (modoEdicion && grupoSeleccionadoId !== null) {
      actualizarGrupo(grupoSeleccionadoId, datosForm);
    } else {
      crearGrupo(datosForm);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  // ELIMINAR GRUPO
  const manejarEliminar = (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente el "${nombre}"? Esta acción no se puede deshacer.`)) {
      eliminarGrupo(id);
    }
  };

  // COLUMNAS PARA EXPORTAR EN REPORTE PDF
  const columnasPdf = ['Categoría', 'Grupo de Crecimiento', 'Líder de Célula', 'Pastor Encargado', 'Tesorero', 'F. Fundación'];
  const datosPdf = gruposFiltrados.map(g => [
    g.categoria || 'Jóvenes',
    g.nombre_grupo,
    g.lider,
    g.pastor_encargado,
    g.tesorero,
    g.fecha_fundacion
  ]);

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN ENCABEZADO CON BOTONES OPERATIVOS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Grupos de Crecimiento</h1>
          <p className="text-xs text-slate-500">Mapeo de reuniones familiares, ubicación geográfica y discipulado congregacional de la iglesia.</p>
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
            <span>Crear Grupo</span>
          </button>
        </div>
      </div>

      {/* CONTROL BUSCADOR CÉLULAR */}
      <div className="relative rounded-2xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Filtrar por nombre de grupo, líder o pastor encargado..."
          className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
      </div>

      {/* TABS DE DIVISIÓN DE GRUPOS EN 2 */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setCategoriaActiva('Jóvenes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-black uppercase rounded-xl transition cursor-pointer ${
            categoriaActiva === 'Jóvenes'
              ? 'bg-white text-indigo-800 shadow-sm border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Grupos de Jóvenes</span>
          <span className="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-0.5 rounded-full font-black font-mono">
            {grupos.filter(g => (g.categoria || 'Jóvenes') === 'Jóvenes').length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setCategoriaActiva('Mayores')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-black uppercase rounded-xl transition cursor-pointer ${
            categoriaActiva === 'Mayores'
              ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Grupos de Mayores</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black font-mono">
            {grupos.filter(g => g.categoria === 'Mayores').length}
          </span>
        </button>
      </div>

      {/* SECCIÓN TABLA GRUPOS DE CRECIMIENTO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        {gruposFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 font-mono">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">Grupo</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">Líder</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60 font-mono">Pastor Supervisor</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60 font-mono">Junta de la Célula</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs text-slate-800">
                {gruposFiltrados.map((g) => {
                  const totMiembros = miembros.filter(m => m.id_grupo === g.id_grupo).length;
                  const totBienes = inventario.filter(i => i.id_grupo === g.id_grupo).length;
                  return (
                    <tr key={g.id_grupo} className="hover:bg-slate-50/50 transition">
                      {/* GRUPO */}
                      <td className="px-5 py-4 border-r border-slate-100 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#1565c0] text-sm uppercase tracking-wide">
                            {g.nombre_grupo}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                            F. Fund: <span className="font-bold text-slate-600">{g.fecha_fundacion}</span>
                          </span>
                        </div>
                      </td>

                      {/* LIDER */}
                      <td className="px-5 py-4 border-r border-slate-100 font-mono text-xs whitespace-nowrap">
                        <span className="font-bold text-slate-800">{g.lider}</span>
                      </td>

                      {/* PASTOR */}
                      <td className="px-5 py-4 border-r border-slate-100 font-mono text-xs whitespace-nowrap">
                        <span className="font-bold text-slate-800">{g.pastor_encargado}</span>
                      </td>

                      {/* JUNTA */}
                      <td className="px-5 py-4 border-r border-slate-100 font-mono text-[10px] text-slate-600 leading-normal">
                        <div><strong className="text-slate-400 uppercase text-[9px]">Sec:</strong> {g.secretario || 'Inexistente'}</div>
                        <div><strong className="text-slate-400 uppercase text-[9px]">Tes:</strong> {g.tesorero || 'Inexistente'}</div>
                        {g.vocal_1 && <div><strong className="text-slate-400 uppercase text-[9px]">Voc 1:</strong> {g.vocal_1}</div>}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-5 py-4 text-right text-xs font-medium space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setGrupoVerDetalle(g);
                            setSeccionActiva('info');
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer inline-block"
                          title="Ver Ficha Celular"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirFormEditar(g)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer inline-block"
                          title="Editar Propiedades"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => manejarEliminar(g.id_grupo, g.nombre_grupo)}
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
            Ningún grupo de crecimiento de esta categoría coincide con el criterio de búsqueda.
          </div>
        )}
      </div>

      {/* MODAL: DETALLES DE UN GRUPO DE CRECIMIENTO */}
      {grupoVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center bg-white rounded-t-3xl">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-650">Ficha Informativa Celular</span>
                <h3 className="text-base font-black text-slate-850">Grupo de Crecimiento</h3>
              </div>
              <button onClick={() => setGrupoVerDetalle(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECCIÓN DE TABS DE DETALLE */}
            <div className="px-6 pt-4">
              <div className="grid grid-cols-3 gap-2 pb-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSeccionActiva('info')}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-center transition cursor-pointer ${
                    seccionActiva === 'info'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50 font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] uppercase font-extrabold tracking-wider">Ficha General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeccionActiva('miembros')}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-center transition cursor-pointer relative ${
                    seccionActiva === 'miembros'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50 font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4 mb-0.5" />
                  {miembros.filter(m => m.id_grupo === grupoVerDetalle.id_grupo).length > 0 && (
                    <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-sm">
                      {miembros.filter(m => m.id_grupo === grupoVerDetalle.id_grupo).length}
                    </span>
                  )}
                  <span className="text-[9px] uppercase font-extrabold tracking-wider">Ver Miembros</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeccionActiva('inventario')}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl text-center transition cursor-pointer relative ${
                    seccionActiva === 'inventario'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50 font-bold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Package className="w-4 h-4 mb-0.5" />
                  {inventario.filter(item => item.id_grupo === grupoVerDetalle.id_grupo).length > 0 && (
                    <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[8px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-sm">
                      {inventario.filter(item => item.id_grupo === grupoVerDetalle.id_grupo).length}
                    </span>
                  )}
                  <span className="text-[9px] uppercase font-extrabold tracking-wider">Inventario</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-850">
              
              {/* HEADER DE FICHA (SIN GRUPO ID O ID GRUPO CEL) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                <span className="bg-indigo-100 text-indigo-805 text-indigo-800 text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  Categoría: {grupoVerDetalle.categoria || 'Jóvenes'}
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase mt-1.5">{grupoVerDetalle.nombre_grupo}</h2>
                <p className="text-[10px] text-slate-450 mt-1 font-mono">FECHA FUNDACIÓN: {grupoVerDetalle.fecha_fundacion}</p>
              </div>

              {/* CONTENIDO DE SECCIÓN: INFO GENERAL */}
              {seccionActiva === 'info' && (
                <div className="space-y-4 pt-1">
                  <h4 className="font-bold text-slate-900 font-mono text-[10px] uppercase tracking-wider">Supervisión y Composición de Liderazgo Celular</h4>
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                    <div className="bg-slate-50 p-2.5 rounded-xl border">
                      <span className="block text-slate-400 uppercase text-[8px]">Pastor Encargado</span>
                      <span className="font-bold text-slate-850">{grupoVerDetalle.pastor_encargado}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border">
                      <span className="block text-slate-400 uppercase text-[8px]">Líder de Célula</span>
                      <span className="font-bold text-slate-800">{grupoVerDetalle.lider}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border">
                      <span className="block text-slate-400 uppercase text-[8px]">Secretario de Célula</span>
                      <span className="font-bold text-slate-800">{grupoVerDetalle.secretario || 'Inexistente'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border">
                      <span className="block text-slate-400 uppercase text-[8px]">Tesorero de Célula</span>
                      <span className="font-bold text-slate-800">{grupoVerDetalle.tesorero || 'Inexistente'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border">
                      <span className="block text-slate-400 uppercase text-[8px]">Primer vocal</span>
                      <span className="font-bold text-slate-800">{grupoVerDetalle.vocal_1 || 'Inexistente'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border">
                      <span className="block text-slate-400 uppercase text-[8px]">Segundo vocal</span>
                      <span className="font-bold text-slate-800">{grupoVerDetalle.vocal_2 || 'Inexistente'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO DE SECCIÓN: VER MIEMBROS */}
              {seccionActiva === 'miembros' && (
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-xl border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase font-mono">Miembros Registrados en este Grupo</span>
                    <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-md font-bold">
                      Total: {miembros.filter(m => m.id_grupo === grupoVerDetalle.id_grupo).length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {miembros.filter(m => m.id_grupo === grupoVerDetalle.id_grupo).length > 0 ? (
                      miembros.filter(m => m.id_grupo === grupoVerDetalle.id_grupo).map(m => (
                        <div key={m.id_miembro} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-350 transition flex items-center justify-between">
                          <div>
                            <span className="text-slate-900 font-bold block">{m.nombres} {m.apellidos}</span>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-450 font-mono mt-0.5">
                              <span>CI: {m.ci}</span>
                              <span>·</span>
                              <span>Tel: {m.telefono || 'N/R'}</span>
                            </div>
                            {m.cursos_discipulado && m.cursos_discipulado.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {m.cursos_discipulado.map(c => (
                                  <span key={c} className="bg-indigo-50 text-indigo-700 text-[8px] font-bold font-mono px-1 rounded-sm uppercase">Disc. {c}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`inline-block text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-md ${
                              m.estado_miembro === 'Activo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {m.estado_miembro}
                            </span>
                            <span className="block text-[9px] text-slate-450 mt-1 font-mono uppercase font-black">{m.tipo_miembro}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-450 italic bg-amber-50/35 border rounded-xl">
                        No hay miembros de la iglesia asociados a este grupo de crecimiento en el sistema.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CONTENIDO DE SECCIÓN: INVENTARIO */}
              {seccionActiva === 'inventario' && (
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase font-mono">Bienes / Equipos Asignados al Grupo</span>
                    <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-md font-bold">
                      Items: {inventario.filter(i => i.id_grupo === grupoVerDetalle.id_grupo).length}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                    {inventario.filter(i => i.id_grupo === grupoVerDetalle.id_grupo).length > 0 ? (
                      inventario.filter(i => i.id_grupo === grupoVerDetalle.id_grupo).map(i => (
                        <div key={i.codigo} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-350 transition space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-slate-900 font-bold block">{i.descripcion}</span>
                              <span className="text-[10px] text-slate-450 font-mono mt-0.5">Código Único: #{i.codigo}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              i.estado === 'disponible' ? 'bg-emerald-100 text-emerald-700' :
                              i.estado === 'en_uso' ? 'bg-blue-100 text-blue-700' :
                              i.estado === 'dano' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              Estado: {i.estado}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-150">
                            <div>
                              <span className="block text-slate-400 text-[8px] uppercase">Cantidad</span>
                              <span className="font-bold text-slate-800">{i.cantidad} {i.unidad}</span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-[8px] uppercase">Procedencia</span>
                              <span className="font-bold text-slate-800">{i.procedencia}</span>
                            </div>
                            <div>
                              <span className="block text-slate-400 text-[8px] uppercase">Valor Est.</span>
                              <span className="font-bold text-slate-850">{i.precio} {i.moneda}</span>
                            </div>
                          </div>

                          {i.observaciones && (
                            <p className="text-[10px] italic text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                              * {i.observaciones}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-450 italic bg-slate-50 border rounded-xl">
                        Este grupo de crecimiento no tiene asignados items de inventario o activos fijos.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-3xl">
              <button onClick={() => setGrupoVerDetalle(null)} className="bg-slate-900 border text-white font-bold py-1.5 px-4 text-xs rounded-xl cursor-pointer">
                Cerrar Ventana
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
                {modoEdicion ? 'Actualizar Ficha de Célula' : 'Añadir Registro Grupo de Crecimiento'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardado} className="p-6 space-y-4 text-xs text-slate-800 font-sans">
              
              {errValidacion && (
                <div className="bg-red-50 text-red-800 border p-2.5 rounded-lg font-mono">
                  ⚠️ {errValidacion}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Nombre del Grupo de Crecimiento</label>
                  <input
                    type="text"
                    required
                    value={nombreGrupo}
                    onChange={(e) => setNombreGrupo(e.target.value)}
                    placeholder="ej: Grupo Shaddai"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Categoría (Edad/Tipo)</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as 'Jóvenes' | 'Mayores')}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-bold text-slate-700"
                  >
                    <option value="Jóvenes">Jóvenes</option>
                    <option value="Mayores">Mayores</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Pastor Supervisor Encargado</label>
                  <input
                    type="text"
                    required
                    value={pastorEncargado}
                    onChange={(e) => setPastorEncargado(e.target.value)}
                    placeholder="ej: Pastor Gómez"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Fecha de Fundación de Grupo</label>
                  <input
                    type="date"
                    required
                    value={fechaFundacion}
                    onChange={(e) => setFechaFundacion(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <span className="block font-bold text-indigo-900 text-[10px] uppercase font-mono tracking-wider">Liderazgo Interno de Célula Familiar</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Nombre del Líder de Célula</label>
                    <input
                      type="text"
                      required
                      value={lider}
                      onChange={(e) => setLider(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Nombre del Secretario de Célula</label>
                    <input
                      type="text"
                      required
                      value={secretario}
                      onChange={(e) => setSecretario(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Nombre del Tesorero de Célula</label>
                    <input
                      type="text"
                      required
                      value={tesorero}
                      onChange={(e) => setTesorero(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono">Primer vocal de Célula</label>
                    <input
                      type="text"
                      required
                      value={vocal1}
                      onChange={(e) => setVocal1(e.target.value)}
                      className="mt-1 block w-full px-2.5 py-1.8 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 font-mono">Segundo vocal de Célula (Opcional)</label>
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
                  className="bg-slate-205 border text-slate-750 px-4 py-2 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {modoEdicion ? 'Actualizar Ficha' : 'Guardar Ficha'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL REPARTO PDF */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Libro de Actas de Grupos de Crecimiento de la Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}

    </div>
  );
};
