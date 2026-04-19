/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import GameBoard from './components/GameBoard';
import NeonMusicPlayer from './components/NeonMusicPlayer';
import { Github } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Alarma Anti-Cierre (BeforeUnload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Si estuviéramos en una SPA real con estado de partida, aquí verificaríamos isPlaying
      // Para este demo, siempre advertimos si el usuario ha interactuado
      e.preventDefault();
      e.returnValue = "¡Cuidado! Si sales ahora perderás tu progreso en la partida.";
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isPlaying]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-black">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(5,5,26,1)_0%,_rgba(0,0,0,1)_100%)]" />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" 
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 5 }}
        className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-neon-pink/10 blur-[150px] rounded-full pointer-events-none" 
      />

      <div className="w-full max-w-5xl space-y-6 z-10">
        <header className="flex flex-col md:flex-row justify-center items-center md:justify-between gap-4 mb-4 text-center md:text-left">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-4xl font-bold italic tracking-tighter neon-text-cyan flex items-center justify-center md:justify-start gap-2">
              <span className="p-1.5 bg-neon-cyan rounded text-black not-italic text-2xl font-black">N</span>
              PONG NEÓN
            </h1>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-medium ml-1 mt-1">
              Arcade System v1.0
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Estabilidad del Sistema</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-4 h-1 bg-neon-cyan/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </header>

        <motion.main
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GameBoard />
        </motion.main>

        <footer className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
          <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
            <span className="hover:text-neon-cyan cursor-help transition-colors">Física Real-Time</span>
            <span className="hover:text-neon-pink cursor-help transition-colors">AI Adaptativa</span>
            <span className="hover:text-white cursor-help transition-colors">60 FPS Ultra</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-medium text-white/20">
            Diseñado para AI Studio • 2026
          </div>
        </footer>
      </div>

      <NeonMusicPlayer />

      {/* Retro CRT Line Pattern */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </div>
  );
}
