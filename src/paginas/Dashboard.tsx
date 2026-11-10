// ESTE COMPONENTE CONTIENE LA PÁGINA DEL DASHBOARD PRINCIPAL

import React from 'react';
import { motion } from 'motion/react';
import { EntradaAnimada } from '../componentes/EntradaAnimada';
import { useApp } from '../contextos/AppContexto';
import { Church, Users, HeartHandshake, Award, Layers, CalendarDays, UserCheck, Flame, BarChart2, PieChart, TrendingUp, Droplets } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { miembros, actividades } = useApp();

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
    { key: 0, rango: 'Niños (0-12)', total: ninos0a12.length, varones: ninos0a12V, mujeres: ninos0a12M, color: '#38BDF8', hoverColor: '#0EA5E9', bgClass: 'bg-[#38BDF8]' },
    { key: 1, rango: 'Adolescentes', total: adolescentes13a17.length, varones: adolescentes13a17V, mujeres: adolescentes13a17M, color: '#A78BFA', hoverColor: '#8B5CF6', bgClass: 'bg-[#A78BFA]' },
    { key: 2, rango: 'Jóvenes (18-35)', total: jovenes18a35.length, varones: jovenes18a35V, mujeres: jovenes18a35M, color: '#10B981', hoverColor: '#059669', bgClass: 'bg-[#10B981]' },
    { key: 3, rango: 'Adultos (35-59)', total: adultos35a59.length, varones: adultos35a59V, mujeres: adultos35a59M, color: '#F59E0B', hoverColor: '#D97706', bgClass: 'bg-[#F59E0B]' },
    { key: 4, rango: 'Mayores (60+)', total: mayores60.length, varones: mayores60V, mujeres: mayores60M, color: '#F43F5E', hoverColor: '#E11D48', bgClass: 'bg-[#F43F5E]' }
  ];

  const maxValorGrupo = Math.max(...dataBarrasEdades.map(d => d.total), 1);
  // OBTENER LAS 5 ACTIVIDADES DE LA SEMANA PRINCIPAL
  const cincoActividades = actividades.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6 font-sans text-black"
    >
      {/* BANNER CON PALETA DE COLORES CELESTE Y BLANCO */}
      <EntradaAnimada>
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden border-l-8 border-[#4040E0]">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Church className="w-80 h-80 text-[#E3E8FF]" style={{ color: '#E3E8FF' }} />
          </div>
          <div className="relative z-10 max-w-3xl">      
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3" style={{ color: '#002060' }}>
              Iglesia Filadelfia
            </h1>
            <p className="mt-2 text-xs md:text-sm leading-relaxed font-semibold font-sans" style={{ color: '#002060' }}>
              Panel General · Resumen completo de miembros · Resumen de ministerios y grupos · Estadísticas
            </p>
          </div>
        </div>
      </EntradaAnimada>

      {/* MISIÓN Y VISIÓN DE LA IGLESIA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EntradaAnimada delay={0.1} className="h-full" hover>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-slate-100 p-2 rounded-xl text-black">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black font-sans">Misión</h3>
              </div>
              <p className="text-[#002060] text-xs leading-relaxed italic">
                FILADELFIA es una familia comprometida a celebrar la presencia de Dios, comunicar su palabra, promueve comunión afectiva, enseñando la madurez para un servicio eficiente a su familia, iglesia y comunidad.
              </p>
            </div>        
          </div>
        </EntradaAnimada>

        <EntradaAnimada delay={0.2} className="h-full" hover>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-slate-100 p-2 rounded-xl text-black">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black font-sans">Visión</h3>
              </div>
              <p className="text-[#002060] text-xs leading-relaxed italic">
                En los próximos cinco años, la familia FILADELFIA alcanzará a consolidar 80 grupos de crecimiento con miembros comprometidos sirviendo al pueblo de Dios y la comunidad de forma íntegra ayudando en sus necesidades: social, espiritual, material, enseñándoles principios para desarrollar habilidades que les permita salir de la pobreza con los recursos provistos por Dios.
              </p>
            </div>        
          </div>
        </EntradaAnimada>
      </div>

      {/* REQUERIMIENTO: DEMOGRAFÍA Y ESTADÍSTICAS EN TABLERO CONSOLIDADAMENTE SENCILLO */}
      <div>
        <h2 className="text-base font-extrabold text-black mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-black" />
          <span>Resumen numérico por categorías</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* CARD PRINCIPAL OBLIGATORIO: TOTAL DE MIEMBROS TOTALES */}
          <EntradaAnimada delay={0.1} className="h-full" hover>
          <div className="bg-slate-900 text-white rounded-lg shadow-sm border border-slate-800 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-white text-3xl font-black tracking-tight font-sans">
                  {miembros.length}
                </h4>
                <p className="text-xs text-slate-300 font-medium uppercase tracking-wider mt-1">Total de Miembros</p>
              </div>
              <div className="bg-slate-850 p-2.5 rounded-full border border-slate-800">
                <Users className="w-5 h-5 text-[#F2C063]" />
              </div>
            </div>
            <div className="bg-slate-800 px-4 py-2 text-slate-300 text-[11px] font-medium flex items-center justify-between border-t border-slate-700/50">
              <span className="font-extrabold uppercase tracking-wide text-[9px] text-[#F2C063]">Miembros Totales</span>
              <Award className="w-3.5 h-3.5 text-[#F2C063]" />
            </div>
          </div>
          </EntradaAnimada>

          {/* CARD 1: BAUTIZADOS */}
          <EntradaAnimada delay={0.2} className="h-full" hover>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#10B981] text-2xl font-extrabold tracking-tight font-sans">
                  {bautizados.length}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Bautizados</p>
              </div>
              <div className="bg-[#D1FAE5] p-2.5 rounded-full">
                <UserCheck className="w-5 h-5 text-[#10B981]" />
              </div>
            </div>
            <div className="bg-[#10B981] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>{pctBautizados}% total de miembros</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          </EntradaAnimada>

          {/* CARD 2: NO BAUTIZADOS */}
          <EntradaAnimada delay={0.3} className="h-full" hover>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#002060] text-2xl font-extrabold tracking-tight font-sans">
                  {noBautizados.length}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">No Bautizados</p>
              </div>
              <div className="bg-[#E9EBFE] p-2.5 rounded-full">
                <Flame className="w-5 h-5 text-[#4040E0]" />
              </div>
            </div>
            <div className="bg-[#002060] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>{pctNoBautizados}% total de miembros</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          </EntradaAnimada>

          {/* CARD 3: SIMPATIZANTES */}
          <EntradaAnimada delay={0.4} className="h-full" hover>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#059669] text-2xl font-extrabold tracking-tight font-sans">
                  {totalSimpatizantes}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Simpatizantes</p>
              </div>
              <div className="bg-[#D1FAE5] p-2.5 rounded-full">
                <HeartHandshake className="w-5 h-5 text-[#059669]" />
              </div>
            </div>
            <div className="bg-[#059669] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>Personas de otra Iglesias</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          </EntradaAnimada>

          {/* CARD 4: ADULTOS MAYORES */}
          <EntradaAnimada delay={0.5} className="h-full" hover>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between h-36">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-[#F59E0B] text-2xl font-extrabold tracking-tight font-sans">
                  {mayores60.length}
                </h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Adultos Mayores</p>
              </div>
              <div className="bg-[#FEF3C7] p-2.5 rounded-full">
                <Award className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
            <div className="bg-[#F59E0B] px-4 py-2 text-white text-[11px] font-medium flex items-center justify-between">
              <span>Hermanos mayores</span>
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          </EntradaAnimada>

        </div>

        {/* TABLERO SECUNDARIO DE EDADES REESTRUCTURADO Y SUPERSENCILLO */}
        <div className="grid grid-cols-4 gap-3 mt-4 text-center">
          <EntradaAnimada delay={0.6} hover>
            <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Adultos (35-59)</span>
              <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{adultos35a59.length}</p>
            </div>
          </EntradaAnimada>

          <EntradaAnimada delay={0.7} hover>
            <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Jóvenes (18-35)</span>
              <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{jovenes18a35.length}</p>
            </div>
          </EntradaAnimada>

          <EntradaAnimada delay={0.8} hover>
            <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Adolescentes (13-17)</span>
              <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{adolescentes13a17.length}</p>
            </div>
          </EntradaAnimada>

          <EntradaAnimada delay={0.9} hover>
            <div className="bg-white border border-slate-200 rounded-xl p-2 md:p-3">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Niños (0-12)</span>
              <p className="text-base md:text-lg font-extrabold text-slate-900 mt-1">{ninos0a12.length}</p>
            </div>
          </EntradaAnimada>
        </div>
      </div>

      {/* SECCIÓN DE ESTADÍSTICAS EN GRÁFICOS REALES Y SENCILLOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        
        {/* CARD 1: EDADES CON BARRAS VIVAS */}
        <EntradaAnimada delay={0.2} className="h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-[#EEF1FE]">
                  <BarChart2 className="w-4 h-4 text-[#4040E0]" />
                </div>
                <span>Datos por edades</span>
              </h3>
              <span className="bg-[#4040E0] text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg font-mono">{miembros.length} miembros</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {dataBarrasEdades.map((d) => {
                const porcentaje = Math.round((d.total / totalMiembros) * 100) || 0;
                return (
                  <div key={d.key} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    {/* Contador coloreado por franja */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    >
                      {d.total}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-800 truncate">{d.rango}</span>
                        <span
                          className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0"
                          style={{ color: d.color, backgroundColor: `${d.color}22` }}
                        >
                          {porcentaje}%
                        </span>
                      </div>
                      {/* Barra con degradado vivo */}
                      <div className="w-full h-2.5 rounded-full" style={{ backgroundColor: `${d.color}22` }}>
                        <div
                          className="h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(porcentaje, 2)}%`, background: `linear-gradient(90deg, ${d.color}66 0%, ${d.color} 100%)` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </EntradaAnimada>

        {/* CARD 2: CÍRCULOS ESTADÍSTICOS VISUALES */}
        <EntradaAnimada delay={0.3} className="h-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-[#D1FAE5]">
                  <PieChart className="w-4 h-4 text-[#059669]" />
                </div>
                <span>Bautizados y Género</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              
              {/* Círculo de Bautizados */}
              <div className="flex flex-col items-center border border-[#A7F3D0] bg-gradient-to-b from-[#F0FDF4] to-white p-3.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-black text-[#047857] mb-2.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" />
                  Bautizados
                </span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#D1FAE5" 
                      strokeWidth="3.6" 
                    />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#10B981" 
                      strokeWidth="3.6" 
                      strokeLinecap="round"
                      strokeDasharray={`${pctBautizados} 100`}
                    />
                  </svg>
                  <div className="absolute flex items-center justify-center">
                    <span className="text-xs font-black text-[#047857]">{pctBautizados}%</span>
                  </div>
                </div>

                <div className="mt-3.5 text-[10.5px] font-mono text-slate-700 w-full space-y-1">
                  <div className="flex justify-between items-center bg-[#D1FAE5] rounded-md px-2 py-0.5">
                    <span className="font-bold text-[#047857]">Sí</span>
                    <span className="font-black text-[#047857]">{bautizados.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FEE2E2] rounded-md px-2 py-0.5">
                    <span className="font-bold text-[#B91C1C]">No</span>
                    <span className="font-black text-[#B91C1C]">{noBautizados.length}</span>
                  </div>
                </div>
              </div>

              {/* Círculo Género */}
              <div className="flex flex-col items-center border border-[#BAE6FD] bg-gradient-to-b from-[#F0F9FF] to-white p-3.5 rounded-xl text-center">
                <span className="text-[10px] uppercase font-black text-[#0369A1] mb-2.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Género
                </span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#E0F2FE" 
                      strokeWidth="3.6" 
                    />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.9155" 
                      fill="none" 
                      stroke="#38BDF8" 
                      strokeWidth="3.6" 
                      strokeLinecap="round"
                      strokeDasharray={`${pctVarones} 100`}/>
                  </svg>
                  <div className="absolute flex items-center justify-center">
                    <span className="text-xs font-black text-[#0369A1]">{pctVarones}%</span>
                  </div>
                </div>
                <div className="mt-3.5 text-[10.5px] font-mono text-slate-700 w-full space-y-1">
                  <div className="flex justify-between items-center bg-[#E0F2FE] rounded-md px-2 py-0.5">
                    <span className="font-bold text-[#0369A1]">Varones</span>
                    <span className="font-black text-[#0369A1]">{totalVarones}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#FCE7F3] rounded-md px-2 py-0.5">
                    <span className="font-bold text-[#BE185D]">Mujeres</span>
                    <span className="font-black text-[#BE185D]">{totalMujeres}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </EntradaAnimada>
      </div>

      {/* REQUERIMIENTO: 5 ACTIVIDADES DE LA SEMANA */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* REQUERIMIENTO: 5 ACTIVIDADES DE LA SEMANA */}
        <EntradaAnimada delay={0.4} className="h-full">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-[#4040E0]" />
              <span>Actividades proximas de esta semana</span>
            </h3>
            <span className="bg-[#E0E7FF] text-[#3730A3] font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
              5 Programadas
            </span>
          </div>

          <div className="space-y-4">
            {cincoActividades.map((act, index) => (
              <motion.div 
                key={act.id_actividad || index}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.07, duration: 0.4, ease: 'easeOut' }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-200 transition-colors flex flex-col md:flex-row md:items-center md:justify-between text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
                      {act.fecha} - {act.hora_inicio || '-'}
                    </span>
                    <h4 className="font-bold text-slate-800">{act.actividad}</h4>
                  </div>
                  <p className="text-slate-500 text-[11px]">{Array.isArray(act.proposito) ? act.proposito.join(', ') : act.proposito}</p>
                  <p className="text-[11px] text-slate-450 font-mono">Lugar: <strong>{act.lugar}</strong> | Responsable: {act.responsable}</p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.75 rounded-full uppercase tracking-wider font-mono ${
                    act.estado === 'realizado' ? 'bg-[#D1FAE5] text-[#047857]' :
                    act.estado === 'cancelado' ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#E2E8F0] text-[#475569]'}`}>
                    {act.estado}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </EntradaAnimada>

      </div>
    </motion.div>
  );
};
