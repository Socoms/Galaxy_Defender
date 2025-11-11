// ▶ 메인 메뉴, 초기화, 이벤트 리스너, 게임 상태 관리

// 🎮 우주 슈팅 게임 
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ▶ 캔버스 크기 반응형 설정
function resizeCanvas() {
  const maxWidth = window.innerWidth * 0.85;
  const maxHeight = window.innerHeight * 0.95;
  const aspectRatio = 800 / 1200;
  
  let newWidth = maxWidth;
  let newHeight = maxHeight;
  
  if (newWidth / newHeight > aspectRatio) {
    newWidth = newHeight * aspectRatio;
  } else {
    newHeight = newWidth / aspectRatio;
  }
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  
  if (player) {
    player.x = Math.min(player.x, canvas.width - player.width);
    player.y = Math.min(player.y, canvas.height - player.height);
  }
}

function initCanvas() {
  if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    initStars();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCanvas);
} else {
  initCanvas();
}

// ▶ 게임 상태 관리
let gameState = 'menu';

// ▶ 게임 변수 (game_screen.js와 공유)
let score = 0;
let lives = 3;
let gameOver = false;
let keys = {};
let enemySpawnInterval = 1000;
let enemySpeedBase = 2;
let difficultyLevel = 1;
let lastShotTime = 0;
let shootCooldown = 100;
let boss = null;
let bossActive = false;
let bossSpawnScore = 100;
let lastBossScore = 0;
let stormActive = false;
let stormTimer = 0;
let stormDuration = 300;
let stormCooldown = 0;
let collectedCoins = 0;
let autoSlowMotionTriggered = false;
let timeScale = 1;
let comboCount = 0;
let comboTimer = 0;
let comboMaxTime = 180;
let specialAttackCooldown = 0;
let slowMotionActive = false;
let slowMotionTimer = 0;
let gameStartTime = 0;
let gameTime = 0;
let pauseStartTime = 0;
let totalPauseTime = 0;
let waveStartTimeAtPause = 0; // 일시정지 시작 시점의 waveStartTime 값
let perfectCombo = true;
let totalKills = 0;
let consecutiveKills = 0;
let maxCombo = 0;
let enemySpawnTimer;
let enemyShootTimer;
let playerRespawnTimer = null;

// ▶ 웨이브 시스템
let currentWave = 1;
let waveStartTime = 0;
let waveDuration = 30; // 웨이브당 30초
let waveKillsRequired = 10; // 웨이브당 처치 필요 수
let waveKills = 0; // 현재 웨이브에서 처치한 적 수
let waveNotificationTime = 0; // 웨이브 알림 표시 시간

// ▶ 별 배경 초기화
let stars = [];
function initStars() {
  if (canvas) {
    stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 1 + 0.5
    }));
  }
}

// ▶ DOM 요소 참조
const menuScreen = document.getElementById('menuScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const restartBtn2 = document.getElementById('restartBtn2');
const menuBtn = document.getElementById('menuBtn');
const menuBtn2 = document.getElementById('menuBtn2');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const totalPointsDisplay = document.getElementById('totalPointsDisplay');
const finalScore = document.getElementById('finalScore');
const finalHighScore = document.getElementById('finalHighScore');
const finalLevel = document.getElementById('finalLevel');
const finalTime = document.getElementById('finalTime');
const finalKills = document.getElementById('finalKills');
const finalMaxCombo = document.getElementById('finalMaxCombo');
const earnedPoints = document.getElementById('earnedPoints');
const finalCoins = document.getElementById('finalCoins');

// 상점 관련 DOM
const shopScreen = document.getElementById('shopScreen');
const shopBtn = document.getElementById('shopBtn');
const shopBackBtn = document.getElementById('shopBackBtn');
const shopPoints = document.getElementById('shopPoints');
const buyDamage = document.getElementById('buyDamage');
const buySpeed = document.getElementById('buySpeed');
const buyCharges = document.getElementById('buyCharges');
const buyLives = document.getElementById('buyLives');
const damageLevel = document.getElementById('damageLevel');
const speedLevel = document.getElementById('speedLevel');
const chargesLevel = document.getElementById('chargesLevel');
const livesLevel = document.getElementById('livesLevel');
const damageCost = document.getElementById('damageCost');
const speedCost = document.getElementById('speedCost');
const chargesCost = document.getElementById('chargesCost');
const livesCost = document.getElementById('livesCost');

// ▶ 키 입력 처리 (스페이스바와 다른 키 동시 입력 문제 해결)
// window와 document 모두에 이벤트 리스너를 추가하여 키 입력을 확실히 캡처
function handleKeyDown(e) {
  const keyValue = e.key;
  const keyCode = e.code;
  const keyIdentifier = e.keyIdentifier || e.keyCode; // 레거시 지원
  
  // 키 상태를 먼저 업데이트 (preventDefault 전에!)
  // 일반 키보드와 노트북 키보드 모두 지원하도록 모든 키 식별자 저장
  if (keyValue) {
    keys[keyValue] = true;
  }
  if (keyCode) {
    keys[keyCode] = true;
  }
  // 레거시 키 코드 지원 (일반 키보드 호환성)
  if (keyIdentifier && typeof keyIdentifier === 'number') {
    keys['keyCode_' + keyIdentifier] = true;
  }
  
  // ESC 키 처리 - 게임 중일 때만 (가장 먼저 처리)
  if (keyValue === 'Escape' || keyCode === 'Escape' || keyIdentifier === 27) {
    console.log('ESC 키 감지됨, gameState:', gameState); // 디버깅
    if (gameState === 'playing') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('일시정지 호출');
      pauseGame();
      return false;
    } else if (gameState === 'paused') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('재개 호출');
      resumeGame();
      return false;
    }
  }
  
  // 게임 중일 때만 특정 키의 기본 동작 방지
  if (gameState === 'playing' || gameState === 'paused') {
    if (keyValue === ' ' || 
        keyValue === 'ArrowUp' || keyValue === 'ArrowDown' || 
        keyValue === 'ArrowLeft' || keyValue === 'ArrowRight' ||
        keyCode === 'Space' || keyCode === 'ArrowUp' || keyCode === 'ArrowDown' ||
        keyCode === 'ArrowLeft' || keyCode === 'ArrowRight') {
      e.preventDefault();
    }
  }
  
  if ((keyValue === 'x' || keyValue === 'X' || keyCode === 'KeyX') && gameState === 'playing' && !e.repeat) {
    useSpecialAttack();
  }
  
  if ((keyValue === 'Shift' || keyCode === 'ShiftLeft' || keyCode === 'ShiftRight') && gameState === 'playing' && !e.repeat) {
    activateSlowMotion();
  }
}

