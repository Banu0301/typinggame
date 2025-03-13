import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, Zap, Trophy, Gamepad2 } from 'lucide-react';

interface WordBlock {
  id: string;
  word: string;
  x: number;
  y: number;
  speed: number;
  color: string;
}

const WORDS = [
  // Cyberpunk Terms
  'CYBER', 'HACK', 'NEON', 'PULSE', 'GRID', 'BYTE', 'DATA',
  'SYNC', 'FLUX', 'VOID', 'NODE', 'CORE', 'WAVE', 'BEAM',
  // Tech Terms
  'CODE', 'LINK', 'PING', 'PORT', 'BOOT', 'SCAN', 'LOOP',
  'CHIP', 'DISK', 'FILE', 'HOST', 'MESH', 'RAID', 'ROOT',
  // Sci-Fi Terms
  'NANO', 'QUANTUM', 'LASER', 'NEXUS', 'PRIME', 'SOLAR',
  'CYBER', 'MATRIX', 'NEURAL', 'PLASMA', 'VECTOR', 'ZERO',
  // Short Action Words
  'RUN', 'FLY', 'JUMP', 'DASH', 'SLAM', 'RUSH', 'FADE',
  'GLOW', 'BURN', 'RISE', 'FALL', 'SPIN', 'FLIP', 'ZOOM'
];

const COLORS = [
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-green-400 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-red-500'
];

function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [time, setTime] = useState(60);
  const [input, setInput] = useState('');
  const [words, setWords] = useState<WordBlock[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; color: string; angle: number }>>([]);
  const [difficulty, setDifficulty] = useState(1);
  const animationFrameRef = useRef<number>();
  const inputRef = useRef<HTMLInputElement>(null);

  const createWordBlock = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const width = Math.min(window.innerWidth - 20, 500); // Responsive width calculation
    return {
      id: Math.random().toString(36).substr(2, 9),
      word,
      x: Math.random() * (width - 100) + 10, // Ensure words stay within viewport
      y: -50,
      speed: (0.5 + Math.random() * 1.5) * difficulty,
      color
    };
  }, [difficulty]);

  const createParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: 20 }, () => ({
      x,
      y,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      angle: Math.random() * Math.PI * 2
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setParticles(prev => prev.slice(20)), 1000);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTime(60);
    setWords([]);
    setDifficulty(1);
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    if (!gameActive) return;

    const wordInterval = setInterval(() => {
      setWords(prev => [...prev, createWordBlock()]);
    }, 2000 / difficulty);

    const timerInterval = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setGameActive(false);
          clearInterval(wordInterval);
          setHighScore(current => Math.max(current, score));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const difficultyInterval = setInterval(() => {
      setDifficulty(prev => Math.min(prev + 0.1, 2.5));
    }, 10000);

    const animate = () => {
      setWords(prev => 
        prev
          .map(word => ({
            ...word,
            y: word.y + word.speed
          }))
          .filter(word => word.y < window.innerHeight)
      );
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(wordInterval);
      clearInterval(timerInterval);
      clearInterval(difficultyInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, createWordBlock, difficulty, score]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInput(value);

    const matchedWord = words.find(w => w.word === value);
    if (matchedWord) {
      createParticles(matchedWord.x, matchedWord.y);
      setWords(prev => prev.filter(w => w.id !== matchedWord.id));
      setScore(prev => prev + matchedWord.word.length * 100);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDY2LCA4NCwgMjU1LCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      {/* Game UI */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-50 border-b border-cyan-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Zap className="animate-pulse" />
              <span className="text-xl md:text-2xl font-bold">{score}</span>
            </div>
            <div className="flex items-center space-x-2 text-amber-400">
              <Trophy />
              <span className="text-xl md:text-2xl font-bold">{highScore}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-2 text-purple-400">
              <Gamepad2 />
              <span className="text-xl font-bold">Level {Math.floor(difficulty)}</span>
            </div>
            <div className="flex items-center space-x-2 text-rose-400">
              <Timer />
              <span className="text-xl md:text-2xl font-bold">{time}</span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative h-[calc(100vh-8rem)]">
          {!gameActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 text-center">
                CYBER TYPER
              </h1>
              <div className="text-center mb-8">
                <p className="text-xl text-cyan-400 mb-2">High Score: {highScore}</p>
                <p className="text-gray-400">Type the falling words before they reach the bottom!</p>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all"
              >
                START GAME
              </button>
            </div>
          )}

          {/* Word Blocks */}
          {words.map(word => (
            <div
              key={word.id}
              className={`absolute px-4 py-2 bg-gradient-to-r ${word.color} rounded shadow-lg transform hover:scale-105 transition-all`}
              style={{ left: word.x, top: word.y }}
            >
              {word.word}
            </div>
          ))}

          {/* Particles */}
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                backgroundColor: particle.color,
                transform: `rotate(${particle.angle}rad)`,
                transition: 'all 1s linear'
              }}
            />
          ))}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            disabled={!gameActive}
            className="w-full px-6 py-4 text-lg md:text-xl bg-gray-800 border-2 border-cyan-500 rounded-lg focus:outline-none focus:border-cyan-400 text-center uppercase tracking-wider"
            placeholder={gameActive ? "TYPE TO DESTROY" : "GAME OVER"}
          />
        </div>
      </div>
    </div>
  );
}

export default App;