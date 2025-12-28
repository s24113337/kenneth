
import React from 'react';
import { Difficulty, GameStatus } from '../types';

interface HUDProps {
  score: number;
  lives: number;
  difficulty: Difficulty;
  stability: number;
}

export const HUD: React.FC<HUDProps> = ({ score, lives, difficulty, stability }) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none p-8 font-['Press_Start_2P']">
      {/* Top Left: Score Box */}
      <div className="absolute top-8 left-8 p-4 bg-black/60 border-2 border-cyan-400 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.3)]">
        <div className="text-cyan-400 text-[10px] mb-2 tracking-tighter uppercase">SCORE</div>
        <div className="text-white text-2xl font-bold tracking-widest">
          {score.toLocaleString().padStart(6, '0')}
        </div>
      </div>

      {/* Top Center: Stability Bar (Arcade-style) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 text-center">
        <div className="text-pink-500 text-[10px] mb-3 tracking-widest animate-pulse font-bold">STABILITY SYSTEM</div>
        <div className="h-6 w-full bg-gray-950 border-2 border-pink-500 p-0.5 rounded shadow-[0_0_10px_rgba(255,0,255,0.2)]">
          <div 
            className={`h-full transition-all duration-300 ${stability < 30 ? 'bg-red-500 shadow-[0_0_15px_#f00]' : 'bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_15px_#f0f]'}`}
            style={{ width: `${stability}%` }}
          />
        </div>
      </div>
      
      {/* Top Right: Lives (Pixel Hearts) */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-3">
        <div className="text-white text-[10px] opacity-70">INTEGRITY</div>
        <div className="flex gap-3 bg-black/40 p-3 rounded-xl border border-white/20 backdrop-blur-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={`text-3xl transition-all duration-500 ${
                i < lives ? 'text-red-500 drop-shadow-[0_0_10px_#f00] scale-100' : 'text-gray-800 scale-75 grayscale'
              }`}
              style={{ fontFamily: 'sans-serif' }}
            >
              ♥
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-8 text-cyan-500/60 text-[8px] uppercase font-bold tracking-widest">
        SYSTEM: {difficulty} MODE // V.3.1.2
      </div>
    </div>
  );
};

export const StartMenu: React.FC<{ onStart: (diff: Difficulty) => void }> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-indigo-950/90 flex flex-col items-center justify-center p-8 z-50 text-center backdrop-blur-xl">
      <div className="relative mb-16 scale-110">
        <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full animate-pulse" />
        <h1 className="text-6xl md:text-8xl text-white font-['Bungee'] tracking-widest neon-text mb-2">
          NEON NIGHT
        </h1>
        <h2 className="text-3xl md:text-5xl text-pink-500 font-['Bungee'] tracking-[0.4em] opacity-90">
          MARKET
        </h2>
      </div>
      
      <div className="bg-black/60 p-10 rounded-3xl border-2 border-white/10 shadow-2xl max-w-xl w-full backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer" />
        
        <p className="text-cyan-100 text-[12px] mb-10 leading-relaxed uppercase tracking-widest opacity-90 font-bold">
          The townsfolk are hungry... for chaos! <br/> Protect the stalls as the market's neon guardian.
        </p>
        
        <div className="grid grid-cols-1 gap-5 w-full">
          {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => onStart(diff)}
              className="group relative overflow-hidden py-5 bg-transparent border-2 border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 font-bold uppercase tracking-widest rounded-2xl text-sm"
            >
              <span className="relative z-10">{diff} SHIFT</span>
              <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-around text-[9px] text-pink-400 font-bold">
          <div className="flex flex-col items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded">ARROWS</span>
            <span className="text-white/40">MOVE</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="px-3 py-1 bg-white/10 rounded">SPACE</span>
            <span className="text-white/40">ENERGY BLAST</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GameOverMenu: React.FC<{ 
  score: number; 
  onRestart: () => void; 
  commentary?: string 
}> = ({ score, onRestart, commentary }) => {
  return (
    <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-8 z-50 text-center animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-6xl text-red-600 font-['Bungee'] drop-shadow-[0_0_30px_#f00] mb-2">
          GAME OVER
        </h1>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      </div>
      
      <div className="text-4xl text-white mb-12 font-['Bungee'] tracking-widest">
        STALL SCORE: <span className="text-cyan-400">{score.toLocaleString()}</span>
      </div>
      
      {commentary && (
        <div className="max-w-md bg-white/5 p-8 rounded-3xl border-2 border-pink-500/20 mb-12 text-cyan-100 text-sm leading-relaxed relative italic">
          <div className="text-[10px] text-pink-500 uppercase mb-4 font-bold tracking-widest not-italic">VENDOR FEEDBACK</div>
          "{commentary}"
          <div className="absolute -bottom-3 -right-3 text-3xl opacity-20 rotate-12">🍜</div>
        </div>
      )}
      
      <button
        onClick={onRestart}
        className="group relative px-20 py-6 bg-cyan-600 text-white hover:bg-cyan-500 transition-all font-bold uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.4)] border-b-4 border-cyan-800 active:border-b-0 active:translate-y-1"
      >
        RESTART SYSTEM
      </button>
    </div>
  );
};
