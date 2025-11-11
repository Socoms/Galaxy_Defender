// ▶ UI 그리기 관련

// ▶ 별 배경 (움직이는 우주 느낌)
// stars 배열은 main_screen.js에서 선언 및 초기화됩니다.

// ▶ 별 배경 업데이트
function updateStars() {
  for (let s of stars) {
    s.y += s.speed;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }
}

// ▶ 배경 별 그리기
function drawStars() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (gameSettings.lightMode) {
    gradient.addColorStop(0, "#d0d0d0");
    gradient.addColorStop(0.5, "#e8e8e8");
    gradient.addColorStop(1, "#d0d0d0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000"; // 라이트 모드에서는 검은색 별로 대비 향상
  } else {
    gradient.addColorStop(0, "#0a0a2e");
    gradient.addColorStop(0.5, "#1a1a3e");
    gradient.addColorStop(1, "#0a0a2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
  }
  for (let s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ▶ 이펙트 그리기
function drawEffects() {
  for (let e of effects) {
    const alpha = e.life / 30;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ▶ 별 모양 아이템 그리기 함수
function drawStarShape(x, y, radius, points, inset) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, 0 - radius);
  for (let i = 0; i < points; i++) {
    ctx.rotate(Math.PI / points);
    ctx.lineTo(0, 0 - (radius * inset));
    ctx.rotate(Math.PI / points);
    ctx.lineTo(0, 0 - radius);
  }
  ctx.closePath();
  ctx.restore();
}

// ▶ 아이템 그리기
function drawItems() {
  for (let item of items) {
    ctx.save();
    switch (item.type) {
      case ITEM_TYPES.SCORE:
        ctx.fillStyle = "orange";
        ctx.beginPath();
        drawStarShape(item.x + item.width / 2, item.y + item.height / 2, 6, 5, 0.5);
        ctx.fill();
        break;
      case ITEM_TYPES.SPEED:
        ctx.fillStyle = "lime";
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case ITEM_TYPES.TRIPLE:
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        drawStarShape(item.x + item.width / 2, item.y + item.height / 2, 7, 3, 0.5);
        ctx.fill();
        break;
      case ITEM_TYPES.SHIELD:
        ctx.fillStyle = "blue";
        ctx.strokeStyle = "lightblue";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        break;
      case ITEM_TYPES.POWER:
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = "yellow";
        ctx.fillRect(item.x + 2, item.y + 2, item.width - 4, item.height - 4);
        break;
      case ITEM_TYPES.SLOW:
        ctx.fillStyle = "magenta";
        ctx.strokeStyle = "purple";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(item.x + item.width / 2, item.y + item.height / 2, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}

// ▶ 코인 그리기
function drawCoins() {
  coins.forEach(coin => {
    ctx.save();
    ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
    ctx.rotate(coin.rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.width / 2);
    gradient.addColorStop(0, "#ffd700");
    gradient.addColorStop(1, "#ff8c00");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#ffa500";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "#ffed4e";
    ctx.beginPath();
    ctx.arc(0, 0, coin.width / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
}

// ▶ 장애물 그리기
function drawObstacles() {
  obstacles.forEach(obs => {
    ctx.save();
    ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
    ctx.rotate(obs.rotation);
    
    ctx.fillStyle = "#8b4513";
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#654321";
    ctx.beginPath();
    ctx.arc(-obs.width / 6, -obs.height / 6, obs.width / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(obs.width / 6, obs.height / 6, obs.width / 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
}

// ▶ 미니맵 그리기
function drawMinimap() {
  const minimapWidth = 80;
  const minimapHeight = 120;
  const minimapX = canvas.width - minimapWidth - 10;
  const minimapY = canvas.height - minimapHeight - 10;
  
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 2;
  ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
  
  const playerScaleX = minimapWidth / canvas.width;
  const playerScaleY = minimapHeight / canvas.height;
  const playerMiniX = minimapX + (player.x + player.width / 2) * playerScaleX;
  const playerMiniY = minimapY + (player.y + player.height / 2) * playerScaleY;
  
  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(playerMiniX, playerMiniY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  enemies.forEach(e => {
    const enemyMiniX = minimapX + (e.x + e.width / 2) * playerScaleX;
    const enemyMiniY = minimapY + (e.y + e.height / 2) * playerScaleY;
    
    if (enemyMiniX >= minimapX && enemyMiniX <= minimapX + minimapWidth &&
        enemyMiniY >= minimapY && enemyMiniY <= minimapY + minimapHeight) {
      ctx.fillStyle = e.isStrong ? "red" : "orange";
      ctx.beginPath();
      ctx.arc(enemyMiniX, enemyMiniY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  if (boss && bossActive) {
    const bossMiniX = minimapX + (boss.x + boss.width / 2) * playerScaleX;
    const bossMiniY = minimapY + (boss.y + boss.height / 2) * playerScaleY;
    
    if (bossMiniX >= minimapX && bossMiniX <= minimapX + minimapWidth &&
        bossMiniY >= minimapY && bossMiniY <= minimapY + minimapHeight) {
      ctx.fillStyle = "purple";
      ctx.fillRect(bossMiniX - 4, bossMiniY - 4, 8, 8);
    }
  }
  
  ctx.fillStyle = "white";
  ctx.font = "8px Arial";
  ctx.fillText("MAP", minimapX + 2, minimapY + 12);
}

// ▶ 하트 그리기 함수
function drawHeart(x, y, size) {
  ctx.save();
  ctx.fillStyle = "red";
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x - size / 6, y + (size + topCurveHeight) / 2, x, y + size);
  ctx.bezierCurveTo(x + size / 6, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ▶ 생명(하트) 표시 함수
function drawLives() {
  const heartSize = 20;
  const spacing = 25;
  const startX = canvas.width - (heartSize * lives + spacing * (lives - 1)) - 10;
  const startY = 10;
  
  for (let i = 0; i < lives; i++) {
    drawHeart(startX + i * (heartSize + spacing), startY, heartSize);
  }
}

// ▶ 보스 그리기
function drawBoss() {
  if (!boss || !bossActive) return;
  
  ctx.save();
  ctx.fillStyle = "purple";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(boss.x + boss.width / 3, boss.y + boss.height / 3, 8, 0, Math.PI * 2);
  ctx.arc(boss.x + boss.width * 2 / 3, boss.y + boss.height / 3, 8, 0, Math.PI * 2);
  ctx.fill();
  
  const barWidth = boss.width + 20;
  const barHeight = 8;
  const barX = boss.x - 10;
  const barY = boss.y - 20;
  ctx.fillStyle = "red";
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = "lime";
  ctx.fillRect(barX, barY, (boss.health / boss.maxHealth) * barWidth, barHeight);
  
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;
  ctx.strokeRect(boss.x - 2, boss.y - 2, boss.width + 4, boss.height + 4);
  
  ctx.restore();
}

