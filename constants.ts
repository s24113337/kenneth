
import { Difficulty, GameConfig } from './types';

export const COLORS = {
  PLAYER: '#00ffff',
  PLAYER_CORE: '#ffffff',
  PROJECTILE: '#ffff00',
  ENEMY_DUMPLING: '#fff9c4',
  ENEMY_SUSHI: '#ff5252',
  ENEMY_RAMEN: '#ffa726',
  POWERUP_MULTI: '#ff00ff',
  POWERUP_SPEED: '#00ffff',
  POWERUP_HEART: '#ff2d55',
  POWERUP_SHIELD: '#3d5afe',
  POWERUP_RAPID: '#ffd600',
  BACKGROUND: '#0c0c1e', // Deeper arcade indigo
  NEON_PINK: '#ff00ff',
  NEON_CYAN: '#00ffff',
  STALL_ROOF: '#331a4d',
  LANTERN: '#ff4d4d'
};

export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  [Difficulty.EASY]: {
    enemySpeed: 1.2,
    spawnRate: 1400
  },
  [Difficulty.NORMAL]: {
    enemySpeed: 2.0,
    spawnRate: 900
  },
  [Difficulty.HARD]: {
    enemySpeed: 2.8,
    spawnRate: 600
  }
};

export const PLAYER_RADIUS = 22;
export const PROJECTILE_RADIUS = 6;
export const PROJECTILE_SPEED = 10;
export const ENEMY_RADIUS = 26;
export const POWERUP_RADIUS = 20;
