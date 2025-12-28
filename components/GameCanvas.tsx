
import React, { useRef, useEffect, useCallback } from 'react';
import { 
  Player, Projectile, Enemy, PowerUp, Particle, 
  Difficulty, GameStatus 
} from '../types';
import { 
  COLORS, PLAYER_RADIUS, PROJECTILE_RADIUS, PROJECTILE_SPEED, 
  ENEMY_RADIUS, POWERUP_RADIUS, DIFFICULTY_CONFIG 
} from '../constants';

interface GameCanvasProps {
  difficulty: Difficulty;
  status: GameStatus;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onStabilityUpdate: (stability: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  difficulty, status, onGameOver, onScoreUpdate, onLivesUpdate, onStabilityUpdate 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const state = useRef({
    player: { x: 0, y: 0, radius: PLAYER_RADIUS, color: COLORS.PLAYER, speed: 7.5, lives: 3, score: 0 } as Player,
    projectiles: [] as Projectile[],
    enemies: [] as Enemy[],
    powerups: [] as PowerUp[],
    particles: [] as Particle[],
    keys: { up: false, down: false, left: false, right: false, space: false },
    lastShot: 0,
    shotCooldown: 160,
    stability: 100,
    spawnTimer: 0,
    powerupActive: { multishot: 0, speed: 0, shield: 0, rapid: 0 },
    screenShake: 0,
    marketAssets: [] as { x: number, y: number, type: string, color: string, size: number, flip: boolean, label: string }[],
    townsfolk: [] as { x: number, y: number, color: string, bounceOffset: number }[],
    frameCount: 0
  });

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    state.current.player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: PLAYER_RADIUS,
      color: COLORS.PLAYER,
      speed: 7.5,
      lives: 3,
      score: 0
    };
    state.current.enemies = [];
    state.current.projectiles = [];
    state.current.powerups = [];
    state.current.particles = [];
    state.current.powerupActive = { multishot: 0, speed: 0, shield: 0, rapid: 0 };
    state.current.stability = 100;
    
    // Generate Night Market Scenery
    state.current.marketAssets = [];
    state.current.townsfolk = [];
    
    const stallNames = ['TAKOYAKI', 'RAMEN', 'SUSHI', 'BOBA', 'GYOZA', 'MOCHI', 'BAO'];
    
    // Side Stalls (Rows of shops)
    for (let i = 0; i < 12; i++) {
      const isLeft = i % 2 === 0;
      state.current.marketAssets.push({
        x: isLeft ? 70 : canvas.width - 70,
        y: Math.floor(i / 2) * 220 + 100,
        type: 'stall',
        color: [COLORS.NEON_PINK, COLORS.NEON_CYAN, '#ffff00', '#00ff00'][i % 4],
        size: 90,
        flip: isLeft,
        label: stallNames[i % stallNames.length]
      });
    }

    // Townsfolk (Static NPCs in background)
    for (let i = 0; i < 30; i++) {
      state.current.townsfolk.push({
        x: Math.random() < 0.5 ? Math.random() * 120 : canvas.width - Math.random() * 120,
        y: Math.random() * (canvas.height + 400),
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
        bounceOffset: Math.random() * Math.PI * 2
      });
    }

