import { LANE_COUNT } from './config.js';
import { getLaneX } from './lanes.js';

export function spawnEntity(gameState, targetCode, collectedCode, entities) {
    if (gameState !== 1) return; // STATE_PLAYING

    let lane = Math.floor(Math.random() * LANE_COUNT);
    let missingIndices = [];
    for(let i=0; i<4; i++) if(!collectedCode[i]) missingIndices.push(i);

    if (missingIndices.length > 0 && Math.random() < 0.65) {
        let digitIndex = missingIndices[Math.floor(Math.random() * missingIndices.length)];
        entities.push({
            type: 'digit',
            digitVal: targetCode[digitIndex],
            digitIndex: digitIndex,
            lane: lane,
            z: 420
        });
    } else if (Math.random() < 0.5) {
        entities.push({
            type: 'obstacle',
            lane: lane,
            z: 420
        });
    } else {
        entities.push({
            type: 'laser',
            lane: lane,
            z: 420
        });
    }
}
