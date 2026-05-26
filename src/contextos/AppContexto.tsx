// ESTE ARCHIVO DEFINE EL CONTEXTO GLOBAL DE LA APLICACIÓN CONECTADO AL BACKEND NESTJS
// ADEMÁS PERMITE REALIZAR OPERACIONES CRUD COMPLETAS EN EL SERVIDOR BASADO EN LA BASE DE DATOS CONFIGURADA
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, Miembro, Ministerio, GrupoCrecimiento, Inventario, Actividad } from '../tipos';

interface AppContextoType {
  usuarios: Usuario[];
  miembros: Miembro[];
  ministerios: Ministerio[];
  grupos: GrupoCrecimiento[];
  inventario: Inventario[];
  actividades: Actividad[];
  usuarioActual: Usuario | null;

  // FUNCIONALIDADES DE AUTENTICACIÓN Y SOLICITUDES
  iniciarSesion: (nombre_usuario: string, contrasena: string) => Promise<{ succes: boolean; message: string }>;
  cerrarSesion: () => void;
  solicitarCuenta: (usuario: Omit<Usuario, 'id_usuario' | 'fecha_registro' | 'ultimo_acceso' | 'aprobado'>) => Promise<{ succes: boolean; message: string }>;
  aprobarUsuario: (id_usuario: number) => Promise<void>;
  rechazarUsuario: (id_usuario: number) => Promise<void>;

  // OPERACIONES CRUD DE USUARIOS
  crearUsuario: (usuario: Omit<Usuario, 'id_usuario'>) => Promise<void>;
  actualizarUsuario: (id_usuario: number, datos: Partial<Usuario>) => Promise<void>;
  eliminarUsuario: (id_usuario: number) => Promise<void>;

  // OPERACIONES CRUD DE MIEMBROS
  crearMiembro: (miembro: Omit<Miembro, 'id_miembro'>) => Promise<void>;
  actualizarMiembro: (id_miembro: number, datos: Partial<Miembro>) => Promise<void>;
  eliminarMiembro: (id_miembro: number) => Promise<void>;

  // OPERACIONES CRUD DE MINISTERIOS
  crearMinisterio: (ministerio: Omit<Ministerio, 'id_ministerio'>) => Promise<void>;
  actualizarMinisterio: (id_ministerio: number, datos: Partial<Ministerio>) => Promise<void>;
  eliminarMinisterio: (id_ministerio: number) => Promise<void>;

  // OPERACIONES CRUD DE GRUPOS DE CRECIMIENTO
  crearGrupo: (grupo: Omit<GrupoCrecimiento, 'id_grupo'>) => Promise<void>;
  actualizarGrupo: (id_grupo: number, datos: Partial<GrupoCrecimiento>) => Promise<void>;
  eliminarGrupo: (id_grupo: number) => Promise<void>;

  // OPERACIONES CRUD DE INVENTARIO
  crearInventario: (item: Inventario) => Promise<void>;
  actualizarInventario: (codigo: string, datos: Partial<Inventario>) => Promise<void>;
  eliminarInventario: (codigo: string) => Promise<void>;

  // OPERACIONES CRUD DE ACTIVIDADES
  crearActividad: (actividad: Omit<Actividad, 'id_actividad'>) => Promise<void>;
  actualizarActividad: (id_actividad: number, datos: Partial<Actividad>) => Promise<void>;
  eliminarActividad: (id_actividad: number) => Promise<void>;
}

const AppContexto = createContext<AppContextoType | undefined>(undefined);

