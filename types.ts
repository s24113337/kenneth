
export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD'
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Entity {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface Player extends Entity {
  speed: number;
  lives: number;
  score: number;
}

export interface Projectile extends Entity {
  velocity: { x: number; y: number };
}

export interface Enemy extends Entity {
  velocity: { x: number; y: number };
  type: 'dumpling' | 'sushi' | 'ramen';
  points: number;
}

export interface PowerUp extends Entity {
  type: 'multishot' | 'speed' | 'heart' | 'shield' | 'rapid';
  duration: number;
}

export interface Particle extends Entity {
  velocity: { x: number; y: number };
  alpha: number;
  life: number;
}

export interface GameConfig {
  enemySpeed: number;
  spawnRate: number;
}
