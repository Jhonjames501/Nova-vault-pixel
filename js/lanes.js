import { V_WIDTH, LANE_COUNT } from './config.js';

export function getLaneX(lane) {
    const centerX = V_WIDTH / 2;
    const spacing = 48; // Espaciado optimizado para 5 carriles
    // lane 0, 1, 2, 3, 4 -> offset -2, -1, 0, 1, 2
    return centerX + (lane - 2) * spacing;
}
