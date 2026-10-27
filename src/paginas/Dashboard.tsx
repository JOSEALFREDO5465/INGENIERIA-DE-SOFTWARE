// ESTE COMPONENTE CONTIENE LA PÁGINA DEL DASHBOARD PRINCIPAL

import React from 'react';
import { useApp } from '../contextos/AppContexto';
import { Church, Users, HeartHandshake, Award, Layers, CalendarDays, UserCheck, Flame, BarChart2, PieChart, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { miembros, actividades, grupos } = useApp();

  // FILTROS Y ESTADÍSTICAS DINÁMICAS BASADAS EN LOS REGISTROS

  // 1. MIEMBROS BAUTIZADOS DIVIDIDOS ENTRE MUJERES Y VARONES
  const bautizados = miembros.filter(m => m.bautizado === true);
  const mBautizadosV = bautizados.filter(m => m.sexo === 'Masculino').length;
  const mBautizadosM = bautizados.filter(m => m.sexo === 'Femenino').length;

  // 2. MIEMBROS NO BAUTIZADOS DIVIDIDOS ENTRE MUJERES Y VARONES
  const noBautizados = miembros.filter(m => m.bautizado === false);
  const mNoBautizadosV = noBautizados.filter(m => m.sexo === 'Masculino').length;
  const mNoBautizadosM = noBautizados.filter(m => m.sexo === 'Femenino').length;

  // 3. TOTAL DE SIMPATIZANTES
  const totalSimpatizantes = miembros.filter(m => m.tipo_miembro === 'Simpatizante').length;

  // 4. TOTAL DE ADULTOS MAYORES 60 AÑOS EN ADELANTE (DIVIDIDOS ENTRE MUJERES Y VARONES)
  const mayores60 = miembros.filter(m => m.edad >= 60);
  const mayores60V = mayores60.filter(m => m.sexo === 'Masculino').length;
  const mayores60M = mayores60.filter(m => m.sexo === 'Femenino').length;

  // 5. TOTAL DE ADULTOS DE 35 HASTA LOS 59 AÑOS (DIVIDIDOS ENTRE MUJERES Y VARONES)
  const adultos35a59 = miembros.filter(m => m.edad >= 35 && m.edad <= 59);
  const adultos35a59V = adultos35a59.filter(m => m.sexo === 'Masculino').length;
  const adultos35a59M = adultos35a59.filter(m => m.sexo === 'Femenino').length;

  // 6. TOTAL JÓVENES DE 18 A 35 AÑOS (DIVIDIDOS ENTRE MUJERES Y VARONES)
  const jovenes18a35 = miembros.filter(m => m.edad >= 18 && m.edad <= 35);
  const jovenes18a35V = jovenes18a35.filter(m => m.sexo === 'Masculino').length;
  const jovenes18a35M = jovenes18a35.filter(m => m.sexo === 'Femenino').length;

  // 7. TOTAL DE ADOLESCENTES DE 13 A 17 AÑOS (DIVIDIDOS ENTRE MUJERES Y VARONES)
  const adolescentes13a17 = miembros.filter(m => m.edad >= 13 && m.edad <= 17);
  const adolescentes13a17V = adolescentes13a17.filter(m => m.sexo === 'Masculino').length;
  const adolescentes13a17M = adolescentes13a17.filter(m => m.sexo === 'Femenino').length;

  // 8. TOTAL DE NIÑOS DE 0 A 12 AÑOS (DIVIDIDOS ENTRE MUJERES Y VARONES)
  const ninos0a12 = miembros.filter(m => m.edad >= 0 && m.edad <= 12);
  const ninos0a12V = ninos0a12.filter(m => m.sexo === 'Masculino').length;
  const ninos0a12M = ninos0a12.filter(m => m.sexo === 'Femenino').length;

  // VARIABLES PARA CONTROLES GRÁFICOS INTERACTIVOS
  const totalMiembros = miembros.length || 1;
  const pctBautizados = Math.round((bautizados.length / totalMiembros) * 100);
  const pctNoBautizados = Math.round((noBautizados.length / totalMiembros) * 100);

  const totalVarones = miembros.filter(m => m.sexo === 'Masculino').length;
  const totalMujeres = miembros.filter(m => m.sexo === 'Femenino').length;
  const pctVarones = Math.round((totalVarones / totalMiembros) * 100);
  const pctMujeres = Math.round((totalMujeres / totalMiembros) * 100);

  // Datos para el gráfico de barras ajustados a la paleta de colorres
  const dataBarrasEdades = [
    { key: 0, rango: 'Niños (0-12)', total: ninos0a12.length, varones: ninos0a12V, mujeres: ninos0a12M, color: '#bae6fd', hoverColor: '#7dd3fc', bgClass: 'bg-sky-200' }, 
    { key: 1, rango: 'Adolescentes', total: adolescentes13a17.length, varones: adolescentes13a17V, mujeres: adolescentes13a17M, color: '#7dd3fc', hoverColor: '#38bdf8', bgClass: 'bg-sky-300' }, 
    { key: 2, rango: 'Jóvenes (18-35)', total: jovenes18a35.length, varones: jovenes18a35V, mujeres: jovenes18a35M, color: '#38bdf8', hoverColor: '#0ea5e9', bgClass: 'bg-sky-400' }, 
    { key: 3, rango: 'Adultos (35-59)', total: adultos35a59.length, varones: adultos35a59V, mujeres: adultos35a59M, color: '#0ea5e9', hoverColor: '#0284c7', bgClass: 'bg-sky-500' }, 
    { key: 4, rango: 'Mayores (60+)', total: mayores60.length, varones: mayores60V, mujeres: mayores60M, color: '#0284c7', hoverColor: '#0369a1', bgClass: 'bg-sky-600' } 
  ];

  const maxValorGrupo = Math.max(...dataBarrasEdades.map(d => d.total), 1);
  // OBTENER LAS 5 ACTIVIDADES DE LA SEMANA PRINCIPAL
  const cincoActividades = actividades.slice(0, 5);
  // OBTENER LOS 5 GRUPOS DE CRECIMIENTO DE LA REUNIÓN SEMANAL
  const cincoGrupos = grupos.slice(0, 5);

  return (
    <div className="space-y-6 font-sans text-black">
      {/* BANNER CON PALETA DE COLORES CELESTE Y BLANCO */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden border-l-8 border-[#0ea5e9]">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Church className="w-80 h-80 text-sky-200" style={{ color: '#bae6fd' }} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="bg-slate-100 border border-slate-205 font-mono text-[10.5px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold inline-block" style={{ color: '#263238' }}>
            Dashboard Principal · Administración General
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3" style={{ color: '#263238' }}>
            Iglesia Filadelfia
          </h1>
          <p className="mt-2 text-xs md:text-sm leading-relaxed font-semibold font-sans" style={{ color: '#263238' }}>
            Panel General · Resumen completo de miembros · Resumen de ministerios y grupos · Estadísticas
          </p>
        </div>
      </div>

      {/* MISIÓN Y VISIÓN DE LA IGLESIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-slate-100 p-2 rounded-xl text-black">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black font-sans">Nuestra Misión</h3>
            </div>
            <p className="text-[#111111] text-xs leading-relaxed italic">
              "Proclamar el evangelio de Jesucristo a toda persona, discipular a los creyentes para lograr su madurez espiritual en la fe, y servir a nuestra comunidad con amor."
            </p>
          </div>
          <div className="border-t border-slate-100 pt-2 mt-3 text-[11px] text-slate-800 font-mono">
            IGLESIA FILADELFIA · MARCOS 16:15
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-slate-100 p-2 rounded-xl text-black">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-black font-sans">Nuestra Visión</h3>
            </div>
            <p className="text-[#111111] text-xs leading-relaxed italic">
              "Ser una iglesia unida y multiplicadora comprometida con la transformación integral mediante la expansión orgánica de células y ministerios."
            </p>
          </div>
          <div className="border-t border-slate-100 pt-2 mt-3 text-[11px] text-slate-800 font-mono">
            IGLESIA FILADELFIA · HECHOS 1:8
          </div>
        </div>
      </div>

      {/* REQUERIMIENTO: DEMOGRAFÍA Y ESTADÍSTICAS EN TABLERO CONSOLIDADAMENTE SENCILLO */}
      <div>
        <h2 className="text-base font-extrabold text-black mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-black" />
          <span>Resumen numérico por categorías</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* CARD PRINCIPAL OBLIGATORIO: TOTAL DE MIEMBROS TOTALES */}
          <div className="bg-slate-900 text-white rounded-lg shadow-sm border border-slate-800 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-white text-3xl font-black tracking-tight font-sans">
                  {miembros.length}
                </h4>
                <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mt-1">Total de Miembros</p>
              </div>
              <div className="bg-slate-850 p-2.5 rounded-full border border-slate-800">
                <Users className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div className="bg-slate-800 px-4 py-2 text-slate-300 text-[11px] font-medium flex items-center justify-between border-t border-slate-700/50">
              <span className="font-extrabold uppercase tracking-wide text-[9px] text-[#0ea5e9]">Miembros Totales</span>
              <Award className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>

          {/* CARD 1: BAUTIZADOS */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#ffa100] text-2xl font-extrabold tracking-tight font-sans">
                  {bautizados.length}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Bautizados</p>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-full">
                <UserCheck className="w-5 h-5 text-[#ffa100]" />
              </div>
            </div>
            <div className="bg-[#ffa100] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>{pctBautizados}% total de miembros</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* CARD 2: NO BAUTIZADOS */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#e53935] text-2xl font-extrabold tracking-tight font-sans">
                  {noBautizados.length}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">No Bautizados</p>
              </div>
              <div className="bg-red-50 p-2.5 rounded-full">
                <Flame className="w-5 h-5 text-[#e53935]" />
              </div>
            </div>
            <div className="bg-[#e53935] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>{pctNoBautizados}% total de miembros</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* CARD 3: SIMPATIZANTES */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#4caf50] text-2xl font-extrabold tracking-tight font-sans">
                  {totalSimpatizantes}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Simpatizantes</p>
              </div>
              <div className="bg-green-50 p-2.5 rounded-full">
                <HeartHandshake className="w-5 h-5 text-[#4caf50]" />
              </div>
            </div>
            <div className="bg-[#4caf50] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>Personas de otra Iglesias</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* CARD 4: ADULTOS MAYORES */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#1e88e5] text-2xl font-extrabold tracking-tight font-sans">
                  {mayores60.length}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Adultos Mayores</p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-full">
                <Award className="w-5 h-5 text-[#1e88e5]" />
              </div>
            </div>
            <div className="bg-[#1e88e5] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>Hermanos mayores</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

        </div>

        {/* TABLERO SECUNDARIO DE EDADES REESTRUCTURADO Y SUPERSENCILLO */}
        <div className="grid grid-cols-4 gap-3 mt-4 text-center">
          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
            <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Adultos (35-59)</span>
            <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{adultos35a59.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
            <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Jóvenes (18-35)</span>
            <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{jovenes18a35.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
            <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Adolescentes (13-17)</span>
            <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{adolescentes13a17.length}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
            <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Niños (0-12)</span>
            <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{ninos0a12.length}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ESTADÍSTICAS EN GRÁFICOS REALES Y SENCILLOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        
        {/* CARD 1: EDADES CON BARRA VISUAL SIMPLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Datos por edades</span>
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              {dataBarrasEdades.map((d) => {
                const porcentaje = Math.round((d.total / totalMiembros) * 100) || 0;
                return (
                  <div key={d.key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-slate-700 font-semibold">
                      <span>{d.rango}</span>
                      <span className="font-mono text-slate-900">{d.total} ({porcentaje}%)</span>
                    </div>
                    {/* Barra de progreso visual muy limpia */}
                    <div className="w-full bg-slate-100/90 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${porcentaje || 2}%`, backgroundColor: d.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARD 2: CÍRCULOS ESTADÍSTICOS VISUALES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <PieChart className="w-3.5 h-3.5 text-slate-500" />
                <span>Bautizados y Género</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              
              {/* Círculo de  Bautizados */}
              <div className="flex flex-col items-center bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-2.5">Bautizados</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#f1f5f9" 
                      strokeWidth="3.2" 
                    />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3.2" 
                      strokeDasharray={`${pctBautizados} 100`}
                    />
                  </svg>
                  <div className="absolute flex items-center justify-center">
                    <span className="text-xs font-black text-slate-800">{pctBautizados}%</span>
                  </div>
                </div>

                <div className="mt-3.5 text-[10.5px] font-mono text-slate-700 w-full space-y-0.5">
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
                    <span>Sí:</span>
                    <span className="font-extrabold text-[#10b981]">{bautizados.length}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>No:</span>
                    <span className="font-bold text-slate-500">{noBautizados.length}</span>
                  </div>
                </div>
              </div>

              {/* Círculo Género */}
              <div className="flex flex-col items-center bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 mb-2.5">Varones</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#bae6fd" 
                      strokeWidth="3.2" 
                    />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#0284c7" 
                      strokeWidth="3.2" 
                      strokeDasharray={`${pctVarones} 100`}/>
                  </svg>
                  <div className="absolute flex items-center justify-center">
                    <span className="text-xs font-black text-slate-800">{pctVarones}%</span>
                  </div>
                </div>
                <div className="mt-3.5 text-[10.5px] font-mono text-slate-700 w-full space-y-0.5">
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-0.5">
                    <span>Varones (V):</span>
                    <span className="font-extrabold text-[#0284c7]">{totalVarones}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mujeres (M):</span>
                    <span className="font-bold text-sky-400">{totalMujeres}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REQUERIMIENTOS ESPECIALES DE REUNIONES Y ACTIVIDADES SEMANALES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* REQUERIMIENTO: 5 ACTIVIDADES DE LA SEMANA */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              <span>Actividades proximas de esta semana</span>
            </h3>
            <span className="bg-indigo-50 text-indigo-600 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
              5 Programadas
            </span>
          </div>

          <div className="space-y-4">
            {cincoActividades.map((act, index) => (
              <div 
                key={act.id_actividad || index}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-200 transition-colors flex flex-col md:flex-row md:items-center md:justify-between text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
                      {act.fecha} - {act.hora_inicio || '-'}
                    </span>
                    <h4 className="font-bold text-slate-800">{act.actividad}</h4>
                  </div>
                  <p className="text-slate-500 text-xs">{act.proposito}</p>
                  <p className="text-[11px] text-slate-450 font-mono">Lugar: <strong>{act.lugar}</strong> | Responsable: {act.responsable}</p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.75 rounded-full uppercase tracking-wider font-mono ${
                    act.estado === 'realizado' ? 'bg-emerald-100 text-emerald-800' :
                    act.estado === 'cancelado' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                    {act.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REQUERIMIENTO: 5 GRUPOS DE CRECIMIENTO QUE SE REUNEN */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Datos de lideres de Grupo</span>
            </h3>
            <span className="bg-amber-50 text-amber-700 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
              5 Reuniones Activas
            </span>
          </div>

          <div className="space-y-4">
            {cincoGrupos.map((g, index) => (
              <div 
                key={g.id_grupo || index}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-amber-200 transition-colors flex flex-col md:flex-row md:items-center md:justify-between text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
                      GRUPO {g.id_grupo}
                    </span>
                    <h4 className="font-bold text-slate-800">{g.nombre_grupo}</h4>
                  </div>
                  <p className="text-xs text-slate-500">Fundado: <span className="font-mono">{g.fecha_fundacion}</span> · Pastor Encargado: <span className="font-semibold">{g.pastor_encargado}</span></p>
                  <p className="text-[11px] text-slate-450 font-mono">Manual de Discipulado · Clave de Célula: {String(g.id_grupo).padStart(3, '0')}</p>
                </div>
                <div className="mt-3 md:mt-0 text-right">
                  <span className="block text-xs font-bold text-slate-870">Líder: {g.lider}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Tesorero: {g.tesorero}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
