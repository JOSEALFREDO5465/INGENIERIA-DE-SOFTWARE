// ESTE COMPONENTE ADMINISTRA EL CICLO DE VIDA CRUD PARA LA TABLA MIEMBROS
// CONTIENE EL FORMULARIO INTEGRAL CON LOS 23 CAMPOS EXIGIDOS Y CARACTERÍSTICAS DE IMPRESIÓN EN FORMATO PDF

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { Miembro } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

// UTILIDAD PARA ENCONTRAR ESTILO DE BADGES DE MINISTERIOS SEGÚN EL REPORTE VISUAL DE REFERENCIA
export const obtenerEstiloBadgeMinisterio = (min: string) => {
  const norm = min.toUpperCase().trim();
  if (norm.includes('DISIMULADO') || norm.includes('DISCIPULADO')) {
    return {
      classes: 'bg-[#FAF5FF] border-[#E8D5FD] text-[#822DF9]',
      label: 'DISIMULADO'
    };
  }
  if (norm.includes('COMUNION')) {
    return {
      classes: 'bg-[#EDFCF2] border-[#D1FADF] text-[#027E35]',
      label: 'COMUNION'
    };
  }
  if (norm.includes('ADORACION')) {
    return {
      classes: 'bg-[#FEFBF2] border-[#E2B080] text-[#B85704]',
      label: 'ADORACION'
    };
  }
  if (norm.includes('EVANGELISMO')) {
    return {
      classes: 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]',
      label: 'EVANGELISMO'
    };
  }
  // Alternativas descriptivas o registradas
  if (norm.includes('ALABANZA')) {
    return {
      classes: 'bg-amber-50 border-amber-200 text-amber-700',
      label: 'ALABANZA'
    };
  }
  if (norm.includes('EDUCACION')) {
    return {
      classes: 'bg-sky-50 border-sky-200 text-sky-700',
      label: 'EDUCACION'
    };
  }
  if (norm.includes('DAMAS')) {
    return {
      classes: 'bg-rose-50 border-rose-200 text-rose-700',
      label: 'DAMAS'
    };
  }
  if (norm.includes('JOVENES')) {
    return {
      classes: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      label: 'JOVENES'
    };
  }
  return {
    classes: 'bg-slate-50 border-slate-200 text-slate-700',
    label: min.toUpperCase()
  };
};

