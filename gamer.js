import { V_WIDTH, V_HEIGHT, LANE_COUNT, STATE_PLAYING, STATE_FINAL_RUSH, STATE_GAMEOVER, STATE_WIN } from './config.js';
import { getLaneX } from './lanes.js';
import { renderPlayerAdvanced } from './character.js';
import { spawnEntity } from './collectibles.js';

export class GameManager {
    constructor() {
        this.score = 0;
        this.distance = 0;
        this.lives = 3;
        this.targetDistance = 420;
        this.playerLane = 2; // Centro para 5 carriles (0, 1, 2, 3, 4)
        this.playerX = getLaneX(this.playerLane);
        this.playerTargetX = this.playerX;
        this.speed = 4.5;
        this.targetCode = [];
        this.collectedCode = [false, false, false, false];
        this.gameTime = 0;
        this.entities = [];
        this.particleSystem = [];
        this.floatingTexts = [];
        this.gameState = STATE_PLAYING;
        this.spawnTimer = 0;
        this.dashProgress = 0;
        this.hitTimer = 0;
        this.cameraShake = 0;
    }

    init() {
        this.score = 0;
        this.distance = 0;
        this.lives = 3;
        this.playerLane = 2;
        this.playerX = getLaneX(this.playerLane);
        this.playerTargetX = this.playerX;
        this.speed = 5;
        this.entities = [];
        this.particleSystem = [];
        this.floatingTexts = [];
        this.gameTime = 0;
        this.dashProgress = 0;
        this.hitTimer = 0;
        this.cameraShake = 0;
        this.gameState = STATE_PLAYING;

        this.targetCode = [];
        this.collectedCode = [false, false, false, false];
        for(let i=0; i<4; i++) {
            this.targetCode.push(Math.floor(Math.random() * 9) + 1);
        }
    }

