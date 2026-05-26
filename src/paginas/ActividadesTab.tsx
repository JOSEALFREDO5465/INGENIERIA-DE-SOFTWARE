// ESTE COMPONENTE ADMINISTRA EL CICLO DE VIDA CRUD PARA LA TABLA ACTIVIDADES DIARIAS/SEMANALES
// CONECTADO CON EL CONTEXTO GLOBAL PARA ASOCIAR LOS SACRAMENTOS DE CÉLULAS Y MINISTERIOS ORGANIZATIVOS

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { Actividad } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

const obtenerNombreMesYAnio = (fechaStr: string) => {
  if (!fechaStr) return "MES DESCONOCIDO";
  const partes = fechaStr.split('-');
  if (partes.length < 2) return "MES DESCONOCIDO";
  const mesIndex = parseInt(partes[1], 10);
  const anio = partes[0];
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  const mesNombre = meses[mesIndex - 1] || 'MES DESCONOCIDO';
  return `${mesNombre} DE ${anio}`;
};

export const ActividadesTab: React.FC = () => {
  const { actividades, crearActividad, actualizarActividad, eliminarActividad, ministerios } = useApp();

  // --- ESTADOS NAVEGACIÓN FORMULARIO ---
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [actividadSeleccionadaId, setActividadSeleccionadaId] = useState<number | null>(null);

  // --- DETALLE ---
  const [actVerDetalle, setActVerDetalle] = useState<Actividad | null>(null);

  // --- REPORTE PDF ---
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);

  // --- BUSCADOR ---
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // --- CAMPOS FORM ACTIVIDADES (PDF) ---
  const [fecha, setFecha] = useState<string>('');
  const [actividad, setActividad] = useState<string>('');
  const [proposito, setProposito] = useState<string>('');
  const [propositosSeleccionados, setPropositosSeleccionados] = useState<string[]>([]);
  const [hora, setHora] = useState<string>('');
  const [responsable, setResponsable] = useState<string>('');
  const [lugar, setLugar] = useState<string>('');
  const [estado, setEstado] = useState<'pendiente' | 'realizado' | 'cancelado'>('pendiente');
  const [meta, setMeta] = useState<string>('');
  const [idMinisterio, setIdMinisterio] = useState<number>(1);

  const [errValidacion, setErrValidacion] = useState<string>('');

  // FILTRAR ACTIVIDADES
  const actividadesFiltradas = actividades.filter(act => {
    const mesAnioLabel = obtenerNombreMesYAnio(act.fecha).toLowerCase();
    const textoFiltro = filtroTexto.toLowerCase();
    return (
      act.actividad.toLowerCase().includes(textoFiltro) ||
      act.responsable.toLowerCase().includes(textoFiltro) ||
      act.lugar.toLowerCase().includes(textoFiltro) ||
      mesAnioLabel.includes(textoFiltro)
    );
  });

  const actividadesOrdenadas = [...actividadesFiltradas].sort((a, b) => b.fecha.localeCompare(a.fecha));

  const gruposPorMes: { [key: string]: Actividad[] } = {};
  actividadesOrdenadas.forEach((act) => {
    const mesAnio = obtenerNombreMesYAnio(act.fecha);
    if (!gruposPorMes[mesAnio]) {
      gruposPorMes[mesAnio] = [];
    }
    gruposPorMes[mesAnio].push(act);
  });

  const mesesOrdenados = Object.keys(gruposPorMes).sort((a, b) => {
    const fechaA = gruposPorMes[a][0].fecha;
    const fechaB = gruposPorMes[b][0].fecha;
    return fechaB.localeCompare(fechaA);
  });

  // LIMPIAR FORMULARIO
  const limpiarFormulario = () => {
    setFecha('');
    setActividad('');
    setProposito('');
    setPropositosSeleccionados([]);
    setHora('');
    setResponsable('');
    setLugar('');
    setEstado('pendiente');
    setMeta('');
    setIdMinisterio(1);
    setErrValidacion('');
  };

  // NUEVO
  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setActividadSeleccionadaId(null);
    setModalAbierto(true);
  };

  // EDITAR
  const abrirFormEditar = (act: Actividad) => {
    setFecha(act.fecha);
    setActividad(act.actividad);
    setProposito(act.proposito || '');

    // Parse propósito
    const preList = act.proposito ? act.proposito.split(',').map(s => s.trim()).filter(Boolean) : [];
    const correctas = ['Ministerio', 'Adoración', 'Comunión', 'Evangelismo', 'Discipulado', 'Todos'];
    const filtered = preList.map(item => {
      const matched = correctas.find(c => c.toLowerCase() === item.toLowerCase() || c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === item.toLowerCase());
      return matched || item;
    });
    setPropositosSeleccionados(filtered);

    setHora(act.hora);
    setResponsable(act.responsable);
    setLugar(act.lugar);
    setEstado(act.estado);
    setMeta(act.meta || '');
    setIdMinisterio(act.id_ministerio || 1);

    setActividadSeleccionadaId(act.id_actividad);
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  // GUARDAR
  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    if (!actividad.trim() || propositosSeleccionados.length === 0 || !fecha || !hora || !responsable.trim() || !lugar.trim() || !meta.trim()) {
      setErrValidacion('Nombre, al menos un Propósito, Fecha, Hora, Responsable, Lugar y Meta de la Actividad son requeridos equitativamente.');
      return;
    }

    const propositoFinal = propositosSeleccionados.includes('Todos')
      ? 'Todos'
      : propositosSeleccionados.join(', ');

    const datosForm = {
      fecha,
      actividad: actividad.trim(),
      proposito: propositoFinal,
      hora,
      responsable: responsable.trim(),
      lugar: lugar.trim(),
      estado,
      meta: meta.trim(),
      id_ministerio: Number(idMinisterio)
    };

    if (modoEdicion && actividadSeleccionadaId !== null) {
      actualizarActividad(actividadSeleccionadaId, datosForm);
    } else {
      crearActividad(datosForm);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  // ELIMINAR ACTIVIDAD
  const manejarEliminar = (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente la actividad "${nombre}"?`)) {
      eliminarActividad(id);
    }
  };

  // REPORTE PDF COLUMNAS
  const columnasPdf = ['F. Actividad', 'Nombre Actividad', 'Proposito', 'Hora', 'Responsable', 'Lugar de Reunión', 'Estado'];
  const datosPdf = actividadesFiltradas.map(act => [
    act.fecha,
    act.actividad,
    act.proposito,
    act.hora,
    act.responsable,
    act.lugar,
    act.estado?.toUpperCase()
  ]);

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN ENCABEZADO CON OPERADORES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Programa de Actividades y Eventos</h1>
          <p className="text-xs text-slate-500">Supervisión eclesiástica de vigilias, capacitaciones y cultos generales de la Iglesia Filadelfia.</p>
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
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Actividad</span>
          </button>
        </div>
      </div>

      {/* CONTROL BUSCADOR */}
      <div className="relative rounded-2xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Filtrar actividades por títulos, responsables o templos/aulas asignadas..."
          className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
      </div>

      {/* DIVISIONES MENSUALES Y TABLAS DE ACTIVIDADES */}
      <div className="space-y-10">
        {mesesOrdenados.length > 0 ? (
          mesesOrdenados.map((mesAnio) => {
            const actividadesDelMes = gruposPorMes[mesAnio];
            return (
              <div key={mesAnio} className="space-y-4">
                {/* ENCABEZADO DE SECCIÓN MENSUAL */}
                <div className="flex items-center space-x-3 pt-2">
                  <h2 className="text-sm md:text-base font-extrabold text-slate-900 tracking-wider uppercase font-mono bg-slate-100 border border-slate-205 px-3 py-1.5 rounded-xl shadow-sm">
                    {mesAnio}
                  </h2>
                  <div className="flex-1 h-[2px] bg-slate-200"></div>
                </div>

                {/* TABLA DE ACTIVIDADES DEL MES */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 font-mono">
                        <tr>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Fecha / Hora</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Actividad / Propósito</th>
                          <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Responsable / Lugar</th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Meta de la Actividad</th>
                          <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-xs text-slate-805">
                        {actividadesDelMes.map((act) => {
                          const propsList = act.proposito
                            ? act.proposito.split(',').map(s => s.trim()).filter(Boolean)
                            : [];

                          return (
                            <tr key={act.id_actividad} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] font-bold text-slate-900">
                                <div>{act.fecha}</div>
                                <div className="text-[10px] text-indigo-650 font-semibold">{act.hora} h.</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-extrabold text-slate-900 leading-snug">{act.actividad}</div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {propsList.length > 0 ? (
                                    propsList.map((item, idx) => {
                                      const p = item.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                      let badgeStyle = "bg-slate-50 text-slate-650 border border-slate-200";
                                      let labelText = item.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                                      if (p === 'ministerio') {
                                        badgeStyle = "bg-blue-50 text-blue-700 border border-blue-200";
                                      } else if (p === 'adoracion') {
                                        badgeStyle = "bg-amber-50 text-amber-700 border border-amber-250";
                                      } else if (p === 'comunion') {
                                        badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                                      } else if (p === 'evangelismo') {
                                        badgeStyle = "bg-rose-50 text-rose-700 border border-rose-200";
                                      } else if (p === 'discipulado' || p === 'dicipulado' || p === 'disimulado') {
                                        badgeStyle = "bg-purple-50 text-purple-700 border border-purple-200";
                                        labelText = "DISIMULADO";
                                      } else if (p === 'todos' || p === 'todos los propositos') {
                                        badgeStyle = "bg-slate-900 text-white border border-slate-950 font-black";
                                        labelText = "TODOS LOS PROPÓSITOS";
                                      }

                                      return (
                                        <span
                                          key={idx}
                                          className={`inline-flex items-center px-3 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider ${badgeStyle}`}
                                        >
                                          {labelText}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Sin propósitos definidos</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <div className="font-bold text-slate-850">{act.responsable}</div>
                                <div className="text-[10px] text-slate-450 font-semibold">{act.lugar}</div>
                              </td>
                              <td className="px-6 py-4 text-left">
                                <div className="text-slate-600 max-w-xs italic break-words line-clamp-2" title={act.meta}>
                                  "{act.meta || 'Sin meta definida'}"
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <span className={`inline-flex px-2.5 py-0.75 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                                  act.estado === 'realizado' ? 'bg-emerald-600 text-white border border-emerald-550 shadow-sm' :
                                  act.estado === 'cancelado' ? 'bg-rose-600 text-white border border-rose-550 shadow-sm' : 'bg-amber-400 text-amber-950 border border-amber-300 shadow-sm'
                                }`}>
                                  {act.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                <button
                                  onClick={() => setActVerDetalle(act)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer inline-block"
                                  title="Ficha del Evento"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => abrirFormEditar(act)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer inline-block"
                                  title="Editar Actividad"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => manejarEliminar(act.id_actividad, act.actividad)}
                                  className="p-1.5 text-red-650 hover:bg-red-50 hover:text-red-855 rounded-lg transition text-red-650 cursor-pointer inline-block"
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 italic font-medium">
            Ninguna actividad registrada coincide con el criterio de filtrado en absoluto.
          </div>
        )}
      </div>

      {/* MODAL DETALLES COMPLETO DE ACTIVIDADES E HIGHLIGHTS */}
      {actVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center rounded-t-3xl bg-white">
              <div>
                <h3 className="text-base font-black text-slate-850">Propiedades de Actividad</h3>
              </div>
              <button onClick={() => setActVerDetalle(null)} className="text-slate-400 p-1.5 hover:bg-slate-150 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-slate-800">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="block text-[9px] uppercase font-mono text-slate-400 font-bold">Título de Actividad</span>
                <h4 className="font-extrabold text-slate-900 text-sm mt-1 leading-relaxed">{actVerDetalle.actividad}</h4>
                <p className="text-[11px] text-slate-555 italic mt-2"><strong>Propósito:</strong> "{actVerDetalle.proposito}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-800">
                <div className="bg-slate-50 p-2.5 rounded-xl border font-mono">
                  <span className="block text-[8px] uppercase text-slate-400">Fecha del Programa</span>
                  <span className="font-bold text-slate-900">{actVerDetalle.fecha}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border font-mono">
                  <span className="block text-[8px] uppercase text-slate-400">Hora Programada</span>
                  <span className="font-bold text-slate-900">{actVerDetalle.hora} h.</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border">
                  <span className="block text-[8px] uppercase text-slate-400 font-mono">Lugar de Reunión</span>
                  <span className="font-bold text-slate-900">{actVerDetalle.lugar}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border">
                  <span className="block text-[8px] uppercase text-slate-400 font-mono">Líder Responsable</span>
                  <span className="font-bold text-slate-900">{actVerDetalle.responsable}</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-150 text-[11px] text-slate-700">
                <span className="block text-[9px] uppercase font-mono font-bold text-indigo-900">Metas e Insumos a Lograr (Meta)</span>
                <p className="mt-1 leading-relaxed font-medium text-indigo-950">{actVerDetalle.meta}</p>
              </div>

              <div className="flex justify-between items-center bg-slate-50 border p-2.5 rounded-lg text-[11px] font-mono">
                <span>Vinculación Ministerial ID: #{actVerDetalle.id_ministerio}</span>
                <span className="flex items-center gap-1.5">
                  <span>Estado:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    actVerDetalle.estado === 'realizado' ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' :
                    actVerDetalle.estado === 'cancelado' ? 'bg-rose-600 text-white border-rose-500 shadow-sm' : 'bg-amber-400 text-amber-955 border-amber-300 shadow-sm'
                  }`}>
                    {actVerDetalle.estado}
                  </span>
                </span>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 flex justify-end rounded-b-3xl">
              <button onClick={() => setActVerDetalle(null)} className="bg-slate-900 text-white font-bold px-4 py-2 hover:bg-slate-800 text-xs rounded-xl cursor-pointer">
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
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center bg-white rounded-t-3xl text-xs">
              <h3 className="text-sm font-black text-slate-855">
                {modoEdicion ? 'Actualizar Ficha de Actividad' : 'Agregar Nueva Actividad Programada'}
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
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Nombre de la Actividad (Título)</label>
                <input
                  type="text"
                  required
                  value={actividad}
                  onChange={(e) => setActividad(e.target.value)}
                  placeholder="ej: Culto Dominical Familiar"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px] mb-1.5">Objetivos o Propósitos de la Actividad</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-205">
                  {['Ministerio', 'Adoración', 'Comunión', 'Evangelismo', 'Discipulado', 'Todos'].map((opc) => {
                    const checked = propositosSeleccionados.includes(opc);
                    return (
                      <label
                        key={opc}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg border cursor-pointer select-none transition ${
                          checked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/55'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (opc === 'Todos') {
                              if (checked) {
                                setPropositosSeleccionados([]);
                              } else {
                                setPropositosSeleccionados(['Ministerio', 'Adoración', 'Comunión', 'Evangelismo', 'Discipulado', 'Todos']);
                              }
                            } else {
                              let nuevos = [...propositosSeleccionados];
                              if (checked) {
                                nuevos = nuevos.filter(n => n !== opc && n !== 'Todos');
                              } else {
                                nuevos.push(opc);
                                const prims = ['Ministerio', 'Adoración', 'Comunión', 'Evangelismo', 'Discipulado'];
                                const allPrimsChecked = prims.every(p => nuevos.includes(p));
                                if (allPrimsChecked && !nuevos.includes('Todos')) {
                                  nuevos.push('Todos');
                                }
                              }
                              setPropositosSeleccionados(nuevos);
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] leading-none">{opc}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-450 mt-1 font-mono">Puede seleccionar múltiples opciones, o marcar "Todos".</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Fecha Programada</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Hora Específica</label>
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Líder Responsable de Actividad</label>
                  <input
                    type="text"
                    required
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder="ej: Pastor Gómez, Junta Damas"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Lugar de Realización</label>
                  <input
                    type="text"
                    required
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    placeholder="ej: Templo Central, Aulas"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Estado de Actividad</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="realizado">Realizado / Ejecutado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Ministerio Vinculado</label>
                  <select
                    value={idMinisterio}
                    onChange={(e) => setIdMinisterio(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    {ministerios.map(m => (
                      <option key={m.id_ministerio} value={m.id_ministerio}>{m.nombre_ministerio}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Meta de la Actividad (Asistentes esperados, impactos)</label>
                <textarea
                  required
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                  placeholder="ej: Consolidar la asistencia de 80 jóvenes y bautizar a 5 nuevos convertidos..."
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
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
                  className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {modoEdicion ? 'Actualizar Actividad' : 'Registrar nueva Actividad'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL REPARTO PDF */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Libro de Actividades, Vigilias y Eventos Semanales Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}

    </div>
  );
};