function handleKeyUp(e) {
  const keyValue = e.key;
  const keyCode = e.code;
  const keyIdentifier = e.keyIdentifier || e.keyCode; // 레거시 지원
  
  // 키 상태를 먼저 업데이트
  // 일반 키보드와 노트북 키보드 모두 지원하도록 모든 키 식별자 제거
  if (keyValue) {
    keys[keyValue] = false;
  }
  if (keyCode) {
    keys[keyCode] = false;
  }
  // 레거시 키 코드 지원 (일반 키보드 호환성)
  if (keyIdentifier && typeof keyIdentifier === 'number') {
    keys['keyCode_' + keyIdentifier] = false;
  }
  
  // 게임 중일 때만 특정 키의 기본 동작 방지
  if (gameState === 'playing' || gameState === 'paused') {
    if (keyValue === ' ' || 
        keyValue === 'ArrowUp' || keyValue === 'ArrowDown' || 
        keyValue === 'ArrowLeft' || keyValue === 'ArrowRight' ||
        keyCode === 'Space' || keyCode === 'ArrowUp' || keyCode === 'ArrowDown' ||
        keyCode === 'ArrowLeft' || keyCode === 'ArrowRight') {
      e.preventDefault();
    }
  }
}

// window와 document 모두에 이벤트 리스너 추가 (더 견고한 키 입력 처리)
// 중복 처리 방지를 위해 once 옵션 없이 추가
window.addEventListener("keydown", handleKeyDown, { passive: false, capture: true });
document.addEventListener("keydown", handleKeyDown, { passive: false, capture: false });
window.addEventListener("keyup", handleKeyUp, { passive: false, capture: true });
document.addEventListener("keyup", handleKeyUp, { passive: false, capture: false });

// canvas에도 키 이벤트 리스너 추가 (포커스 보장)
if (canvas) {
  canvas.addEventListener("keydown", handleKeyDown, { passive: false });
  canvas.addEventListener("keyup", handleKeyUp, { passive: false });
  // 게임 시작 시 canvas에 포커스
  canvas.addEventListener('click', () => {
    canvas.focus();
  });
}

// 포커스를 잃었을 때 키 상태 초기화
window.addEventListener("blur", () => {
  keys = {};
  // 진행 중이면 포커스 이탈 시 자동 일시정지
  if (gameState === 'playing') {
    pauseGame();
  }
});

// 다른 탭/앱으로 전환 시 자동 일시정지
document.addEventListener('visibilitychange', () => {
  if (document.hidden && gameState === 'playing') {
    pauseGame();
  }
});

// ▶ 터치 컨트롤
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;
let touchTargetX = null;
let touchTargetY = null;

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  touchStartX = touch.clientX - rect.left;
  touchStartY = touch.clientY - rect.top;
  touchActive = true;
  
  const shootButtonArea = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 80,
    width: 80,
    height: 60
  };
  
  if (touchStartX >= shootButtonArea.x && 
      touchStartX <= shootButtonArea.x + shootButtonArea.width &&
      touchStartY >= shootButtonArea.y && 
      touchStartY <= shootButtonArea.y + shootButtonArea.height) {
    keys[' '] = true;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!touchActive) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;
  
  // 목표 위치만 저장 (직접 설정하지 않음)
  touchTargetX = Math.max(0, Math.min(touchX - player.width / 2, canvas.width - player.width));
  touchTargetY = Math.max(0, Math.min(touchY - player.height / 2, canvas.height - player.height));
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  touchActive = false;
  touchTargetX = null;
  touchTargetY = null;
  keys[' '] = false;
}, { passive: false });

canvas.addEventListener('touchcancel', (e) => {
  e.preventDefault();
  touchActive = false;
  touchTargetX = null;
  touchTargetY = null;
  keys[' '] = false;
}, { passive: false });

// ▶ 게임 초기화 함수
function initGame() {
  bullets = [];
  missiles = [];
  lasers = [];
  explosions = [];
  enemies = [];
  enemyBullets = [];
  items = [];
  coins = [];
  obstacles = [];
  effects = [];
  score = 0;
  lives = 3;
  gameOver = false;
  difficultyLevel = 1;
  enemySpeedBase = 1.5; // 초기 속도를 조금 낮춤
  enemySpawnInterval = 1000;
  boss = null;
  bossActive = false;
  bossSpawnScore = 100;
  lastBossScore = 0;
  
  // 웨이브 시스템 초기화
  currentWave = 1;
  waveStartTime = Date.now();
  totalPauseTime = 0; // 게임 시작 시 일시정지 시간 초기화
  pauseStartTime = 0;
  waveStartTimeAtPause = 0;
  waveKills = 0;
  waveKillsRequired = 10;
  waveNotificationTime = 0;
  comboCount = 0;
  comboTimer = 0;
  specialAttackCooldown = 0;
  slowMotionActive = false;
  slowMotionTimer = 0;
  stormActive = false;
  stormTimer = 0;
  stormCooldown = 0;
  collectedCoins = 0;
  autoSlowMotionTriggered = false;
  timeScale = 1;
  
  // 터치 입력 초기화
  touchActive = false;
  touchTargetX = null;
  touchTargetY = null;
  
  player.x = Math.min(canvas.width / 2 - player.width / 2, canvas.width - player.width);
  player.y = Math.min(canvas.height - player.height - 50, canvas.height - player.height);
  player.speed = player.baseSpeed + upgrades.playerSpeed;
  player.hasShield = false;
  player.tripleShot = false;
  player.poweredBullet = false;
  player.powerUpTimer = 0;
  player.specialAttackCharges = 3 + upgrades.specialCharges;
  player.bulletDamage = upgrades.bulletDamage;
  player.rotation = 0;
  player.invincible = false;
  player.invincibleTimer = 0;
  
  gameStartTime = Date.now();
  gameTime = 0;
  pauseStartTime = 0;
  totalPauseTime = 0;
  perfectCombo = true;
  totalKills = 0;
  consecutiveKills = 0;
  maxCombo = 0;
  
  lives = 3 + upgrades.maxLives;
  
  stars.forEach(s => {
    s.x = Math.random() * canvas.width;
    s.y = Math.random() * canvas.height;
  });
  
  clearInterval(enemySpawnTimer);
  clearInterval(enemyShootTimer);
  
  enemySpawnTimer = setInterval(() => {
    if (gameState === 'playing' && !bossActive) {
      spawnEnemy();
    }
  }, enemySpawnInterval);
  
  // 적 탄환 발사 타이머는 난이도에 따라 동적으로 조정됩니다
  // 초기값: 2000ms (2초)
  enemyShootTimer = setInterval(() => {
    if (gameState === 'playing') {
      enemyShoot();
    }
  }, 2000);
}

