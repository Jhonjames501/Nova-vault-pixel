// Base preparada para Power-Ups futuros (BOOST, MAGNET, SHIELD, x2, SLOW MO - Imagen 3)
export const PowerUpTypes = {
    BOOST: 'boost',
    MAGNET: 'magnet',
    SHIELD: 'shield',
    DOUBLE_SCORE: 'x2',
    SLOW_MO: 'slow_mo'
};

export class PowerUpManager {
    constructor() {
        this.activePowerUps = {};
    }

    applyPowerUp(type) {
        this.activePowerUps[type] = true;
        console.log(`Power-up activado: ${type}`);
    }

    isPowerUpActive(type) {
        return !!this.activePowerUps[type];
    }
}
