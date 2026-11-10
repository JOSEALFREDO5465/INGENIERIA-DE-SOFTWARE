// ESTE COMPONENTE CONTIENE LA VISTA DE ACCESO AL SISTEMA (LOGIN)
// ADEMÁS INCLUYE LA OPCIÓN REQUERIDA PARA "SOLICITAR CUENTA" 

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Church, Lock, User, Mail, UserPlus, ArrowLeft, ArrowRight, CheckCircle, ShieldAlert, AlertTriangle, RefreshCw, ImageIcon } from 'lucide-react';
import { useApp } from '../contextos/AppContexto';
import { CampoContrasena } from '../componentes/CampoContrasena';

export const Login: React.FC = () => {
  const { iniciarSesion, solicitarCuenta } = useApp();
  const navigate = useNavigate();

  // ESTADOS PARA INTERFAZ DE LOGIN O INTERFAZ DE SOLICITUD
  const [esModoSolicitud, setEsModoSolicitud] = useState<boolean>(false);

  // CREDENCIALES DE INGRESO
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // CÓDIGO DE VERIFICACIÓN (CAPTCHA)
  const [captcha, setCaptcha] = useState<{ id: string; imagen: string } | null>(null);
  const [codigoCaptcha, setCodigoCaptcha] = useState<string>('');
  const [cargandoCaptcha, setCargandoCaptcha] = useState<boolean>(true);

  // CAMPOS PARA SOLICITUD DE CUENTA NUEVA
  const [solNombre, setSolNombre] = useState<string>('');
  const [solUser, setSolUser] = useState<string>('');
  const [solCorreo, setSolCorreo] = useState<string>('');
  const [solPass, setSolPass] = useState<string>('');
  const [solRol, setSolRol] = useState<'pastor' | 'secretaria' | 'tesorero'>('secretaria');

  // MENSAJES Y NOTIFICACIONES
  const [mensajeError, setMensajeError] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<string>('');

  // GENERAR / REFRESH DEL CÓDIGO DE VERIFICACIÓN
  const cargarCaptcha = useCallback(async () => {
    setCargandoCaptcha(true);
    setCodigoCaptcha('');
    try {
      const res = await fetch('/api/auth/captcha');
      const data = await res.json();
      if (data.success && data.captcha) {
        setCaptcha(data.captcha);
      } else {
        setCaptcha(null);
      }
    } catch (e) {
      setCaptcha(null);
    } finally {
      setCargandoCaptcha(false);
    }
  }, []);

  useEffect(() => {
    cargarCaptcha();
  }, [cargarCaptcha]);

  // MANEJAR EL ACCESSO DE SEGURIDAD
  const manejarAcceso = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');


    if (!username.trim() || !password.trim()) {
      setMensajeError('Por favor complete todos los datos de inicio de sesión.');
      return;
    }

    if (!codigoCaptcha.trim()) {
      setMensajeError('Ingrese el código de verificación que aparece en la imagen.');
      return;
    }

    const resultado = await iniciarSesion(
      username.trim(),
      password,
      captcha?.id,
      codigoCaptcha.trim()
    );

    if (!resultado.succes) {
      setMensajeError(resultado.message);
      // El código de verificación es de un solo uso: se genera uno nuevo
      cargarCaptcha();
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
      setSolRol('secretaria');
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
    <div className="min-h-screen bg-[#F5F6FF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* EFECTOS VISUALES DE FONDO FILADELFIA */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E3E8FF]/60 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C7D2FE]/40 rounded-full blur-3xl"></div>
 
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            src="/src/img/logo.png" alt="Logo Iglesia Centro Evangélico Filadelfia" className="w-24 h-24 object-contain"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-black tracking-tight">
          Iglesia Centro Evagelistico Filadelfia
        </h2>
        <p className="mt-2 text-center text-sm text-[#002060] font-semibold">
          {esModoSolicitud 
            ? 'Formulario de Solicitud de Cuenta' 
            : 'Una Iglesia con proposito'
          }
        </p>
      </motion.div>
 
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-6 rounded-2xl sm:px-10" style={{ border: '1px solid rgba(14,31,26,0.15)' }}>
          
          {mensajeError && (
            <div className="mb-4 bg-[#FDE7E7] border-2 border-[#F5BEBE] rounded-xl p-3 flex items-start space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-[#B91C1C] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#E85B5B] font-bold">{mensajeError}</div>
            </div>
          )}
 
          {mensajeExito && (
            <div className="mb-4 bg-[#EEF1FE] border-2 border-[#CBD3F0] rounded-xl p-3.5 flex items-start space-x-2.5">
              <CheckCircle className="w-5 h-5 text-[#3F5F5A] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#3F5F5A] font-bold">{mensajeExito}</div>
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
                    <User className="h-5 w-5 text-[#002060]" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese su nombre de usuario"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border-2 border-[#CBD3F0] rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4040E0] focus:border-[#4040E0] sm:text-sm"
                  />
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Contraseña:
                </label>
                <div className="mt-1">
                  <CampoContrasena
                    value={password}
                    onChange={setPassword}
                    placeholder="Ingrese su contraseña"
                    autoComplete="current-password"
                    icono={<Lock className="h-5 w-5 text-[#002060]" />}
                  />
                </div>
              </div>

              {/* CÓDIGO DE VERIFICACIÓN (CAPTCHA) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Código de verificación:
                </label>
                <div className="mt-1 flex items-start gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={codigoCaptcha}
                      onChange={(e) => setCodigoCaptcha(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Escriba el código de la imagen"
                      maxLength={6}
                      autoComplete="off"
                      className="block w-full px-3 py-2.5 bg-white border-2 border-[#CBD3F0] rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4040E0] focus:border-[#4040E0] sm:text-sm font-mono tracking-[0.3em]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Escriba los caracteres que ve en la imagen para poder ingresar.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {captcha?.imagen ? (
                      <img
                        src={captcha.imagen}
                        alt="Código de verificación de seguridad"
                        className="h-[70px] w-[220px] rounded-xl border-2 border-[#CBD3F0] bg-white object-cover"
                      />
                    ) : (
                      <div className="h-[70px] w-[220px] rounded-xl border-2 border-dashed border-[#CBD3F0] bg-white flex items-center justify-center text-[10px] font-bold text-slate-400 text-center px-2">
                        {cargandoCaptcha ? 'GENERANDO CÓDIGO...' : 'NO SE PUDO GENERAR EL CÓDIGO'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={cargarCaptcha}
                      title="Generar otro código de verificación"
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#4040E0] hover:text-[#2F34C4] transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${cargandoCaptcha ? 'animate-spin' : ''}`} />
                      <span>No puedo leerlo</span>
                    </button>
                  </div>
                </div>
              </div>
 
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-[#4040E0] hover:bg-[#2F34C4] transition-colors cursor-pointer"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
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
                  className="w-full flex items-center justify-center space-x-1.5 text-xs text-[#4040E0] hover:bg-[#E9EBFE] font-bold transition-colors py-2 bg-[#EEF1FE] rounded-xl border-2 border-[#CBD3F0] cursor-pointer"
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
                  className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#CBD3F0] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#4040E0] focus:outline-none"
                />
              </div>
 
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Ingrese un nombre de Usuario
                </label>
                <input
                  type="text" required value={solUser} onChange={(e) => setSolUser(e.target.value)} placeholder="Nombre de usuario"
                  className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#CBD3F0] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#4040E0] focus:outline-none"
                />
              </div>
 
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black">
                  Correo Electrónico
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#002060]" />
                  </div>
                  <input
                    type="email" required value={solCorreo} onChange={(e) => setSolCorreo(e.target.value)} placeholder="Ingrese un correo electrónico"
                    className="block w-full pl-9 pr-3 py-2 bg-white border-2 border-[#CBD3F0] rounded-xl text-black placeholder-slate-400 text-sm focus:ring-2 focus:ring-[#4040E0] focus:outline-none"
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-3 items-start">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black">
                    Ingrese su contraseña
                  </label>
                  <div className="mt-1">
                    <CampoContrasena
                      value={solPass}
                      onChange={setSolPass}
                      placeholder="Ingrese una contraseña"
                      required
                      autoComplete="new-password"
                      mostrarMedidor
                      icono={<Lock className="h-4 w-4 text-[#002060]" />}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black">
                    escoja un Rol
                  </label>
                  <select
                    value={solRol} onChange={(e) => setSolRol(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 bg-white border-2 border-[#CBD3F0] rounded-xl text-black text-sm focus:ring-2 focus:ring-[#4040E0] focus:outline-none">
                    <option value="secretaria">Secretaría</option>
                    <option value="pastor">Pastor</option>
                    <option value="tesorero">Tesorero</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                    La seguridad de la contraseña se evalúa al escribirla.
                  </p>
                </div>
              </div>
 
              <div className="pt-2 text-xs text-black bg-[#EEF1FE] p-3 rounded-xl border-2 border-[#CBD3F0] font-medium leading-relaxed flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#002060]" />
                <span><strong>Aviso Importante:</strong> Su cuenta NO se creará inmediatamente. Sus datos serán revisados por un Administrador para su aprobación.</span>
              </div>
 
              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEsModoSolicitud(false);
                    setMensajeError('');
                    setMensajeExito('');
                  }}
                  className="flex-1 flex justify-center items-center py-2 px-3 border-2 border-[#CBD3F0] hover:bg-[#EEF1FE] rounded-xl text-sm font-bold text-black transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Atrás</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 flex justify-center items-center py-2 px-3 border border-transparent rounded-xl text-sm font-bold text-white bg-[#4040E0] hover:bg-[#2F34C4] transition-colors cursor-pointer"
                >
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
