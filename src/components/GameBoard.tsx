import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchRanking, saveScore, PongRankingEntry } from '@/src/lib/ranking';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface GameState {
  playerScore: number;
  cpuScore: number;
  status: 'start' | 'playing' | 'gameover';
}

const BALL_RADIUS = 8;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const SPEED_INCREMENT = 0.2;
const CPU_BASE_SPEED = 5;
const WINNING_SCORE = 7;

export default function GameBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    playerScore: 0,
    cpuScore: 0,
    status: 'start'
  });
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('neon_pong_highscore');
    return saved ? parseInt(saved) : 0;
  });

  const [rankingList, setRankingList] = useState<PongRankingEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadRanking = useCallback(async () => {
    const data = await fetchRanking();
    setRankingList(data);
  }, []);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  // Game Ref values for loop
  const p1Y = useRef(0);
  const p2Y = useRef(0);
  const ball = useRef({ x: 0, y: 0, dx: 0, dy: 0 });
  const particles = useRef<Particle[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});

  const resetBall = useCallback((canvas: HTMLCanvasElement, direction: number) => {
    // Escalar la velocidad inicial de la pelota según el ancho de pantalla para que en móviles (pantallas angostas) haya tiempo de reaccionar
    const speedX = Math.max(3, canvas.width * 0.006); 
    ball.current = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: direction * speedX,
      dy: (Math.random() - 0.5) * 8
    };
  }, []);

  const initialized = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      if (!initialized.current) {
        p1Y.current = height / 2 - PADDLE_HEIGHT / 2;
        p2Y.current = height / 2 - PADDLE_HEIGHT / 2;
        resetBall(canvasRef.current, Math.random() > 0.5 ? 1 : -1);
        initialized.current = true;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [resetBall]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const update = () => {
    if (gameStateRef.current.status !== 'playing' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Player Move
    const moveSpeed = Math.max(12, canvas.height * 0.02); // Sensibilidad de teclado mucho más rápida
    if (keys.current['arrowup'] || keys.current['w']) p1Y.current -= moveSpeed;
    if (keys.current['arrowdown'] || keys.current['s']) p1Y.current += moveSpeed;

    // Boundaries Player
    p1Y.current = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, p1Y.current));

    // Bot-Pong Follow Logic (A bit of delay/imperfect tracking)
    const currentCpuSpeed = Math.max(3, canvas.height * 0.008);
    const targetY = ball.current.y - PADDLE_HEIGHT / 2;
    if (p2Y.current < targetY - 10) p2Y.current += currentCpuSpeed;
    else if (p2Y.current > targetY + 10) p2Y.current -= currentCpuSpeed;

    // Boundaries Bot-Pong
    p2Y.current = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, p2Y.current));

    // Ball Move
    ball.current.x += ball.current.dx;
    ball.current.y += ball.current.dy;

    // Wall Collision (Top/Bottom)
    if (ball.current.y < BALL_RADIUS || ball.current.y > canvas.height - BALL_RADIUS) {
      ball.current.dy *= -1;
      createExplosion(ball.current.x, ball.current.y, '#ff00ff');
    }

    // Paddle Collisions
    const checkPaddleCollision = (px: number, py: number, isP1: boolean) => {
      if (
        ball.current.y + BALL_RADIUS > py &&
        ball.current.y - BALL_RADIUS < py + PADDLE_HEIGHT
      ) {
        if (isP1) {
          if (ball.current.x - BALL_RADIUS < px + PADDLE_WIDTH && ball.current.dx < 0) {
            return true;
          }
        } else {
          if (ball.current.x + BALL_RADIUS > px && ball.current.dx > 0) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkPaddleCollision(20, p1Y.current, true)) {
      ball.current.dx = Math.abs(ball.current.dx) * (1 + SPEED_INCREMENT);
      const relativeIntersectY = (p1Y.current + PADDLE_HEIGHT / 2) - ball.current.y;
      const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
      ball.current.dy = normalizedIntersectY * -7;
      createExplosion(ball.current.x, ball.current.y, '#00f3ff');
    }

    if (checkPaddleCollision(canvas.width - 20 - PADDLE_WIDTH, p2Y.current, false)) {
      ball.current.dx = -Math.abs(ball.current.dx) * (1 + SPEED_INCREMENT);
      const relativeIntersectY = (p2Y.current + PADDLE_HEIGHT / 2) - ball.current.y;
      const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
      ball.current.dy = normalizedIntersectY * -7;
      createExplosion(ball.current.x, ball.current.y, '#ff00ff');
    }

    // Scoring
    if (ball.current.x < 0) {
      setGameState(prev => ({ ...prev, cpuScore: prev.cpuScore + 1 }));
      resetBall(canvas, 1);
    } else if (ball.current.x > canvas.width) {
      setGameState(prev => ({ ...prev, playerScore: prev.playerScore + 1 }));
      resetBall(canvas, -1);
    }

    // Particles update
    particles.current = particles.current.filter(p => p.life > 0);
    particles.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        color
      });
    }
  };

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const canvas = canvasRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid help
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i+= 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for(let i = 0; i < canvas.height; i+= 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Particles
    particles.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Paddles
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f3ff';
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(20, p1Y.current, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(canvas.width - 20 - PADDLE_WIDTH, p2Y.current, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw Ball
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }, []);

  const loop = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  useEffect(() => {
    if (gameState.playerScore >= WINNING_SCORE || gameState.cpuScore >= WINNING_SCORE) {
      setGameState(prev => ({ ...prev, status: 'gameover' }));
      if (gameState.playerScore > highScore) {
        setHighScore(gameState.playerScore);
        localStorage.setItem('neon_pong_highscore', gameState.playerScore.toString());
      }
    }
  }, [gameState.playerScore, gameState.cpuScore, highScore]);

  const startGame = () => {
    if (canvasRef.current) resetBall(canvasRef.current, Math.random() > 0.5 ? 1 : -1);
    setGameState({ playerScore: 0, cpuScore: 0, status: 'playing' });
  };

  // Touch Support
  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameStateRef.current.status !== 'playing') return;
    
    let clientY = 0;
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = (e as React.MouseEvent).clientY;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      p1Y.current = clientY - rect.top - PADDLE_HEIGHT / 2;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] bg-cyber-bg/50 rounded-2xl border-2 border-white/10 overflow-hidden"
      onTouchMove={handleTouch}
      onTouchStart={handleTouch}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* UI Overlays */}
      <div className="absolute top-8 left-0 right-0 flex justify-center items-center pointer-events-none">
        <div className="flex items-center gap-12 glass-morphism px-8 py-3 rounded-full border border-white/20">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-neon-cyan font-bold">You</div>
            <div className="text-4xl font-bold neon-text-cyan leading-none">{gameState.playerScore}</div>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest text-neon-pink font-bold">Bot-Pong</div>
            <div className="text-4xl font-bold neon-text-pink leading-none">{gameState.cpuScore}</div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {gameState.status === 'start' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center z-40 backdrop-blur-sm"
          >
            <motion.h1 
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4 neon-text-cyan flex items-center gap-4"
            >
              PONG <span className="text-neon-pink drop-shadow-[0_0_10px_#ff00ff]">NEÓN</span>
            </motion.h1>
            <p className="text-white/60 mb-8 max-w-md uppercase tracking-[0.2em] text-sm">
              Keyboard Arrows / W-S or Touch to Control
            </p>
            <button
              onClick={startGame}
              className="group relative px-10 py-4 bg-transparent border-2 border-neon-cyan text-neon-cyan font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-neon-cyan hover:text-black hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]"
            >
              <div className="relative z-10 flex items-center gap-3">
                <Play className="fill-current" />
                Start Game
              </div>
            </button>
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg w-full max-w-sm max-h-48 overflow-y-auto custom-scrollbar">
              <h3 className="text-neon-cyan uppercase font-bold tracking-widest text-sm flex justify-center items-center gap-2 mb-3">
                <Trophy size={16} /> Global Ranking (SheetDB)
              </h3>
              <div className="flex flex-col gap-2">
                {rankingList.length > 0 ? rankingList.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-white/80 px-4 py-2 bg-black/40 rounded border border-white/5">
                    <span className="font-bold">
                      <span className="text-neon-cyan/50 mr-2">#{idx + 1}</span> 
                      {entry.name}
                    </span>
                    <span className="font-mono font-bold text-neon-pink">{entry.score} pts</span>
                  </div>
                )) : (
                  <div className="text-xs text-white/40">Cargando ranking global...</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {gameState.status === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-40 backdrop-blur-md"
          >
            <h2 className={cn(
              "text-5xl font-black italic mb-2 tracking-tighter",
              gameState.playerScore > gameState.cpuScore ? "text-neon-cyan" : "text-neon-pink"
            )}>
              {gameState.playerScore > gameState.cpuScore ? "YOU DOMINATED!" : "Bot-Pong WINS"}
            </h2>
            <div className="text-8xl font-bold mb-8">
              {gameState.playerScore} - {gameState.cpuScore}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 w-full max-w-md">
              
              {gameState.playerScore > 0 && (
                 <div className="flex flex-col gap-2 w-full">
                   <input
                     type="text"
                     placeholder="TU NOMBRE"
                     maxLength={15}
                     value={playerName}
                     onChange={(e) => setPlayerName(e.target.value)}
                     className="px-4 py-3 bg-white/5 border border-neon-cyan/30 text-white font-bold uppercase tracking-widest text-center rounded-sm outline-none focus:border-neon-cyan"
                   />
                   <button
                     onClick={async () => {
                       if (!playerName.trim()) return;
                       setIsSaving(true);
                       await saveScore(playerName, gameState.playerScore);
                       setIsSaving(false);
                       await loadRanking();
                       setGameState({ ...gameState, status: 'start' });
                     }}
                     disabled={isSaving || !playerName.trim()}
                     className="w-full py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold uppercase tracking-widest hover:bg-neon-cyan/40 disabled:opacity-50 transition-all rounded-sm"
                   >
                     {isSaving ? 'Guardando...' : 'Subir Score Global'}
                   </button>
                 </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button
                  onClick={startGame}
                  className="flex-1 flex justify-center items-center gap-3 px-8 py-3 bg-neon-cyan text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded-sm"
                >
                  <RefreshCw size={20} />
                  Revancha
                </button>
                <button
                  onClick={() => {
                    setGameState({ ...gameState, status: 'start' });
                    setPlayerName('');
                  }}
                  className="flex-1 flex justify-center items-center gap-3 px-8 py-3 border-2 border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm"
                >
                  <RotateCcw size={20} />
                  Menú
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
