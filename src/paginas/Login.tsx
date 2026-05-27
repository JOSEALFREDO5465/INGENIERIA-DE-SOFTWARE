// ESTE COMPONENTE CONTIENE LA VISTA DE ACCESO AL SISTEMA (LOGIN)
// ADEMÁS INCLUYE LA OPCIÓN REQUERIDA PARA "SOLICITAR CUENTA" 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Church, Lock, User, Mail, UserPlus, ArrowLeft, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../contextos/AppContexto';

export const Login: React.FC = () => {
  const { iniciarSesion, solicitarCuenta } = useApp();
  const navigate = useNavigate();

  // ESTADOS PARA INTERFAZ DE LOGIN O INTERFAZ DE SOLICITUD
  const [esModoSolicitud, setEsModoSolicitud] = useState<boolean>(false);

  // CREDENCIALES DE INGRESO
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // CAMPOS PARA SOLICITUD DE CUENTA NUEVA
  const [solNombre, setSolNombre] = useState<string>('');
  const [solUser, setSolUser] = useState<string>('');
  const [solCorreo, setSolCorreo] = useState<string>('');
  const [solPass, setSolPass] = useState<string>('');
  const [solRol, setSolRol] = useState<'admin' | 'líder' | 'pastor'>('líder');

  // MENSAJES Y NOTIFICACIONES
  const [mensajeError, setMensajeError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');

  // MANEJAR EL ACCESSO DE SEGURIDAD
  const manejarAcceso = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    if (!username.trim() || !password.trim()) {
      setMensajeError('Por favor complete todos los datos de inicio de sesión.');
      return;
    }

    const resultado = await iniciarSesion(username.trim(), password);
    if (!resultado.succes) {
      setMensajeError(resultado.message);
    } else {
      // Navegar a dashboard después de login exitoso
      navigate('/dashboard');
    }
  };

  // MANEJAR LA SOLICITUD DE NUEVA CUENTA
  const manejarRegistroSolicitado = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    if (!solNombre.trim() || !solUser.trim() || !solCorreo.trim() || !solPass.trim()) {
      setMensajeError('Todos los campos son estrictamente requeridos para la solicitud.');
      return;
    }

    const resultado = await solicitarCuenta({
      nombre_completo: solNombre.trim(),
      nombre_usuario: solUser.trim(),
      correo: solCorreo.trim(),
      contrasena: solPass,
      rol: solRol
    });

    if (resultado.succes) {
      setMensajeExito(resultado.message);
      // REINICIAR FORMULARIO DE SOLICITUD
      setSolNombre('');
      setSolUser('');
      setSolCorreo('');
      setSolPass('');
      setSolRol('líder');
      // VOLVER AL LOGIN DESPUÉS DE UN SEGUNDO
      setTimeout(() => {
        setEsModoSolicitud(false);
        setMensajeExito('');
      }, 5000);
    } else {
      setMensajeError(resultado.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* EFECTOS VISUALES DE FONDO CELESTES */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#bae6fd]/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-3xl"></div>
 
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <img src="/src/img/logo.png" alt="Logo Iglesia Centro Evangélico Filadelfia" className="w-24 h-24 object-contain"/>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black tracking-tight animate-fade-in">
          Iglesia Centro Evagelistico Filadelfia
        </h2>
        <p className="mt-2 text-center text-sm text-[#0284c7] font-semibold">
          {esModoSolicitud 
            ? 'Formulario de Solicitud de Cuenta' 
            : 'Una Iglesia con proposito'
          }
        </p>
      </div>
 
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 border-2 border-[#bae6fd] rounded-2xl sm:px-10">
          
          {mensajeError && (
            <div className="mb-4 bg-red-50 border-2 border-red-250 rounded-xl p-3 flex items-start space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 font-bold">{mensajeError}</div>
            </div>
          )}
 
          {mensajeExito && (
            <div className="mb-4 bg-emerald-50 border-2 border-emerald-250 rounded-xl p-3.5 flex items-start space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-700 font-bold">{mensajeExito}</div>
            </div>
          )}
 
          {!esModoSolicitud ? (
            /* FORMULARIO DE INICIO DE SESIÓN */
            <form className="space-y-6" onSubmit={manejarAcceso}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  ingrese su Usuario:
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#0284c7]" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese su nombre de usuario"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border-2 border-[#bae6fd] rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] sm:text-sm"
                  />
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Contraseña:
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#0284c7]" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border-2 border-[#bae6fd] rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] sm:text-sm"
                  />
                </div>
              </div>
 
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors cursor-pointer"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
 
              <div className="border-t border-slate-200 pt-5 text-center">
                <span className="text-xs text-black block mb-2 font-semibold">Si quieres crear una cuenta solicita una aquí</span>
                <button
                  type="button"
                  onClick={() => {
                    setEsModoSolicitud(true);
                    setMensajeError('');
                    setMensajeExito('');
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 text-xs text-[#0ea5e9] hover:bg-[#e0f2fe] font-bold transition-colors py-2 bg-[#f0f9ff] rounded-xl border-2 border-[#bae6fd] cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Solicitar una Cuenta</span>
                </button>
              </div>
            </form>
          ) : (
            /* INTERFAZ DE SOLICITUD DE CUENTA NUEVA BAJO EVALUACIÓN */
            <form className="space-y-4" onSubmit={manejarRegistroSolicitado}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black font-sans">
                  Nombres y Apellidos Completos
                </label>
                <input
                  type="text" required value={solNombre} onChange={(e) => setSolNombre(e.target.value)} placeholder="Nombre y Apellidos Completos"
                  className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#bae6fd] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                />
              </div>
 
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Ingrese un nombre de Usuario
                </label>
                <input
                  type="text" required value={solUser} onChange={(e) => setSolUser(e.target.value)} placeholder="Nombre de usuario"
                  className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#bae6fd] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                />
              </div>
 
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Correo Electrónico
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#0284c7]" />
                  </div>
                  <input
                    type="email" required value={solCorreo} onChange={(e) => setSolCorreo(e.target.value)} placeholder="Ingrese un correo electrónico"
                    className="block w-full pl-9 pr-3 py-2 bg-white border-2 border-[#bae6fd] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black">
                    Ingrese su contraseña
                  </label>
                  <input
                    type="password" required value={solPass} onChange={(e) => setSolPass(e.target.value)} placeholder="Ingrese una contraseña"
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#bae6fd] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black">
                    escoja un Rol
                  </label>
                  <select
                    value={solRol} onChange={(e) => setSolRol(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#bae6fd] rounded-xl text-black text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:outline-none">
                    <option value="líder">Líder</option>
                    <option value="pastor">Pastor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
 
              <div className="pt-2 text-xs text-black bg-[#f0f9ff] p-3 rounded-xl border-2 border-[#bae6fd] font-medium leading-relaxed">
                ⚠️ <strong>Aviso Importante:</strong> Su cuenta NO se creará inmediatamente. Sus datos serán revisados por un Administrador para su aprobación.
              </div>
 
              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEsModoSolicitud(false);
                    setMensajeError('');
                    setMensajeExito('');
                  }}
                  className="flex-1 flex justify-center items-center py-2 px-3 border-2 border-[#bae6fd] hover:bg-[#f0f9ff] rounded-xl text-sm font-bold text-black transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Atrás</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 flex justify-center items-center py-2 px-3 border border-transparent rounded-xl text-sm font-bold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors cursor-pointer"
                >
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
