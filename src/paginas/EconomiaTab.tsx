// PÁGINA DE GESTIÓN ECONÓMICA CENTRAL (TESORERÍA)
// Diseño con paleta crema, animaciones con framer-motion.

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contextos/AppContexto';
import { MovimientoEconomico } from '../tipos';
import { Plus, Search, Eye, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';

// Paleta crema
const CREAM_BG = '#faf8f5';
const CREAM_CARD = '#f5f0e8';
const CREAM_BORDER = '#e8e0d4';
const CREAM_DARK = '#3d3529';
const CREAM_MUTED = '#8a7e6b';

const COLOR_INGRESO = '#10b981';
const COLOR_OFRENDA = '#3b82f6';
const COLOR_EGRESO = '#ef4444';

const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const EconomiaTab: React.FC = () => {
  const {
    movimientosEconomicos,
    crearMovimientoEconomico,
    usuarioActual,
  } = useApp();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [errValidacion, setErrValidacion] = useState<string>('');

  const [movimientoVer, setMovimientoVer] = useState<MovimientoEconomico | null>(null);

  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'ingreso' | 'egreso' | 'ofrenda'>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'1mes' | '2meses' | '1anio' | 'todo'>('todo');

  const [tipo, setTipo] = useState<'ingreso' | 'egreso' | 'ofrenda'>('ingreso');
  const [monto, setMonto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  const hoy = new Date().toISOString().split('T')[0];

  const getFechaLimite = () => {
    const now = new Date();
    if (filtroPeriodo === '1mes') return new Date(now.getFullYear(), now.getMonth(), 1);
    if (filtroPeriodo === '2meses') return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    if (filtroPeriodo === '1anio') return new Date(now.getFullYear(), 0, 1);
    return new Date(2000, 0, 1);
  };

  const movimientosFiltrados = (movimientosEconomicos || [])
    .filter((m) => {
      const texto = filtroTexto.toLowerCase();
      const matchTexto =
        m.descripcion.toLowerCase().includes(texto) ||
        m.tipo.includes(texto) ||
        String(m.fecha).includes(texto);
      const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
      const matchPeriodo = new Date(m.fecha) >= getFechaLimite();
      return matchTexto && matchTipo && matchPeriodo;
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();
  const movimientosMes = (movimientosEconomicos || []).filter(
    (m) => m.mes === mesActual && m.anio === anioActual
  );

  const ingresos = movimientosMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0);
  const ofrendas = movimientosMes.filter((m) => m.tipo === 'ofrenda').reduce((s, m) => s + Number(m.monto), 0);
  const egresos = movimientosMes.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + Number(m.monto), 0);

  const totalIngresos = (movimientosEconomicos || []).filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0);
  const totalOfrendas = (movimientosEconomicos || []).filter((m) => m.tipo === 'ofrenda').reduce((s, m) => s + Number(m.monto), 0);
  const totalEgresos = (movimientosEconomicos || []).filter((m) => m.tipo === 'egreso').reduce((s, m) => s + Number(m.monto), 0);
  const saldoTotal = totalIngresos + totalOfrendas - totalEgresos;

  const puedeGestionar = usuarioActual
    ? ['pastor', 'secretaria', 'tesorero'].includes(usuarioActual.rol)
    : false;

  const datosMensuales = useMemo(() => {
    const result: { mes: number; anio: number; label: string; ingresos: number; ofrendas: number; egresos: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const a = d.getFullYear();
      const movs = (movimientosEconomicos || []).filter((mv) => mv.mes === m && mv.anio === a);
      result.push({
        mes: m,
        anio: a,
        label: `${mesesCortos[m - 1]} ${String(a).slice(2)}`,
        ingresos: movs.filter((mv) => mv.tipo === 'ingreso').reduce((s, mv) => s + Number(mv.monto), 0),
        ofrendas: movs.filter((mv) => mv.tipo === 'ofrenda').reduce((s, mv) => s + Number(mv.monto), 0),
        egresos: movs.filter((mv) => mv.tipo === 'egreso').reduce((s, mv) => s + Number(mv.monto), 0),
      });
    }
    return result;
  }, [movimientosEconomicos]);

  const maxMensual = Math.max(
    ...datosMensuales.map((d) => Math.max(d.ingresos, d.ofrendas, d.egresos)),
    1
  );

  const totalMes = ingresos + ofrendas + egresos || 1;
  const pctIngresos = (ingresos / totalMes) * 100;
  const pctOfrendas = (ofrendas / totalMes) * 100;
  const pctEgresos = (egresos / totalMes) * 100;

  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const ingresosDash = (pctIngresos / 100) * donutCircumference;
  const ofrendasDash = (pctOfrendas / 100) * donutCircumference;
  const egresosDash = (pctEgresos / 100) * donutCircumference;

  const limpiar = () => {
    setTipo('ingreso');
    setMonto('');
    setDescripcion('');
    setFecha(hoy);
    setErrValidacion('');
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalAbierto) { setModalAbierto(false); limpiar(); }
        if (movimientoVer) { setMovimientoVer(null); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalAbierto, movimientoVer]);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0 || !fecha) {
      setErrValidacion('Monto mayor a cero y fecha son obligatorios.');
      return;
    }
    if (tipo === 'egreso' && !descripcion.trim()) {
      setErrValidacion('La descripcion es obligatoria para registrar un egreso.');
      return;
    }
    const f = new Date(fecha);
    crearMovimientoEconomico({
      tipo,
      monto: montoNum,
      descripcion: descripcion.trim() || 'Sin descripcion',
      fecha: f.toISOString().split('T')[0],
      mes: f.getMonth() + 1,
      anio: f.getFullYear(),
    });
    setModalAbierto(false);
    limpiar();
    setToast({ mensaje: 'Movimiento registrado correctamente', tipo: 'exito' });
  };

  const descargarRecibo = (m: MovimientoEconomico) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const colorMap: Record<string, [number, number, number]> = {
      ingreso: [16, 185, 129],
      egreso: [239, 68, 68],
      ofrenda: [59, 130, 246],
    };
    const color = colorMap[m.tipo] || [100, 116, 139];

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('IGLESIA EVANGELICA FILADELFIA', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('"Proclamando la verdad y sirviendo con amor" - La Paz, Bolivia', pageWidth / 2, 27, { align: 'center' });

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(20, 32, pageWidth - 20, 32);

    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('RECIBO DE MOVIMIENTO ECONOMICO', pageWidth / 2, 42, { align: 'center' });

    const rows = [
      { label: 'No. de Recibo:', value: `#${m.id_movimiento}` },
      { label: 'Fecha:', value: String(m.fecha).split('T')[0] },
      { label: 'Tipo:', value: m.tipo.toUpperCase() },
      { label: 'Descripcion:', value: m.descripcion },
    ];

    let y = 55;
    doc.setFontSize(11);
    rows.forEach((row) => {
      doc.setTextColor(71, 85, 105);
      doc.text(row.label, 25, y);
      doc.setTextColor(30, 41, 59);
      doc.text(row.value, 70, y);
      y += 8;
    });

    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Monto:', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(24);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(Number(m.monto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }), pageWidth / 2, y, { align: 'center' });

    y += 20;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Este documento es un comprobante generado por el Sistema de Gestion Eclesiastica.', pageWidth / 2, y, { align: 'center' });
    doc.text(`Generado el ${new Date().toLocaleString('es-BO')}`, pageWidth / 2, y + 5, { align: 'center' });

    doc.save(`recibo_${m.id_movimiento}_${String(m.fecha).split('T')[0]}.pdf`);
    setToast({ mensaje: 'Recibo PDF descargado correctamente', tipo: 'exito' });
  };

  const descargarReporte = () => {
    const fechaLimite = getFechaLimite();

    const filtrados = (movimientosEconomicos || [])
      .filter((m) => {
        if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false;
        const fechaMov = new Date(m.fecha);
        return fechaMov >= fechaLimite;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    if (filtrados.length === 0) {
      setToast({ mensaje: 'No hay movimientos para los filtros seleccionados', tipo: 'error' });
      return;
    }

    const totalIngresos = filtrados.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.monto), 0);
    const totalOfrendas = filtrados.filter((m) => m.tipo === 'ofrenda').reduce((s, m) => s + Number(m.monto), 0);
    const totalEgresos = filtrados.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + Number(m.monto), 0);
    const saldoTotalF = totalIngresos + totalOfrendas - totalEgresos;

    const tipoLabel = filtroTipo === 'todos' ? 'Todos los movimientos' : filtroTipo === 'ingreso' ? 'Ingresos' : filtroTipo === 'egreso' ? 'Egresos' : 'Ofrendas';
    const periodoLabel = filtroPeriodo === '1mes' ? 'Ultimo mes' : filtroPeriodo === '2meses' ? 'Ultimos 2 meses' : filtroPeriodo === '1anio' ? 'Todo el anio' : 'Todo el historial';

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(61, 53, 41);
    doc.text('IGLESIA EVANGELICA FILADELFIA', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(138, 126, 107);
    doc.text('"Proclamando la verdad y sirviendo con amor" - La Paz, Bolivia', pageWidth / 2, 27, { align: 'center' });

    doc.setDrawColor(232, 224, 212);
    doc.setLineWidth(0.5);
    doc.line(20, 32, pageWidth - 20, 32);

    doc.setFontSize(14);
    doc.setTextColor(61, 53, 41);
    doc.text('REPORTE ECONOMICO', pageWidth / 2, 42, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(138, 126, 107);
    doc.text(`Filtros: ${tipoLabel} | ${periodoLabel} | Total: ${filtrados.length} movimientos`, pageWidth / 2, 50, { align: 'center' });

    const cardY = 58;
    const cardW = (pageWidth - 50) / 4;
    const cards = [
      { label: 'Ingresos', value: totalIngresos, color: [16, 185, 129] },
      { label: 'Ofrendas', value: totalOfrendas, color: [59, 130, 246] },
      { label: 'Egresos', value: totalEgresos, color: [239, 68, 68] },
      { label: 'Saldo', value: saldoTotalF, color: saldoTotalF >= 0 ? [16, 185, 129] : [239, 68, 68] },
    ];
    cards.forEach((card, i) => {
      const x = 20 + i * (cardW + 5);
      doc.setFillColor(245, 240, 232);
      doc.roundedRect(x, cardY, cardW, 22, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(138, 126, 107);
      doc.text(card.label, x + cardW / 2, cardY + 7, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.text(card.value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }), x + cardW / 2, cardY + 16, { align: 'center' });
    });

    const tableY = cardY + 30;
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(61, 53, 41);
    doc.rect(20, tableY, pageWidth - 40, 8, 'F');
    doc.text('Fecha', 22, tableY + 5.5);
    doc.text('Tipo', 55, tableY + 5.5);
    doc.text('Descripcion', 85, tableY + 5.5);
    doc.text('Monto', pageWidth - 22, tableY + 5.5, { align: 'right' });

    let y = tableY + 10;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    filtrados.forEach((m, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 0) {
        doc.setFillColor(250, 248, 245);
        doc.rect(20, y - 3, pageWidth - 40, 7, 'F');
      }
      doc.text(String(m.fecha).split('T')[0], 22, y);
      doc.text(m.tipo, 55, y);
      const desc = m.descripcion.length > 40 ? m.descripcion.substring(0, 40) + '...' : m.descripcion;
      doc.text(desc, 85, y);
      doc.text(Number(m.monto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' }), pageWidth - 22, y, { align: 'right' });
      y += 7;
    });

    const footerY = y + 10;
    doc.setFontSize(8);
    doc.setTextColor(138, 126, 107);
    doc.text('Reporte generado por el Sistema de Gestion Eclesiastica de Iglesia Filadelfia.', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generado el ${new Date().toLocaleString('es-BO')}`, pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`reporte_economico_${filtroTipo}_${filtroPeriodo}_${new Date().toISOString().split('T')[0]}.pdf`);
    setToast({ mensaje: `Reporte PDF descargado (${filtrados.length} movimientos)`, tipo: 'exito' });
  };

  return (
    <>
      {/* TOAST DE NOTIFICACION (abajo) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold ${
              toast.tipo === 'exito'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="text-lg">{toast.tipo === 'exito' ? '✓' : '✕'}</span>
              <span>{toast.mensaje}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6" style={{ backgroundColor: CREAM_BG }}>
        {/* ENCABEZADO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm"
          style={{ borderColor: CREAM_BORDER }}
        >
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: CREAM_DARK }}>Modulo Economico Central</h1>
            <p className="text-xs" style={{ color: CREAM_MUTED }}>
              Registro de ingresos, egresos y ofrendas. Consolidacion por mes y anio.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalAbierto(true)}
            disabled={!puedeGestionar}
            className={`flex items-center space-x-2 font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition ${
              !puedeGestionar ? 'opacity-50 cursor-not-allowed' : 'text-white'
            }`}
            style={{ backgroundColor: puedeGestionar ? '#0ea5e9' : '#bae6fd' }}
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </motion.button>
        </motion.div>

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Ingresos del mes', value: ingresos, color: COLOR_INGRESO },
            { label: 'Ofrendas del mes', value: ofrendas, color: COLOR_OFRENDA },
            { label: 'Egresos del mes', value: egresos, color: COLOR_EGRESO },
            { label: 'Saldo total', value: saldoTotal, color: saldoTotal >= 0 ? COLOR_INGRESO : COLOR_EGRESO },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              className="rounded-xl border p-4 transition-all duration-300"
              style={{ backgroundColor: '#ffffff', borderColor: CREAM_BORDER }}
            >
              <div className="text-xs uppercase font-bold" style={{ color: CREAM_MUTED }}>{card.label}</div>
              <div className="text-2xl font-black" style={{ color: card.color }}>
                {card.value.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de barras: tendencia mensual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6"
            style={{ borderColor: CREAM_BORDER }}
          >
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: CREAM_DARK }}>
              Tendencia mensual (ultimos 6 meses)
            </h3>
            <div className="flex items-end justify-between gap-2 h-48">
              {datosMensuales.map((d, idx) => {
                const hIngresos = (d.ingresos / maxMensual) * 100;
                const hOfrendas = (d.ofrendas / maxMensual) * 100;
                const hEgresos = (d.egresos / maxMensual) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-0.5 h-40">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${hIngresos}%` }}
                        transition={{ delay: 0.5 + idx * 0.1, duration: 0.6, ease: 'easeOut' }}
                        className="flex-1 rounded-t"
                        style={{ backgroundColor: COLOR_INGRESO, minHeight: d.ingresos > 0 ? '4px' : '0' }}
                        title={`Ingresos: ${d.ingresos.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}`}
                      ></motion.div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${hOfrendas}%` }}
                        transition={{ delay: 0.6 + idx * 0.1, duration: 0.6, ease: 'easeOut' }}
                        className="flex-1 rounded-t"
                        style={{ backgroundColor: COLOR_OFRENDA, minHeight: d.ofrendas > 0 ? '4px' : '0' }}
                        title={`Ofrendas: ${d.ofrendas.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}`}
                      ></motion.div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${hEgresos}%` }}
                        transition={{ delay: 0.7 + idx * 0.1, duration: 0.6, ease: 'easeOut' }}
                        className="flex-1 rounded-t"
                        style={{ backgroundColor: COLOR_EGRESO, minHeight: d.egresos > 0 ? '4px' : '0' }}
                        title={`Egresos: ${d.egresos.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}`}
                      ></motion.div>
                    </div>
                    <span className="text-[10px] font-mono font-bold" style={{ color: CREAM_MUTED }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_INGRESO }}></div>
                <span style={{ color: CREAM_MUTED }}>Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_OFRENDA }}></div>
                <span style={{ color: CREAM_MUTED }}>Ofrendas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_EGRESO }}></div>
                <span style={{ color: CREAM_MUTED }}>Egresos</span>
              </div>
            </div>
          </motion.div>

          {/* Gráfico de dona */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col items-center justify-center"
            style={{ borderColor: CREAM_BORDER }}
          >
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4" style={{ color: CREAM_DARK }}>
              Distribucion del mes
            </h3>
            <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
              <circle cx="80" cy="80" r={donutRadius} fill="none" stroke="#f1f5f9" strokeWidth="16" />
              <motion.circle
                cx="80" cy="80" r={donutRadius} fill="none"
                stroke={COLOR_INGRESO} strokeWidth="16"
                strokeDasharray={`${ingresosDash} ${donutCircumference}`}
                strokeDashoffset="0"
                initial={{ strokeDasharray: `0 ${donutCircumference}` }}
                animate={{ strokeDasharray: `${ingresosDash} ${donutCircumference}` }}
                transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
              />
              <motion.circle
                cx="80" cy="80" r={donutRadius} fill="none"
                stroke={COLOR_OFRENDA} strokeWidth="16"
                strokeDasharray={`${ofrendasDash} ${donutCircumference}`}
                strokeDashoffset={`-${ingresosDash}`}
                initial={{ strokeDasharray: `0 ${donutCircumference}` }}
                animate={{ strokeDasharray: `${ofrendasDash} ${donutCircumference}` }}
                transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
              />
              <motion.circle
                cx="80" cy="80" r={donutRadius} fill="none"
                stroke={COLOR_EGRESO} strokeWidth="16"
                strokeDasharray={`${egresosDash} ${donutCircumference}`}
                strokeDashoffset={`-${ingresosDash + ofrendasDash}`}
                initial={{ strokeDasharray: `0 ${donutCircumference}` }}
                animate={{ strokeDasharray: `${egresosDash} ${donutCircumference}` }}
                transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="mt-4 space-y-1.5 text-xs w-full">
              {[
                { label: 'Ingresos', pct: pctIngresos, color: COLOR_INGRESO },
                { label: 'Ofrendas', pct: pctOfrendas, color: COLOR_OFRENDA },
                { label: 'Egresos', pct: pctEgresos, color: COLOR_EGRESO },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span style={{ color: CREAM_MUTED }}>{item.label}</span>
                  </div>
                  <span className="font-bold" style={{ color: CREAM_DARK }}>{item.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* FILTROS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white rounded-2xl border shadow-sm p-6"
          style={{ borderColor: CREAM_BORDER }}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: CREAM_MUTED }} />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar movimiento..."
                className="pl-10 pr-4 py-2.5 bg-white border rounded-2xl outline-none text-xs w-full transition-all"
                style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: CREAM_MUTED }}>Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border rounded-xl outline-none text-xs"
                style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
              >
                <option value="todos">Todos los tipos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
                <option value="ofrenda">Ofrendas</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: CREAM_MUTED }}>Periodo</label>
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border rounded-xl outline-none text-xs"
                style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
              >
                <option value="1mes">Ultimo mes</option>
                <option value="2meses">Ultimos 2 meses</option>
                <option value="1anio">Todo el anio</option>
                <option value="todo">Todo el historial</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={descargarReporte}
              className="flex items-center space-x-2 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition whitespace-nowrap text-white"
              style={{ backgroundColor: '#0ea5e9' }}
            >
              <Download className="w-4 h-4" />
              <span>Descargar Reporte</span>
            </motion.button>
          </div>
        </motion.div>

        {/* TABLA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-white rounded-2xl border shadow-sm overflow-hidden"
          style={{ borderColor: CREAM_BORDER }}
        >
          <table className="min-w-full divide-y" style={{ borderColor: CREAM_BORDER }}>
            <thead style={{ backgroundColor: CREAM_CARD }}>
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase" style={{ color: CREAM_MUTED }}>Fecha</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase" style={{ color: CREAM_MUTED }}>Tipo</th>
                <th className="px-6 py-3 text-left text-[11px] font-bold uppercase" style={{ color: CREAM_MUTED }}>Descripcion</th>
                <th className="px-6 py-3 text-right text-[11px] font-bold uppercase" style={{ color: CREAM_MUTED }}>Monto</th>
                <th className="px-6 py-3 text-right text-[11px] font-bold uppercase" style={{ color: CREAM_MUTED }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: CREAM_BORDER }}>
              {movimientosFiltrados.length > 0 ? (
                movimientosFiltrados.map((m, idx) => (
                  <motion.tr
                    key={m.id_movimiento}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.03, duration: 0.3 }}
                    className="hover:bg-opacity-50 transition"
                    style={{ backgroundColor: idx % 2 === 0 ? CREAM_BG : 'white' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: CREAM_DARK }}>{String(m.fecha).split('T')[0]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.tipo === 'ingreso' ? 'bg-emerald-100 text-emerald-800' :
                        m.tipo === 'egreso' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: CREAM_DARK }}>{m.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold" style={{ color: m.tipo === 'ingreso' ? COLOR_INGRESO : m.tipo === 'egreso' ? COLOR_EGRESO : COLOR_OFRENDA }}>
                      {Number(m.monto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => setMovimientoVer(m)}
                        className="text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded text-xs transition inline-flex items-center space-x-1"
                        title="Ver recibo"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </button>
                      <button
                        onClick={() => descargarRecibo(m)}
                        className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-xs transition inline-flex items-center space-x-1"
                        title="Descargar recibo"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Descargar</span>
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center italic" style={{ color: CREAM_MUTED }}>
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* PANEL LATERAL DERECHO: VER RECIBO */}
        <AnimatePresence>
          {movimientoVer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setMovimientoVer(null)}
              ></div>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l flex flex-col"
                style={{ borderColor: CREAM_BORDER }}
              >
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: CREAM_CARD, borderColor: CREAM_BORDER }}>
                  <h3 className="text-base font-black" style={{ color: CREAM_DARK }}>Recibo de Movimiento</h3>
                  <button onClick={() => setMovimientoVer(null)} className="p-1 rounded-lg transition" style={{ color: CREAM_MUTED }}>
                    <span className="text-xl">X</span>
                  </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  <div className="text-center border-b-2 pb-4" style={{ borderColor: '#0ea5e9' }}>
                    <h2 className="text-lg font-extrabold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>IGLESIA FILADELFIA</h2>
                    <p className="text-xs mt-1" style={{ color: CREAM_MUTED }}>"Proclamando la verdad y sirviendo con amor"</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold" style={{ color: CREAM_DARK }}>RECIBO DE MOVIMIENTO ECONOMICO</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'No. de Recibo', value: `#${movimientoVer.id_movimiento}` },
                      { label: 'Fecha', value: String(movimientoVer.fecha).split('T')[0] },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between py-2 border-b" style={{ borderColor: CREAM_BORDER }}>
                        <span className="text-xs font-bold uppercase" style={{ color: CREAM_MUTED }}>{row.label}</span>
                        <span className="text-sm font-bold" style={{ color: CREAM_DARK }}>{row.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b" style={{ borderColor: CREAM_BORDER }}>
                      <span className="text-xs font-bold uppercase" style={{ color: CREAM_MUTED }}>Tipo</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        movimientoVer.tipo === 'ingreso' ? 'bg-emerald-100 text-emerald-800' :
                        movimientoVer.tipo === 'egreso' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movimientoVer.tipo.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b" style={{ borderColor: CREAM_BORDER }}>
                      <span className="text-xs font-bold uppercase" style={{ color: CREAM_MUTED }}>Descripcion</span>
                      <span className="text-sm text-right max-w-[200px]" style={{ color: CREAM_DARK }}>{movimientoVer.descripcion}</span>
                    </div>
                    <div className="py-3 text-center">
                      <span className="text-xs uppercase font-bold block mb-1" style={{ color: CREAM_MUTED }}>Monto</span>
                      <span className="text-3xl font-black" style={{ color: movimientoVer.tipo === 'ingreso' ? COLOR_INGRESO : movimientoVer.tipo === 'egreso' ? COLOR_EGRESO : COLOR_OFRENDA }}>
                        {Number(movimientoVer.monto).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: CREAM_BORDER }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => descargarRecibo(movimientoVer)}
                      className="w-full flex items-center justify-center space-x-2 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md text-white"
                      style={{ backgroundColor: '#0ea5e9' }}
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Recibo PDF</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PANEL LATERAL DERECHO: NUEVO MOVIMIENTO */}
        <AnimatePresence>
          {modalAbierto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => { setModalAbierto(false); limpiar(); }}
              ></div>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l flex flex-col"
                style={{ borderColor: CREAM_BORDER }}
              >
                <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: CREAM_CARD, borderColor: CREAM_BORDER }}>
                  <h3 className="text-base font-black" style={{ color: CREAM_DARK }}>Nuevo Movimiento Economico</h3>
                  <button onClick={() => { setModalAbierto(false); limpiar(); }} className="p-1 rounded-lg transition" style={{ color: CREAM_MUTED }}>
                    <span className="text-xl">X</span>
                  </button>
                </div>
                <form onSubmit={manejarGuardado} className="p-6 space-y-4 flex-1 overflow-y-auto">
                  {errValidacion && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 flex items-center space-x-2"
                    >
                      <span>!</span> {errValidacion}
                    </motion.div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: CREAM_MUTED }}>Tipo</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
                    >
                      <option value="ingreso">Ingreso</option>
                      <option value="egreso">Egreso</option>
                      <option value="ofrenda">Ofrenda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: CREAM_MUTED }}>Monto</label>
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: CREAM_MUTED }}>
                      Descripcion {tipo === 'egreso' ? <span className="text-red-500">*</span> : <span className="font-normal" style={{ color: CREAM_MUTED }}>(opcional)</span>}
                    </label>
                    <input
                      type="text"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required={tipo === 'egreso'}
                      placeholder="Descripcion del movimiento..."
                      className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: CREAM_MUTED }}>Fecha</label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      style={{ borderColor: CREAM_BORDER, color: CREAM_DARK }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t" style={{ borderColor: CREAM_BORDER }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => { setModalAbierto(false); limpiar(); }}
                      className="px-4 py-2 rounded-lg text-xs font-bold transition"
                      style={{ backgroundColor: CREAM_CARD, color: CREAM_DARK }}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={!puedeGestionar}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition text-white ${!puedeGestionar ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: puedeGestionar ? '#0ea5e9' : '#bae6fd' }}
                    >
                      Registrar Movimiento
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};