export const AppContextoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [grupos, setGrupos] = useState<GrupoCrecimiento[]>([]);
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);

  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(() => {
    const data = localStorage.getItem('filadelfia_v2_usuario_actual');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // CARGAR REGISTROS DINÁMICOS DESDE EL BACKEND AL COMPLETAR AUTENTICACIÓN
  const cargarDatosServidor = async () => {
    try {
      const resMiembros = await fetch('/api/members');
      if (resMiembros.ok) setMiembros(await resMiembros.json());

      const resMin = await fetch('/api/ministries');
      if (resMin.ok) setMinisterios(await resMin.json());

      const resGrupos = await fetch('/api/groups');
      if (resGrupos.ok) setGrupos(await resGrupos.json());

      const resInv = await fetch('/api/inventory');
      if (resInv.ok) setInventario(await resInv.json());

      const resAct = await fetch('/api/activities');
      if (resAct.ok) setActividades(await resAct.json());

      const resUsers = await fetch('/api/users');
      if (resUsers.ok) setUsuarios(await resUsers.json());
    } catch (e) {
      console.error('Error al poblar datos desde el backend:', e);
    }
  };

  useEffect(() => {
    if (usuarioActual) {
      cargarDatosServidor();
      localStorage.setItem('filadelfia_v2_usuario_actual', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('filadelfia_v2_usuario_actual');
    }
  }, [usuarioActual]);

  // FUNCIONES DE REGISTRO E INICIO DE SESIÓN
  const iniciarSesion = async (nombre_usuario: string, contrasena: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, contrasena }),
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUsuarioActual(data.user);
        return { succes: true, message: data.message };
      }
      return { succes: false, message: data.message || 'Error al iniciar sesión' };
    } catch (e) {
      return { succes: false, message: 'Falla al conectar con el servidor backend' };
    }
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
  };

  const solicitarCuenta = async (nuevoUser: Omit<Usuario, 'id_usuario' | 'fecha_registro' | 'ultimo_acceso' | 'aprobado'>) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUser),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh users list immediately
        const resUsers = await fetch('/api/users');
        if (resUsers.ok) setUsuarios(await resUsers.json());
        return { succes: true, message: data.message };
      }
      return { succes: false, message: data.message || 'Error al enviar solicitud' };
    } catch (e) {
      return { succes: false, message: 'Falla al conectar con el servidor para la solicitud' };
    }
  };

  const aprobarUsuario = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}/approve`, { method: 'POST' });
      if (response.ok) {
        const approved = await response.json();
        setUsuarios(prev => prev.map(u => u.id_usuario === id ? approved : u));
      }
    } catch (e) {
      console.error('Error al aprobar usuario:', e);
    }
  };

  const rechazarUsuario = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}/reject`, { method: 'POST' });
      if (response.ok) {
        setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
      }
    } catch (e) {
      console.error('Error al rechazar usuario:', e);
    }
  };

  // CRUD USUARIOS
  const crearUsuario = async (u: Omit<Usuario, 'id_usuario'>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u),
      });
      if (response.ok) {
        const created = await response.json();
        setUsuarios(prev => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarUsuario = async (id: number, datos: Partial<Usuario>) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (response.ok) {
        const updated = await response.json();
        setUsuarios(prev => prev.map(u => u.id_usuario === id ? updated : u));
        if (usuarioActual && usuarioActual.id_usuario === id) {
          setUsuarioActual(updated);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarUsuario = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
        if (usuarioActual && usuarioActual.id_usuario === id) {
          setUsuarioActual(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD MIEMBROs
  const crearMiembro = async (m: Omit<Miembro, 'id_miembro'>) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      });
      if (response.ok) {
        const created = await response.json();
        setMiembros(prev => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarMiembro = async (id: number, datos: Partial<Miembro>) => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (response.ok) {
        const updated = await response.json();
        setMiembros(prev => prev.map(m => m.id_miembro === id ? updated : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarMiembro = async (id: number) => {
    try {
      const response = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMiembros(prev => prev.filter(m => m.id_miembro !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD MINISTERIOS
  const crearMinisterio = async (min: Omit<Ministerio, 'id_ministerio'>) => {
    try {
      const response = await fetch('/api/ministries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(min),
      });
      if (response.ok) {
        const created = await response.json();
        setMinisterios(prev => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarMinisterio = async (id: number, datos: Partial<Ministerio>) => {
    try {
      const response = await fetch(`/api/ministries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (response.ok) {
        const updated = await response.json();
        setMinisterios(prev => prev.map(min => min.id_ministerio === id ? updated : min));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarMinisterio = async (id: number) => {
    try {
      const response = await fetch(`/api/ministries/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMinisterios(prev => prev.filter(min => min.id_ministerio !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD GRUPOS DE CRECIMIENTO
  const crearGrupo = async (g: Omit<GrupoCrecimiento, 'id_grupo'>) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(g),
      });
      if (response.ok) {
        const created = await response.json();
        setGrupos(prev => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarGrupo = async (id: number, datos: Partial<GrupoCrecimiento>) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (response.ok) {
        const updated = await response.json();
        setGrupos(prev => prev.map(g => g.id_grupo === id ? updated : g));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarGrupo = async (id: number) => {
    try {
      const response = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setGrupos(prev => prev.filter(g => g.id_grupo !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD INVENTARIO
  const crearInventario = async (item: Inventario) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        const created = await response.json();
        setInventario(prev => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarInventario = async (codigo: string, datos: Partial<Inventario>) => {
    try {
      const response = await fetch(`/api/inventory/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (response.ok) {
        const updated = await response.json();
        setInventario(prev => prev.map(item => String(item.codigo) === String(codigo) ? updated : item));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarInventario = async (codigo: string) => {
    try {
      const response = await fetch(`/api/inventory/${codigo}`, { method: 'DELETE' });
      if (response.ok) {
        setInventario(prev => prev.filter(item => String(item.codigo) !== String(codigo)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD ACTIVIDADES
  const crearActividad = async (act: Omit<Actividad, 'id_actividad'>) => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(act),
      });
      if (response.ok) {
        const created = await response.json();
        setActividades(prev => [...prev, created]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarActividad = async (id: number, datos: Partial<Actividad>) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (response.ok) {
        const updated = await response.json();
        setActividades(prev => prev.map(act => act.id_actividad === id ? updated : act));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const eliminarActividad = async (id: number) => {
    try {
      const response = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setActividades(prev => prev.filter(act => act.id_actividad !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContexto.Provider value={{
      usuarios,
      miembros,
      ministerios,
      grupos,
      inventario,
      actividades,
      usuarioActual,
      iniciarSesion,
      cerrarSesion,
      solicitarCuenta,
      aprobarUsuario,
      rechazarUsuario,
      crearUsuario,
      actualizarUsuario,
      eliminarUsuario,
      crearMiembro,
      actualizarMiembro,
      eliminarMiembro,
      crearMinisterio,
      actualizarMinisterio,
      eliminarMinisterio,
      crearGrupo,
      actualizarGrupo,
      eliminarGrupo,
      crearInventario,
      actualizarInventario,
      eliminarInventario,
      crearActividad,
      actualizarActividad,
      eliminarActividad
    }}>
      {children}
    </AppContexto.Provider>
  );
};

export const useApp = () => {
  const contexto = useContext(AppContexto);
  if (contexto === undefined) {
    throw new Error('useApp debe de ser utilizado dentro de un AppContextoProvider');
  }
  return contexto;
};
