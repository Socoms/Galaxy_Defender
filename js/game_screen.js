// ▶ 게임 플레이 로직

// ▶ 게임 메커니즘 변수 (main_screen.js에서 전역으로 선언됨)
// 변수들은 main_screen.js에서 선언되어 전역 스코프에서 공유됩니다.
let enemyTypes = ['normal', 'fast', 'tank', 'zigzag', 'horizontal'];

// ▶ 플레이어 총알 발사
function shoot() {
  const now = Date.now();
  if (now - lastShotTime < shootCooldown) return;
  lastShotTime = now;

  // 총알 발사 효과음
  playSound('shoot', 0.2);

  const bulletWidth = player.poweredBullet ? 8 : 4;
  const bulletHeight = player.poweredBullet ? 15 : 10;
  const bulletSpeed = player.poweredBullet ? 10 : 7;
  const bulletColor = player.poweredBullet ? "cyan" : "yellow";

  const createBullet = (x, y, angle) => {
    return getFromPool('bullets', () => ({
      x, y,
      width: bulletWidth,
      height: bulletHeight,
      speed: bulletSpeed,
      color: bulletColor,
      angle: 0,
      active: true
    }));
  };

  if (player.tripleShot) {
    const b1 = createBullet(player.x + player.width / 2 - bulletWidth / 2, player.y, 0);
    const b2 = createBullet(player.x + player.width / 2 - bulletWidth / 2 - 15, player.y, 0);
    const b3 = createBullet(player.x + player.width / 2 - bulletWidth / 2 + 15, player.y, 0);
    b1.x = player.x + player.width / 2 - bulletWidth / 2;
    b2.x = player.x + player.width / 2 - bulletWidth / 2 - 15;
    b3.x = player.x + player.width / 2 - bulletWidth / 2 + 15;
    b1.y = b2.y = b3.y = player.y;
    bullets.push(b1, b2, b3);
  } else {
    const bullet = createBullet(player.x + player.width / 2 - bulletWidth / 2, player.y, 0);
    bullet.x = player.x + player.width / 2 - bulletWidth / 2;
    bullet.y = player.y;
    bullets.push(bullet);
  }
}

// ▶ 특수 공격 함수
function useSpecialAttack() {
  if (player.specialAttackCharges <= 0 || gameState !== 'playing') return;
  
  player.specialAttackCharges--;
  
  // 특수 공격 효과음
  playSound('special', 0.4);
  
  switch (player.specialAttack) {
    case 'missile':
      if (enemies.length > 0) {
        const target = enemies.reduce((closest, e) => {
          const distClosest = Math.sqrt((closest.x - player.x) ** 2 + (closest.y - player.y) ** 2);
          const distE = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
          return distE < distClosest ? e : closest;
        });
        missiles.push({
          x: player.x + player.width / 2,
          y: player.y,
          width: 8,
          height: 16,
          speed: 8,
          targetX: target.x + target.width / 2,
          targetY: target.y + target.height / 2,
          explosionRadius: 60
        });
      }
      break;
      
    case 'laser':
      lasers.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: canvas.height,
        active: true,
        timer: 30
      });
      break;
      
    case 'explosion':
      explosions.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        radius: 0,
        maxRadius: 150,
        speed: 5,
        damage: 3
      });
      break;
  }
  
  specialAttackCooldown = 300;
}

// ▶ 슬로우 모션 활성화
function activateSlowMotion() {
  if (slowMotionActive || gameState !== 'playing') return;
  slowMotionActive = true;
  slowMotionTimer = 180;
  autoSlowMotionTriggered = false;
}

// ▶ 위기 상황 자동 슬로우 모션 체크
function checkAutoSlowMotion() {
  if (slowMotionActive || autoSlowMotionTriggered || gameState !== 'playing') return;
  
  const nearbyBullets = enemyBullets.filter(b => {
    const dist = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
    return dist < 100;
  });
  
  const nearbyEnemies = enemies.filter(e => {
    const dist = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
    return dist < 80;
  });
  
  if (nearbyBullets.length >= 3 || (nearbyEnemies.length >= 2 && lives <= 1)) {
    slowMotionActive = true;
    slowMotionTimer = 120;
    autoSlowMotionTriggered = true;
    spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 1);
  }
}

