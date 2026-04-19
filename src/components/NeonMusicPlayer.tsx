import { Volume2, VolumeX, Music } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function NeonMusicPlayer() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <div className="flex items-center gap-3 px-4 py-2 glass-morphism rounded-full neon-shadow-cyan">
        <div className="relative">
          <Music className={cn(
            "w-5 h-5 text-neon-cyan animate-pulse",
            !isPlaying && "animate-none opacity-50"
          )} />
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -inset-1 bg-neon-cyan rounded-full -z-10"
            />
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan leading-tight">
            Now Playing
          </span>
          <span className="text-xs font-medium text-white/80 leading-tight">
            Synthwave Dreams
          </span>
        </div>

        <button
          onClick={() => {
            setIsMuted(!isMuted);
            setIsPlaying(!isMuted ? false : true);
          }}
          className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors text-neon-cyan"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
