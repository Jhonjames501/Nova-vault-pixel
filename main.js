import { GameManager } from './game.js';
import { LANE_COUNT } from './config.js';
import { getLaneX } from './lanes.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new GameManager();

// --- MOTOR DE AUDIO WEB API ---
let audioCtx = null;
let isMuted = false;

function initAudio() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {}
}

function playSound(type) {
    if (isMuted || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'step') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'collect') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(1320, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                let o = audioCtx.createOscillator();
                let g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.type = 'square';
                o.frequency.setValueAtTime(freq, now + idx * 0.1);
                g.gain.setValueAtTime(0.1, now + idx * 0.1);
                g.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
                o.start(now + idx * 0.1);
                o.stop(now + idx * 0.1 + 0.15);
            });
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(40, now + 0.25);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    } catch(e) {}
}

// Controles para 5 carriles (Lane 0 a 4)
function moveLeft() {
    if (game.playerLane > 0) {
        game.playerLane--;
        game.playerTargetX = getLaneX(game.playerLane);
    }
}

function moveRight() {
    if (game.playerLane < LANE_COUNT - 1) {
        game.playerLane++;
        game.playerTargetX = getLaneX(game.playerLane);
    }
}

document.getElementById('btn-left').addEventListener('click', (e) => { e.stopPropagation(); moveLeft(); });
document.getElementById('btn-right').addEventListener('click', (e) => { e.stopPropagation(); moveRight(); });

window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        isMuted = !isMuted;
        return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft();
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight();
});

const screenMenu = document.getElementById('screen-menu');
const screenGameover = document.getElementById('screen-gameover');
const screenWin = document.getElementById('screen-win');
const hudElement = document.getElementById('hud');
const codeDisplayElement = document.getElementById('code-display');
const touchControlsElement = document.getElementById('touch-controls');

document.getElementById('btn-play').addEventListener('click', startGame);
document.getElementById('btn-retry').addEventListener('click', startGame);
document.getElementById('btn-replay').addEventListener('click', startGame);

function startGame() {
    initAudio();
    screenMenu.classList.add('hidden');
    screenGameover.classList.add('hidden');
    screenWin.classList.add('hidden');
    hudElement.classList.remove('hidden');
    codeDisplayElement.classList.remove('hidden');
    touchControlsElement.classList.remove('hidden');

    game.init();
}

function gameOver() {
    hudElement.classList.add('hidden');
    codeDisplayElement.classList.add('hidden');
    touchControlsElement.classList.add('hidden');
    screenGameover.classList.remove('hidden');

    let collectedCount = game.collectedCode.filter(Boolean).length;
    document.getElementById('go-stats').innerHTML = `
        SCORE: ${game.score}<br>
        DISTANCIA: ${Math.floor(game.distance)}m<br>
        CÓDIGO: ${collectedCount}/4 COMPLETADO
    `;
}

function winGame() {
    hudElement.classList.add('hidden');
    codeDisplayElement.classList.add('hidden');
    touchControlsElement.classList.add('hidden');
    screenWin.classList.remove('hidden');

    document.getElementById('win-stats').innerHTML = `
        LOOT +${game.score + 1240}<br>
        TIME: 01:23<br>
        STEALTH RATING: S+
    `;
}

function updateHUDCodeDisplay() {
    for (let i = 0; i < 4; i++) {
        const el = document.getElementById('cd-' + i);
        if (game.collectedCode[i]) {
            el.innerText = game.targetCode[i];
            el.classList.add('collected');
        } else {
            el.innerText = game.targetCode[i];
            el.classList.remove('collected');
        }
    }
}

function updateHUDUI() {
    document.getElementById('hud-lives').innerText = 'LIVES: ' + '❤️'.repeat(Math.max(0, game.lives));
    document.getElementById('hud-score').innerText = 'SCORE: ' + String(game.score).padStart(6, '0');
    document.getElementById('hud-dist').innerText = 'DIST: ' + Math.max(0, Math.floor(game.targetDistance - game.distance)) + 'm';
    updateHUDCodeDisplay();
}

let lastTime = 0;
function mainLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.016;
    lastTime = timestamp;

    game.update(dt, playSound, gameOver, winGame);
    game.render(ctx);
    updateHUDUI();

    requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
