// ▶ 충돌 감지 시스템

// ▶ 충돌 판정
function isColliding(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// ▶ 효율적인 충돌 감지 (격자 기반)
const gridSize = 50;
const collisionGrid = new Map();

function getGridKey(x, y) {
  return `${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`;
}

function updateCollisionGrid() {
  collisionGrid.clear();
  
  enemies.forEach(e => {
    if (e.active !== false) {
      const key = getGridKey(e.x, e.y);
      if (!collisionGrid.has(key)) {
        collisionGrid.set(key, []);
      }
      collisionGrid.get(key).push(e);
    }
  });
}

function checkCollisionsInGrid(bullet) {
  // 총알의 모든 모서리와 중심점을 체크하여 더 정확한 충돌 감지
  const bulletCenterX = bullet.x + bullet.width / 2;
  const bulletCenterY = bullet.y + bullet.height / 2;
  
  const keys = [
    getGridKey(bullet.x, bullet.y),
    getGridKey(bullet.x + bullet.width, bullet.y),
    getGridKey(bullet.x, bullet.y + bullet.height),
    getGridKey(bullet.x + bullet.width, bullet.y + bullet.height),
    getGridKey(bulletCenterX, bulletCenterY) // 중심점도 체크
  ];
  
  const checkedEnemies = new Set();
  for (let key of keys) {
    const enemiesInCell = collisionGrid.get(key) || [];
    for (let e of enemiesInCell) {
      if (!checkedEnemies.has(e) && isColliding(bullet, e)) {
        checkedEnemies.add(e);
        return e;
      }
    }
  }
  
  // 그리드 기반 검색이 실패한 경우, 모든 적과 직접 충돌 체크 (백업)
  for (let e of enemies) {
    if (e.active !== false && !checkedEnemies.has(e) && isColliding(bullet, e)) {
      return e;
    }
  }
  
  return null;
}