// ▶ 게임 시작
function startGame() {
  initGame();
  gameState = 'playing';
  gameOver = false;
  menuScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  
  // canvas에 포커스 설정 (키 입력을 받기 위해)
  if (canvas) {
    canvas.focus();
  }
  
  // 배경음악 재생
  if (gameSettings.backgroundMusic) {
    playBackgroundMusic();
  }
  update();
}

// ▶ 게임 일시정지
function pauseGame() {
  if (gameState !== 'playing') {
    console.log('일시정지 실패: gameState가 playing이 아님', gameState);
    return;
  }
  
  console.log('일시정지 실행');
  gameState = 'paused';
  
  // 일시정지 시작 시점의 waveStartTime 값 저장 (복원용)
  waveStartTimeAtPause = waveStartTime;
  
  // 다른 화면들 숨기기
  if (menuScreen) menuScreen.classList.add('hidden');
  if (gameOverScreen) gameOverScreen.classList.add('hidden');
  if (shopScreen) shopScreen.classList.add('hidden');
  if (settingsScreen) settingsScreen.classList.add('hidden');
  
  // 일시정지 화면 표시
  if (pauseScreen) {
    pauseScreen.classList.remove('hidden');
    console.log('일시정지 화면 표시됨');
  } else {
    console.error('pauseScreen이 null입니다!');
  }
  
  // 일시정지 시작 시간 기록
  pauseStartTime = Date.now();
  
  // 적 스폰 및 발사 타이머 정지
  clearInterval(enemySpawnTimer);
  clearInterval(enemyShootTimer);
  enemySpawnTimer = null;
  enemyShootTimer = null;
  
  // 배경음악 일시정지
  pauseBackgroundMusic();
  
  const elapsedAtPause = Math.floor((pauseStartTime - waveStartTime) / 1000);
  console.log('일시정지 시점 정보:', {
    waveStartTimeAtPause: waveStartTimeAtPause,
    elapsedAtPause: elapsedAtPause,
    pauseStartTime: pauseStartTime
  });
}

// ▶ 게임 재개
function resumeGame() {
  if (gameState !== 'paused') return;
  
  // 일시정지 시간 계산 및 보정 (재개 전에 먼저 처리)
  if (pauseStartTime > 0) {
    const pauseDuration = Date.now() - pauseStartTime;
    totalPauseTime += pauseDuration;
    
    // gameStartTime을 일시정지 시간만큼 앞당김
    gameStartTime += pauseDuration;
    
    // waveStartTime을 일시정지 시작 시점의 값으로 복원하고, 일시정지 시간만큼 더함
    // 이렇게 하면 일시정지 시간이 경과 시간 계산에서 제외됨
    waveStartTime = waveStartTimeAtPause + pauseDuration;
    
    const currentTime = Date.now();
    const elapsedAfterResume = Math.floor((currentTime - waveStartTime) / 1000);
    const elapsedBeforePause = Math.floor((pauseStartTime - waveStartTimeAtPause) / 1000);
    
    console.log('재개 완료:', {
      pauseDuration: pauseDuration,
      totalPauseTime: totalPauseTime,
      waveStartTimeAtPause: waveStartTimeAtPause,
      waveStartTime: waveStartTime,
      now: currentTime,
      elapsedBeforePause: elapsedBeforePause,
      elapsedAfterResume: elapsedAfterResume,
      shouldBeSame: elapsedBeforePause === elapsedAfterResume
    });
    
    pauseStartTime = 0;
    waveStartTimeAtPause = 0;
  }
  
  gameState = 'playing';
  pauseScreen.classList.add('hidden');
  
  // 적 스폰 및 발사 타이머 재시작
  if (!enemySpawnTimer) {
    enemySpawnTimer = setInterval(() => {
      if (gameState === 'playing' && !bossActive) {
        spawnEnemy();
      }
    }, enemySpawnInterval);
  }
  
  if (!enemyShootTimer) {
    enemyShootTimer = setInterval(() => {
      if (gameState === 'playing') {
        enemyShoot();
      }
    }, 2000);
  }
  
  // 배경음악 재개
  if (gameSettings.backgroundMusic) {
    resumeBackgroundMusic();
  }
  update();
}

// ▶ 게임 오버 처리
function endGame() {
  gameState = 'gameOver';
  gameOver = true;
  
  // 배경음악 중지
  stopBackgroundMusic();
  
  const scoreData = calculateFinalScore();
  const earnedPointsValue = scoreData.totalScore;
  
  addTotalCoins(collectedCoins);
  addTotalPoints(earnedPointsValue);
  
  const highScore = getHighScore();
  if (scoreData.totalScore > highScore) {
    setHighScore(scoreData.totalScore);
  }
  
  finalScore.textContent = scoreData.baseScore;
  finalHighScore.textContent = getHighScore();
  finalLevel.textContent = difficultyLevel;
  finalTime.textContent = gameTime + '초';
  finalKills.textContent = totalKills;
  finalMaxCombo.textContent = maxCombo;
  earnedPoints.textContent = earnedPointsValue + '점';
  finalCoins.textContent = collectedCoins + '개';
  
  gameOverScreen.classList.remove('hidden');
  drawMenuBackground();
}

