// ESTE COMPONENTE CONTIENE LA GESTIÓN DE USUARIOS DEL SISTEMA Y LA BANDEJA DE EVALUACIÓN DE SOLICITUDES
// CUMPLE CON EL REQUERIMIENTO DE AVAL Y REVISIÓN DE CUENTAS POR EL ADMINISTRADOR PRINCIPAL

import React, { useState } from 'react';
import { useApp } from '../contextos/AppContexto';
import { Usuario } from '../tipos';
import { Plus, Search, FileText, Eye, Edit, Trash2, X, Check, ShieldAlert, BadgeHelp, CheckSquare, XCircle, ShieldCheck } from 'lucide-react';
import { GeneradorPDF } from '../componentes/GeneradorPDF';

export const UsuariosTab: React.FC = () => {
  const { 
    usuarios, 
    usuarioActual,
    crearUsuario, 
    actualizarUsuario, 
    eliminarUsuario, 
    aprobarUsuario, 
    rechazarUsuario 
  } = useApp();

  // --- ESTADOS PARA NAVEGACIÓN FORMULARIO ---
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [userSeleccionadoId, setUserSeleccionadoId] = useState<number | null>(null);

  // --- ESTADO PARA DETALLE ---
  const [userVerDetalle, setUserVerDetalle] = useState<Usuario | null>(null);

  // --- ESTADO PARA REPORTE PDF ---
  const [reportePdfAbierto, setReportePdfAbierto] = useState<boolean>(false);

  // --- ESTADOS BUSCADOR ---
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // --- ESTADO DE FORMULARIO DE USUARIO (DATOS DICCIONARIO PDF) ---
  const [nombreCompleto, setNombreCompleto] = useState<string>('');
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [contrasena, setContrasena] = useState<string>('');
  const [rol, setRol] = useState<'admin' | 'líder' | 'pastor'>('líder');

  const [errValidacion, setErrValidacion] = useState<string>('');

  // SEPARAR USUARIOS EN APROBADOS (ACTIVOS) Y SOLICITUDES INACTIVAS (PENDIENTES)
  const usuariosAprobados = usuarios.filter(u => u.aprobado === true && (
    u.nombre_completo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    u.nombre_usuario.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    u.correo.toLowerCase().includes(filtroTexto.toLowerCase())
  ));

  const solicitudesPendientes = usuarios.filter(u => u.aprobado === false);

  // REINICIAR FORMULARIO
  const limpiarFormulario = () => {
    setNombreCompleto('');
    setNombreUsuario('');
    setCorreo('');
    setContrasena('');
    setRol('líder');
    setErrValidacion('');
  };

  // ABRIR FORM NUEVO
  const abrirFormNuevo = () => {
    limpiarFormulario();
    setModoEdicion(false);
    setUserSeleccionadoId(null);
    setModalAbierto(true);
  };

  // ABRIR FORM EDITAR
  const abrirFormEditar = (u: Usuario) => {
    setNombreCompleto(u.nombre_completo);
    setNombreUsuario(u.nombre_usuario);
    setCorreo(u.correo);
    setContrasena(u.contrasena);
    setRol(u.rol);

    setUserSeleccionadoId(u.id_usuario);
    setModoEdicion(true);
    setModalAbierto(true);
    setErrValidacion('');
  };

  // ACCIÓN DE GUARDADO
  const manejarGuardado = (e: React.FormEvent) => {
    e.preventDefault();
    setErrValidacion('');

    if (!nombreCompleto.trim() || !nombreUsuario.trim() || !correo.trim() || !contrasena.trim()) {
      setErrValidacion('Todos los campos definidos en la estructura son estrictamente obligatorios.');
      return;
    }

    // COMPROBAR UNICIDAD DE NOMBRE_USUARIO Y CORREO EN CASO DE NUEVO REGISTRO
    if (!modoEdicion) {
      const duplicadoUser = usuarios.some(u => u.nombre_usuario.toLowerCase() === nombreUsuario.trim().toLowerCase());
      const duplicadoEmail = usuarios.some(u => u.correo.toLowerCase() === correo.trim().toLowerCase());

      if (duplicadoUser) {
        setErrValidacion('El nombre de usuario especificado ya se encuentra registrado.');
        return;
      }
      if (duplicadoEmail) {
        setErrValidacion('El correo electrónico especificado ya se encuentra en uso.');
        return;
      }
    }

    const datosForm = {
      nombre_completo: nombreCompleto.trim(),
      nombre_usuario: nombreUsuario.trim().toLowerCase(),
      correo: correo.trim(),
      contrasena,
      rol,
      aprobado: true,
      fecha_registro: new Date().toISOString(),
      ultimo_acceso: ""
    };

    if (modoEdicion && userSeleccionadoId !== null) {
      actualizarUsuario(userSeleccionadoId, datosForm);
    } else {
      crearUsuario(datosForm);
    }

    setModalAbierto(false);
    limpiarFormulario();
  };

  // ELIMINAR USUARIO
  const manejarEliminar = (id: number, nombre: string) => {
    if (usuarioActual && usuarioActual.id_usuario === id) {
      alert('Usted no puede eliminar su propia cuenta desde su sección activa.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar de manera irrevocable la cuenta de usuario de "${nombre}"?`)) {
      eliminarUsuario(id);
    }
  };

  // DAR DE BAJA USUARIO (DESACTIVAR/SUSPENDER) Y ENVIAR AL PANEL DE PENDIENTES
  const manejarBaja = (id: number, nombre: string) => {
    if (usuarioActual && usuarioActual.id_usuario === id) {
      alert('Usted no puede darse de baja a sí mismo.');
      return;
    }
    if (window.confirm(`¿Estás seguro de dar de baja la cuenta de "${nombre}" para que de inmediato deje de tener acceso al sistema?`)) {
      actualizarUsuario(id, { aprobado: false });
      alert(`La cuenta de "${nombre}" ha sido dada de baja del sistema.`);
    }
  };

  // MAPEO DE DATOS PARA PDF DE REPORTE DE USUARIOS
  const columnasPdf = ['ID', 'Nombre Completo', 'Nombre de Usuario', 'Correo', 'Rol Sistema', 'Registrado El'];
  const datosPdf = usuariosAprobados.map(u => [
    u.id_usuario,
    u.nombre_completo,
    u.nombre_usuario,
    u.correo,
    u.rol?.toUpperCase() || 'LÍDER',
    new Date(u.fecha_registro).toLocaleString('es-BO')
  ]);

  // COMPROBAMOS SI EL LOGUEADO ES EL ADMIN PRINCIPAL
  const esAdministradorPrincipal = usuarioActual?.rol === 'admin';

  return (
    <div className="space-y-8 font-sans">
      
      {/* REQUERIMIENTO ESPECIAL: BANDEJA DE ENTRADA DE SOLICITUDES PARA EL ADMINISTRADOR PRINCIPAL */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="bg-amber-100 text-amber-850 p-2 rounded-xl text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Bandeja de Cuentas por Aprobar</h2>
              <p className="text-xs text-slate-500">Solicitudes de usuario bajo evaluación del Administrador Principal.</p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
            {solicitudesPendientes.length} Solicitudes
          </span>
        </div>

        {esAdministradorPrincipal ? (
          <div className="mt-4 space-y-3">
            {solicitudesPendientes.length > 0 ? (
              solicitudesPendientes.map((sol) => (
                <div 
                  key={sol.id_usuario}
                  className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between text-xs gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-250 text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider">
                        Rol pedido: {sol.rol}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{sol.nombre_completo}</h4>
                    </div>
                    <p className="text-slate-500">Usuario de ingreso: <strong>{sol.nombre_usuario}</strong> | Correo: <strong>{sol.correo}</strong></p>
                    <p className="text-[10px] text-slate-400 font-mono">Solicitado el: {new Date(sol.fecha_registro).toLocaleString('es-BO')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        aprobarUsuario(sol.id_usuario);
                        alert(`¡La cuenta de ${sol.nombre_completo} ha sido aprobada correctamente! Ahora puede entrar con sus credenciales.`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Autorizar Entrada</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Desea rechazar y descartar la solicitud de ${sol.nombre_completo}?`)) {
                          rechazarUsuario(sol.id_usuario);
                        }
                      }}
                      className="bg-slate-205 border hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Descartar</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 italic text-xs">
                No hay ninguna solicitud de cuenta nueva pendiente de aprobación en este momento.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center space-x-3 text-xs text-slate-500">
            <BadgeHelp className="w-6 h-6 text-indigo-505 text-indigo-650" />
            <p>
              ⚠️ **Acceso Restringido:** El módulo de validación y aprobación de colaboradores está supeditado exclusivamente a la cuenta del <strong>Administrador Principal (rol: admin)</strong>. Inicie sesión como 'admin' para evaluar estas solicitudes.
            </p>
          </div>
        )}
      </div>

      {/* CONTROL DEL CRUD GENERAL USUARIOS ACTIVOS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Usuarios Autorizados del Sistema</h2>
            <p className="text-xs text-slate-500">Manejo de credenciales de entrada administrativa y asamblea ministerial de la Iglesia Filadelfia.</p>
          </div>

        </div>

        {/* BUSCADOR EXCLUSIVO */}
        <div className="relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Filtrar por nombres de usuario, apellidos o correo institucional..."
            className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          />
        </div>

        {/* SECCIÓN LISTADO USUARIOS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 font-mono">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nombre Completo / Usuario</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Correo Electrónico</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Rol Consola</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">Último Acceso</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs">
                {usuariosAprobados.length > 0 ? (
                  usuariosAprobados.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">#{u.id_usuario}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">{u.nombre_completo}</div>
                        <div className="text-[11px] text-indigo-600 font-mono">@{u.nombre_usuario}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{u.correo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2.5 py-0.75 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          u.rol === 'admin' ? 'bg-red-50 text-red-750 border border-red-200' :
                          u.rol === 'pastor' ? 'bg-purple-50 text-purple-750 border border-purple-200' : 'bg-indigo-55 bg-indigo-50 text-indigo-750 border border-indigo-200'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-[10px] text-slate-500">
                        {u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-BO') : 'Nunca ha ingresado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <button
                          onClick={() => setUserVerDetalle(u)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Ficha Usuario"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* SOLO EL PROPIO DUEÑO PUEDE EDITAR SU CUENTA (CONTRASEÑA Y DETALLES) */}
                        {usuarioActual && usuarioActual.id_usuario === u.id_usuario && (
                          <button
                            onClick={() => abrirFormEditar(u)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Editar Mi Cuenta"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* EL ADMINISTRADOR PRINCIPAL PUEDE ELIMINAR O DAR DE BAJA OTRAS CUENTAS */}
                        {esAdministradorPrincipal && usuarioActual && usuarioActual.id_usuario !== u.id_usuario && (
                          <>
                            <button
                              onClick={() => manejarBaja(u.id_usuario, u.nombre_completo)}
                              className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              title="Dar de Baja Cuenta"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => manejarEliminar(u.id_usuario, u.nombre_completo)}
                              className="p-1.5 text-red-650 hover:bg-red-50 hover:text-red-850 rounded-lg transition text-red-600 cursor-pointer"
                              title="Eliminar Cuenta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      No hay ningún usuario activo registrado en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: DETALLE FICHA INTEGRAL DE USUARIOS */}
      {userVerDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center rounded-t-3xl">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-600">ID Usuario: #{userVerDetalle.id_usuario}</span>
                <h3 className="text-base font-black text-slate-850">Propiedades de Cuenta</h3>
              </div>
              <button onClick={() => setUserVerDetalle(null)} className="text-slate-400 p-1.5 hover:bg-slate-150 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-slate-800">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg text-white font-black flex items-center justify-center">
                  U
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{userVerDetalle.nombre_completo}</h4>
                  <p className="font-mono text-[11px] text-indigo-600">@{userVerDetalle.nombre_usuario} · {userVerDetalle.correo}</p>
                </div>
              </div>

              <div className="space-y-2 border border-slate-150 p-3.5 rounded-xl bg-slate-50">
                <p>
                  🔑 <strong>Contraseña:</strong>{' '}
                  {usuarioActual && usuarioActual.id_usuario === userVerDetalle.id_usuario ? (
                    <span className="font-mono bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-bold">{userVerDetalle.contrasena}</span>
                  ) : (
                    <span className="font-mono text-slate-400">•••••• (Solo visible para el dueño)</span>
                  )}
                </p>
                <p>🛡️ <strong>Rol Administrativo:</strong> {userVerDetalle.rol?.toUpperCase()}</p>
                <p>📋 <strong>Aceptado en Iglesia:</strong> {userVerDetalle.aprobado ? 'SÍ (ACTIVO)' : 'PENDIENTE'}</p>
              </div>

              <div className="space-y-1 text-[11px] font-mono text-slate-500 bg-slate-100 p-3 rounded-lg">
                <p>Creación de Cuenta: {new Date(userVerDetalle.fecha_registro).toLocaleString('es-BO')}</p>
                <p>Último acceso al Templo: {userVerDetalle.ultimo_acceso ? new Date(userVerDetalle.ultimo_acceso).toLocaleString('es-BO') : 'N/C'}</p>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 flex justify-end rounded-b-3xl">
              <button 
                onClick={() => setUserVerDetalle(null)}
                className="bg-slate-900 border text-white font-bold px-4 py-2 hover:bg-slate-800 text-xs rounded-xl cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CAPTURA FORMULARIO CREAR/EDITAR EXPLICACIONES PDF EXIGIDAS */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-sm font-black text-slate-850">
                {modoEdicion ? 'Actualizar Credenciales' : 'Registrar Nuevo Operador'}
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
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Apellidos y Nombres Completos</label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-1 text-slate-900 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="ejemplo: juan_lider"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Correo Electrónico Único</label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ej: juan@filadelfia.org"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {(!modoEdicion || (usuarioActual && usuarioActual.id_usuario === userSeleccionadoId)) ? (
                <div>
                  <label className="block text-slate-550 font-bold uppercase text-[10px]">{modoEdicion ? 'Actualizar Contraseña' : 'Contraseña Provisoria'}</label>
                  <input
                    type="password"
                    required={!modoEdicion}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-2 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>🔒 Contraseña protegida (Solo el propio dueño puede modificarla)</span>
                </div>
              )}

              <div>
                <label className="block text-slate-550 font-bold uppercase text-[10px]">Rol Operativo Otorgado</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-950 focus:outline-none"
                >
                  <option value="admin">Administrador (admin)</option>
                  <option value="pastor">Pastor (pastor)</option>
                  <option value="líder">Líder Gral (líder)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t mt-4 -mx-6 px-6 bg-slate-50 py-3 -mb-6 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="bg-slate-205 border text-slate-700 px-4 py-2 hover:bg-slate-100 rounded-xl text-[10px] font-bold cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 rounded-xl text-[10px] font-bold cursor-pointer transition"
                >
                  {modoEdicion ? 'Actualizar Cuenta' : 'Crear Cuenta'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL RECONSTITUCIÓN DE PDF */}
      {reportePdfAbierto && (
        <GeneradorPDF
          titulo="Libro General de Colaboradores y Usuarios Autorizados del Sistema Web Iglesia Filadelfia"
          columnas={columnasPdf}
          datos={datosPdf}
          alCerrar={() => setReportePdfAbierto(false)}
        />
      )}

    </div>
  );
};