// ▶ 보스 업데이트
function updateBoss() {
  if (!boss || !bossActive) return;
  
  boss.x += boss.speed * boss.direction;
  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.direction *= -1;
  }
  
  boss.shootTimer++;
  if (boss.shootTimer >= boss.shootInterval) {
    boss.shootTimer = 0;
    for (let i = -2; i <= 2; i++) {
      enemyBullets.push({
        x: boss.x + boss.width / 2 - 2,
        y: boss.y + boss.height,
        width: 6,
        height: 12,
        speed: 5,
        angle: i * 0.2
      });
    }
  }
  
  if (boss.health <= 0) {
    spawnEffect(boss.x + boss.width / 2, boss.y + boss.height / 2, 3);
    score += 100 * difficultyLevel;
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        spawnCoin(boss.x + boss.width / 2 + (Math.random() - 0.5) * 40, boss.y + boss.height / 2);
      }, i * 100);
    }
    
    boss = null;
    bossActive = false;
    lastBossScore = score;
    bossSpawnScore += 200;
  }
}

// ▶ 이펙트 업데이트
function updateEffects() {
  effects.forEach(e => {
    e.x += e.dx;
    e.y += e.dy;
    e.life--;
  });
  effects = effects.filter(e => e.life > 0);
}

// ▶ 미사일 업데이트
function updateMissiles() {
  missiles.forEach(m => {
    const dx = m.targetX - m.x;
    const dy = m.targetY - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 5) {
      m.x += (dx / dist) * m.speed;
      m.y += (dy / dist) * m.speed;
    } else {
      m.exploded = true;
      // 미사일 폭발 효과음
      playSound('explosion', 0.5);
      spawnEffect(m.x, m.y, 2);
      
      enemies.forEach(e => {
        const dist = Math.sqrt((e.x + e.width/2 - m.x) ** 2 + (e.y + e.height/2 - m.y) ** 2);
        if (dist < m.explosionRadius) {
          e.health -= 2;
        }
      });
    }
  });
  missiles = missiles.filter(m => !m.exploded && m.y > -50);
}

// ▶ 레이저 업데이트
function updateLasers() {
  lasers.forEach(laser => {
    laser.timer--;
    if (laser.timer <= 0) {
      laser.active = false;
    }
    
    if (laser.active) {
      enemies.forEach(e => {
        if (e.x < laser.x + laser.width && e.x + e.width > laser.x) {
          e.health -= 1;
        }
      });
    }
  });
  lasers = lasers.filter(l => l.active || l.timer > 0);
}

// ▶ 폭발 업데이트
function updateExplosions() {
  explosions.forEach(exp => {
    exp.radius += exp.speed;
    
    if (exp.radius <= exp.maxRadius) {
      enemies.forEach(e => {
        const dist = Math.sqrt((e.x + e.width/2 - exp.x) ** 2 + (e.y + e.height/2 - exp.y) ** 2);
        if (dist < exp.radius && !e.hitByExplosion) {
          e.health -= exp.damage;
          e.hitByExplosion = true;
        }
      });
    }
  });
  explosions = explosions.filter(exp => exp.radius < exp.maxRadius);
}

// ▶ 콤보 시스템 업데이트
function updateCombo() {
  if (comboTimer > 0) {
    comboTimer--;
  } else {
    if (comboCount > 0) {
      const bonus = Math.floor(comboCount * comboCount / 2);
      score += bonus;
      comboCount = 0;
    }
  }
}

// ▶ 콤보 추가
function addCombo() {
  comboTimer = comboMaxTime;
  comboCount++;
  consecutiveKills++;
  totalKills++;
  
  if (comboCount > maxCombo) {
    maxCombo = comboCount;
  }
  
  if (comboCount > 1) {
    score += comboCount;
  }
}

// ▶ 점수 계산
function calculateFinalScore() {
  let finalScore = score;
  
  const timeBonus = Math.max(0, Math.floor(1000 / gameTime));
  finalScore += timeBonus;
  
  if (perfectCombo && totalKills > 10) {
    const perfectBonus = totalKills * 10;
    finalScore += perfectBonus;
  }
  
  if (maxCombo > 10) {
    finalScore += maxCombo * 5;
  }
  
  return {
    baseScore: score,
    timeBonus: timeBonus,
    perfectBonus: (perfectCombo && totalKills > 10) ? totalKills * 10 : 0,
    comboBonus: maxCombo > 10 ? maxCombo * 5 : 0,
    totalScore: finalScore
  };
}