// ▶ 메뉴로 돌아가기
function goToMenu() {
  gameState = 'menu';
  gameOver = false;
  menuScreen.classList.remove('hidden');
  pauseScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  shopScreen.classList.add('hidden');
  settingsScreen.classList.add('hidden');
  
  highScoreDisplay.textContent = getHighScore();
  totalPointsDisplay.textContent = getTotalCoins();
  
  drawMenuBackground();
}

// ▶ 업그레이드 상점 열기
function openShop() {
  shopScreen.classList.remove('hidden');
  menuScreen.classList.add('hidden');
  updateShopDisplay();
}

// ▶ 업그레이드 상점 표시 업데이트
function updateShopDisplay() {
  shopPoints.textContent = getTotalCoins();
  damageLevel.textContent = upgrades.bulletDamage;
  speedLevel.textContent = upgrades.playerSpeed;
  chargesLevel.textContent = upgrades.specialCharges;
  livesLevel.textContent = upgrades.maxLives;
  
  damageCost.textContent = getUpgradeCost('bulletDamage');
  speedCost.textContent = getUpgradeCost('playerSpeed');
  chargesCost.textContent = getUpgradeCost('specialCharges');
  livesCost.textContent = getUpgradeCost('maxLives');
}

// ▶ 업그레이드 구매 함수
function buyUpgrade(upgradeType) {
  const cost = getUpgradeCost(upgradeType);
  if (spendCoins(cost)) {
    upgrades[upgradeType]++;
    saveUpgrades();
    updateShopDisplay();
    alert(`업그레이드 완료! ${upgradeType} 레벨이 증가했습니다.`);
  } else {
    alert(`코인이 부족합니다! 필요: ${cost}코인, 보유: ${getTotalCoins()}코인`);
  }
}

// ▶ 메뉴/게임 오버 배경 그리기 (별 애니메이션)
function drawMenuBackground() {
  if (gameState !== 'menu' && gameState !== 'gameOver') return;
  
  updateStars();
  
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  if (gameSettings.lightMode) {
    gradient.addColorStop(0, "#e0e0e0");
    gradient.addColorStop(0.5, "#f5f5f5");
    gradient.addColorStop(1, "#e0e0e0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
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
  
  requestAnimationFrame(drawMenuBackground);
}

// ▶ 버튼 이벤트 리스너
function setupEventListeners() {
  if (startBtn) startBtn.addEventListener('click', startGame);
  if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
  if (restartBtn) restartBtn.addEventListener('click', () => {
    startGame();
  });
  if (restartBtn2) restartBtn2.addEventListener('click', () => {
    startGame();
  });
  if (menuBtn) menuBtn.addEventListener('click', goToMenu);
  if (menuBtn2) menuBtn2.addEventListener('click', goToMenu);
  if (shopBtn) shopBtn.addEventListener('click', openShop);
  if (shopBackBtn) shopBackBtn.addEventListener('click', () => {
    shopScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
  });

  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
  if (settingsBackBtn) settingsBackBtn.addEventListener('click', () => {
    settingsScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
  });
  if (resetDataBtn) resetDataBtn.addEventListener('click', resetGameData);
  
  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      gameSettings.lightMode = e.target.checked;
      applySettings();
      saveSettings();
    });
  }
  
  if (soundEffectsToggle) {
    soundEffectsToggle.addEventListener('change', (e) => {
      gameSettings.soundEffects = e.target.checked;
      saveSettings();
    });
  }
  
  if (backgroundMusicToggle) {
    backgroundMusicToggle.addEventListener('change', (e) => {
      gameSettings.backgroundMusic = e.target.checked;
      saveSettings();
      if (!e.target.checked) {
        // 배경음악 정지
        stopBackgroundMusic();
      } else {
        // 배경음악 재생 (게임 중일 때만)
        if (gameState === 'playing') {
          playBackgroundMusic();
        }
      }
    });
  }

  if (buyDamage) buyDamage.addEventListener('click', () => buyUpgrade('bulletDamage'));
  if (buySpeed) buySpeed.addEventListener('click', () => buyUpgrade('playerSpeed'));
  if (buyCharges) buyCharges.addEventListener('click', () => buyUpgrade('specialCharges'));
  if (buyLives) buyLives.addEventListener('click', () => buyUpgrade('maxLives'));
}

// DOM 로드 완료 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    applySettings();
    if (highScoreDisplay) highScoreDisplay.textContent = getHighScore();
    if (totalPointsDisplay) totalPointsDisplay.textContent = getTotalCoins();
    drawMenuBackground();
  });
} else {
  setupEventListeners();
  applySettings();
  if (highScoreDisplay) highScoreDisplay.textContent = getHighScore();
  if (totalPointsDisplay) totalPointsDisplay.textContent = getTotalCoins();
  drawMenuBackground();
}

