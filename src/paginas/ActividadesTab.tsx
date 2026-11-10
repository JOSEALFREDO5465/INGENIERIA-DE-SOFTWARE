// ESTE COMPONENTE ADMINISTRA EL CRUD DE ACTIVIDADES DEL AÑO.
// Incluye validación de conflictos de horario y espacio (RF03) y presupuesto vs costo real (RF06).

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EntradaAnimada } from '../componentes/EntradaAnimada';
import { useApp } from '../contextos/AppContexto';
import { Actividad } from '../tipos';
import { Plus, Search, FileText, Eye, Pencil, Trash2, X, AlertTriangle, Calendar, Clock, MapPin, Target, CircleCheck, Circle, XCircle } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

// Propósitos oficiales de la Iglesia (selección múltiple, todas = TODOS LOS PROPÓSITOS)
const PROPOSITOS_DISPONIBLES = ['Adoración', 'Comunión', 'Discipulado', 'Ministerio', 'Evangelismo'];

const quitarTildes = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const propositoNormalizado = (p: string) => quitarTildes(p.trim().toLowerCase());

const PROPÓSITO_CHIPS: Record<string, { bg: string; border: string; text: string }> = {
  adoracion: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
  comunion: { bg: '#D1FAE5', border: '#A7F3D0', text: '#047857' },
  discipulado: { bg: '#EDE9FE', border: '#DDD6FE', text: '#6D28D9' },
  ministerio: { bg: '#DBEAFE', border: '#BFDBFE', text: '#1D4ED8' },
  evangelismo: { bg: '#FFEDD5', border: '#FED7AA', text: '#C2410C' },
};

const propositoEstilo = (p: string) => {
  const clave = propositoNormalizado(p);
  return PROPÓSITO_CHIPS[clave] ?? { bg: '#F1F5F9', border: '#E2E8F0', text: '#475569' };
};

const TODOS_LOS_PROPOSITOS = PROPOSITOS_DISPONIBLES.map(propositoNormalizado);

