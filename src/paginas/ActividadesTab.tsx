// ESTE COMPONENTE ADMINISTRA EL CRUD DE ACTIVIDADES DEL AÑO.
// Incluye validación de conflictos de horario y espacio (RF03) y presupuesto vs costo real (RF06).

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { Actividad } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

const obtenerNombreMesYAnio = (fechaStr: string) => {
  if (!fechaStr) return 'MES DESCONOCIDO';
  const partes = fechaStr.split('-');
  if (partes.length < 2) return 'MES DESCONOCIDO';
  const mesIndex = parseInt(partes[1], 10);
  const anio = partes[0];
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];
  const mesNombre = meses[mesIndex - 1] || 'MES DESCONOCIDO';
  return `${mesNombre} DE ${anio}`;
};

// Convierte "HH:MM" a minutos desde medianoche para comparar intervalos.
const horaAMinutos = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  if (!hh || !mm) return -1;
  return hh * 60 + mm;
};

const intervalosSeSolapan = (i1: string, f1: string, i2: string, f2: string) => {
  const a = horaAMinutos(i1);
  const b = horaAMinutos(f1 || '23:59');
  const c = horaAMinutos(i2);
  const d = horaAMinutos(f2 || '23:59');
  if (a < 0 || b < 0 || c < 0 || d < 0) return false;
  return a < d && c < b;
};

