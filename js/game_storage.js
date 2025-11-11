// ▶ 로컬 스토리지 관리 (점수, 업그레이드, 설정)

// ▶ 최고 점수 관리
function getHighScore() {
  return parseInt(localStorage.getItem('galaxyDefenderHighScore') || '0');
}

function setHighScore(score) {
  localStorage.setItem('galaxyDefenderHighScore', score.toString());
}

// ▶ 업그레이드 시스템
const upgrades = {
  bulletDamage: parseInt(localStorage.getItem('upgrade_bulletDamage') || '1'),
  playerSpeed: parseInt(localStorage.getItem('upgrade_playerSpeed') || '0'),
  specialCharges: parseInt(localStorage.getItem('upgrade_specialCharges') || '0'),
  maxLives: parseInt(localStorage.getItem('upgrade_maxLives') || '0')
};

const upgradeCosts = {
  bulletDamage: 10,  // 총알 데미지 1 증가 (코인)
  playerSpeed: 15,  // 이동 속도 1 증가 (코인)
  specialCharges: 20,  // 특수 공격 충전 +1 (코인)
  maxLives: 30  // 최대 생명 +1 (코인)
};

function saveUpgrades() {
  localStorage.setItem('upgrade_bulletDamage', upgrades.bulletDamage.toString());
  localStorage.setItem('upgrade_playerSpeed', upgrades.playerSpeed.toString());
  localStorage.setItem('upgrade_specialCharges', upgrades.specialCharges.toString());
  localStorage.setItem('upgrade_maxLives', upgrades.maxLives.toString());
}

function getUpgradeCost(upgradeType) {
  const baseCost = upgradeCosts[upgradeType];
  const currentLevel = upgrades[upgradeType];
  return baseCost + (currentLevel * 5);  // 레벨마다 5코인씩 증가
}

// ▶ 총 점수 관리
function getTotalPoints() {
  return parseInt(localStorage.getItem('totalPoints') || '0');
}

function addTotalPoints(points) {
  const current = getTotalPoints();
  localStorage.setItem('totalPoints', (current + points).toString());
}

function spendPoints(cost) {
  const current = getTotalPoints();
  if (current >= cost) {
    localStorage.setItem('totalPoints', (current - cost).toString());
    return true;
  }
  return false;
}

// ▶ 코인 관리
function getTotalCoins() {
  return parseInt(localStorage.getItem('totalCoins') || '0');
}

function addTotalCoins(coins) {
  const current = getTotalCoins();
  localStorage.setItem('totalCoins', (current + coins).toString());
}

function spendCoins(cost) {
  const current = getTotalCoins();
  if (current >= cost) {
    localStorage.setItem('totalCoins', (current - cost).toString());
    return true;
  }
  return false;
}

// ▶ 게임 설정 관리
const gameSettings = {
  lightMode: localStorage.getItem('game_lightMode') === 'true',
  soundEffects: localStorage.getItem('game_soundEffects') !== 'false', // 기본값 true
  backgroundMusic: localStorage.getItem('game_backgroundMusic') !== 'false' // 기본값 true
};

function saveSettings() {
  localStorage.setItem('game_lightMode', gameSettings.lightMode.toString());
  localStorage.setItem('game_soundEffects', gameSettings.soundEffects.toString());
  localStorage.setItem('game_backgroundMusic', gameSettings.backgroundMusic.toString());
}


