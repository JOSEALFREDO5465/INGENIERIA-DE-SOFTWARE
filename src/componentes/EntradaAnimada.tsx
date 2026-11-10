import React from 'react';
import { motion } from 'motion/react';

interface EntradaAnimadaProps {
  children: React.ReactNode;
  /** Retardo en segundos para escalonar la entrada de varias tarjetas. */
  delay?: number;
  /** Distancia vertical desde la que entra el bloque. */
  desde?: number;
  /** Activa la elevación y sombra suave al pasar el mouse (tarjetas). */
  hover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Réplica de la animación de las tarjetas de resumen de Economía:
 * aparecen desde abajo con un retardo escalonado y, opcionalmente,
 * se elevan suavemente al pasar el mouse.
 */
export const EntradaAnimada: React.FC<EntradaAnimadaProps> = ({
  children,
  delay = 0,
  desde = 20,
  hover = false,
  className,
  style,
}) => (
  <motion.div
    initial={{ opacity: 0, y: desde }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={hover ? { y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } : undefined}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);
