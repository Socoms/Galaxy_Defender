// ▶ 설정 화면 관련 기능

// 설정 화면 관련 DOM
const settingsScreen = document.getElementById('settingsScreen');
const settingsBtn = document.getElementById('settingsBtn');
const settingsBackBtn = document.getElementById('settingsBackBtn');
const resetDataBtn = document.getElementById('resetDataBtn');
const themeToggle = document.getElementById('themeToggle');
const soundEffectsToggle = document.getElementById('soundEffectsToggle');
const backgroundMusicToggle = document.getElementById('backgroundMusicToggle');

// 설정 적용
function applySettings() {
  if (gameSettings.lightMode) {
    document.body.classList.add('light-mode');
    if (themeToggle) themeToggle.checked = true;
  } else {
    document.body.classList.remove('light-mode');
    if (themeToggle) themeToggle.checked = false;
  }
}

// ▶ 설정 화면 열기
function openSettings() {
  settingsScreen.classList.remove('hidden');
  menuScreen.classList.add('hidden');
  updateSettingsDisplay();
}

// ▶ 설정 화면 표시 업데이트
function updateSettingsDisplay() {
  if (themeToggle) themeToggle.checked = gameSettings.lightMode;
  if (soundEffectsToggle) soundEffectsToggle.checked = gameSettings.soundEffects;
  if (backgroundMusicToggle) backgroundMusicToggle.checked = gameSettings.backgroundMusic;
}

// ▶ 데이터 초기화
function resetGameData() {
  if (confirm('모든 게임 데이터를 초기화하시겠습니까?\n(최고 점수, 코인, 업그레이드 등이 모두 삭제됩니다)')) {
    localStorage.removeItem('galaxyDefenderHighScore');
    localStorage.removeItem('totalPoints');
    localStorage.removeItem('totalCoins');
    localStorage.removeItem('upgrade_bulletDamage');
    localStorage.removeItem('upgrade_playerSpeed');
    localStorage.removeItem('upgrade_specialCharges');
    localStorage.removeItem('upgrade_maxLives');
    
    upgrades.bulletDamage = 1;
    upgrades.playerSpeed = 0;
    upgrades.specialCharges = 0;
    upgrades.maxLives = 0;
    
    updateSettingsDisplay();
    if (highScoreDisplay) highScoreDisplay.textContent = '0';
    if (totalPointsDisplay) totalPointsDisplay.textContent = '0';
    
    alert('데이터가 초기화되었습니다.');
  }
}