export const ActividadesTab: React.FC = () => {
  const { actividades, crearActividad, actualizarActividad, eliminarActividad, ministerios } = useApp();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [actividadSeleccionadaId, setActividadSeleccionadaId] = useState<number | null>(null);

  const [actVerDetalle, setActVerDetalle] = useState<Actividad | null>(null);
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  const [fecha, setFecha] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState<string>('');
  const [horaFin, setHoraFin] = useState<string>('');
  const [actividad, setActividad] = useState<string>('');
  const [proposito, setProposito] = useState<string>('');
  const [propositosSeleccionados, setPropositosSeleccionados] = useState<string[]>([]);
  const [responsable, setResponsable] = useState<string>('');
  const [lugar, setLugar] = useState<string>('');
  const [estado, setEstado] = useState<'pendiente' | 'realizado' | 'cancelado'>('pendiente');
  const [meta, setMeta] = useState<string>('');
  const [presupuesto, setPresupuesto] = useState<number>(0);
  const [costoReal, setCostoReal] = useState<number>(0);
  const [idMinisterio, setIdMinisterio] = useState<number>(1);

  const [errValidacion, setErrValidacion] = useState<string>('');

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

  // Detecta conflictos con actividades existentes (mismo lugar o responsable con solapamiento horario)
  const detectarConflicto = (datos: Partial<Actividad>, excluirId?: number): Actividad | null => {
    const inicio = datos.hora_inicio || '';
    const fin = datos.hora_fin || '';
    if (!inicio || !fin) return null;
    for (const act of actividades) {
      if (excluirId !== undefined && act.id_actividad === excluirId) continue;
      const mismoLugar = act.lugar.trim().toLowerCase() === (datos.lugar || '').trim().toLowerCase();
      const mismoResponsable = act.responsable.trim().toLowerCase() === (datos.responsable || '').trim().toLowerCase();
      const solapan = intervalosSeSolapan(inicio, fin, act.hora_inicio, act.hora_fin || undefined);
      if (solapan && (mismoLugar || mismoResponsable)) {
        return act;
      }
    }
    return null;
  };

  const limpiarFormulario = () => {
    setFecha('');
    setHoraInicio('');
    setHoraFin('');
    setActividad('');
    setProposito('');
    setPropositosSeleccionados([]);
    setResponsable('');
    setLugar('');
    setEstado('pendiente');
    setMeta('');
    setPresupuesto(0);
    setCostoReal(0);
    setIdMinisterio(1);
    setErrValidacion('');
  };

  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setActividadSeleccionadaId(null);
    setModalAbierto(true);
  };

  const abrirFormEditar = (act: Actividad) => {
    setFecha(act.fecha);
    setHoraInicio(act.hora_inicio || '');
    setHoraFin(act.hora_fin || '');
    setActividad(act.actividad);
    setProposito(act.proposito || '');
    const preList = act.proposito ? act.proposito.split(',').map(s => s.trim()).filter(Boolean) : [];
    setPropositosSeleccionados(preList);
    setHoraInicio(act.hora_inicio || '');
    setHoraFin(act.hora_fin || '');
    setResponsable(act.responsable);
    setLugar(act.lugar);
    setEstado(act.estado);
    setMeta(act.meta || '');
    setPresupuesto(act.presupuesto || 0);
    setCostoReal(act.costo_real || 0);
    setIdMinisterio(act.id_ministerio || 1);
    setActividadSeleccionadaId(act.id_actividad);
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    if (!actividad.trim() || propositosSeleccionados.length === 0 || !fecha || !horaInicio || !horaFin || !responsable.trim() || !lugar.trim() || !meta.trim()) {
      setErrValidacion('Nombre, al menos un Propósito, Fecha, Hora Inicio, Hora Fin, Responsable, Lugar y Meta son obligatorios.');
      return;
    }

    const horaI = horaAMinutos(horaInicio);
    const horaF = horaAMinutos(horaFin);
    if (horaI < 0 || horaF < 0 || horaF <= horaI) {
      setErrValidacion('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const conflicto = detectarConflicto({
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      lugar,
      responsable,
    }, actividadSeleccionadaId);

    if (conflicto) {
      setErrValidacion(
        `Conflicto de horario con la actividad "${conflicto.actividad}" (${conflicto.fecha} ${conflicto.hora_inicio}-${conflicto.hora_fin}, responsable: ${conflicto.responsable}, lugar: ${conflicto.lugar}).`
      );
      return;
    }

    const propositoFinal = propositosSeleccionados.includes('Todos')
      ? 'Todos'
      : propositosSeleccionados.join(', ');

    const datosForm = {
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      actividad: actividad.trim(),
      proposito: propositoFinal,
      responsable: responsable.trim(),
      lugar: lugar.trim(),
      estado,
      meta: meta.trim(),
      presupuesto: Number(presupuesto),
      costo_real: Number(costoReal),
      id_ministerio: Number(idMinisterio),
    };

    if (modoEdicion && actividadSeleccionadaId !== null) {
      actualizarActividad(actividadSeleccionadaId, datosForm);
    } else {
      crearActividad(datosForm);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  const manejarEliminar = (id: number, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente la actividad "${nombre}"?`)) {
      eliminarActividad(id);
    }
  };

  const columnasPdf = ['F. Actividad', 'Hora Inicio', 'Hora Fin', 'Nombre Actividad', 'Propósito', 'Responsable', 'Lugar', 'Presupuesto', 'Costo Real', 'Estado'];
  const datosPdf = actividadesFiltradas.map(act => [
    act.fecha,
    act.hora_inicio || '-',
    act.hora_fin || '-',
    act.actividad,
    act.proposito,
    act.responsable,
    act.lugar,
    act.presupuesto.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }),
    act.costo_real.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }),
    act.estado?.toUpperCase()
  ]);

  return (
    <div className="space-y-6">
      {/* SECCIÓN ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Programa de Actividades y Eventos</h1>
          <p className="text-xs text-slate-500">Planificación con detección de conflictos de horario/espacio y control presupuestario.</p>
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

      {/* BUSCADOR */}
      <div className="relative rounded-2xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Filtrar actividades por títulos, responsables o lugares..."
          className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
      </div>

      {/* TABLAS MENSUALES */}
      <div className="space-y-6">
        {mesesOrdenados.map((mesAnio) => (
          <div key={mesAnio} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-indigo-50 px-4 py-3 border-b border-slate-200">
              <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">{mesAnio}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Hora</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Actividad</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Propósito</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Responsable</th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Lugar</th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase">Presupuesto</th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase">Costo Real</th>
                    <th className="px-6 py-3 text-center text-[11px] font-bold text-slate-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-xs">
                  {gruposPorMes[mesAnio].map((act) => (
                    <tr key={act.id_actividad} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-mono">{act.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-mono">{act.hora_inicio} - {act.hora_fin || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">{act.actividad}</td>
                      <td className="px-6 py-4 text-slate-600">{act.proposito}</td>
                      <td className="px-6 py-4 text-slate-700">{act.responsable}</td>
                      <td className="px-6 py-4 text-slate-600">{act.lugar}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-700">{act.presupuesto.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-700">{act.costo_real.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.estado === 'realizado' ? 'bg-emerald-100 text-emerald-800' :
                          act.estado === 'cancelado' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {act.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs space-x-1">
                        <button
                          onClick={() => { setActVerDetalle(act); setModalAbierto(true); }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition" title="Ver detalle">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => abrirFormEditar(act)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition" title="Editar">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => manejarEliminar(act.id_actividad, act.actividad)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {mesesOrdenados.length === 0 && (
          <div className="py-12 text-center text-slate-400 italic text-xs bg-slate-50 rounded-3xl border border-slate-200">
            No hay actividades registradas.
          </div>
        )}
      </div>

      {/* MODAL: DETALLE */}
      {actVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-850">Detalle de Actividad</h3>
                <p className="text-xs text-slate-500">{actVerDetalle.fecha} · {actVerDetalle.hora_inicio} - {actVerDetalle.hora_fin || '-'}</p>
              </div>
              <button onClick={() => setActVerDetalle(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Nombre</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.actividad}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Responsable</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.responsable}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Lugar</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.lugar}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Propósito</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.proposito}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Presupuesto proyectado</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.presupuesto.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Costo real ejecutado</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.costo_real.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Variación</span>
                  <p className={`font-bold ${actVerDetalle.costo_real <= actVerDetalle.presupuesto ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {(actVerDetalle.presupuesto - actVerDetalle.costo_real).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Estado</span>
                  <p className="font-bold text-slate-800 uppercase">{actVerDetalle.estado}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Meta</span>
                  <p className="font-bold text-slate-800">{actVerDetalle.meta}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end rounded-b-xl">
              <button onClick={() => setActVerDetalle(null)} className="bg-slate-900 text-white font-bold py-1.5 px-4 text-xs rounded-xl cursor-pointer">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORMULARIO CREAR/EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-850">{modoEdicion ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={manejarGuardado} className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
              {errValidacion && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>{errValidacion}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Nombre de la Actividad</label>
                  <input
                    type="text"
                    required
                    value={actividad}
                    onChange={(e) => setActividad(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Propósito</label>
                  <select
                    multiple
                    size={4}
                    value={propositosSeleccionados}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                      setPropositosSeleccionados(selected);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Ministerio">Ministerio</option>
                    <option value="Adoración">Adoración</option>
                    <option value="Comunión">Comunión</option>
                    <option value="Evangelismo">Evangelismo</option>
                    <option value="Discipulado">Discipulado</option>
                    <option value="Todos">Todos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Lugar</label>
                  <input
                    type="text"
                    required
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Meta</label>
                  <input
                    type="text"
                    required
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Presupuesto Proyectado</label>
                  <input
                    type="number"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Costo Real Ejecutado</label>
                  <input
                    type="number"
                    value={costoReal}
                    onChange={(e) => setCostoReal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Ministerio a Cargo</label>
                  <select
                    value={String(idMinisterio)}
                    onChange={(e) => setIdMinisterio(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {(ministerios || []).map((m) => (
                      <option key={m.id_ministerio} value={m.id_ministerio}>{m.nombre_ministerio}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-2 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-md"
                >
                  {modoEdicion ? 'Actualizar Actividad' : 'Registrar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PDF */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Reporte de Actividades - Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}
    </div>
  );
};