export const MiembrosTab: React.FC = () => {
  const { miembros, crearMiembro, actualizarMiembro, eliminarMiembro, grupos, ministerios } = useApp();

  // Helper para clasificar grupos de crecimiento entre Jóvenes y Mayores de forma dinámica
  const esGrupoDeJovenes = (nombre: string) => {
    const norm = nombre.toLowerCase();
    return (
      norm.includes('joven') ||
      norm.includes('juvenil') ||
      norm.includes('bethel') ||
      norm.includes('emanuel') ||
      norm.includes('adolescente') ||
      norm.includes('estudiante') ||
      norm.includes('infantil') ||
      norm.includes('niño')
    );
  };

  // --- ESTADOS PARA NAVEGACIÓN DE FORMULARIO ---
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [miembroSeleccionadoId, setMiembroSeleccionadoId] = useState<number | null>(null);

  // --- ESTADO PARA DETALLE DE REGISTRO ---
  const [miembroVerDetalle, setMiembroVerDetalle] = useState<Miembro | null>(null);

  // --- ESTADO PARA VISUALIZACIÓN DE REPORTE PDF ---
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);

  // --- ESTADOS PARA BUSCADOR ---
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // --- ESTADO DE FORMULARIO DE MIEMBRO (23 CAMPOS) ---
  const [nombres, setNombres] = useState<string>('');
  const [apellidos, setApellidos] = useState<string>('');
  const [fechaNacimiento, setFechaNacimiento] = useState<string>('');
  const [lugarNacimiento, setLugarNacimiento] = useState<string>('');
  const [edad, setEdad] = useState<number>(18);
  const [sexo, setSexo] = useState<'Masculino' | 'Femenino'>('Masculino');
  const [estadoCivil, setEstadoCivil] = useState<'Soltero' | 'Casado' | 'Divorciado' | 'Viudo'>('Soltero');
  const [profesionOficio, setProfesionOficio] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [telefono, setTelefono] = useState<number>(0);
  const [ci, setCi] = useState<string>('');
  const [conversion, setConversion] = useState<boolean>(true);
  const [fechaConversion, setFechaConversion] = useState<string>('');
  const [lugarConversion, setLugarConversion] = useState<string>('');
  const [bautizado, setBautizado] = useState<boolean>(true);
  const [fechaBautizo, setFechaBautizo] = useState<string>('');
  const [lugarBautizo, setLugarBautizo] = useState<string>('');
  const [idGrupo, setIdGrupo] = useState<number | null>(null);
  const [estadoMiembro, setEstadoMiembro] = useState<'Activo' | 'Pasivo'>('Activo');
  const [otrosDatos, setOtrosDatos] = useState<string>('');
  const [historialLiderazgo, setHistorialLiderazgo] = useState<string>('');
  const [asisteGrupo, setAsisteGrupo] = useState<boolean>(true);
  const [tipoMiembro, setTipoMiembro] = useState<'Miembro' | 'Simpatizante'>('Miembro');

  // NUEVOS ESTADOS DE FORMULARIO REQUERIDOS
  const [grupoCategoria, setGrupoCategoria] = useState<'Ninguno' | 'Jóvenes' | 'Mayores'>('Ninguno');
  const [cursosDiscipulado, setCursosDiscipulado] = useState<string[]>([]);
  const [ministeriosActivos, setMinisteriosActivos] = useState<string[]>([]);

  // ERR DE VALIDACIÓN EN PANTALLA
  const [errValidacion, setErrValidacion] = useState<string>('');

  // FILTRAR MIEMBROS POR NOMBRE, APELLIDO O CI
  const miembrosFiltrados = miembros.filter(m => 
    m.nombres.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    m.apellidos.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    m.ci.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  // AUTO-CALCULAR LA EDAD EN BASE A LA FECHA DE NACIMIENTO
  const manejarCambioFechaNacValue = (f: string) => {
    setFechaNacimiento(f);
    if (f) {
      const hoy = new Date();
      const cumpleanos = new Date(f);
      let calcEdad = hoy.getFullYear() - cumpleanos.getFullYear();
      const m = hoy.getMonth() - cumpleanos.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        calcEdad--;
      }
      setEdad(Math.max(0, calcEdad));
    }
  };

  // LIMPIAR CAMPOS DEL FORMULARIO
  const limpiarFormulario = () => {
    setNombres('');
    setApellidos('');
    setFechaNacimiento('');
    setLugarNacimiento('');
    setEdad(18);
    setSexo('Masculino');
    setEstadoCivil('Soltero');
    setProfesionOficio('');
    setDireccion('');
    setTelefono(0);
    setCi('');
    setConversion(true);
    setFechaConversion('');
    setLugarConversion('');
    setBautizado(true);
    setFechaBautizo('');
    setLugarBautizo('');
    setIdGrupo(null);
    setEstadoMiembro('Activo');
    setOtrosDatos('');
    setHistorialLiderazgo('');
    setAsisteGrupo(true);
    setTipoMiembro('Miembro');
    setGrupoCategoria('Ninguno');
    setCursosDiscipulado([]);
    setMinisteriosActivos([]);
    setErrValidacion('');
  };

  // ABRIR FORMULARIO EN MODO NUEVO
  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setMiembroSeleccionadoId(null);
    setModalAbierto(true);
  };

  // ABRIR FORMULARIO EN MODO EDICIÓN
  const abrirFormEditar = (m: Miembro) => {
    setNombres(m.nombres);
    setApellidos(m.apellidos);
    setFechaNacimiento(m.fecha_nacimiento);
    setLugarNacimiento(m.lugar_nacimiento);
    setEdad(m.edad);
    setSexo(m.sexo);
    setEstadoCivil(m.estado_civil);
    setProfesionOficio(m.profesion_oficio);
    setDireccion(m.direccion);
    setTelefono(m.telefono);
    setCi(m.ci);
    setConversion(m.conversion);
    setFechaConversion(m.fecha_conversion || '');
    setLugarConversion(m.lugar_conversion || '');
    setBautizado(m.bautizado);
    setFechaBautizo(m.fecha_bautizo || '');
    setLugarBautizo(m.lugar_bautizo || '');
    setIdGrupo(m.id_grupo);
    setEstadoMiembro(m.estado_miembro);
    setOtrosDatos(m.otros_datos || '');
    setHistorialLiderazgo(m.historial_liderazgo || '');
    setAsisteGrupo(m.asiste_grupo);
    setTipoMiembro(m.tipo_miembro);
    setGrupoCategoria(m.grupo_categoria || 'Ninguno');
    setCursosDiscipulado(m.cursos_discipulado || []);
    setMinisteriosActivos(m.ministerios_activos || []);

    setMiembroSeleccionadoId(m.id_miembro);
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  // GUARDAR REGISTROS (CREAR O ACTUALIZAR)
  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    // VALIDACIONES DEL ESQUEMA
    if (!nombres.trim() || !apellidos.trim() || !ci.trim()) {
      setErrValidacion('Nombres, Apellidos y Carnet de Identidad (C.I.) son requeridos obligatoriamente.');
      return;
    }

    const mDatos: Omit<Miembro, 'id_miembro'> = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fecha_nacimiento: fechaNacimiento,
      lugar_nacimiento: lugarNacimiento.trim(),
      edad,
      sexo,
      estado_civil: estadoCivil,
      profesion_oficio: profesionOficio.trim(),
      direccion: direccion.trim(),
      telefono: Number(telefono),
      ci: ci.trim(),
      conversion,
      fecha_conversion: conversion ? fechaConversion : '',
      lugar_conversion: conversion ? lugarConversion.trim() : '',
      bautizado,
      fecha_bautizo: bautizado ? fechaBautizo : '',
      lugar_bautizo: bautizado ? lugarBautizo.trim() : '',
      id_grupo: grupoCategoria === 'Ninguno' ? null : (idGrupo ? Number(idGrupo) : null),
      estado_miembro: estadoMiembro,
      otros_datos: otrosDatos.trim(),
      historial_liderazgo: historialLiderazgo.trim(),
      asiste_grupo: asisteGrupo,
      tipo_miembro: tipoMiembro,
      grupo_categoria: grupoCategoria,
      cursos_discipulado: cursosDiscipulado,
      ministerios_activos: ministeriosActivos
    };

    if (modoEdicion && miembroSeleccionadoId !== null) {
      actualizarMiembro(miembroSeleccionadoId, mDatos);
    } else {
      crearMiembro(mDatos);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  // ELIMINAR MIEMBRO CON CONFIRMACIÓN
  const manejarEliminar = (id: number, nombre: string) => {
    if (window.confirm(`¿Estás completamente seguro de eliminar permanentemente al miembro "${nombre}"? Esta acción removerá su historial eclesiástico.`)) {
      eliminarMiembro(id);
    }
  };

  // MAPEAR DATOS FILTRADOS PARA LA VISTA EXCLUSIVA GENERADORA DE PDF
  const columnasPdf = ['C.I.', 'Nombres y Apellidos', 'Edad', 'Sexo', 'F. Nac', 'Bautizado', 'Célula ID', 'Tipo'];
  const datosPdf = miembrosFiltrados.map(m => [
    m.ci,
    `${m.nombres} ${m.apellidos}`,
    m.edad,
    m.sexo,
    m.fecha_nacimiento,
    m.bautizado ? 'Bautizado' : 'Pendiente',
    `Grupo ${m.id_grupo}`,
    m.tipo_miembro
  ]);

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN INICIAL CON BOTONES OPERACIONALES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Control de Membresía General</h1>
          <p className="text-xs text-slate-500">Manejo centralizado y digital del Libro de Registro Oficial de la Iglesia Filadelfia.</p>
        </div>
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => setReportePdfAbierto(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Generar Reporte PDF</span>
          </button>
          <button
            onClick={abrirFormNuevo}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 font-extrabold" />
            <span>Crear Miembro</span>
          </button>
        </div>
      </div>

      {/* CONTROLADOR BUSCADOR */}
      <div className="relative rounded-2xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Filtrar por nombres, apellidos o carnet de identidad..."
          className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* TABLA DINÁMICA DE REGISTRO DE MIEMBROS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 font-mono">
              <tr>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">CI</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Edad</th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Teléfono</th>
                <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bautizado</th>
                <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ministerio</th>
                <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 font-sans">
              {miembrosFiltrados.length > 0 ? (
                miembrosFiltrados.map((m) => (
                  <tr key={m.id_miembro} className="hover:bg-slate-50/50 transition-colors">
                    {/* CI */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{m.ci}</td>
                    
                    {/* NOMBRE COMPLETO */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-850">{m.nombres} {m.apellidos}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Dirección: {m.direccion || 'S/N'}</div>
                    </td>
                    
                    {/* EDAD */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-650">
                      {m.edad} {m.edad === 1 ? 'año' : 'años'}
                    </td>
                    
                    {/* TELÉFONO */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-650 font-mono">
                      {m.telefono || 'S/N'}
                    </td>
                    
                    {/* BAUTIZADO */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        m.bautizado 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                          : 'bg-amber-50 text-amber-700 border border-amber-250'
                      }`}>
                        {m.bautizado ? 'Sí' : 'No'}
                      </span>
                    </td>
                    
                    {/* MINISTERIO */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        {m.ministerios_activos && m.ministerios_activos.length > 0 ? (
                          m.ministerios_activos.slice(0, 3).map((min, idx) => {
                            const badge = obtenerEstiloBadgeMinisterio(min);
                            return (
                              <span 
                                key={idx} 
                                className={`px-2.5 py-0.5 text-[9px] font-black tracking-wider rounded-full border border-2 uppercase inline-block text-center ${badge.classes}`}
                                style={{ minWidth: '95px' }}
                              >
                                {badge.label}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] uppercase font-mono text-slate-400 italic">Ninguno</span>
                        )}
                      </div>
                    </td>
                    
                    {/* ESTADO */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-2 ${
                        m.estado_miembro === 'Activo' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}>
                        {m.estado_miembro || 'Pasivo'}
                      </span>
                    </td>
                    
                    {/* ACCIONES */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                      <button
                        onClick={() => setMiembroVerDetalle(m)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Ver Ficha Detallada"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => abrirFormEditar(m)}
                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar Registro"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => manejarEliminar(m.id_miembro, `${m.nombres} ${m.apellidos}`)}
                        className="p-1.5 text-red-650 hover:bg-red-50 hover:text-red-800 text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar del Sistema"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                    Ningún registro de membresía coincide con el criterio de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VER DETALLE FICHA INTEGRAL DE MIEMBRO (TODOS LOS CAMPOS) */}
      {miembroVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
              <div>
                <h3 className="text-lg font-black text-slate-850">Datos del miembro</h3>
              </div>
              <button 
                onClick={() => setMiembroVerDetalle(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* RESUMEN DE IDENTIDAD */}
              <div className="bg-slate-50 p-5 rounded-2xl border-l-4 border-l-[#1565c0] border-y border-r border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-850 text-lg tracking-tight">{miembroVerDetalle.nombres} {miembroVerDetalle.apellidos}</h4>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 font-mono shadow-xs">
                      {miembroVerDetalle.tipo_miembro}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono shadow-xs ${
                      String(miembroVerDetalle.estado_miembro).toLowerCase() === 'activo'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {miembroVerDetalle.estado_miembro}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIONES DE DETALLES */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Carnet de Identidad</span>
                  <span className="font-bold text-slate-900 text-sm">{miembroVerDetalle.ci}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Teléfono / Celular</span>
                  <span className="font-bold text-slate-900 text-sm">{miembroVerDetalle.telefono || 'Sin registrar'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Fecha de Nacimiento</span>
                  <span className="font-bold text-slate-900 text-sm">{miembroVerDetalle.fecha_nacimiento}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Edad Calculada</span>
                  <span className="font-bold text-slate-900 text-sm">{miembroVerDetalle.edad} años ({miembroVerDetalle.sexo})</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 col-span-2">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Lugar de Nacimiento</span>
                  <span className="font-semibold text-slate-800">{miembroVerDetalle.lugar_nacimiento}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Estado Civil</span>
                  <span className="font-bold text-slate-900">{miembroVerDetalle.estado_civil}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Profesión u Oficio</span>
                  <span className="font-bold text-slate-900">{miembroVerDetalle.profesion_oficio || 'Sin Oficio'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 col-span-2">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Dirección Domiciliaria</span>
                  <span className="font-medium text-slate-800">{miembroVerDetalle.direccion}</span>
                </div>
              </div>

              {/* CONVERSIÓN Y BAUTISMO */}
              <div className="space-y-3 bg-indigo-950/5 p-4 rounded-2xl border border-indigo-900/10 text-xs">
                <h5 className="font-mono font-extrabold uppercase text-indigo-900 tracking-wider">Historial de Sacramentos</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold">¿Está convertido?: <span className={miembroVerDetalle.conversion ? "text-emerald-700 font-bold" : "text-amber-700"}>{miembroVerDetalle.conversion ? 'SÍ' : 'NO'}</span></p>
                    {miembroVerDetalle.conversion && (
                      <div className="text-[11px] text-slate-550 border-l-2 border-indigo-400 pl-2">
                        <p>Fecha: {miembroVerDetalle.fecha_conversion || 'N/R'}</p>
                        <p>Lugar: {miembroVerDetalle.lugar_conversion || 'N/R'}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold">¿Está bautizado?: <span className={miembroVerDetalle.bautizado ? "text-emerald-700 font-bold" : "text-amber-700"}>{miembroVerDetalle.bautizado ? 'SÍ' : 'NO'}</span></p>
                    {miembroVerDetalle.bautizado && (
                      <div className="text-[11px] text-slate-550 border-l-2 border-indigo-400 pl-2">
                        <p>Fecha: {miembroVerDetalle.fecha_bautizo || 'N/R'}</p>
                        <p>Lugar: {miembroVerDetalle.lugar_bautizo || 'N/R'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DE LIDERAZGO Y GRUPO */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Grupo de Crecimiento</span>
                  <div className="space-y-1 mt-1 text-slate-900 font-sans">
                    <div>
                      <span className="text-slate-400 font-sans">Categoría:</span>{' '}
                      <span className="font-black text-indigo-700">{miembroVerDetalle.grupo_categoria || 'Ninguno'}</span>
                    </div>
                    {miembroVerDetalle.grupo_categoria !== 'Ninguno' && (
                      <div>
                        <span className="text-slate-400 font-sans">Grupo asignado:</span>{' '}
                        <span className="font-bold">
                          {grupos.find((g) => g.id_grupo === miembroVerDetalle.id_grupo)?.nombre_grupo || 'No asignado'}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Asiste al grupo regularmente: {miembroVerDetalle.asiste_grupo ? 'SÍ' : 'NO'}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Historial de Liderazgo</span>
                  <p className="font-semibold text-slate-800 break-words mt-1">{miembroVerDetalle.historial_liderazgo || 'No registra historial de liderazgo'}</p>
                </div>
              </div>

              {/* CURSOS DE DISCIPULADO Y MINISTERIOS ACTIVOS */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] uppercase font-mono text-slate-400 mb-2">Cursos de Discipulado Avanzado</span>
                  <div className="flex flex-wrap gap-2">
                    {['101', '201', '301', '401', '501'].map((num) => {
                      const aprobado = miembroVerDetalle.cursos_discipulado?.includes(num);
                      return (
                        <span
                          key={num}
                          className={`px-2 py-1 rounded font-mono text-[11px] font-black flex items-center gap-1 border-2 ${
                            aprobado
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400 shadow-sm'
                              : 'bg-slate-50 text-slate-300 border-slate-100 line-through'
                          }`}
                        >
                          {aprobado ? '✓' : '✗'} {num}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="block text-[10px] uppercase font-mono text-slate-400 mb-2">Ministerios Activos</span>
                  <div className="flex flex-wrap gap-1">
                    {miembroVerDetalle.ministerios_activos && miembroVerDetalle.ministerios_activos.length > 0 ? (
                      miembroVerDetalle.ministerios_activos.map((min, idx) => {
                        const badge = obtenerEstiloBadgeMinisterio(min);
                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-0.5 text-[9px] font-black tracking-wider rounded-full border border-2 uppercase inline-block font-sans ${badge.classes}`}
                          >
                            {badge.label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] uppercase font-mono text-slate-400 italic mt-1 inline-block">Ninguno asignado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES ADICIONALES */}
              {miembroVerDetalle.otros_datos && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="block text-[10px] uppercase font-mono text-slate-400">Observaciones Especiales</span>
                  <p className="text-slate-700 break-words whitespace-pre-line leading-relaxed">{miembroVerDetalle.otros_datos}</p>
                </div>
              )}

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setMiembroVerDetalle(null)}
                className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl hover:bg-slate-700 transition"
              >
                Entendido / Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORMULARIO CRUD CREAR/EDITAR ELEMENTO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-850">
                {modoEdicion ? 'Actualizar Ficha de Miembro' : 'Añadir Nuevo Miembro al Registro'}
              </h3>
              <button 
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardado} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
              {errValidacion && (
                <div className="bg-red-55 border border-red-200 p-3 rounded-xl flex items-center space-x-2 text-xs text-red-750 bg-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-650" />
                  <span>{errValidacion}</span>
                </div>
              )}

              {/* BLOQUE: DATOS PERSONALES */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-indigo-900 font-mono tracking-wider">1. Datos de Identificación Personal</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Nombres</label>
                    <input
                      type="text"
                      required
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Apellidos</label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Carnet Identidad (C.I.)</label>
                    <input
                      type="text"
                      required
                      value={ci}
                      onChange={(e) => setCi(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Fecha Nacimiento</label>
                    <input
                      type="date"
                      required
                      value={fechaNacimiento}
                      onChange={(e) => manejarCambioFechaNacValue(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Edad Calculada</label>
                    <input
                      type="number"
                      readOnly
                      value={edad}
                      className="mt-1 block w-full px-3 py-1.8 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none text-slate-900 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Sexo</label>
                    <select
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value as any)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-950"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Estado Civil</label>
                    <select
                      value={estadoCivil}
                      onChange={(e) => setEstadoCivil(e.target.value as any)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900"
                    >
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Lugar de Nacimiento</label>
                    <input
                      type="text"
                      value={lugarNacimiento}
                      onChange={(e) => setLugarNacimiento(e.target.value)}
                      placeholder="Ciudad, departamento o país de nacimiento"
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Teléfono / Celular</label>
                    <input
                      type="number"
                      required
                      value={telefono || ''}
                      onChange={(e) => setTelefono(Number(e.target.value))}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Profesión u Oficio</label>
                    <input
                      type="text"
                      value={profesionOficio}
                      onChange={(e) => setProfesionOficio(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Dirección Domicilio</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* BLOQUE: HISTORIAL DE COMUNIÓN */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs uppercase font-extrabold text-indigo-900 font-mono tracking-wider">2. Conversión e Historial Sacramental</h4>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* SUBSECCIÓN CONVERSIÓN */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="formConversion"
                        checked={conversion}
                        onChange={(e) => setConversion(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <label htmlFor="formConversion" className="text-xs font-bold text-slate-700 font-mono uppercase">¿Está Convertido?</label>
                    </div>

                    {conversion && (
                      <div className="grid grid-cols-1 gap-2 border-l-2 border-indigo-200 pl-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha de Conversión</label>
                          <input
                            type="date"
                            value={fechaConversion}
                            onChange={(e) => setFechaConversion(e.target.value)}
                            className="mt-0.5 block w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Lugar de Conversión</label>
                          <input
                            type="text"
                            value={lugarConversion}
                            onChange={(e) => setLugarConversion(e.target.value)}
                            className="mt-0.5 block w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none text-slate-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SUBSECCIÓN BAUTIZO */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="formBautizado"
                        checked={bautizado}
                        onChange={(e) => setBautizado(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <label htmlFor="formBautizado" className="text-xs font-bold text-slate-700 font-mono uppercase">¿Es Bautizado en Agua?</label>
                    </div>

                    {bautizado && (
                      <div className="grid grid-cols-1 gap-2 border-l-2 border-indigo-200 pl-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha de Bautizo</label>
                          <input
                            type="date"
                            value={fechaBautizo}
                            onChange={(e) => setFechaBautizo(e.target.value)}
                            className="mt-0.5 block w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Lugar de Bautizo</label>
                          <input
                            type="text"
                            value={lugarBautizo}
                            onChange={(e) => setLugarBautizo(e.target.value)}
                            className="mt-0.5 block w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none text-slate-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* BLOQUE: ASIGNACIÓN Y COMPORTAMIENTO CELULAR */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs uppercase font-extrabold text-indigo-900 font-mono tracking-wider">3. Vinculación y Organización Interna</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  {/* CATEGORÍA GRUPO CRECIMIENTO */}
                  <div>
                    <label className="block text-xs font-bold text-slate-650 font-mono uppercase">Categoría Grupo de Crecimiento</label>
                    <select
                      value={grupoCategoria}
                      onChange={(e) => {
                        const nuevaCat = e.target.value as 'Ninguno' | 'Jóvenes' | 'Mayores';
                        setGrupoCategoria(nuevaCat);
                        if (nuevaCat === 'Ninguno') {
                          setIdGrupo(null);
                        } else {
                          const gruposFiltradosPorCat = nuevaCat === 'Jóvenes'
                            ? grupos.filter(g => esGrupoDeJovenes(g.nombre_grupo))
                            : grupos.filter(g => !esGrupoDeJovenes(g.nombre_grupo));
                          if (gruposFiltradosPorCat.length > 0) {
                            setIdGrupo(gruposFiltradosPorCat[0].id_grupo);
                          } else {
                            setIdGrupo(null);
                          }
                        }
                      }}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    >
                      <option value="Ninguno">Ninguno</option>
                      <option value="Jóvenes">Jóvenes</option>
                      <option value="Mayores">Mayores</option>
                    </select>
                  </div>

                  {/* MENÚ SECUNDARIO DE GRUPO ASIGNADO */}
                  <div className={grupoCategoria === 'Ninguno' ? 'invisible lg:block' : 'opacity-100'}>
                    {grupoCategoria !== 'Ninguno' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-650 font-mono uppercase">Grupo ({grupoCategoria})</label>
                        <select
                          value={idGrupo || ''}
                          onChange={(e) => setIdGrupo(e.target.value ? Number(e.target.value) : null)}
                          required={grupoCategoria !== 'Ninguno'}
                          className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        >
                          <option value="">-- Seleccionar grupo --</option>
                          {(grupoCategoria === 'Jóvenes'
                            ? grupos.filter(g => esGrupoDeJovenes(g.nombre_grupo))
                            : grupos.filter(g => !esGrupoDeJovenes(g.nombre_grupo))
                          ).map(g => (
                            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="hidden lg:block text-slate-400 text-xs italic py-2">Sin grupo asignado</div>
                    )}
                  </div>

                  {/* TIPO DE HERMANO */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Tipo de Hermano</label>
                    <select
                      value={tipoMiembro}
                      onChange={(e) => setTipoMiembro(e.target.value as any)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm text-slate-950 focus:outline-none font-semibold"
                    >
                      <option value="Miembro">Miembro Activo</option>
                      <option value="Simpatizante">Simpatizante / Oyente</option>
                    </select>
                  </div>

                  {/* ESTADO EN LA IGLESIA */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Estado en Iglesia</label>
                    <select
                      value={estadoMiembro}
                      onChange={(e) => setEstadoMiembro(e.target.value as any)}
                      className="mt-1 block w-full px-3 py-1.8 bg-white border border-slate-300 rounded-lg text-sm text-slate-950 focus:outline-none font-semibold"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Pasivo">Pasivo (Inactivo)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border">
                  <input
                    type="checkbox"
                    id="formAsiste"
                    checked={asisteGrupo}
                    onChange={(e) => setAsisteGrupo(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <label htmlFor="formAsiste" className="text-xs font-bold text-slate-700 font-mono uppercase">¿Asiste Regularmente a la Reunión de Grupo Semanal?</label>
                </div>
              </div>

              {/* BLOQUE: DISCIPULADO Y MINISTERIOS ACTIVOS */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs uppercase font-extrabold text-indigo-900 font-mono tracking-wider">4. Discipulado y Ministerios Activos</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {/* CURSOS DE DISCIPULADO CHECKBOXES */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-750 font-mono uppercase mb-2">Cursos de Discipulado Avanzado</label>
                    <p className="text-[11px] text-slate-400 mb-2">Marque las casillas de los cursos que ha culminado con check:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {['101', '201', '301', '401', '501'].map((num) => {
                        const estaChecked = cursosDiscipulado.includes(num);
                        return (
                          <label
                            key={num}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition select-none ${
                              estaChecked
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-extrabold'
                                : 'bg-white border-slate-200 text-slate-500 font-medium hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={estaChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCursosDiscipulado([...cursosDiscipulado, num]);
                                } else {
                                  setCursosDiscipulado(cursosDiscipulado.filter(c => c !== num));
                                }
                              }}
                              className="sr-only"
                            />
                            <span className="text-[11px] font-mono">{num}</span>
                            <div className={`mt-1.5 w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                              estaChecked
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-slate-50 border-slate-300'
                            }`}>
                              {estaChecked && '✓'}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* MINISTERIOS ACTIVOS SELECTION MENU */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-750 font-mono uppercase mb-2">
                      Ministerios Activos (Máx 3)
                    </label>
                    <p className="text-[11px] text-slate-450 mb-2">
                      Seleccione en qué ministerios sirve actualmente (máx. 3):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ministerios.map((minObj) => {
                        const minName = minObj.nombre_ministerio;
                        const estaSeleccionado = ministeriosActivos.includes(minName);
                        const isMaxReached = ministeriosActivos.length >= 3;
                        return (
                          <button
                            key={minObj.id_ministerio}
                            type="button"
                            disabled={!estaSeleccionado && isMaxReached}
                            onClick={() => {
                              if (estaSeleccionado) {
                                setMinisteriosActivos(ministeriosActivos.filter(m => m !== minName));
                              } else {
                                if (ministeriosActivos.length < 3) {
                                  setMinisteriosActivos([...ministeriosActivos, minName]);
                                }
                              }
                            }}
                            className={`px-3 py-1 text-xs font-black rounded-full border border-2 tracking-wide uppercase transition ${
                              estaSeleccionado
                                ? obtenerEstiloBadgeMinisterio(minName).classes + ' scale-105 border-indigo-600 shadow'
                                : !estaSeleccionado && isMaxReached
                                  ? 'bg-slate-100 border-slate-150 text-slate-300 cursor-not-allowed scale-95 opacity-50'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {minName}
                          </button>
                        );
                      })}
                    </div>
                    {ministeriosActivos.length >= 3 && (
                      <p className="text-[10px] text-amber-600 font-mono mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 inline" /> Has alcanzado el límite máximo de 3 ministerios activos.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* HISTORIAL LIDERAZGO Y ADICIONALES */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs uppercase font-extrabold text-indigo-900 font-mono tracking-wider">5. Historial Eclesiástico y Notas</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Historial de Liderazgo Anterior</label>
                    <textarea
                      value={historialLiderazgo}
                      onChange={(e) => setHistorialLiderazgo(e.target.value)}
                      placeholder="Registros históricos de cargos liderados en esta u otra denominación..."
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none text-slate-900"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 font-mono uppercase">Detalles u Observaciones Adicionales</label>
                    <textarea
                      value={otrosDatos}
                      onChange={(e) => setOtrosDatos(e.target.value)}
                      placeholder="Información familiar de relevancia, datos médicos o sugerencias..."
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none text-slate-900"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* CONTROL ACCIONES DE GUARDADO */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 mt-4 rounded-b-xl -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-slate-200 text-slate-750 hover:bg-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow transition cursor-pointer"
                >
                  {modoEdicion ? 'Actualizar Miembro' : 'Registrar Miembro'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVISUALIZACIÓN Y DESCARGA DEL REPORTE PDF MEMBRETADO */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Libro de Registro Oficial de Miembros de Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}

    </div>
  );
};
