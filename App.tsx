
import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import { HUD, StartMenu, GameOverMenu } from './components/UI';
import { Difficulty, GameStatus } from './types';
import { getGameCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stability, setStability] = useState(100);
  const [commentary, setCommentary] = useState<string>('');

  const handleStart = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setLives(3);
    setStability(100);
    setCommentary('');
    setStatus(GameStatus.PLAYING);
  };

  const handleGameOver = useCallback(async (finalScore: number) => {
    setStatus(GameStatus.GAMEOVER);
    const text = await getGameCommentary(finalScore, difficulty);
    setCommentary(text || '');
  }, [difficulty]);

  const handleRestart = () => {
    setStatus(GameStatus.START);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-['Press_Start_2P'] select-none">
      <GameCanvas 
        difficulty={difficulty}
        status={status}
        onGameOver={handleGameOver}
        onScoreUpdate={setScore}
        onLivesUpdate={setLives}
        onStabilityUpdate={setStability}
      />

      {status === GameStatus.START && (
        <StartMenu onStart={handleStart} />
      )}

      {status === GameStatus.PLAYING && (
        <HUD score={score} lives={lives} difficulty={difficulty} stability={stability} />
      )}

      {status === GameStatus.GAMEOVER && (
        <GameOverMenu 
          score={score} 
          onRestart={handleRestart} 
          commentary={commentary} 
        />
      )}
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.03),transparent)]" />
    </div>
  );
};

export default App;