    // Strings of lanterns
    for (let i = 0; i < 25; i++) {
      state.current.marketAssets.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        type: 'lantern',
        color: COLORS.LANTERN,
        size: 14,
        flip: false,
        label: ''
      });
    }

    onScoreUpdate(0);
    onLivesUpdate(3);
    onStabilityUpdate(100);
  }, [onScoreUpdate, onLivesUpdate, onStabilityUpdate]);

  const createExplosion = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      state.current.particles.push({
        x, y,
        radius: Math.random() * 4 + 2,
        color,
        velocity: {
          x: (Math.random() - 0.5) * 16,
          y: (Math.random() - 0.5) * 16
        },
        life: 1,
        alpha: 1
      });
    }
  };

  const update = useCallback(() => {
    const s = state.current;
    const canvas = canvasRef.current;
    if (!canvas || status !== GameStatus.PLAYING) return;

    s.frameCount++;
    s.stability -= 0.025; 
    if (s.stability <= 0) {
      onGameOver(s.player.score);
      return;
    }
    onStabilityUpdate(Math.max(0, s.stability));

    // Player Movement (Arrow Keys)
    let currentSpeed = s.player.speed;
    if (s.powerupActive.speed > 0) {
      currentSpeed *= 1.6;
      s.powerupActive.speed--;
    }

    if (s.keys.up && s.player.y > s.player.radius) s.player.y -= currentSpeed;
    if (s.keys.down && s.player.y < canvas.height - s.player.radius) s.player.y += currentSpeed;
    if (s.keys.left && s.player.x > s.player.radius) s.player.x -= currentSpeed;
    if (s.keys.right && s.player.x < canvas.width - s.player.radius) s.player.x += currentSpeed;

    // Shooting
    const now = Date.now();
    const effectiveCooldown = s.powerupActive.rapid > 0 ? s.shotCooldown / 3 : s.shotCooldown;
    if (s.powerupActive.rapid > 0) s.powerupActive.rapid--;
    
    if (s.keys.space && now - s.lastShot > effectiveCooldown) {
      const createProj = (angle: number) => {
        s.projectiles.push({
          x: s.player.x,
          y: s.player.y,
          radius: PROJECTILE_RADIUS,
          color: COLORS.PROJECTILE,
          velocity: { x: Math.cos(angle) * PROJECTILE_SPEED, y: Math.sin(angle) * PROJECTILE_SPEED }
        });
      };

      if (s.powerupActive.multishot > 0) {
        createProj(-Math.PI / 2); createProj(-Math.PI / 2.5); createProj(-Math.PI / 1.6);
        s.powerupActive.multishot--;
      } else {
        createProj(-Math.PI / 2);
      }
      s.lastShot = now;
      s.screenShake = 2;
    }

    // Spawn Pursuit Enemies (Expressive Townsfolk style food)
    s.spawnTimer += 16;
    if (s.spawnTimer > DIFFICULTY_CONFIG[difficulty].spawnRate) {
      const margin = 120;
      let ex, ey;
      const side = Math.floor(Math.random() * 4);
      if (side === 0) { ex = Math.random() * canvas.width; ey = -margin; }
      else if (side === 1) { ex = canvas.width + margin; ey = Math.random() * canvas.height; }
      else if (side === 2) { ex = Math.random() * canvas.width; ey = canvas.height + margin; }
      else { ex = -margin; ey = Math.random() * canvas.height; }
      
      const types: Enemy['type'][] = ['dumpling', 'sushi', 'ramen'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      s.enemies.push({
        x: ex, y: ey,
        radius: ENEMY_RADIUS,
        color: type === 'dumpling' ? COLORS.ENEMY_DUMPLING : (type === 'sushi' ? COLORS.ENEMY_SUSHI : COLORS.ENEMY_RAMEN),
        type,
        points: type === 'ramen' ? 150 : 75,
        velocity: { x: 0, y: 0 } 
      });
      s.spawnTimer = 0;
    }

    if (s.screenShake > 0) s.screenShake *= 0.85;
    if (s.powerupActive.shield > 0) s.powerupActive.shield--;

    // Update Projectiles
    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      const p = s.projectiles[i];
      p.x += p.velocity.x; p.y += p.velocity.y;
      if (p.x < -100 || p.x > canvas.width + 100 || p.y < -100 || p.y > canvas.height + 100) {
        s.projectiles.splice(i, 1);
      }
    }

    // Update Enemies (Pursuit)
    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const e = s.enemies[i];
      const angle = Math.atan2(s.player.y - e.y, s.player.x - e.x);
      const speed = DIFFICULTY_CONFIG[difficulty].enemySpeed;
      e.x += Math.cos(angle) * speed; e.y += Math.sin(angle) * speed;

      const dist = Math.hypot(s.player.x - e.x, s.player.y - e.y);
      if (dist < s.player.radius + e.radius) {
        s.enemies.splice(i, 1);
        if (s.powerupActive.shield <= 0) {
          s.player.lives -= 1;
          s.stability -= 15;
          onLivesUpdate(s.player.lives);
          s.screenShake = 15;
          createExplosion(e.x, e.y, e.color, 15);
          if (s.player.lives <= 0) {
            onGameOver(s.player.score); return;
          }
        } else {
          createExplosion(e.x, e.y, COLORS.POWERUP_SHIELD, 15);
        }
        continue;
      }

      for (let j = s.projectiles.length - 1; j >= 0; j--) {
        const p = s.projectiles[j];
        if (Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
          s.player.score += e.points;
          onScoreUpdate(s.player.score);
          s.stability = Math.min(100, s.stability + 1.2);
          createExplosion(e.x, e.y, e.color, 20);
          s.enemies.splice(i, 1);
          s.projectiles.splice(j, 1);

          if (Math.random() < 0.2) {
            const types: PowerUp['type'][] = ['multishot', 'speed', 'heart', 'shield', 'rapid'];
            const type = types[Math.floor(Math.random() * types.length)];
            s.powerups.push({
              x: e.x, y: e.y, radius: POWERUP_RADIUS, type, duration: 400,
              color: type === 'multishot' ? COLORS.POWERUP_MULTI : 
                     (type === 'speed' ? COLORS.POWERUP_SPEED : 
                     (type === 'heart' ? COLORS.POWERUP_HEART : 
                     (type === 'shield' ? COLORS.POWERUP_SHIELD : COLORS.POWERUP_RAPID)))
            });
          }
          break;
        }
      }
    }

    // Update Powerups
    for (let i = s.powerups.length - 1; i >= 0; i--) {
      const pu = s.powerups[i];
      const dist = Math.hypot(s.player.x - pu.x, s.player.y - pu.y);
      if (dist < s.player.radius + pu.radius) {
        if (pu.type === 'heart') {
          s.player.lives = Math.min(5, s.player.lives + 1);
          onLivesUpdate(s.player.lives);
        } else if (pu.type === 'multishot') s.powerupActive.multishot += 100;
        else if (pu.type === 'speed') s.powerupActive.speed += 600;
        else if (pu.type === 'shield') s.powerupActive.shield += 800;
        else if (pu.type === 'rapid') s.powerupActive.rapid += 600;
        createExplosion(pu.x, pu.y, pu.color, 25);
        s.powerups.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.velocity.x; p.y += p.velocity.y;
      p.alpha -= 0.035;
      if (p.alpha <= 0) s.particles.splice(i, 1);
    }
  }, [difficulty, status, onGameOver, onScoreUpdate, onLivesUpdate, onStabilityUpdate]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const s = state.current;
    ctx.save();
    if (s.screenShake > 0.1) ctx.translate((Math.random()-0.5)*s.screenShake, (Math.random()-0.5)*s.screenShake);

    // Deep Indigo Night Sky Background
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic Floor Reflections (Wet pavement look)
    const reflectionGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    reflectionGrad.addColorStop(0, '#0c0c24');
    reflectionGrad.addColorStop(1, '#1a1a3a');
    ctx.fillStyle = reflectionGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background Grid lines
    ctx.strokeStyle = '#222244';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=80) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=80) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

    // Draw Market Stalls
    s.marketAssets.forEach(a => {
      if (a.type === 'stall') {
        ctx.save();
        ctx.shadowBlur = 20; ctx.shadowColor = a.color;
        
        // Counter / Base
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(a.x - a.size/2, a.y, a.size, a.size/2);
        
        // Striped Awning
        const awningHeight = 40;
        const stripes = 5;
        const stripeWidth = a.size / stripes;
        for (let j = 0; j < stripes; j++) {
          ctx.fillStyle = j % 2 === 0 ? a.color : '#ffffff';
          ctx.fillRect(a.x - a.size/2 + j * stripeWidth, a.y - awningHeight, stripeWidth, awningHeight);
        }
        
        // Neon Sign
        ctx.fillStyle = '#000';
        ctx.fillRect(a.x - a.size/2 + 5, a.y - 65, a.size - 10, 20);
        ctx.strokeStyle = a.color; ctx.lineWidth = 2;
        ctx.strokeRect(a.x - a.size/2 + 5, a.y - 65, a.size - 10, 20);
        
        ctx.fillStyle = a.color;
        ctx.font = 'bold 8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(a.label, a.x, a.y - 50);
        
        // Glowing items on shelf
        ctx.fillStyle = a.color;
        for(let k=0; k<3; k++) {
          ctx.beginPath(); ctx.arc(a.x - 20 + k*20, a.y + 15, 6, 0, Math.PI*2); ctx.fill();
        }
        
        ctx.restore();
      } else if (a.type === 'lantern') {
        const sway = Math.sin(s.frameCount * 0.04 + a.x) * 8;
        ctx.save();
        ctx.shadowBlur = 15; ctx.shadowColor = a.color;
        ctx.fillStyle = a.color;
        // Lantern Body
        ctx.beginPath(); 
        ctx.ellipse(a.x + sway, a.y, a.size, a.size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Top cap
        ctx.fillStyle = '#111';
        ctx.fillRect(a.x + sway - 6, a.y - a.size*1.3 - 2, 12, 4);
        ctx.restore();
      }
    });

    // Draw Townsfolk NPCs
    s.townsfolk.forEach(t => {
      const bounce = Math.sin(s.frameCount * 0.1 + t.bounceOffset) * 4;
      ctx.fillStyle = t.color;
      // Head
      ctx.beginPath(); ctx.arc(t.x, t.y + bounce - 10, 8, 0, Math.PI*2); ctx.fill();
      // Body
      ctx.fillRect(t.x - 10, t.y + bounce - 2, 20, 15);
      // Face
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(t.x - 3, t.y + bounce - 10, 1.5, 0, Math.PI*2); ctx.arc(t.x + 3, t.y + bounce - 10, 1.5, 0, Math.PI*2); ctx.fill();
    });

    // Projectiles
    s.projectiles.forEach(p => {
      ctx.fillStyle = p.color; ctx.shadowBlur = 20; ctx.shadowColor = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
    });

    // Enemies (Cute expressive food)
    s.enemies.forEach(e => {
      ctx.shadowBlur = 15; ctx.shadowColor = e.color;
      ctx.fillStyle = e.color;
      const wobble = Math.sin(s.frameCount * 0.2 + e.x) * 2;
      const bounce = Math.sin(s.frameCount * 0.15 + e.y) * 3;
      
      if (e.type === 'dumpling') {
        ctx.beginPath(); ctx.arc(e.x + wobble, e.y + bounce, e.radius, Math.PI, 0);
        ctx.lineTo(e.x + e.radius + wobble, e.y + e.radius + bounce);
        ctx.lineTo(e.x - e.radius + wobble, e.y + e.radius + bounce);
        ctx.closePath(); ctx.fill();
      } else if (e.type === 'sushi') {
        ctx.roundRect(e.x - e.radius + wobble, e.y - e.radius/2 + bounce, e.radius*2, e.radius, 8);
        ctx.fill();
        ctx.fillStyle = '#111'; ctx.fillRect(e.x - e.radius/2 + wobble, e.y - e.radius/2 + bounce, e.radius, e.radius/2);
      } else {
        ctx.beginPath(); ctx.arc(e.x + wobble, e.y + bounce, e.radius, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(e.x - e.radius + 4 + wobble, e.y - 4 + bounce, e.radius*2 - 8, 3);
      }
      
      // Eyes (Meet the townsfolk expressive style)
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(e.x - 7 + wobble, e.y + bounce, 3, 0, Math.PI*2); ctx.arc(e.x + 7 + wobble, e.y + bounce, 3, 0, Math.PI*2); ctx.fill();
      // Blushes
      ctx.fillStyle = '#ff99aa'; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(e.x - 14 + wobble, e.y + 4 + bounce, 3, 0, Math.PI*2); ctx.arc(e.x + 14 + wobble, e.y + 4 + bounce, 3, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Powerups
    s.powerups.forEach(pu => {
      const pulse = 1 + Math.sin(s.frameCount * 0.1) * 0.15;
      ctx.strokeStyle = pu.color; ctx.lineWidth = 4; ctx.shadowBlur = 25; ctx.shadowColor = pu.color;
      ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * pulse, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
      const label = pu.type === 'heart' ? '♥' : (pu.type === 'shield' ? '◆' : (pu.type === 'speed' ? '⚡' : pu.type[0].toUpperCase()));
      ctx.fillText(label, pu.x, pu.y + 8);
    });

    // Player (Guardian Cat Guardian)
    if (s.powerupActive.shield > 0) {
      ctx.strokeStyle = COLORS.POWERUP_SHIELD; ctx.lineWidth = 5; ctx.shadowBlur = 25; ctx.shadowColor = COLORS.POWERUP_SHIELD;
      ctx.beginPath(); ctx.arc(s.player.x, s.player.y, s.player.radius + 15, 0, Math.PI*2); ctx.stroke();
    }
    
    ctx.save();
    ctx.shadowBlur = 25; ctx.shadowColor = s.player.color; ctx.fillStyle = s.player.color;
    // Cat ears
    ctx.beginPath();
    ctx.moveTo(s.player.x - 14, s.player.y - 14); ctx.lineTo(s.player.x - 22, s.player.y - 32); ctx.lineTo(s.player.x - 4, s.player.y - 14);
    ctx.moveTo(s.player.x + 14, s.player.y - 14); ctx.lineTo(s.player.x + 22, s.player.y - 32); ctx.lineTo(s.player.x + 4, s.player.y - 14);
    ctx.fill();
    // Head
    ctx.beginPath(); ctx.arc(s.player.x, s.player.y, s.player.radius, 0, Math.PI*2); ctx.fill();
    // Visor
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(s.player.x - 18, s.player.y - 10, 36, 12);
    ctx.fillStyle = '#ff00ff'; ctx.fillRect(s.player.x - 16, s.player.y - 8, 32, 2);
    // Core glow
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.player.x, s.player.y + 8, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Particles
    s.particles.forEach(p => { 
      ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; 
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill(); 
    });

    // Scanlines Overlay
    ctx.restore();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#000';
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.fillRect(0, i, canvas.width, 1);
    }
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    const loop = () => { update(); draw(); requestRef.current = requestAnimationFrame(loop); };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update, draw]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      const key = e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) e.preventDefault();
      if (key === 'ArrowUp') state.current.keys.up = isDown;
      if (key === 'ArrowDown') state.current.keys.down = isDown;
      if (key === 'ArrowLeft') state.current.keys.left = isDown;
      if (key === 'ArrowRight') state.current.keys.right = isDown;
      if (key === ' ' || e.code === 'Space') state.current.keys.space = isDown;
    };
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));
    return () => { 
      window.removeEventListener('keydown', (e) => handleKey(e, true)); 
      window.removeEventListener('keyup', (e) => handleKey(e, false)); 
    };
  }, []);

  useEffect(() => {
    const resize = () => { if (canvasRef.current) { canvasRef.current.width = window.innerWidth; canvasRef.current.height = window.innerHeight; } };
    window.addEventListener('resize', resize); resize();
    if (status === GameStatus.PLAYING) initGame();
    return () => window.removeEventListener('resize', resize);
  }, [status, initGame]);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-none" />;
};

export default GameCanvas;
