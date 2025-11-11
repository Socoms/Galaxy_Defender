// ▶ 게임 오브젝트 생성 및 관리

// ▶ 전투기 이미지 로드
const playerImage = new Image();
playerImage.src = "images/fighter.png";

// ▶ 외계인 적 이미지 로드  
const alienImage = new Image();
alienImage.src = "images/ufo.png";

// ▶ 플레이어 설정 
const player = {
  x: 280,
  y: 800,
  width: 40,
  height: 40,
  speed: 5,
  baseSpeed: 5,
  hasShield: false,
  tripleShot: false,
  poweredBullet: false,
  powerUpTimer: 0,
  specialAttack: 'missile',
  specialAttackCharges: 3,
  bulletDamage: 1,
  rotation: 0,
  rotationSpeed: 0.05,
  invincible: false,
  invincibleTimer: 0
};

// ▶ 상태 변수
let bullets = [];
let missiles = [];
let lasers = [];
let explosions = [];
let enemies = [];
let enemyBullets = [];
let items = [];
let coins = [];
let obstacles = [];
let effects = [];

// ▶ 객체 풀링 시스템
const objectPools = {
  bullets: [],
  enemies: [],
  enemyBullets: [],
  items: [],
  coins: [],
  effects: [],
  obstacles: []
};

function getFromPool(poolName, createFn) {
  let pool = objectPools[poolName];
  let obj = pool.find(o => !o.active);
  if (!obj) {
    obj = createFn();
    pool.push(obj);
  }
  obj.active = true;
  return obj;
}

function returnToPool(obj) {
  obj.active = false;
}

// ▶ 아이템 타입 상수
const ITEM_TYPES = {
  SCORE: 'score',
  SPEED: 'speed',
  TRIPLE: 'triple',
  SHIELD: 'shield',
  POWER: 'power',
  SLOW: 'slow'
};

// ▶ 아이템 생성
function spawnItem(x, y, type = null) {
  if (!type) {
    const rand = Math.random();
    if (rand < 0.3) {
      const powerUps = [ITEM_TYPES.SPEED, ITEM_TYPES.TRIPLE, ITEM_TYPES.SHIELD, ITEM_TYPES.POWER, ITEM_TYPES.SLOW];
      type = powerUps[Math.floor(Math.random() * powerUps.length)];
    } else {
      type = ITEM_TYPES.SCORE;
    }
  }
  
  items.push({
    x,
    y,
    width: 12,
    height: 12,
    speed: 2,
    type: type
  });
}

// ▶ 코인 생성
function spawnCoin(x, y) {
  coins.push({
    x: x || Math.random() * (canvas.width - 20),
    y: y || -20,
    width: 15,
    height: 15,
    speed: 3,
    rotation: 0,
    rotationSpeed: 0.1,
    value: 1
  });
}

// ▶ 폭발 이펙트 생성
function spawnEffect(x, y, intensity = 1) {
  const particleCount = 10 * intensity;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    effects.push({
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      life: 30,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`
    });
  }
}

// ▶ 총알 발사 파티클 효과
function spawnBulletParticle(x, y) {
  for (let i = 0; i < 3; i++) {
    effects.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 0.5,
      dy: -Math.random() * 1 - 0.5,
      radius: 1,
      life: 15,
      color: "yellow"
    });
  }
}

// ▶ 적 생성
function spawnEnemy() {
  if (bossActive) return;
  const x = Math.random() * (canvas.width - 40);
  // 적 이동 속도를 더 부드럽게 조정
  const baseSpeed = enemySpeedBase + (difficultyLevel - 1) * 0.3;
  
  let enemyType = 'normal';
  const rand = Math.random();
  
  if (difficultyLevel >= 2 && rand < 0.15) {
    enemyType = 'fast';
  } else if (difficultyLevel >= 3 && rand < 0.25) {
    enemyType = 'tank';
  } else if (difficultyLevel >= 4 && rand < 0.2) {
    enemyType = 'zigzag';
  } else if (difficultyLevel >= 5 && rand < 0.15) {
    enemyType = 'horizontal';
  }
  
  const enemy = {
    x: x,
    y: 0,
    width: 40,
    height: 40,
    speed: baseSpeed,
    health: 1,
    maxHealth: 1,
    isStrong: false,
    type: enemyType || 'normal',
    direction: 1,
    zigzagOffset: 0,
    zigzagSpeed: 2,
    hitByExplosion: false
  };
  
  switch (enemyType) {
    case 'fast':
      enemy.speed = baseSpeed * 2;
      enemy.width = 30;
      enemy.height = 30;
      break;
    case 'tank':
      enemy.health = 3;
      enemy.maxHealth = 3;
      enemy.speed = baseSpeed * 0.7;
      enemy.width = 50;
      enemy.height = 50;
      enemy.isStrong = true;
      break;
    case 'zigzag':
      enemy.speed = baseSpeed * 1.2;
      break;
    case 'horizontal':
      enemy.speed = baseSpeed * 0.8;
      enemy.direction = Math.random() < 0.5 ? -1 : 1;
      break;
  }
  
  enemies.push(enemy);
}

// ▶ 보스 생성
function spawnBoss() {
  if (bossActive) return;
  bossActive = true;
  boss = {
    x: canvas.width / 2 - 50,
    y: 50,
    width: 100,
    height: 80,
    speed: 2,
    health: 30 + difficultyLevel * 10,
    maxHealth: 30 + difficultyLevel * 10,
    direction: 1,
    shootTimer: 0,
    shootInterval: 60
  };
  // 보스 등장 효과음
  playSound('boss', 0.5);
  for (let i = 0; i < 50; i++) {
    spawnEffect(canvas.width / 2, 50, 2);
  }
}

// ▶ 적 총알 발사
function enemyShoot() {
  if (enemies.length === 0) return;
  
  // 화면에 보이는 적만 발사하도록 필터링
  const visibleEnemies = enemies.filter(e => e.y > 0 && e.y < canvas.height);
  if (visibleEnemies.length === 0) return;
  
  const shooter = visibleEnemies[Math.floor(Math.random() * visibleEnemies.length)];
  enemyBullets.push({
    x: shooter.x + shooter.width / 2 - 2,
    y: shooter.y + shooter.height,
    width: 4,
    height: 10,
    speed: 4
  });
}

// ▶ 우주 폭풍 생성
function spawnStorm() {
  if (stormActive || stormCooldown > 0) return;
  stormActive = true;
  stormTimer = stormDuration;
  stormCooldown = 900;
  
  for (let i = 0; i < 100; i++) {
    effects.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 3,
      dy: (Math.random() - 0.5) * 3,
      radius: 2 + Math.random() * 3,
      life: 60,
      color: `hsl(${200 + Math.random() * 40}, 100%, 50%)`
    });
  }
}

// ▶ 장애물 생성
function spawnObstacle() {
  if (obstacles.length >= 3) return;
  
  obstacles.push({
    x: Math.random() * (canvas.width - 40),
    y: -50,
    width: 40,
    height: 40,
    speed: 2 + Math.random() * 2,
    direction: Math.random() < 0.5 ? -1 : 1,
    rotation: 0,
    rotationSpeed: 0.05
  });
}

