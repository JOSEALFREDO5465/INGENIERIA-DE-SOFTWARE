// ESTE ENTRADA PRINCIPAL INTEGRA EL PROVINCIONAMIENTO GLOBAL DE APPLICACIÓN

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContextoProvider, useApp } from './contextos/AppContexto';
import { Login } from './paginas/Login';
import { Dashboard } from './paginas/Dashboard';
import { MiembrosTab } from './paginas/MiembrosTab';
import { UsuariosTab } from './paginas/UsuariosTab';
import { MinisteriosTab } from './paginas/MinisteriosTab';
import { GruposTab } from './paginas/GruposTab';
import { InventarioTab } from './paginas/InventarioTab';
import { ActividadesTab } from './paginas/ActividadesTab';
import { EconomiaTab } from './paginas/EconomiaTab';
import { Church, LayoutDashboard, Users, ShieldCheck, FolderGit2, Network, Boxes, Calendar, LogOut, ChevronRight, Menu, X, Settings, Bell, Search, CreditCard, Lock } from 'lucide-react';

const ContenedorEstructuralSecundario: React.FC = () => {
  const { usuarioActual, cerrarSesion } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  // RESPONSIVO MENÚ COLAPSABLE LATERAL PARA MÓVILES
  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);
  
  // Obtener la ruta actual para determinar vistaActiva
  const getVistaActivaFromPath = () => {
    const pathname = location.pathname;
    if (pathname === '/dashboard' || pathname === '/') return 'dashboard';
    if (pathname === '/miembros') return 'miembros';
    if (pathname === '/ministerios') return 'ministerios';
    if (pathname === '/grupos') return 'grupos';
    if (pathname === '/inventario') return 'inventario';
    if (pathname === '/actividades') return 'actividades';
    if (pathname === '/economia') return 'economia';
    if (pathname === '/usuarios') return 'usuarios';
    return 'dashboard';
  };
  
  const vistaActiva = getVistaActivaFromPath();
  
  // SI NO HAY USUARIO EN SESIÓN, OBLIGATORIO MOSTRAR LA INTERFAZ DE LOGIN
  if (!usuarioActual) {
    return <Login />;
  }

  // LISTADO DE MÓDULOS DE NAVEGACIÓN EN ESPAÑOL REQUERIDOS
  const todosLosModulos = [
    { id: 'dashboard', nombre: 'Dashboard', icono: LayoutDashboard },
    { id: 'miembros', nombre: 'Miembros', icono: Users },
    { id: 'ministerios', nombre: 'Ministerios', icono: FolderGit2 },
    { id: 'grupos', nombre: 'Grupos de Crecimiento', icono: Network },
    { id: 'inventario', nombre: 'Inventario', icono: Boxes },
    { id: 'actividades', nombre: 'Actividades', icono: Calendar },
    { id: 'economia', nombre: 'Economía', icono: CreditCard },
    { id: 'usuarios', nombre: 'Usuarios', icono: ShieldCheck },
  ];

  // CONTROL DE ACCESO POR ROL (RNF01)
  // pastor: todo | secretaria: todo menos Economía y Usuarios | tesorero: solo Economía
  const permisosPorRol: Record<string, string[]> = {
    pastor: ['dashboard', 'miembros', 'ministerios', 'grupos', 'inventario', 'actividades', 'economia', 'usuarios'],
    secretaria: ['dashboard', 'miembros', 'ministerios', 'grupos', 'inventario', 'actividades'],
    tesorero: ['economia'],
  };

  const rolActual = usuarioActual?.rol && permisosPorRol[usuarioActual.rol] ? usuarioActual.rol : 'pastor';
  const modulosPermitidos = permisosPorRol[rolActual] ?? ['dashboard'];
  // Todos los módulos se muestran en el menú; los no permitidos aparecen bloqueados con candado
  const modulosNavegacion = todosLosModulos;

  return (
    <div className="min-h-screen bg-[#F5F6FF] flex flex-col md:flex-row font-sans text-slate-800">
      {/* BARRA LATERAL (SIDEBAR DE NAVEGACIÓN) - VISIBLE EN ESCRITORIO */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-[#002060] text-[#C9D6FF] h-screen sticky top-0 border-r border-[#0F2A55] flex-shrink-0">
        {/* MARCA Y LOGO DE LA IGLESIA FILADELFIA */}
        <div className="p-6 border-b border-[#0F2A55] flex items-center space-x-3 bg-[#002060]">
          <img src="/src/img/logo.png" alt="Logo Iglesia" className="w-13 h-13 object-contain"/>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white uppercase font-sans">C.E.Filadelfia</h1>
            <span className="text-[9px] text-[#C9D6FF] font-mono uppercase tracking-widest font-semibold block">Iglesia con propósito</span>
          </div>
        </div>

        {/* LISTADO DE MENÚ OPERATIVO */}
        <div className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-[#C9D6FF]/60 mt-2">Menu principal</div>
        <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto">
          {modulosNavegacion.map((item) => {
            const IconoComponente = item.icono;
            const esActivo = vistaActiva === item.id;
            const permitido = modulosPermitidos.includes(item.id);
            const routePaths: { [key: string]: string } = {
              'dashboard': '/dashboard',
              'miembros': '/miembros',
              'ministerios': '/ministerios',
              'grupos': '/grupos',
              'inventario': '/inventario',
              'actividades': '/actividades',
              'economia': '/economia',
              'usuarios': '/usuarios',
            };
            if (!permitido) {
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled
                  title={`Acceso restringido para el rol ${rolActual}`}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[#8296D4] text-xs font-medium cursor-not-allowed opacity-70 select-none"
                >
                  <div className="flex items-center space-x-2.5">
                    <IconoComponente className="w-4 h-4" />
                    <span>{item.nombre}</span>
                  </div>
                  <Lock className="w-4 h-4 text-[#F2C063]" />
                </button>
              );
            }
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(routePaths[item.id])}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition text-xs font-medium cursor-pointer ${
                  esActivo 
                    ? 'bg-[#4040E0] text-white font-bold' 
                    : 'text-[#C9D6FF] hover:bg-[#0F2A55] hover:text-white'
                }`}
                >
                <div className="flex items-center space-x-2.5">
                  <IconoComponente className="w-4 h-4" />
                  <span>{item.nombre}</span>
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* CONSOLA PERFIL DE COLABORADOR REGISTRADO */}
        <div className="p-4 border-t border-[#0F2A55] bg-[#002060] space-y-3">
          <div className="flex items-center space-x-3">
            {/* ICONO DEL USUARIO CON INICIAL DEL NOMBRE */}
            <div className="w-9 h-9 rounded-full bg-[#F2C063] text-[#002060] font-extrabold flex items-center justify-center text-xs">
              {usuarioActual.nombre_completo.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#C9D6FF] truncate leading-tight">{usuarioActual.nombre_completo}</p>
              <span className="text-[10px] text-[#C9D6FF]/60 font-mono uppercase tracking-wider block font-bold leading-none mt-1">{usuarioActual.rol}</span>
            </div>
          </div>

          <button
            onClick={() => {
              cerrarSesion();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-[#FD6E6E]/15 hover:bg-[#FD6E6E]/25 text-[#FD6E6E] font-bold text-[11px] rounded transition shadow-sm cursor-pointer border border-[#FD6E6E]/30">
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>
      {/* RECEPTÁCULO PRINCIPAL DE CUERPO */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#F5F6FF]">
        {/* CABECERA SUPERIOR PARA MÓVILES */}
        <header className="bg-[#002060] text-white px-4 py-3 flex items-center justify-between shadow-sm md:hidden relative z-20 border-b border-[#0F2A55]">
          <div className="flex items-center space-x-3">
            <div className="bg-white/15 p-1.5 rounded text-white">
              <Church className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-extrabold text-sm uppercase tracking-wider text-white">Igl. Filadelfia</h1>
          </div>
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="text-white p-1 rounded hover:bg-white/10 cursor-pointer">
            {menuMovilAbierto ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </header>

        {/* MENÚ MÓVIL RESPONSIVO EN CAJÓN CONTENIDO DESLIZANTE */}
        {menuMovilAbierto && (
          <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMenuMovilAbierto(false)}>
            <div 
              className="w-64 bg-[#002060] text-[#C9D6FF] min-h-screen flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}>
              <div>
                <div className="p-6 border-b border-[#0F2A55] flex items-center justify-between bg-[#002060] text-white">
                  <div className="flex items-center space-x-3">
                    <Church className="w-5 h-5 text-white" />
                    <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">Menú Filadelfia</h2>
                  </div>
                  <button onClick={() => setMenuMovilAbierto(false)} className="text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-[#C9D6FF]/60">
                  Navegación
                </div>
                <nav className="px-4 py-1 space-y-1">
                  {modulosNavegacion.map((item) => {
                    const IconoComponente = item.icono;
                    const esActivo = vistaActiva === item.id;
                    const permitido = modulosPermitidos.includes(item.id);
                    const routePaths: { [key: string]: string } = {
                      'dashboard': '/dashboard',
                      'miembros': '/miembros',
                      'ministerios': '/ministerios',
                      'grupos': '/grupos',
                      'inventario': '/inventario',
                      'actividades': '/actividades',
                      'economia': '/economia',
                      'usuarios': '/usuarios',
                    };
                    if (!permitido) {
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled
                          title={`Acceso restringido para el rol ${rolActual}`}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[#8296D4] text-xs font-medium cursor-not-allowed opacity-70 select-none"
                        >
                          <div className="flex items-center space-x-3">
                            <IconoComponente className="w-4 h-4" />
                            <span>{item.nombre}</span>
                          </div>
                          <Lock className="w-4 h-4 text-[#F2C063]" />
                        </button>
                      );
                    }
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate(routePaths[item.id]);
                          setMenuMovilAbierto(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium cursor-pointer ${
                          esActivo 
                            ? 'bg-[#4040E0] text-white font-bold' 
                            : 'text-[#C9D6FF] hover:bg-[#0F2A55] hover:text-white'
                        }`}
                        >
                        <IconoComponente className="w-4 h-4" />
                        <span>{item.nombre}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-[#0F2A55] bg-[#002060] space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F2C063] text-[#002060] flex items-center justify-center font-bold text-xs">
                    {usuarioActual.nombre_completo.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#C9D6FF]">{usuarioActual.nombre_completo}</p>
                    <span className="text-[10px] text-[#C9D6FF]/60 font-mono block uppercase">{usuarioActual.rol}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    cerrarSesion();
                    navigate('/login');
                  }}
                  className="w-full py-1.5 bg-[#FD6E6E]/15 hover:bg-[#FD6E6E]/25 text-[#FD6E6E] font-bold text-xs rounded border border-[#FD6E6E]/30 flex items-center justify-center space-x-1 transition">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO INTERNO DE PÁGINAS */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {!modulosPermitidos.includes(vistaActiva) && (
            <div className="flex flex-col items-center justify-center h-full min-h-[55vh] text-center px-6">
              <div className="w-20 h-20 rounded-3xl bg-[#002060] flex items-center justify-center shadow-lg mb-6">
                <Lock className="w-10 h-10 text-[#F2C063]" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#002060]">Acceso Restringido</h2>
              <p className="mt-2 text-sm text-[#4A5B85] max-w-md">
                Tu rol <span className="font-bold text-[#4040E0] uppercase">{rolActual}</span> no tiene autorización para entrar a esta sección del sistema.
              </p>
              <p className="mt-1 text-xs text-[#8A97BD]">Si crees que se trata de un error, comunícate con el Pastor de la iglesia.</p>
              <button
                onClick={() => navigate(rolActual === 'tesorero' ? '/economia' : '/dashboard')}
                className="mt-6 flex items-center space-x-2 bg-[#4040E0] hover:bg-[#2F34C4] text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition cursor-pointer"
              >
                <span>{rolActual === 'tesorero' ? 'Ir a Economía' : 'Volver al Dashboard'}</span>
              </button>
            </div>
          )}
          {modulosPermitidos.includes(vistaActiva) && (vistaActiva === 'dashboard' || location.pathname === '/') && <Dashboard />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'miembros' && <MiembrosTab />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'usuarios' && <UsuariosTab />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'ministerios' && <MinisteriosTab />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'grupos' && <GruposTab />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'inventario' && <InventarioTab />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'actividades' && <ActividadesTab />}
          {modulosPermitidos.includes(vistaActiva) && vistaActiva === 'economia' && <EconomiaTab />}
        </main>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppContextoProvider>
      <ContenedorEstructuralSecundario />
    </AppContextoProvider>
  );
}
