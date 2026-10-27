// ESTE COMPONENTE ADMINISTRA EL CICLO DE VIDA CRUD PARA LA TABLA INVENTARIO
// PERMITE CONTROLAR LOS ACTIVOS INTEGRALES Y EQUIPOS ADQUIRIDOS O DONADOS EN BOLIVIANOS (BS)

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { Inventario } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

export const InventarioTab: React.FC = () => {
  const { inventario, crearInventario, actualizarInventario, eliminarInventario, ministerios, grupos } = useApp();

  // --- ESTADOS NAVEGACIÓN FORMULARIO ---
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [codigoSeleccionado, setCodigoSeleccionado] = useState<string | null>(null);

  // --- DETALLE ---
  const [itemVerDetalle, setItemVerDetalle] = useState<Inventario | null>(null);

  // --- REPORTE PDF ---
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);

  // --- BUSCADOR ---
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // --- CAMPOS FORM INVENTARIO ---
  const [codigoInput, setCodigoInput] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [unidad, setUnidad] = useState<'Pz' | 'Jg' | 'Mts' | 'Otro'>('Pz');
  const [estado, setEstado] = useState<'disponible' | 'en_uso' | 'dano' | 'mantenimiento'>('disponible');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [precio, setPrecio] = useState<number>(0);
  const [moneda, setMoneda] = useState<'Bs' | 'Sus'>('Bs');
  const [procedencia, setProcedencia] = useState<'Comprado' | 'Donación'>('Comprado');
  const [verificacion, setVerificacion] = useState<'Sí' | 'No'>('Sí');
  const [idMinisterio, setIdMinisterio] = useState<number | null>(null);
  const [idGrupo, setIdGrupo] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState<string>('');

  const [errValidacion, setErrValidacion] = useState<string>('');

  // FILTRAR INVENTARIO
  const inventarioFiltrado = inventario.filter(item => {
    const minNombre = ministerios?.find(m => m.id_ministerio === item.id_ministerio)?.nombre_ministerio || 'General / Iglesia';
    const text = filtroTexto.toLowerCase();
    return (
      item.descripcion.toLowerCase().includes(text) ||
      item.estado.toLowerCase().includes(text) ||
      item.procedencia.toLowerCase().includes(text) ||
      minNombre.toLowerCase().includes(text) ||
      item.codigo.toString().includes(text)
    );
  });

  // AGRUPAR POR MINISTERIO
  const gruposMinisterio = (ministerios || []).map(min => {
    const items = inventarioFiltrado.filter(item => item.id_ministerio === min.id_ministerio);
    return {
      id_ministerio: min.id_ministerio,
      nombre_ministerio: min.nombre_ministerio,
      items
    };
  });

  const itemsGenerales = inventarioFiltrado.filter(item => 
    !item.id_ministerio || !ministerios?.some(m => m.id_ministerio === item.id_ministerio)
  );

  const todosLosGrupos = [
    ...gruposMinisterio,
    ...(itemsGenerales.length > 0 ? [{
      id_ministerio: 0,
      nombre_ministerio: 'Colectivo General / Iglesia',
      items: itemsGenerales
    }] : [])
  ].filter(g => g.items.length > 0);

  // LIMPIAR FORMULARIO
  const limpiarFormulario = () => {
    setCodigoInput('');
    setDescripcion('');
    setCantidad(1);
    setUnidad('Pz');
    setEstado('disponible');
    setUbicacion('');
    setPrecio(0);
    setMoneda('Bs');
    setProcedencia('Comprado');
    setVerificacion('Sí');
    setIdMinisterio(null);
    setIdGrupo(null);
    setObservaciones('');
    setErrValidacion('');
  };

  // NUEVO
  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setCodigoSeleccionado(null);
    setModalAbierto(true);
  };

  // EDITAR
  const abrirFormEditar = (item: Inventario) => {
    setCodigoInput(String(item.codigo));
    setDescripcion(item.descripcion);
    setCantidad(item.cantidad);
    setUnidad(item.unidad || 'Pz');
    setEstado(item.estado || 'disponible');
    setUbicacion(item.ubicacion || '');
    setPrecio(item.precio || 0);
    setMoneda(item.moneda || 'Bs');
    setProcedencia(item.procedencia || 'Comprado');
    setVerificacion(item.verificacion || 'Sí');
    setIdMinisterio(item.id_ministerio ?? null);
    setIdGrupo(item.id_grupo ?? null);
    setObservaciones(item.observaciones || '');

    setCodigoSeleccionado(String(item.codigo));
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  // GUARDAR
  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    const trimmedCode = codigoInput.trim();
    if (!trimmedCode) {
      setErrValidacion('Por favor ingrese un código de artículo válido.');
      return;
    }

    const yaExiste = inventario.some(item => 
      String(item.codigo).trim().toLowerCase() === trimmedCode.toLowerCase() && 
      (!modoEdicion || (codigoSeleccionado !== null && String(item.codigo).trim().toLowerCase() !== String(codigoSeleccionado).trim().toLowerCase()))
    );
    if (yaExiste) {
      setErrValidacion(`El código "${trimmedCode}" ya se encuentra registrado para otro bien de inventario.`);
      return;
    }

    if (!descripcion.trim() || cantidad <= 0 || precio < 0) {
      setErrValidacion('Descripción del Artículo, Cantidad (mayor a 0) y Precio son estrictamente requeridos.');
      return;
    }

    const datosForm: Inventario = {
      codigo: trimmedCode,
      descripcion: descripcion.trim(),
      cantidad: Number(cantidad),
      unidad,
      estado,
      ubicacion: ubicacion.trim(),
      precio: Number(precio),
      moneda,
      procedencia,
      verificacion,
      id_ministerio: idMinisterio ?? null,
      id_grupo: idGrupo ?? null,
      observaciones: observaciones.trim()
    };

    if (modoEdicion && codigoSeleccionado !== null) {
      actualizarInventario(String(codigoSeleccionado), datosForm);
    } else {
      crearInventario(datosForm);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  // ELIMINAR ARTÍCULO
  const manejarEliminar = (codigo: string, desc: string) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente el activo "${desc}" del inventario?`)) {
      eliminarInventario(codigo);
    }
  };

  // REPORTE PDF COLUMNAS
  const columnasPdf = ['Código', 'Descripción del Artículo', 'Cant', 'Unidad', 'Estado Físico', 'Ubicación', 'Precio', 'Costo Total', 'Procedencia', 'Verificado', 'Ministerio', 'Grupo'];
  const datosPdf = inventarioFiltrado.map(item => [
    item.codigo,
    item.descripcion,
    item.cantidad,
    item.unidad,
    item.estado,
    item.ubicacion || '-',
    `${item.precio} ${item.moneda}`,
    `${item.precio * item.cantidad} ${item.moneda}`,
    item.procedencia,
    item.verificacion,
    ministerios?.find(m => m.id_ministerio === item.id_ministerio)?.nombre_ministerio || 'General',
    item.id_grupo ? `Grupo ${item.id_grupo}` : '-'
  ]);

  return (
    <div className="space-y-6">
      
      {/* SECCIÓN ENCABEZADO CON OPERADORES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-sans">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Inventario de Bienes de la Iglesia</h1>
          <p className="text-xs text-slate-500">Manejo físico de activos fijos, valor unitario y sumario de procedencia de donación o adquisiones.</p>
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
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Activo</span>
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
          placeholder="Filtrar activos por palabras clave de descripción, marcas o estado actual..."
          className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
      </div>

      {/* LISTADO DE TABLAS DE INVENTARIO AGRUPADAS POR MINISTERIO */}
      {todosLosGrupos.length > 0 ? (
        <div className="space-y-8">
          {todosLosGrupos.map((grupo) => {
            return (
              <div key={grupo.id_ministerio} className="bg-white rounded-3xl border border-slate-205 shadow-sm overflow-hidden p-6 space-y-4">
                
                {/* ENCABEZADO DEL GRUPO DE MINISTERIO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-150 gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{grupo.nombre_ministerio}</h2>
                      <p className="text-[10px] text-slate-400 font-sans">Bienes asignados bajo el cuidado de esta área de la congregación</p>
                    </div>
                  </div>
                </div>

                {/* TABLA DEL GRUPO */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 font-mono">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">CÓDIGO</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">DESCRIPCIÓN <span className="block text-[8px] font-normal text-slate-400 font-sans tracking-tight">(Tamaño-Color-Medida-Marca-Modelo)</span></th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">CANT.</th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">UNIDAD <span className="block text-[8px] font-normal text-slate-400 font-sans tracking-tight">(Pz-Jg...)</span></th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">ESTADO <span className="block text-[8px] font-normal text-slate-400 font-sans tracking-tight">(Nuevo-Bueno-Mal)</span></th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">PRECIO <span className="block text-[8px] font-normal text-slate-400 font-sans tracking-tight">(Bs-Sus)</span></th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">PROCEDENCIA <span className="block text-[8px] font-normal text-slate-400 font-sans tracking-tight">(Comprado-Donación)</span></th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200/60">VERIFICACIÓN <span className="block text-[8px] font-normal text-slate-400 font-sans tracking-tight">(Inspección)</span></th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">OBSERVACIONES</th>
                        <th className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-xs text-slate-800">
                      {grupo.items.map((item) => (
                        <tr key={item.codigo} className="hover:bg-slate-50/50 transition">
                          {/* CODIGO */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono border-r border-slate-100">
                            Cod. {/^\d+$/.test(item.codigo) && Number(item.codigo) < 10 ? `0${item.codigo}` : item.codigo}
                          </td>
                          
                          {/* DESCRIPCION */}
                          <td className="px-4 py-4 border-r border-slate-100">
                            <div className="text-sm font-bold text-slate-850 max-w-sm leading-tight">{item.descripcion}</div>
                          </td>
                          
                          {/* CANT */}
                          <td className="px-4 py-4 text-center text-sm font-extrabold text-slate-700 font-mono border-r border-slate-100">
                            {item.cantidad}
                          </td>

                          {/* UNIDAD */}
                          <td className="px-4 py-4 text-center text-sm font-semibold text-slate-600 font-mono border-r border-slate-100 bg-slate-50/40">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
                              {item.unidad || 'Pz'}
                            </span>
                          </td>

                          {/* ESTADO */}
                          <td className="px-4 py-4 text-center border-r border-slate-100">
                            <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border-2 inline-block ${
                              item.estado === 'disponible' ? 'bg-emerald-600 text-white border-emerald-500' :
                              item.estado === 'en_uso' ? 'bg-blue-500 text-white border-blue-400' :
                              item.estado === 'dano' ? 'bg-rose-600 text-white border-rose-500' :
                              'bg-amber-500 text-white border-amber-400'
                            }`}>
                              {item.estado}
                            </span>
                          </td>

                          {/* PRECIO */}
                          <td className="px-4 py-4 text-center font-bold text-slate-900 font-mono border-r border-slate-100">
                            <div className="text-xs">{item.precio} {item.moneda || 'Bs'}</div>
                            <div className="text-[9px] text-slate-400 font-normal">Suma: {item.precio * item.cantidad} {item.moneda || 'Bs'}</div>
                          </td>

                          {/* PROCEDENCIA */}
                          <td className="px-4 py-4 text-center font-semibold text-slate-700 border-r border-slate-100 bg-slate-50/40">
                            <span className={`px-2.5 py-0.75 text-[10px] rounded border ${
                              item.procedencia === 'Comprado' ? 'bg-sky-50 text-sky-850 border-sky-200 font-bold' : 'bg-purple-50 text-purple-750 border-purple-200 font-bold'
                            }`}>
                              {item.procedencia}
                            </span>
                          </td>

                          {/* VERIFICACION */}
                          <td className="px-4 py-4 text-center border-r border-slate-100">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              item.verificacion === 'Sí' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                            } border`}>
                              {item.verificacion || 'Sí'}
                            </span>
                          </td>

                          {/* OBSERVACIONES CON SALTO DE LÍNEA Y MOSTRANDO TODO EL TEXTO */}
                          <td className="px-4 py-4 text-left text-[11px] text-slate-700 font-sans whitespace-pre-line break-words max-w-sm">
                            {item.observaciones ? (
                              <div className="leading-relaxed font-medium">{item.observaciones}</div>
                            ) : (
                              <span className="text-slate-400 italic">Sin observaciones.</span>
                            )}
                          </td>

                          {/* ACCIONES */}
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                            <button
                              onClick={() => setItemVerDetalle(item)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Ficha del Activo"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => abrirFormEditar(item)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              title="Editar Activo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => manejarEliminar(item.codigo, item.descripcion)}
                              className="p-1.5 text-red-650 hover:bg-red-50 hover:text-red-850 rounded-lg transition text-red-600 cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 italic">
          Ningún bien de inventario coincide con su parámetro de búsqueda.
        </div>
      )}

      {/* MODAL: DETALLES DE UN ARTICULO */}
      {itemVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center rounded-t-3xl bg-white">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-600">ID del artículo: {itemVerDetalle.codigo}</span>
                <h3 className="text-base font-black text-slate-850">Propiedades del Activo Fijo</h3>
              </div>
              <button onClick={() => setItemVerDetalle(null)} className="text-slate-400 p-1.5 hover:bg-slate-150 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-slate-800">
              <div className="bg-slate-50 p-4 border rounded-xl">
                <span className="block text-[9px] uppercase font-mono text-slate-400">Descripción del Artículo (Marca/Modelo/Serie)</span>
                <p className="font-extrabold text-slate-900 text-sm mt-1 leading-relaxed">{itemVerDetalle.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Cantidad</span>
                  <span className="font-bold text-slate-900 text-sm">{itemVerDetalle.cantidad} ({itemVerDetalle.unidad || 'Pz'})</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Precio Unitario</span>
                  <span className="font-bold text-indigo-705 text-sm">{itemVerDetalle.precio} {itemVerDetalle.moneda || 'Bs'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border flex flex-col justify-between">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Estado Físico</span>
                  <span className={`block text-center font-black text-[11px] uppercase tracking-widest px-3.5 py-1.5 rounded-full border-2 mt-1.5 ${
                    itemVerDetalle.estado === 'disponible' ? 'bg-emerald-600 text-white border-emerald-500' :
                    itemVerDetalle.estado === 'en_uso' ? 'bg-blue-500 text-white border-blue-400' :
                    itemVerDetalle.estado === 'dano' ? 'bg-rose-600 text-white border-rose-500' :
                    'bg-amber-500 text-white border-amber-400'
                  }`}>
                    {itemVerDetalle.estado}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Procedencia</span>
                  <span className="font-bold text-slate-900">{itemVerDetalle.procedencia}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border col-span-2">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Ministerio Perteneciente</span>
                  <span className="font-bold text-slate-900 text-sm self-center">
                    {ministerios?.find(m => m.id_ministerio === itemVerDetalle.id_ministerio)?.nombre_ministerio || 'General / Iglesia'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border col-span-2">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Verificación e Inspección</span>
                  <span className="font-bold text-slate-900">{itemVerDetalle.verificacion === 'Sí' ? 'Activo Verificado y Confirmado en Templo' : 'Pendiente de Confirmación Técnica'}</span>
                </div>
              </div>

              {itemVerDetalle.observaciones && (
                <div className="bg-slate-50 p-3.5 rounded-xl border">
                  <span className="block text-[9px] uppercase font-mono text-slate-400">Observaciones Adicionales</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed break-words whitespace-pre-line mt-1">{itemVerDetalle.observaciones}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 flex justify-end rounded-b-3xl">
              <button onClick={() => setItemVerDetalle(null)} className="bg-slate-900 hover:bg-slate-850 text-white font-bold px-4 py-2 text-xs rounded-xl cursor-pointer">
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORMULARIO CRUD CREAR/EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-sm font-black text-slate-855">
                {modoEdicion ? 'Actualizar Propiedad Activo' : 'Añadir Registro al Inventario'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardado} className="p-6 space-y-4 text-xs text-slate-850 font-sans">
              
              {errValidacion && (
                <div className="bg-red-50 text-red-800 border p-2.5 rounded-lg font-mono">
                  ⚠️ {errValidacion}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]/[12px]">Código del artículo / Código</label>
                  <input
                    type="text"
                    required
                    value={codigoInput}
                    onChange={(e) => setCodigoInput(e.target.value)}
                    placeholder="ej: MAF - E 152, LAP-01, 106..."
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Ministerio Responsable</label>
                  <select
                    value={idMinisterio}
                    onChange={(e) => setIdMinisterio(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value={0}>General / Colectivo Iglesia</option>
                    {ministerios?.map((min) => (
                      <option key={min.id_ministerio} value={min.id_ministerio}>
                        {min.nombre_ministerio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Descripción Detallada (Tamaño-Color-Medida-Marca-Serie-Modelo)</label>
                <textarea
                  required
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="ejemplo: Parlante JBL Activo, EON615, 15 pulgadas, color negro, serie JBL-993821"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Cantidad (CANT)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Unidad de Medida (UNIDAD)</label>
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="Pz">Pz (Pieza)</option>
                    <option value="Jg">Jg (Juego)</option>
                    <option value="Mts">Mts (Metros)</option>
                    <option value="Otro">Otro / Global</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Precio Unitario</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={precio || ''}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Moneda (PRECIO)</label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="Bs">Bs (Bolivianos)</option>
                    <option value="Sus">Sus (Dólares)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]/[12px]">Estado Físico (ESTADO)</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="en_uso">En Uso</option>
                    <option value="dano">Dañado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Procedencia (Adquisición)</label>
                  <select
                    value={procedencia}
                    onChange={(e) => setProcedencia(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="Comprado">Comprado por la Iglesia</option>
                    <option value="Donación">Donación de Terceros/Hermanos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">¿Verificación e Inspección realizada?</label>
                <select
                  value={verificacion}
                  onChange={(e) => setVerificacion(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                >
                  <option value="Sí">Sí, Confirmada e Inspeccionada en Oficinas/Templo</option>
                  <option value="No">No / Pendiente de verificación técnica</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Ubicación Física</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="ej: Salón principal, estante 2..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Pertenece a Ministerio</label>
                  <select
                    value={idMinisterio ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setIdMinisterio(v === '' ? null : Number(v));
                      if (v === '') setIdGrupo(null);
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="">Ninguno</option>
                    {(ministerios || []).map((m) => (
                      <option key={m.id_ministerio} value={m.id_ministerio}>{m.nombre_ministerio}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">Pertenece a Grupo de Crecimiento</label>
                  <select
                    value={idGrupo ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setIdGrupo(v === '' ? null : Number(v));
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                  >
                    <option value="">Ninguno</option>
                    {(grupos || []).map((g) => (
                      <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Observaciones Adicionales</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="ej: Guardados en el armario izquierdo del salón..."
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t mt-4 -mx-6 px-6 bg-slate-50 py-3 -mb-6 rounded-b-3xl text-xs">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-slate-205 border text-slate-750 px-4 py-2 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 bg-indigo-600 text-white font-bold px-5 py-2 hover:bg-indigo-750 rounded-xl cursor-pointer"
                >
                  {modoEdicion ? 'Actualizar Activo' : 'Registrar Activo'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL REPARTO PDF */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Libro Registro de Inventarios y Activos Fijos de la Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}

    </div>
  );
};
