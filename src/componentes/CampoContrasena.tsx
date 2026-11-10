// COMPONENTE REUTILIZABLE DE CAMPO DE CONTRASEÑA
// Incluye botón para MOSTRAR / OCULTAR la contraseña y medidor de seguridad
// (SEGURA / MEDIA / PELIGROSA) reutilizado en Login y en Usuarios.

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { evaluarContrasena } from '../utilidades/fuerzaContrasena';

interface CampoContrasenaProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  /** Muestra el medidor de seguridad de la contraseña */
  mostrarMedidor?: boolean;
  /** Contenido del icono a la izquierda del campo */
  icono?: React.ReactNode;
  /** Clases extra para el input */
  className?: string;
  /** Texto de la etiqueta de seguridad */
  etiqueta?: string;
}

export const CampoContrasena: React.FC<CampoContrasenaProps> = ({
  value,
  onChange,
  placeholder = 'Ingrese su contraseña',
  required = false,
  disabled = false,
  autoComplete = 'current-password',
  mostrarMedidor = false,
  icono,
  className = '',
  etiqueta,
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const fuerza = evaluarContrasena(value);

  const IconoFuerza = fuerza.nivel === 'segura' ? ShieldCheck : fuerza.nivel === 'media' ? ShieldAlert : AlertTriangle;

  return (
    <div className="w-full">
      <div className="relative">
        {icono && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icono}
          </div>
        )}
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`block w-full ${icono ? 'pl-10' : 'pl-3'} pr-11 py-2.5 bg-white border-2 border-[#CBD3F0] rounded-xl text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4040E0] focus:border-[#4040E0] sm:text-sm ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#4040E0] transition-colors cursor-pointer disabled:opacity-50"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {mostrarMedidor && value.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mt-2 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide"
              style={{ color: fuerza.color }}
            >
              <IconoFuerza className="w-3.5 h-3.5" />
              {etiqueta || fuerza.etiqueta}
            </span>
            <span className="text-[10px] font-mono text-slate-400">{fuerza.puntaje}%</span>
          </div>

          <div className="mt-1 h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: fuerza.fondoBarra }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fuerza.puntaje}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: fuerza.colorBarra }}
            />
          </div>

          {fuerza.recomendaciones.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {fuerza.recomendaciones.map((r) => (
                <li key={r} className="text-[10px] text-slate-500 leading-snug flex items-start gap-1">
                  <span className="text-slate-300">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
};