// ▶ 아이템 업데이트
function updateItems() {
  items.forEach(item => {
    item.y += item.speed * timeScale;
    if (isColliding(item, player)) {
      item.collected = true;
      
      // 파워업 획득 효과음
      playSound('powerup', 0.3);
      
      switch (item.type) {
        case ITEM_TYPES.SCORE:
          score += 10;
          break;
        case ITEM_TYPES.SPEED:
          player.speed = player.baseSpeed * 1.5;
          player.powerUpTimer = 600;
          spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
          break;
        case ITEM_TYPES.TRIPLE:
          player.tripleShot = true;
          player.powerUpTimer = 600;
          spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
          break;
        case ITEM_TYPES.SHIELD:
          player.hasShield = true;
          player.powerUpTimer = 600;
          spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
          break;
        case ITEM_TYPES.POWER:
          player.poweredBullet = true;
          player.powerUpTimer = 600;
          spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
          break;
        case ITEM_TYPES.SLOW:
          activateSlowMotion();
          spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
          break;
      }
    }
  });
  items = items.filter(i => i.y < canvas.height && !i.collected);
  
  if (player.powerUpTimer > 0) {
    player.powerUpTimer--;
    if (player.powerUpTimer === 0) {
      player.speed = player.baseSpeed + upgrades.playerSpeed;
      player.tripleShot = false;
      player.hasShield = false;
      player.poweredBullet = false;
    }
  }
}

// ▶ 코인 업데이트
function updateCoins() {
  coins.forEach(coin => {
    coin.y += coin.speed * timeScale;
    coin.rotation += coin.rotationSpeed;
    
    if (isColliding(coin, player)) {
      coin.collected = true;
      collectedCoins += coin.value;
      score += 5;
      // 코인 획득 효과음
      playSound('coin', 0.25);
      spawnEffect(coin.x + coin.width / 2, coin.y + coin.height / 2, 0.5);
    }
  });
  coins = coins.filter(c => c.y < canvas.height && !c.collected);
}

// ▶ 장애물 업데이트
function updateObstacles() {
  obstacles.forEach(obs => {
    obs.y += obs.speed * timeScale;
    obs.x += obs.direction * obs.speed * 0.5 * timeScale;
    obs.rotation += obs.rotationSpeed;
    
    if (obs.x <= 0 || obs.x + obs.width >= canvas.width) {
      obs.direction *= -1;
    }
    
    if (isColliding(obs, player) && !player.invincible) {
      if (!player.hasShield) {
        lives--;
        playSound('damage', 0.4);
        spawnEffect(obs.x + obs.width / 2, obs.y + obs.height / 2);
        obs.hit = true;
        if (lives <= 0) {
          endGame();
        } else {
          // 무적 시간 활성화 (120프레임 = 약 2초)
          player.invincible = true;
          player.invincibleTimer = 120;
          
          // 플레이어를 안전한 위치로 이동
          const safeX = Math.max(0, Math.min(canvas.width / 2 - player.width / 2, canvas.width - player.width));
          const safeY = Math.max(0, Math.min(canvas.height - player.height - 50, canvas.height - player.height));
          player.x = safeX;
          player.y = safeY;
        }
      }
    }
  });
  obstacles = obstacles.filter(obs => obs.y < canvas.height && !obs.hit);
}

// ▶ 폭풍 업데이트
function updateStorm() {
  if (stormActive) {
    stormTimer--;
    if (stormTimer <= 0) {
      stormActive = false;
    }
    
    if (stormActive) {
      if (Math.random() < 0.3) {
        effects.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
          radius: 2 + Math.random() * 2,
          life: 40,
          color: `hsl(${200 + Math.random() * 40}, 100%, 50%)`
        });
      }
    }
  }
  
  if (stormCooldown > 0) stormCooldown--;
  
  // Storm 효과는 난이도 5 이상에서만 등장
  if (difficultyLevel >= 5 && !stormActive && stormCooldown <= 0 && Math.random() < 0.001) {
    spawnStorm();
  }
}

// ▶ 난이도에 따라 적 생성 주기 업데이트
function updateSpawnInterval() {
  if (enemySpawnTimer) {
    clearInterval(enemySpawnTimer);
  }
  enemySpawnTimer = setInterval(() => {
    if (gameState === 'playing' && !bossActive) {
      spawnEnemy();
    }
  }, enemySpawnInterval);
}