// ▶ 메인 게임 루프
function update() {
  // 게임 오버 처리
  if (gameOver && gameState === 'playing') {
    endGame();
    return;
  }
  
  // 일시정지 상태일 때는 게임 로직을 건너뛰고 화면만 그리기
  const isPaused = gameState === 'paused';
  
  // 게임이 진행 중이 아닐 때는 업데이트하지 않음
  if (gameState !== 'playing' && !isPaused) {
    return;
  }

  // 일시정지 상태가 아닐 때만 게임 로직 실행
  if (!isPaused) {
    if (gameStartTime > 0) {
      // gameStartTime은 이미 일시정지 시간이 보정된 상태이므로 그대로 사용
      gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    }
  
    // 웨이브 알림 시간 감소
    if (waveNotificationTime > 0) {
      waveNotificationTime--;
    }
    
    // 웨이브 진행 체크 (시간 기반 또는 처치 수 기반)
    // waveStartTime은 이미 일시정지 시간이 보정된 상태이므로 그대로 사용
    const currentTime = Date.now();
    const waveElapsedTime = Math.floor((currentTime - waveStartTime) / 1000);
    
    // 디버깅: 일시정지 후 속도가 빨라지는 문제 확인
    if (waveElapsedTime < 0) {
      console.warn('경고: waveElapsedTime이 음수입니다!', {
        now: currentTime,
        waveStartTime: waveStartTime,
        totalPauseTime: totalPauseTime,
        elapsed: waveElapsedTime,
        difficultyLevel: difficultyLevel
      });
    }
    
    // 디버깅: 웨이브 진행 시간이 비정상적으로 빠른지 확인
    if (waveElapsedTime > waveDuration + 5) {
      console.warn('경고: 웨이브 진행 시간이 비정상적으로 큽니다!', {
        elapsed: waveElapsedTime,
        duration: waveDuration,
        waveStartTime: waveStartTime,
        totalPauseTime: totalPauseTime,
        difficultyLevel: difficultyLevel
      });
    }
    
    const timeBased = waveElapsedTime >= waveDuration;
    const killBased = waveKills >= waveKillsRequired;
    
    if ((timeBased || killBased) && enemies.length === 0 && !bossActive) {
      // 다음 웨이브로 진행
      currentWave++;
      difficultyLevel = currentWave;
      // 웨이브 시작 시간 설정
      // 새 웨이브는 현재 시간에 시작하되, 일시정지 시간은 0으로 초기화
      waveStartTime = Date.now();
      totalPauseTime = 0; // 새 웨이브 시작 시 일시정지 시간 초기화
      waveKills = 0;
      
      console.log('웨이브 전환:', {
        wave: currentWave,
        waveStartTime: waveStartTime,
        now: Date.now(),
        totalPauseTime: '초기화됨'
      });
      waveKillsRequired = 10 + (currentWave - 1) * 5; // 웨이브마다 필요 처치 수 증가
      waveDuration = 30 + (currentWave - 1) * 5; // 웨이브마다 시간 증가
      waveNotificationTime = 120; // 2초간 알림 표시
      
      // 난이도 증가에 따른 설정 업데이트
      enemySpeedBase = 1.5 + (difficultyLevel - 1) * 0.2;
      enemySpawnInterval = Math.max(300, 1000 - (difficultyLevel - 1) * 50);
      updateSpawnInterval();
      
      // 적 탄환 발사 간격도 난이도에 따라 조정
      clearInterval(enemyShootTimer);
      const shootInterval = Math.max(1000, 2000 - (difficultyLevel - 1) * 100);
      enemyShootTimer = setInterval(() => {
        if (gameState === 'playing') {
          enemyShoot();
        }
      }, shootInterval);
    }
  
  if (slowMotionActive) {
    slowMotionTimer--;
    if (slowMotionTimer <= 0) {
      slowMotionActive = false;
      autoSlowMotionTriggered = false;
    }
  }
  timeScale = slowMotionActive ? 0.5 : 1;
  
  // 플레이어 무적 시간 업데이트
  if (player.invincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
      player.invincibleTimer = 0;
    }
  }
  
  updateStars();
  updateEffects();
  updateItems();
  updateCoins();
  updateObstacles();
  updateStorm();
  updateMissiles();
  updateLasers();
  updateExplosions();
  updateCombo();
  
  checkAutoSlowMotion();
  
  if (specialAttackCooldown > 0) specialAttackCooldown--;
  
  updateBoss();

  if (!bossActive && score >= bossSpawnScore && score - lastBossScore >= 200) {
    spawnBoss();
  }

  // 웨이브 시스템으로 난이도가 관리되므로 점수 기반 난이도 증가는 제거됨

  const moveSpeed = stormActive ? player.speed * 0.6 : player.speed;
  const diagonalSpeed = moveSpeed * 0.707;
  
  // 터치 입력이 활성화되어 있으면 터치 목표 위치로 부드럽게 이동
  if (touchActive && touchTargetX !== null && touchTargetY !== null) {
    const dx = touchTargetX - player.x;
    const dy = touchTargetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 목표 위치에 가까우면 즉시 이동, 아니면 부드럽게 이동
    if (distance < moveSpeed * timeScale) {
      player.x = touchTargetX;
      player.y = touchTargetY;
    } else {
      const moveDistance = moveSpeed * timeScale;
      player.x += (dx / distance) * moveDistance;
      player.y += (dy / distance) * moveDistance;
    }
    
    // 경계 체크
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
  } else {
    // 키보드 입력 처리
    // X, Y 방향 이동량 계산
    let deltaX = 0;
    let deltaY = 0;
    
    // 키 입력 체크 - 모든 가능한 키 값과 코드를 직접 확인
    // 일반 키보드와 노트북 키보드 모두 지원하도록 포괄적으로 체크
    // 각 방향을 독립적으로 체크하여 대각선 이동이 제대로 작동하도록
    const leftPressed = !!(keys["ArrowLeft"] || keys["a"] || keys["A"] || keys["KeyA"] || 
                           keys["keyCode_37"]); // Left Arrow keyCode
    const rightPressed = !!(keys["ArrowRight"] || keys["d"] || keys["D"] || keys["KeyD"] || 
                            keys["keyCode_39"]); // Right Arrow keyCode
    const upPressed = !!(keys["ArrowUp"] || keys["w"] || keys["W"] || keys["KeyW"] || 
                        keys["keyCode_38"]); // Up Arrow keyCode
    const downPressed = !!(keys["ArrowDown"] || keys["s"] || keys["S"] || keys["KeyS"] || 
                           keys["keyCode_40"]); // Down Arrow keyCode
    
    // 왼쪽 이동
    if (leftPressed) {
      deltaX -= 1;
    }
    // 오른쪽 이동
    if (rightPressed) {
      deltaX += 1;
    }
    // 위쪽 이동
    if (upPressed) {
      deltaY -= 1;
    }
    // 아래쪽 이동
    if (downPressed) {
      deltaY += 1;
    }
    
    // 대각선 이동인지 확인하고 속도 조정
    const isDiagonal = deltaX !== 0 && deltaY !== 0;
    const currentSpeed = isDiagonal ? diagonalSpeed : moveSpeed;
    
    // 이동량에 속도 적용
    deltaX *= currentSpeed * timeScale;
    deltaY *= currentSpeed * timeScale;
    
    // 경계 체크 후 위치 업데이트
    const newX = player.x + deltaX;
    const newY = player.y + deltaY;
    
    if (newX >= 0 && newX + player.width <= canvas.width) {
      player.x = newX;
    } else if (newX < 0) {
      player.x = 0;
    } else if (newX + player.width > canvas.width) {
      player.x = canvas.width - player.width;
    }
    
    if (newY >= 0 && newY + player.height <= canvas.height) {
      player.y = newY;
    } else if (newY < 0) {
      player.y = 0;
    } else if (newY + player.height > canvas.height) {
      player.y = canvas.height - player.height;
    }
  }
  
  player.rotation = 0;
  
  // 스페이스바 체크 (키 값과 키 코드 모두 - 독립적으로 처리)
  // 일반 키보드와 노트북 키보드 모두 지원
  const spacePressed = keys[" "] || keys["Space"] || keys["keyCode_32"]; // Space keyCode
  if (spacePressed) {
    shoot();
  }
  
  // 난이도 레벨에 따라 장애물 생성 확률과 최대 개수 조정
  // 레벨 1-2: 장애물 없음
  // 레벨 3-4: 최대 1개, 확률 0.0005
  // 레벨 5-6: 최대 2개, 확률 0.001
  // 레벨 7+: 최대 3개, 확률 0.002
  let maxObstacles = 0;
  let obstacleSpawnChance = 0;
  
  if (difficultyLevel >= 7) {
    maxObstacles = 3;
    obstacleSpawnChance = 0.002;
  } else if (difficultyLevel >= 5) {
    maxObstacles = 2;
    obstacleSpawnChance = 0.001;
  } else if (difficultyLevel >= 3) {
    maxObstacles = 1;
    obstacleSpawnChance = 0.0005;
  }
  
  if (difficultyLevel >= 3 && Math.random() < obstacleSpawnChance && obstacles.length < maxObstacles) {
    spawnObstacle();
  }
  
  if (Math.random() < 0.001) {
    spawnCoin();
  }

  // 충돌 그리드를 먼저 업데이트 (적 위치가 변경되기 전에)
  updateCollisionGrid();
  
  bullets.forEach(b => {
    b.y -= b.speed * timeScale;
  });
  
  const enemiesToRemove = [];
  enemies.forEach(e => {
    const speed = e.speed * timeScale;
    
    switch (e.type) {
      case 'normal':
        e.y += speed;
        break;
      case 'fast':
        e.y += speed;
        break;
      case 'tank':
        e.y += speed;
        break;
      case 'zigzag':
        e.y += speed;
        e.zigzagOffset += e.zigzagSpeed * timeScale;
        e.x += Math.sin(e.zigzagOffset * 0.1) * 2 * timeScale;
        if (e.x < -e.width || e.x > canvas.width) {
          enemiesToRemove.push(e);
          returnToPool(e);
        }
        break;
      case 'horizontal':
        e.y += speed * 0.5;
        e.x += e.direction * speed * 1.5 * timeScale;
        if (e.x <= 0 || e.x + e.width >= canvas.width) {
          e.direction *= -1;
        }
        break;
    }
    
    if (isColliding(e, player) && !player.invincible) {
      if (player.hasShield) {
        player.hasShield = false;
        player.powerUpTimer = 0;
        score += e.isStrong ? 5 : 1;
        playSound('hit', 0.3);
        spawnEffect(e.x + e.width / 2, e.y + e.height / 2);
        enemiesToRemove.push(e);
        if (Math.random() < 0.3) {
          spawnItem(e.x + e.width / 2 - 6, e.y);
        }
      } else {
        lives--;
        // 피격 효과음
        playSound('damage', 0.4);
        spawnEffect(e.x + e.width / 2, e.y + e.height / 2);
        enemiesToRemove.push(e);
        if (lives <= 0) {
          endGame();
          return;
        } else {
          // 무적 시간 활성화 (120프레임 = 약 2초)
          player.invincible = true;
          player.invincibleTimer = 120;
          
          // 플레이어를 안전한 위치로 이동 (화면 중앙 하단)
          if (playerRespawnTimer) {
            clearTimeout(playerRespawnTimer);
          }
          const safeX = Math.max(0, Math.min(canvas.width / 2 - player.width / 2, canvas.width - player.width));
          const safeY = Math.max(0, Math.min(canvas.height - player.height - 50, canvas.height - player.height));
          player.x = safeX;
          player.y = safeY;
        }
      }
    }
  });
  
  if (boss && bossActive && isColliding(boss, player) && !player.invincible) {
    if (player.hasShield) {
      player.hasShield = false;
      player.powerUpTimer = 0;
      playSound('hit', 0.3);
      spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
    } else {
      lives--;
      // 보스와 충돌 시 피격 효과음
      playSound('damage', 0.5);
      spawnEffect(player.x + player.width / 2, player.y + player.height / 2);
      if (lives <= 0) {
        endGame();
        return;
      } else {
        // 무적 시간 활성화 (120프레임 = 약 2초)
        player.invincible = true;
        player.invincibleTimer = 120;
        
        // 플레이어를 안전한 위치로 이동 (보스로부터 멀리)
        if (playerRespawnTimer) {
          clearTimeout(playerRespawnTimer);
        }
        const safeX = Math.max(0, Math.min(canvas.width / 2 - player.width / 2, canvas.width - player.width));
        const safeY = Math.max(boss.y + boss.height + 20, Math.min(canvas.height - player.height - 50, canvas.height - player.height));
        player.x = safeX;
        player.y = safeY;
      }
    }
  }
  enemies = enemies.filter(enemy => !enemiesToRemove.includes(enemy));

  bullets = bullets.filter(b => {
    // 화면 밖으로 나간 총알은 제거
    if (b.y <= 0 || b.x < -50 || b.x > canvas.width + 50) {
      returnToPool(b);
      return false;
    }
    
    // 충돌 체크
    const hitEnemy = checkCollisionsInGrid(b);
    if (hitEnemy && hitEnemy.active !== false) {
      hitEnemy.health -= player.bulletDamage;
      returnToPool(b);
      
      if (hitEnemy.health <= 0) {
        const points = hitEnemy.isStrong ? 5 : 1;
        score += points;
        waveKills++; // 웨이브 처치 수 증가
        addCombo();
        // 적 처치 효과음
        playSound(hitEnemy.isStrong ? 'explosion' : 'hit', hitEnemy.isStrong ? 0.4 : 0.3);
        spawnEffect(hitEnemy.x + hitEnemy.width / 2, hitEnemy.y + hitEnemy.height / 2, hitEnemy.isStrong ? 1.5 : 1);

        if (Math.random() < 0.3) {
          spawnItem(hitEnemy.x + hitEnemy.width / 2 - 6, hitEnemy.y);
        }
        if (Math.random() < 0.2) {
          spawnCoin(hitEnemy.x + hitEnemy.width / 2 - 7, hitEnemy.y);
        }
        returnToPool(hitEnemy);
        return false;
      } else {
        // 적 피격 효과음 (데미지 입었지만 처치되지 않음)
        playSound('hit', 0.2);
        spawnEffect(hitEnemy.x + hitEnemy.width / 2, hitEnemy.y + hitEnemy.height / 2, 0.3);
        perfectCombo = false;
        return false;
      }
    }
    return true;
  });
  
  enemies = enemies.filter(e => {
    if (e.y >= canvas.height || e.active === false) {
      if (e.y >= canvas.height) {
        perfectCombo = false;
      }
      returnToPool(e);
      return false;
    }
    return true;
  });
  
  enemies.forEach(e => {
    if (e.y > canvas.height) {
      perfectCombo = false;
    }
  });
  
  if (boss && bossActive) {
    bullets = bullets.filter(b => {
      if (isColliding(b, boss)) {
        boss.health -= player.bulletDamage;
        spawnEffect(b.x + b.width / 2, b.y + b.height / 2, 0.5);
        returnToPool(b);
        return false;
      }
      return true;
    });
  }

  enemyBullets.forEach(b => {
    if (b.angle !== undefined) {
      b.y += b.speed * Math.cos(b.angle) * timeScale;
      b.x += b.speed * Math.sin(b.angle) * timeScale;
    } else {
      b.y += b.speed * timeScale;
    }
      if (isColliding(b, player) && !player.invincible) {
      if (player.hasShield) {
        player.hasShield = false;
        player.powerUpTimer = 0;
        playSound('hit', 0.3);
        spawnEffect(player.x + player.width / 2, player.y + player.height / 2, 0.5);
      } else {
        lives--;
        // 적 총알 피격 효과음
        playSound('damage', 0.4);
        spawnEffect(player.x + player.width / 2, player.y + player.height / 2);
        if (lives <= 0) {
          endGame();
          return;
        } else {
          // 무적 시간 활성화 (120프레임 = 약 2초)
          player.invincible = true;
          player.invincibleTimer = 120;
          
          // 플레이어를 안전한 위치로 이동
          if (playerRespawnTimer) {
            clearTimeout(playerRespawnTimer);
          }
          const safeX = Math.max(0, Math.min(player.x, canvas.width - player.width));
          const safeY = Math.max(0, Math.min(canvas.height - player.height - 50, canvas.height - player.height));
          player.x = safeX;
          player.y = safeY;
        }
      }
      enemyBullets = enemyBullets.filter(bullet => bullet !== b);
    }
  });
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height);
  } // 일시정지 상태가 아닐 때만 게임 로직 실행 종료

  // ▶ 그리기 (일시정지 상태에서도 화면은 그려야 함)
  drawStars();
  drawEffects();
  
  if (stormActive) {
    ctx.fillStyle = "rgba(0, 100, 200, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  drawItems();
  drawCoins();
  drawObstacles();

  drawBoss();

  missiles.forEach(m => {
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y + m.height);
    ctx.lineTo(m.x, m.y + m.height + 10);
    ctx.stroke();
  });
  
  lasers.forEach(laser => {
    if (laser.active) {
      const gradient = ctx.createLinearGradient(laser.x, laser.y, laser.x + laser.width, laser.y + laser.height);
      gradient.addColorStop(0, "rgba(255, 0, 255, 0.8)");
      gradient.addColorStop(1, "rgba(255, 0, 255, 0.2)");
      ctx.fillStyle = gradient;
      ctx.fillRect(laser.x, 0, laser.width, laser.height);
    }
  });
  
  explosions.forEach(exp => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 100, 0, 0.3)";
    ctx.fill();
  });

  enemies.forEach(e => {
    ctx.save();
    
    switch (e.type) {
      case 'fast':
        ctx.filter = "hue-rotate(120deg)";
        break;
      case 'tank':
        ctx.filter = "hue-rotate(240deg)";
        break;
      case 'zigzag':
        ctx.filter = "hue-rotate(60deg)";
        break;
      case 'horizontal':
        ctx.filter = "hue-rotate(300deg)";
        break;
    }
    
    ctx.drawImage(alienImage, e.x, e.y, e.width, e.height);
    ctx.restore();
    
    if (e.isStrong || e.health > 1) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x - 2, e.y - 2, e.width + 4, e.height + 4);
      
      if (e.health < e.maxHealth) {
        const barWidth = e.width;
        const barHeight = 4;
        const barX = e.x;
        const barY = e.y - 8;
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "lime";
        ctx.fillRect(barX, barY, (e.health / e.maxHealth) * barWidth, barHeight);
      }
    }
  });

  bullets.forEach(b => {
    // 라이트 모드에서는 더 진한 색상 사용
    if (gameSettings.lightMode) {
      if (b.color === "yellow") {
        ctx.fillStyle = "#ff6600"; // 주황색으로 변경
        ctx.strokeStyle = "#ff3300"; // 진한 주황색 테두리
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x - 0.5, b.y - 0.5, b.width + 1, b.height + 1);
      } else if (b.color === "cyan") {
        ctx.fillStyle = "#0066ff"; // 진한 파란색으로 변경
        ctx.strokeStyle = "#0033cc"; // 더 진한 파란색 테두리
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x - 0.5, b.y - 0.5, b.width + 1, b.height + 1);
      } else {
        ctx.fillStyle = b.color || "#ff6600";
      }
    } else {
      ctx.fillStyle = b.color || "yellow";
    }
    
    ctx.fillRect(b.x, b.y, b.width, b.height);
    
    if (b.color === "cyan") {
      if (gameSettings.lightMode) {
        ctx.strokeStyle = "#0033cc";
      } else {
        ctx.strokeStyle = "white";
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x + b.width / 2, b.y);
      ctx.lineTo(b.x + b.width / 4, b.y + b.height / 4);
      ctx.lineTo(b.x + b.width / 2, b.y + b.height / 2);
      ctx.lineTo(b.x + b.width * 3 / 4, b.y + b.height / 4);
      ctx.lineTo(b.x + b.width / 2, b.y);
      ctx.stroke();
    }
    
    if (Math.random() < 0.1) {
      spawnBulletParticle(b.x + b.width / 2, b.y + b.height);
    }
  });

  enemyBullets.forEach(b => {
    ctx.fillStyle = b.angle !== undefined ? "orange" : "red";
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // 무적 상태일 때 반투명하게 표시
  if (player.invincible) {
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
  }
  
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  
  if (player.hasShield) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2 + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "cyan";
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  // 무적 상태 알파값 복원
  if (player.invincible) {
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.fillText("Score: " + score, 10, 22);
  ctx.font = "14px Arial";
  ctx.fillText("Wave: " + currentWave, 10, 42);
  
  // 웨이브 진행 상황 표시
  // waveStartTime은 이미 일시정지 시간이 보정된 상태이므로 그대로 사용
  const waveElapsedTimeUI = Math.floor((Date.now() - waveStartTime) / 1000);
  const timeProgress = Math.min(100, (waveElapsedTimeUI / waveDuration) * 100);
  const killProgress = Math.min(100, (waveKills / waveKillsRequired) * 100);
  const waveProgress = Math.max(timeProgress, killProgress); // 시간 또는 처치 수 중 더 높은 것
  
  const barWidth = 200;
  const barHeight = 8;
  const barX = 10;
  const barY = 50;
  
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  ctx.fillStyle = "cyan";
  ctx.fillRect(barX, barY, (waveProgress / 100) * barWidth, barHeight);
  
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "10px Arial";
  const timeLeft = Math.max(0, waveDuration - waveElapsedTimeUI);
  const killsLeft = Math.max(0, waveKillsRequired - waveKills);
  ctx.fillText(`${timeLeft}초 또는 ${killsLeft}킬`, barX + barWidth + 5, barY + 6);
  
  // 웨이브 알림 표시
  if (waveNotificationTime > 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 32px Arial";
    const waveText = `WAVE ${currentWave}`;
    const textWidth = ctx.measureText(waveText).width;
    ctx.fillText(waveText, canvas.width / 2 - textWidth / 2, canvas.height / 2);
    
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;
    ctx.fillText(waveText, canvas.width / 2 - textWidth / 2, canvas.height / 2);
    ctx.globalAlpha = 1;
  }
  
  if (bossActive && boss) {
    ctx.fillStyle = "red";
    ctx.font = "bold 24px Arial";
    const text = "BOSS BATTLE!";
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, canvas.width / 2 - textWidth / 2, 35);
    
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.5;
    ctx.fillText(text, canvas.width / 2 - textWidth / 2, 35);
    ctx.globalAlpha = 1;
  }
  
  const powerUpY = canvas.height - 80;
  let powerUpIndex = 0;
  if (player.tripleShot) {
    ctx.fillStyle = "cyan";
    ctx.fillText("TRIPLE SHOT", 10, powerUpY + powerUpIndex * 20);
    powerUpIndex++;
  }
  if (player.poweredBullet) {
    ctx.fillStyle = "red";
    ctx.fillText("POWER BULLET", 10, powerUpY + powerUpIndex * 20);
    powerUpIndex++;
  }
  if (player.speed > player.baseSpeed) {
    ctx.fillStyle = "lime";
    ctx.fillText("SPEED BOOST", 10, powerUpY + powerUpIndex * 20);
    powerUpIndex++;
  }
  if (player.hasShield) {
    ctx.fillStyle = "cyan";
    ctx.fillText("SHIELD", 10, powerUpY + powerUpIndex * 20);
  }
  
  if (player.powerUpTimer > 0) {
    const barWidth = 120;
    const barHeight = 10;
    const barX = canvas.width - barWidth - 10;
    const barY = 25;
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    const timerPercent = player.powerUpTimer / 600;
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    gradient.addColorStop(0, "#ff0000");
    gradient.addColorStop(0.5, "#ffff00");
    gradient.addColorStop(1, "#00ff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, timerPercent * barWidth, barHeight);
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.fillText("POWER", barX, barY - 3);
  }

  drawLives();
  
  if (comboCount > 1) {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 20px Arial";
    const comboText = `${comboCount}x COMBO!`;
    const comboWidth = ctx.measureText(comboText).width;
    ctx.fillText(comboText, canvas.width / 2 - comboWidth / 2, canvas.height / 2 - 50);
    
    const barWidth = 200;
    const barHeight = 4;
    const barX = canvas.width / 2 - barWidth / 2;
    const barY = canvas.height / 2 - 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "yellow";
    ctx.fillRect(barX, barY, (comboTimer / comboMaxTime) * barWidth, barHeight);
  }
  
  if (player.specialAttackCharges > 0) {
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`Special: ${player.specialAttackCharges} (X)`, 10, canvas.height - 20);
  }
  
  if (slowMotionActive) {
    ctx.fillStyle = "cyan";
    ctx.font = "bold 14px Arial";
    ctx.fillText("SLOW MOTION", canvas.width - 130, canvas.height - 20);
    
    if (autoSlowMotionTriggered) {
      ctx.fillStyle = "yellow";
      ctx.font = "10px Arial";
      ctx.fillText("AUTO", canvas.width - 130, canvas.height - 5);
    }
  }
  
  if (stormActive) {
    ctx.fillStyle = "cyan";
    ctx.font = "bold 16px Arial";
    ctx.fillText("STORM!", canvas.width / 2 - 30, 60);
  }
  
  if (collectedCoins > 0) {
    ctx.fillStyle = "gold";
    ctx.font = "12px Arial";
    ctx.fillText(`💰 ${collectedCoins}`, canvas.width - 60, 60);
  }
  
  drawMinimap();

  // 일시정지 상태가 아닐 때만 다음 프레임 요청
  if (gameState === 'playing' || gameState === 'paused') {
    requestAnimationFrame(update);
  }
}