    update(dt, playSoundCallback, onGameOver, onWin) {
        if (this.gameState !== STATE_PLAYING && this.gameState !== STATE_FINAL_RUSH) return;

        this.gameTime += dt;
        this.distance += this.speed * 0.1;

        let diffX = this.playerTargetX - this.playerX;
        this.playerX += diffX * 0.25;
        this.dashProgress = diffX * 0.05;

        if (this.hitTimer > 0) this.hitTimer -= dt;
        if (this.cameraShake > 0) this.cameraShake *= 0.85;

        if (this.gameState === STATE_PLAYING) {
            if (this.distance >= this.targetDistance) {
                this.triggerFinalRush(onWin);
            }
        }

        this.spawnTimer += this.speed;
        if (this.spawnTimer > 80) {
            this.spawnTimer = 0;
            spawnEntity(this.gameState, this.targetCode, this.collectedCode, this.entities);
        }

        // Actualizar entidades
        for (let i = this.entities.length - 1; i >= 0; i--) {
            let ent = this.entities[i];
            ent.z -= this.speed;
            
            if (ent.z < 25 && ent.z > 0 && ent.lane === this.playerLane) {
                if (ent.type === 'digit') {
                    this.collectDigit(ent, playSoundCallback);
                    this.entities.splice(i, 1);
                    continue;
                } else if (ent.type === 'obstacle' || ent.type === 'laser') {
                    this.hitObstacle(playSoundCallback, onGameOver);
                    this.entities.splice(i, 1);
                    continue;
                }
            }

            if (ent.z < -20) {
                this.entities.splice(i, 1);
            }
        }

        // Partículas
        for (let i = this.particleSystem.length - 1; i >= 0; i--) {
            let p = this.particleSystem[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.035;
            if (p.life <= 0) this.particleSystem.splice(i, 1);
        }

        // Textos flotantes
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            let ft = this.floatingTexts[i];
            ft.y -= 1.5;
            ft.life -= 0.025;
            if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    collectDigit(ent, playSound) {
        this.collectedCode[ent.digitIndex] = true;
        this.score += 150;
        playSound('collect');
        this.cameraShake = 5;

        for (let i = 0; i < 30; i++) {
            let angle = Math.random() * Math.PI * 2;
            let spd = Math.random() * 6 + 2;
            this.particleSystem.push({
                x: this.playerX, y: V_HEIGHT - 170,
                vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                life: 1.0, color: '#FF8C00', size: Math.random() * 4 + 2
            });
        }

        this.floatingTexts.push({
            text: "+150",
            x: this.playerX,
            y: V_HEIGHT - 200,
            life: 1.0
        });

        if (this.collectedCode.every(c => c)) {
            this.score += 1000;
            playSound('win');
        }
    }

    hitObstacle(playSound, onGameOver) {
        this.lives--;
        this.score = Math.max(0, this.score - 250);
        this.hitTimer = 0.5;
        this.cameraShake = 12;
        playSound('hit');

        for (let i = 0; i < 35; i++) {
            let angle = Math.random() * Math.PI * 2;
            let spd = Math.random() * 6 + 2;
            this.particleSystem.push({
                x: this.playerX, y: V_HEIGHT - 170,
                vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                life: 1.0, color: '#ff3300', size: Math.random() * 4 + 2
            });
        }

        if (this.lives <= 0) {
            onGameOver();
        }
    }

    triggerFinalRush(onWin) {
        this.gameState = STATE_FINAL_RUSH;
        this.targetDistance = 0;
        setTimeout(() => {
            onWin();
        }, 3500);
    }

    render(ctx) {
        ctx.save();

        if (this.cameraShake > 0.5) {
            let shakeX = (Math.random() - 0.5) * this.cameraShake;
            let shakeY = (Math.random() - 0.5) * this.cameraShake;
            ctx.translate(shakeX, shakeY);
        }

        ctx.fillStyle = '#050200';
        ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

        // Túnel con perspectiva de 5 carriles (Imagen 2)
        const horizonY = 190;
        const bottomY = V_HEIGHT;
        const centerX = V_WIDTH / 2;

        ctx.fillStyle = '#080402';
        ctx.fillRect(0, horizonY, V_WIDTH, bottomY - horizonY);

        let pulseFactor = 1 + Math.sin(this.gameTime * 0.2) * 0.1;

        // Dibujar 5 líneas de carril
        for (let i = 0; i < LANE_COUNT; i++) {
            let xTop = centerX + (i - 2) * 18;
            let xBottom = getLaneX(i);

            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = (i === 2) ? 3.5 * pulseFactor : 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FF8C00';
            ctx.beginPath();
            ctx.moveTo(xTop, horizonY);
            ctx.lineTo(xBottom, bottomY);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Renderizar Entidades (Diamantes 9-8-7 con números y obstáculos)
        this.entities.forEach(ent => {
            let scale = 1 / (ent.z * 0.003 + 1);
            if (scale < 0 || scale > 3) return;

            let x = V_WIDTH / 2 + (getLaneX(ent.lane) - V_WIDTH / 2) * scale;
            let y = horizonY + (bottomY - horizonY) * (1 - ent.z / 420);

            if (ent.type === 'digit') {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale, scale);

                ctx.strokeStyle = '#FF8C00';
                ctx.lineWidth = 3;
                ctx.fillStyle = 'rgba(255, 140, 0, 0.4)';
                ctx.shadowBlur = 14;
                ctx.shadowColor = '#FF8C00';
                
                ctx.beginPath();
                ctx.moveTo(0, -25);
                ctx.lineTo(20, 0);
                ctx.lineTo(0, 25);
                ctx.lineTo(-20, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(ent.digitVal, 0, 2);
                ctx.restore();
            } else if (ent.type === 'obstacle') {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale, scale);
                ctx.fillStyle = '#ff3300';
                ctx.fillRect(-22, -18, 44, 18);
                ctx.restore();
            } else if (ent.type === 'laser') {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale, scale);
                ctx.fillStyle = '#ff0055';
                ctx.fillRect(-28, -5, 56, 6);
                ctx.restore();
            }
        });

        // Personaje Táctico Avanzado (Imagen 1)
        renderPlayerAdvanced(ctx, this.playerX, V_HEIGHT - 130, this.gameTime, this.dashProgress, this.hitTimer);

        // Partículas
        this.particleSystem.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Textos flotantes
        this.floatingTexts.forEach(ft => {
            ctx.save();
            ctx.fillStyle = '#FF8C00';
            ctx.font = 'bold 12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.globalAlpha = ft.life;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });

        if (this.gameState === STATE_FINAL_RUSH) {
            ctx.fillStyle = '#0a0502';
            ctx.fillRect(40, 100, V_WIDTH - 80, 300);
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 6;
            ctx.strokeRect(40, 100, V_WIDTH - 80, 300);
            ctx.fillStyle = '#FF8C00';
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText("FINAL RUSH", V_WIDTH/2, 135);
        }

        ctx.restore();
    }
}
