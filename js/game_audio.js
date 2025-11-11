// ▶ 오디오 시스템 (배경음악 및 효과음)

// 오디오 컨텍스트 생성
let audioContext = null;
let backgroundMusicSource = null;
let backgroundMusicGain = null;

// 오디오 컨텍스트 초기화 (사용자 인터랙션 후에만 가능)
function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      backgroundMusicGain = audioContext.createGain();
      backgroundMusicGain.connect(audioContext.destination);
    } catch (e) {
      console.warn('오디오 컨텍스트 생성 실패:', e);
    }
  }
  return audioContext;
}

// 사용자 인터랙션으로 오디오 컨텍스트 활성화
function enableAudio() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  } else {
    initAudioContext();
  }
}

// ▶ 효과음 생성 및 재생
function playSound(type, volume = 0.3) {
  if (!gameSettings.soundEffects) return;
  
  const ctx = initAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  switch (type) {
    case 'shoot':
      // 총알 발사음 - 짧고 높은 톤
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
      break;
      
    case 'hit':
      // 적 피격음 - 중간 톤
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      break;
      
    case 'explosion':
      // 폭발음 - 낮은 톤
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      break;
      
    case 'powerup':
      // 파워업 획득음 - 상승하는 톤
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
      break;
      
    case 'coin':
      // 코인 획득음 - 짧고 밝은 톤
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1);
      break;
      
    case 'damage':
      // 피격음 - 낮고 거친 톤
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
      break;
      
    case 'special':
      // 특수 공격음 - 복합 톤
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(500, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1);
      oscillator.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      break;
      
    case 'boss':
      // 보스 등장음 - 낮고 강한 톤
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      break;
      
    default:
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
  }
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.2);
}

// 배경음악 루프 타이머
let backgroundMusicTimer = null;

// ▶ 배경음악 재생 (Web Audio API로 생성)
function playBackgroundMusic() {
  if (!gameSettings.backgroundMusic) return;
  
  const ctx = initAudioContext();
  if (!ctx) return;
  
  // 이미 재생 중이면 중지
  if (backgroundMusicTimer) {
    clearInterval(backgroundMusicTimer);
  }
  
  // 간단한 배경음악 생성 (루프)
  const createTone = (freq, startTime, duration, type = 'sine', volume = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.1);
    gain.gain.linearRampToValueAtTime(volume, startTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.connect(gain);
    gain.connect(backgroundMusicGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };
  
  // 배경음악 패턴 생성 (4/4 박자)
  const bpm = 120;
  const beatDuration = 60 / bpm;
  const pattern = [
    // 코드 진행: C - Am - F - G
    { chord: [261.63, 329.63, 392.00], time: 0 },      // C
    { chord: [220.00, 261.63, 329.63], time: 2 },     // Am
    { chord: [174.61, 220.00, 261.63], time: 4 },      // F
    { chord: [196.00, 246.94, 293.66], time: 6 },     // G
  ];
  
  const loopDuration = 8 * beatDuration; // 8박자 루프
  
  function playLoop() {
    if (!gameSettings.backgroundMusic || gameState !== 'playing') {
      clearInterval(backgroundMusicTimer);
      backgroundMusicTimer = null;
      return;
    }
    
    const startTime = ctx.currentTime;
    
    // 베이스 라인
    pattern.forEach(({ chord, time }) => {
      const noteTime = startTime + time * beatDuration;
      createTone(chord[0] / 2, noteTime, beatDuration * 2, 'sine', 0.08);
    });
    
    // 멜로디 라인
    pattern.forEach(({ chord, time }) => {
      const noteTime = startTime + time * beatDuration;
      chord.forEach((freq, i) => {
        if (i > 0) {
          createTone(freq, noteTime + i * 0.1, beatDuration * 0.8, 'triangle', 0.06);
        }
      });
    });
    
    // 드럼 라인 (간단한 킥)
    for (let i = 0; i < 8; i++) {
      const kickTime = startTime + i * beatDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, kickTime);
      osc.frequency.exponentialRampToValueAtTime(30, kickTime + 0.1);
      
      gain.gain.setValueAtTime(0, kickTime);
      gain.gain.linearRampToValueAtTime(0.12, kickTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, kickTime + 0.1);
      
      osc.connect(gain);
      gain.connect(backgroundMusicGain);
      
      osc.start(kickTime);
      osc.stop(kickTime + 0.1);
    }
  }
  
  // 첫 번째 루프 재생
  playLoop();
  
  // 주기적으로 루프 재생
  backgroundMusicTimer = setInterval(() => {
    playLoop();
  }, loopDuration * 1000);
}

// ▶ 배경음악 중지
function stopBackgroundMusic() {
  if (backgroundMusicTimer) {
    clearInterval(backgroundMusicTimer);
    backgroundMusicTimer = null;
  }
  if (backgroundMusicSource) {
    backgroundMusicSource.stop();
    backgroundMusicSource = null;
  }
}

// ▶ 배경음악 일시정지/재개
function pauseBackgroundMusic() {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

function resumeBackgroundMusic() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// 게임 시작 시 오디오 활성화
document.addEventListener('click', enableAudio, { once: true });
document.addEventListener('keydown', enableAudio, { once: true });
document.addEventListener('touchstart', enableAudio, { once: true });

