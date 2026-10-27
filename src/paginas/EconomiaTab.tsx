// PÁGINA DE GESTIÓN ECONÓMICA CENTRAL (TESORERÍA)
// Ingresos, egresos y ofrendas con consolidación mensual y anual.

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { MovimientoEconomico } from '../tipos';
import { Plus, Search, FileText, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

export const EconomiaTab: React.FC = () => {
  const {
    movimientosEconomicos,
    crearMovimientoEconomico,
    eliminarMovimientoEconomico,
    usuarioActual,
  } = useApp();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [errValidacion, setErrValidacion] = useState<string>('');

  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ingreso' | 'egreso' | 'ofrenda'>('todos');

  // FORM
  const [tipo, setTipo] = useState<'ingreso' | 'egreso' | 'ofrenda'>('ingreso');
  const [monto, setMonto] = useState<number>(0);
  const [descripcion, setDescripcion] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');

  const hoy = new Date().toISOString().split('T')[0];

  const movimientosFiltrados = (movimientosEconomicos || [])
    .filter((m) => {
      const texto = filtroTexto.toLowerCase();
      return (
        m.descripcion.toLowerCase().includes(texto) ||
        m.tipo.includes(texto) ||
        m.fecha.includes(texto)
      );
    })
    .filter((m) => filtroTipo === 'todos' || m.tipo === filtroTipo)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();
  const movimientosMes = (movimientosEconomicos || []).filter(
    (m) => m.mes === mesActual && m.anio === anioActual
  );

  const ingresos = movimientosMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const ofrendas = movimientosMes.filter((m) => m.tipo === 'ofrenda').reduce((s, m) => s + m.monto, 0);
  const egresos = movimientosMes.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
  const saldo = ingresos + ofrendas - egresos;

  const puedeGestionar = usuarioActual
    ? ['pastor', 'secretaria', 'tesorero'].includes(usuarioActual.rol)
    : false;

  const limpiar = () => {
    setTipo('ingreso');
    setMonto(0);
    setDescripcion('');
    setFecha(hoy);
    setErrValidacion('');
  };

  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');
    if (!descripcion.trim() || monto <= 0 || !fecha) {
      setErrValidacion('Descripción, monto mayor a cero y fecha son obligatorios.');
      return;
    }
    const f = new Date(fecha);
    crearMovimientoEconomico({
      tipo,
      monto: Number(monto),
      descripcion: descripcion.trim(),
      fecha: f.toISOString().split('T')[0],
      mes: f.getMonth() + 1,
      anio: f.getFullYear(),
    });
    setModalAbierto(false);
    limpiar();
  };

  const manejarEliminar = (id: number, desc: string) => {
    if (window.confirm(`¿Eliminar movimiento "${desc}"?`)) {
      eliminarMovimientoEconomico(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Módulo Económico Central</h1>
          <p className="text-xs text-slate-500">
            Registro de ingresos, egresos y ofrendas. Consolidación por mes y año.
          </p>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => setModalAbierto(true)}
            disabled={!puedeGestionar}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer ${!puedeGestionar ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN DEL MES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 uppercase font-bold">Ingresos del mes</div>
          <div className="text-2xl font-black text-[#10b981]">{ingresos.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 uppercase font-bold">Ofrendas del mes</div>
          <div className="text-2xl font-black text-[#3b82f6]">{ofrendas.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 uppercase font-bold">Egresos del mes</div>
          <div className="text-2xl font-black text-[#ef4444]">{egresos.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 uppercase font-bold">Saldo del mes</div>
          <div className={`text-2xl font-black ${saldo >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {saldo.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTRO */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar movimiento..."
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as any)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
        >
          <option value="todos">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
          <option value="ofrenda">Ofrendas</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold text-slate-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-right text-[11px] font-bold text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-xs">
            {movimientosFiltrados.length > 0 ? (
              movimientosFiltrados.map((m) => (
                <tr key={m.id_movimiento} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">{m.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.tipo === 'ingreso'
                        ? 'bg-emerald-50 text-emerald-700'
                        : m.tipo === 'egreso'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{m.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold">
                    {m.monto.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {puedeGestionar && (
                      <button
                        onClick={() => manejarEliminar(m.id_movimiento, m.descripcion)}
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs transition"
                        title="Eliminar"
                      >
                        <Trash2Icon />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  No hay movimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVO MOVIMIENTO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-850">Nuevo Movimiento Económico</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <span>✕</span>
              </button>
            </div>
            <form onSubmit={manejarGuardado} className="p-6 space-y-4">
              {errValidacion && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                  <span>⚠</span> {errValidacion}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                  <option value="ofrenda">Ofrenda</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Monto</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-650 uppercase mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!puedeGestionar}
                  className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition ${!puedeGestionar ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function Trash2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
