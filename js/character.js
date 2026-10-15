export function renderPlayerAdvanced(ctx, playerX, py, gameTime, dashProgress, hitTimer) {
    ctx.save();
    ctx.translate(playerX, py);
    
    ctx.rotate(dashProgress * 0.15);

    if (Math.abs(dashProgress) > 0.4) {
        ctx.fillStyle = 'rgba(255, 140, 0, 0.5)';
        ctx.fillRect(-35 - dashProgress * 12, -20, 30, 55);
    }

    // Sombra en el suelo
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 48, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (hitTimer > 0 && Math.floor(gameTime * 25) % 2 === 0) {
        ctx.fillStyle = '#ff3300';
    } else {
        ctx.fillStyle = '#111111';
    }

    let legCycle = Math.sin(gameTime * 16);
    let armCycle = Math.cos(gameTime * 16);

    // Torso / Chaqueta táctica mejorada (detalles estilo Imagen 1)
    ctx.fillRect(-18, -35, 36, 52);

    // Líneas de neón naranja en el traje
    ctx.fillStyle = hitTimer > 0 ? '#ff6600' : '#FF8C00';
    ctx.fillRect(-15, -25, 30, 6);
    ctx.fillRect(-12, -14, 24, 4);
    ctx.fillRect(-15, -38, 30, 5);

    // Mochila táctica detallada
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-14, -30, 28, 20);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(-4, -28, 8, 3);

    // Capucha y Visor brillante naranja intenso (Imagen 1)
    ctx.fillStyle = hitTimer > 0 ? '#ff3300' : '#111111';
    ctx.fillRect(-16, -62, 32, 28);
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-16, -62, 32, 28);

    ctx.fillStyle = '#FF8C00';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#FF8C00';
    ctx.fillRect(-12, -52, 24, 7);
    ctx.shadowBlur = 0;

    // Brazos con animación
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-26, -22 + armCycle * 10, 9, 30);
    ctx.fillRect(17, -22 - armCycle * 10, 9, 30);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(-26, 4 + armCycle * 10, 9, 6);
    ctx.fillRect(17, 4 - armCycle * 10, 9, 6);

    // Piernas con animación de carrera
    ctx.fillStyle = '#111111';
    ctx.fillRect(-14, 15 + legCycle * 12, 10, 32);
    ctx.fillRect(4, 15 - legCycle * 12, 10, 32);

    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(-14, 37 + legCycle * 12, 10, 10);
    ctx.fillRect(4, 37 - legCycle * 12, 10, 10);

    ctx.restore();
}