// Color estable para el chip de responsable (hash basado en su nombre)
const PALETA_RESPONSABLE = [
  { bg: '#FFE4E6', border: '#FECDD3', text: '#E11D48' },
  { bg: '#FFEDD5', border: '#FED7AA', text: '#C2410C' },
  { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
  { bg: '#D1FAE5', border: '#A7F3D0', text: '#047857' },
  { bg: '#CCFBF1', border: '#99F6E4', text: '#0F766E' },
  { bg: '#E0F2FE', border: '#BAE6FD', text: '#0369A1' },
  { bg: '#E0E7FF', border: '#C7D2FE', text: '#3730A3' },
  { bg: '#EDE9FE', border: '#DDD6FE', text: '#7C3AED' },
  { bg: '#FCE7F3', border: '#FBCFE8', text: '#BE185D' },
];

const colorResponsable = (nombre: string) => {
  const texto = nombre.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return PALETA_RESPONSABLE[h % PALETA_RESPONSABLE.length];
};

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

  // Normaliza propósitos provenientes de la API al catálogo local
  const propositosDesdeApi = (lista?: string[] | null): string[] => {
    const fuente = Array.isArray(lista) ? lista : [];
    const normalizar = (txt: string) => quitarTildes(txt.trim().toLowerCase());
    const result: string[] = [];
    for (const item of fuente) {
      const itemNorm = normalizar(item);
      const encontrado = PROPOSITOS_DISPONIBLES.find((p) => normalizar(p) === itemNorm);
      if (encontrado && !result.includes(encontrado)) result.push(encontrado);
    }
    return result;
  };

  const abrirFormEditar = (act: Actividad) => {
    setFecha(act.fecha);
    setHoraInicio(act.hora_inicio || '');
    setHoraFin(act.hora_fin || '');
    setActividad(act.actividad);
    setPropositosSeleccionados(propositosDesdeApi(act.proposito));
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

    const datosForm = {
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      actividad: actividad.trim(),
      proposito: propositosSeleccionados,
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
    Array.isArray(act.proposito) ? act.proposito.join(', ') : String(act.proposito ?? '-'),
    act.responsable,
    act.lugar,
    Number(act.presupuesto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }),
    Number(act.costo_real).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }),
    act.estado?.toUpperCase()
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* SECCIÓN ENCABEZADO */}
      <EntradaAnimada>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={abrirFormNuevo}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Actividad</span>
          </motion.button>
        </div>
      </div>
      </EntradaAnimada>

      {/* BUSCADOR */}
      <EntradaAnimada delay={0.1}>
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
      </EntradaAnimada>

      {/* TABLAS MENSUALES */}
      <div className="space-y-6">
        {mesesOrdenados.map((mesAnio, mesIndex) => (
          <EntradaAnimada key={mesAnio} delay={0.18 + mesIndex * 0.1}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* ENCABEZADO DEL MES */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{mesAnio}</h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {gruposPorMes[mesAnio].length} {gruposPorMes[mesAnio].length === 1 ? 'Actividad' : 'Actividades'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="pl-6 pr-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actividad / Propósito</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hora</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Responsable</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lugar</th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meta</th>
                    <th className="pl-3 pr-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gruposPorMes[mesAnio].map((act, actIndex) => {
                    const propositosApi = Array.isArray(act.proposito) ? act.proposito : [];
                    const normalizarApi = (txt: string) => quitarTildes(txt.trim().toLowerCase());
                    const todosMarcados = propositosApi.length > 0 && TODOS_LOS_PROPOSITOS.every((p) =>
                      propositosApi.some((op) => normalizarApi(op) === p)
                    );
                    const fechaDate = new Date(`${act.fecha}T00:00:00`);
                    const dia = String(fechaDate.getDate()).padStart(2, '0');
                    const mesCorto = fechaDate.toLocaleDateString('es-BO', { month: 'short', timeZone: 'UTC' }).replace('.', '');
                    const colorResp = colorResponsable(act.responsable);
                    return (
                      <motion.tr
                        key={act.id_actividad}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + actIndex * 0.03, duration: 0.35, ease: 'easeOut' }}
                        className="hover:bg-slate-50/50 transition">
                        {/* FECHA */}
                        <td className="pl-6 pr-3 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-4 h-4 text-[#4040E0] flex-shrink-0" />
                            <span className="font-extrabold text-slate-800">{dia} {mesCorto}</span>
                          </div>
                        </td>
                        {/* ACTIVIDAD / PROPÓSITO */}
                        <td className="px-3 py-4">
                          <h4 className="font-bold text-slate-900 leading-snug">{act.actividad}</h4>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {todosMarcados ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide bg-[#002060] text-white">
                                Todos los Propósitos
                              </span>
                            ) : propositosApi.map((p) => {
                              const estilo = propositoEstilo(p);
                              return (
                                <span
                                  key={p}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide border"
                                  style={{ backgroundColor: estilo.bg, borderColor: estilo.border, color: estilo.text }}
                                >
                                  {p}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        {/* HORA */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-slate-700">
                            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="font-semibold">{act.hora_inicio}</span>
                          </div>
                        </td>
                        {/* RESPONSABLE */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wide border"
                            style={{ backgroundColor: colorResp.bg, borderColor: colorResp.border, color: colorResp.text }}
                          >
                            {act.responsable}
                          </span>
                        </td>
                        {/* LUGAR */}
                        <td className="px-3 py-4">
                          <div className="flex items-start space-x-1.5 text-slate-600 max-w-[180px]">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span>{act.lugar}</span>
                          </div>
                        </td>
                        {/* ESTADO */}
                        <td className="px-3 py-4 text-center whitespace-nowrap">
                          {act.estado === 'realizado' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]">
                              <CircleCheck className="w-3 h-3" />
                              <span>Cumplido</span>
                            </span>
                          ) : act.estado === 'cancelado' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
                              <XCircle className="w-3 h-3" />
                              <span>Cancelado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide bg-[#E2E8F0] text-[#475569] border border-[#CBD5E1]">
                              <Clock className="w-3 h-3" />
                              <span>Pendiente</span>
                            </span>
                          )}
                        </td>
                        {/* META */}
                        <td className="px-3 py-4 max-w-[220px]">
                          <div className="flex items-start space-x-1.5 text-slate-500">
                            <Target className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="italic leading-snug">({act.meta})</span>
                          </div>
                        </td>
                        {/* ACCIONES */}
                        <td className="pl-3 pr-6 py-4 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => { setActVerDetalle(act); setModalAbierto(true); }}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition" title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirFormEditar(act)}
                            className="p-1.5 text-[#2563EB] hover:bg-indigo-50 rounded transition" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => actualizarActividad(act.id_actividad, { estado: act.estado === 'realizado' ? 'pendiente' : 'realizado' })}
                            className={`p-1.5 rounded transition ${
                              act.estado === 'realizado'
                                ? 'text-[#047857] bg-[#D1FAE5] hover:bg-[#A7F3D0]'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={act.estado === 'realizado' ? 'Marcar como pendiente' : 'Marcar como realizado'}>
                            <CircleCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => manejarEliminar(act.id_actividad, act.actividad)}
                            className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded transition" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </EntradaAnimada>
        ))}
        {mesesOrdenados.length === 0 && (
          <div className="py-12 text-center text-slate-400 italic text-xs bg-slate-50 rounded-3xl border border-slate-200">
            No hay actividades registradas.
          </div>
        )}
      </div>

      {/* MODAL: DETALLE */}
      {actVerDetalle && (
        <div className="modal-overlay fixed inset-0 bg-slate-900/60 backdrop-blur-sm overscroll-contain flex items-center justify-center z-50 p-4">
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
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Array.isArray(actVerDetalle.proposito) && actVerDetalle.proposito.length > 0 ? (
                      actVerDetalle.proposito.map((p) => {
                        const estilo = propositoEstilo(p);
                        return (
                          <span
                            key={p}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border"
                            style={{ backgroundColor: estilo.bg, borderColor: estilo.border, color: estilo.text }}
                          >
                            {p}
                          </span>
                        );
                      })
                    ) : (
                      <p className="font-bold text-slate-800">Sin especificar</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Presupuesto proyectado</span>
                  <p className="font-bold text-slate-800">{Number(actVerDetalle.presupuesto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Costo real ejecutado</span>
                  <p className="font-bold text-slate-800">{Number(actVerDetalle.costo_real).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Variación</span>
                  <p className={`font-bold ${actVerDetalle.costo_real <= actVerDetalle.presupuesto ? 'text-[#047857]' : 'text-[#B91C1C]'}`}>
                    {(Number(actVerDetalle.presupuesto) - Number(actVerDetalle.costo_real)).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Estado</span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border mt-1 ${
                    actVerDetalle.estado === 'realizado' ? 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]' :
                    actVerDetalle.estado === 'cancelado' ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]' :
                    'bg-[#E2E8F0] text-[#475569] border-[#CBD5E1]'
                  }`}>
                    {actVerDetalle.estado === 'realizado' ? 'Cumplido' : actVerDetalle.estado === 'cancelado' ? 'Cancelado' : 'Pendiente'}
                  </span>
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
        <div className="modal-overlay fixed inset-0 bg-slate-900/60 backdrop-blur-sm overscroll-contain flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-850">{modoEdicion ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={manejarGuardado} className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
              {errValidacion && (
                <div className="bg-[#FDE7E7] border border-[#F5BEBE] p-3 rounded-xl flex items-center space-x-2 text-xs text-[#E85B5B]">
                  <AlertTriangle className="w-4 h-4 text-[#FD6E6E]" />
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
                      placeholder="Ingrese la actividad, ej: Culto Dominical"
                    />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Propósito <span className="text-[#E11D48] normal-case">(marque 1 o más)</span></label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PROPOSITOS_DISPONIBLES.map((p) => {
                      const seleccionado = propositosSeleccionados.includes(p);
                      const estilo = propositoEstilo(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            setPropositosSeleccionados(
                              seleccionado
                                ? propositosSeleccionados.filter((s) => s !== p)
                                : [...propositosSeleccionados, p]
                            )
                          }
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-full border-2 transition cursor-pointer ${
                            seleccionado
                              ? 'shadow-sm scale-105'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          style={
                            seleccionado
                              ? { backgroundColor: estilo.bg, borderColor: estilo.text, color: estilo.text }
                              : { backgroundColor: '#FFFFFF', borderColor: estilo.border, color: estilo.text }
                          }
                        >
                          {seleccionado ? '✓ ' : ''}{p}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setPropositosSeleccionados(
                          propositosSeleccionados.length === PROPOSITOS_DISPONIBLES.length
                            ? []
                            : [...PROPOSITOS_DISPONIBLES]
                        )
                      }
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-full border-2 transition cursor-pointer ${
                        propositosSeleccionados.length === PROPOSITOS_DISPONIBLES.length
                          ? 'bg-[#002060] border-[#002060] text-white shadow-sm'
                          : 'bg-white border-[#002060] text-[#002060] hover:bg-[#002060] hover:text-white'
                      }`}
                    >
                      {propositosSeleccionados.length === PROPOSITOS_DISPONIBLES.length ? '✓ ' : ''}Todos los Propósitos
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="Ingrese el responsable de la actividad"
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
                      placeholder="Ingrese el lugar donde se realizara"
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
                      placeholder="Ingrese la meta u objetivo de la actividad"
                    />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Presupuesto Proyectado</label>
                  <input
                    type="number"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="Ingrese el presupuesto en Bs, ej: 500"
                    />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Costo Real Ejecutado</label>
                  <input
                    type="number"
                    value={costoReal}
                    onChange={(e) => setCostoReal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      placeholder="Ingrese el costo real incurrido"
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
          seccion="Programa de Actividades"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}
    </motion.div>
  );
};
