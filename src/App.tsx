// ESTE ENTRADA PRINCIPAL INTEGRA EL PROVINCIONAMIENTO GLOBAL DE APPLICACIÓN

import React, { useState } from 'react';
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
import { Church, LayoutDashboard, Users, ShieldCheck, FolderGit2, Network, Boxes, Calendar, LogOut, ChevronRight, Menu, X, Settings, Bell, Search} from 'lucide-react';

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
    if (pathname === '/usuarios') return 'usuarios';
    return 'dashboard';
  };
  
  const vistaActiva = getVistaActivaFromPath();
  
  // SI NO HAY USUARIO EN SESIÓN, OBLIGATORIO MOSTRAR LA INTERFAZ DE LOGIN
  if (!usuarioActual) {
    return <Login />;
  }

  // LISTADO DE MÓDULOS DE NAVEGACIÓN EN ESPAÑOL REQUERIDOS
  const modulosNavegacion = [
    { id: 'dashboard', nombre: 'Dashboard', icono: LayoutDashboard },
    { id: 'miembros', nombre: 'Miembros', icono: Users },
    { id: 'ministerios', nombre: 'Ministerios', icono: FolderGit2 },
    { id: 'grupos', nombre: 'Grupos de Crecimiento', icono: Network },
    { id: 'inventario', nombre: 'Inventario', icono: Boxes },
    { id: 'actividades', nombre: 'Actividades', icono: Calendar },
    { id: 'usuarios', nombre: 'Solicitudes', icono: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col md:flex-row font-sans text-slate-800">
      {/* BARRA LATERAL (SIDEBAR DE NAVEGACIÓN) - VISIBLE EN ESCRITORIO */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white text-slate-800 h-screen sticky top-0 border-r border-slate-200 flex-shrink-0">
        {/* MARCA Y LOGO DE LA IGLESIA FILADELFIA (ESTILO ROYAL BLUE MATERIALLY) */}
        <div className="p-6 border-b border-indigo-800 flex items-center space-x-3 bg-[#1565c0]">
          <img src="/src/img/logo.png" alt="Logo Iglesia" className="w-13 h-13 object-contain"/>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white uppercase font-sans">C.E.Filadelfia</h1>
            <span className="text-[9px] text-blue-100 font-mono uppercase tracking-widest font-semibold block">Iglesia con propósito</span>
          </div>
        </div>

        {/* LISTADO DE MENÚ OPERATIVO */}
        <div className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2">Menu principal</div>
        <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto">
          {modulosNavegacion.map((item) => {
            const IconoComponente = item.icono;
            const esActivo = vistaActiva === item.id;
            const routePaths: { [key: string]: string } = {
              'dashboard': '/dashboard',
              'miembros': '/miembros',
              'ministerios': '/ministerios',
              'grupos': '/grupos',
              'inventario': '/inventario',
              'actividades': '/actividades',
              'usuarios': '/usuarios',
            };
            return (
              <button
                key={item.id}
                onClick={() => navigate(routePaths[item.id])}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded transition text-xs font-medium cursor-pointer ${
                  esActivo 
                    ? 'bg-[#f1f4f9] text-[#1565c0] border-l-4 border-[#1565c0] font-bold !rounded-l-none' 
                    : 'text-slate-600 hover:bg-[#f8f9fa] hover:text-[#1565c0]'
                }`}>
                <div className="flex items-center space-x-2.5">
                  <IconoComponente className="w-4 h-4" />
                  <span>{item.nombre}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* CONSOLA PERFIL DE COLABORADOR REGISTRADO */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center space-x-3">
            {/* ICONO DEL USUARIO CON INICIAL DEL NOMBRE */}
            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1565c0] font-extrabold flex items-center justify-center text-xs border border-blue-200">
              {usuarioActual.nombre_completo.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 truncate leading-tight">{usuarioActual.nombre_completo}</p>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block font-bold leading-none mt-1">{usuarioActual.rol}</span>
            </div>
          </div>

          <button
            onClick={() => {
              cerrarSesion();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] rounded transition shadow-sm cursor-pointer border border-red-100">
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>
      {/* RECEPTÁCULO PRINCIPAL DE CUERPO */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#f4f7fa]">
        {/* CABECERA SUPERIOR PARA MÓVILES (ESTILO MATERIALLY) */}
        <header className="bg-[#1565c0] text-white px-4 py-3 flex items-center justify-between shadow-sm md:hidden relative z-20">
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
              className="w-64 bg-white text-slate-800 min-h-screen flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}>
              <div>
                <div className="p-6 border-b border-indigo-800 flex items-center justify-between bg-[#1565c0] text-white">
                  <div className="flex items-center space-x-3">
                    <Church className="w-5 h-5 text-white" />
                    <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">Menú Filadelfia</h2>
                  </div>
                  <button onClick={() => setMenuMovilAbierto(false)} className="text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Navegación
                </div>
                <nav className="px-4 py-1 space-y-1">
                  {modulosNavegacion.map((item) => {
                    const IconoComponente = item.icono;
                    const esActivo = vistaActiva === item.id;
                    const routePaths: { [key: string]: string } = {
                      'dashboard': '/dashboard',
                      'miembros': '/miembros',
                      'ministerios': '/ministerios',
                      'grupos': '/grupos',
                      'inventario': '/inventario',
                      'actividades': '/actividades',
                      'usuarios': '/usuarios',
                    };
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(routePaths[item.id]);
                          setMenuMovilAbierto(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded text-xs font-medium cursor-pointer ${
                          esActivo 
                            ? 'bg-[#f1f4f9] text-[#1565c0] border-l-4 border-[#1565c0] font-bold !rounded-l-none' 
                            : 'text-slate-600 hover:bg-[#f8f9fa]'
                        }`}>
                        <IconoComponente className="w-4 h-4" />
                        <span>{item.nombre}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1565c0] flex items-center justify-center font-bold text-xs">
                    {usuarioActual.nombre_completo.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{usuarioActual.nombre_completo}</p>
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">{usuarioActual.rol}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    cerrarSesion();
                    navigate('/login');
                  }}
                  className="w-full py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded border border-red-100 flex items-center justify-center space-x-1">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO INTERNO DE PÁGINAS */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {(vistaActiva === 'dashboard' || location.pathname === '/') && <Dashboard />}
          {vistaActiva === 'miembros' && <MiembrosTab />}
          {vistaActiva === 'usuarios' && <UsuariosTab />}
          {vistaActiva === 'ministerios' && <MinisteriosTab />}
          {vistaActiva === 'grupos' && <GruposTab />}
          {vistaActiva === 'inventario' && <InventarioTab />}
          {vistaActiva === 'actividades' && <ActividadesTab />}
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
