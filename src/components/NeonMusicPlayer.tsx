import { Volume2, VolumeX, Music } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function NeonMusicPlayer() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://cdn.pixabay.com/audio/2024/10/11/audio_3efa64b9e7.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      // Unmuting
      audioRef.current.play().catch(console.error);
      setIsMuted(false);
      setIsPlaying(true);
    } else {
      // Muting
      audioRef.current.pause();
      setIsMuted(true);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying && !isMuted) {
        audioRef.current.play().catch(e => console.log('Autoplay prevented', e));
        setIsPlaying(true);
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      }
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isPlaying, isMuted]);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-20 right-2 rtl:left-2 md:top-auto md:bottom-6 md:left-6 md:right-auto z-50 scale-75 md:scale-100 origin-top-right md:origin-bottom-left"
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
          onClick={toggleMute}
          className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors text-neon-cyan"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </motion.div>
  );
}
