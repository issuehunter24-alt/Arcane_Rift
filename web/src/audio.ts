/**
 * 사운드 시스템 매니저
 * Web Audio API 기반
 */

type SoundType = 'bgm' | 'sfx';

interface AudioSettings {
  masterVolume: number; // 0.0 ~ 1.0
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
}

interface AudioTrack {
  name: string;
  type: SoundType;
  audio: HTMLAudioElement | null;
  loaded: boolean;
  isPlaying: boolean;
}

class AudioManager {
  private tracks: Map<string, AudioTrack> = new Map();
  private settings: AudioSettings = {
    masterVolume: 0.7,
    bgmVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
  };
  private currentBGM: string | null = null;

  constructor() {
    // localStorage에서 설정 불러오기
    this.loadSettings();
  }

  /**
   * 사운드 파일 등록 (프리로드)
   */
  register(name: string, path: string, type: SoundType = 'sfx'): void {
    if (this.tracks.has(name)) {
      console.warn(`[Audio] Sound "${name}" is already registered.`);
      return;
    }

    const audio = new Audio();
    audio.preload = 'auto';
    
    const track: AudioTrack = {
      name,
      type,
      audio: null,
      loaded: false,
      isPlaying: false,
    };

    audio.addEventListener('canplaythrough', () => {
      track.loaded = true;
      console.log(`[Audio] Loaded: ${name}`);
    });

    audio.addEventListener('error', (e) => {
      console.warn(`[Audio] Failed to load: ${name}`, e);
      track.audio = null;
    });

    audio.src = path;
    track.audio = audio;
    
    // BGM은 루프 설정
    if (type === 'bgm') {
      audio.loop = true;
    }

    this.tracks.set(name, track);
  }

  /**
   * 효과음 재생 (원샷)
   */
  playSFX(name: string, volume?: number): void {
    if (this.settings.muted) return;

    const track = this.tracks.get(name);
    if (!track || !track.audio || !track.loaded) {
      console.warn(`[Audio] SFX not found or not loaded: ${name}`);
      return;
    }

    // 복제하여 재생 (중복 재생 가능)
    const clone = track.audio.cloneNode() as HTMLAudioElement;
    const effectiveVolume = 
      (volume ?? 1.0) * 
      this.settings.sfxVolume * 
      this.settings.masterVolume;
    
    clone.volume = Math.max(0, Math.min(1, effectiveVolume));
    clone.play().catch(err => {
      console.warn(`[Audio] Failed to play SFX: ${name}`, err);
    });
  }

  /**
   * 배경음악 재생
   */
  playBGM(name: string, fadeIn: boolean = true): void {
    if (this.currentBGM === name) return;

    // 기존 BGM 정지
    if (this.currentBGM) {
      this.stopBGM(true);
    }

    if (this.settings.muted) {
      this.currentBGM = name;
      return;
    }

    const track = this.tracks.get(name);
    if (!track || !track.audio || !track.loaded) {
      console.warn(`[Audio] BGM not found or not loaded: ${name}`);
      return;
    }

    const audio = track.audio;
    const targetVolume = this.settings.bgmVolume * this.settings.masterVolume;

    if (fadeIn) {
      audio.volume = 0;
      audio.play().catch(err => {
        console.warn(`[Audio] Failed to play BGM: ${name}`, err);
      });
      
      // 페이드 인 (2초)
      let currentVol = 0;
      const fadeInterval = setInterval(() => {
        currentVol += 0.02;
        if (currentVol >= targetVolume) {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
        } else {
          audio.volume = currentVol;
        }
      }, 40); // 2000ms / 50 steps = 40ms
    } else {
      audio.volume = targetVolume;
      audio.play().catch(err => {
        console.warn(`[Audio] Failed to play BGM: ${name}`, err);
      });
    }

    track.isPlaying = true;
    this.currentBGM = name;
  }

  /**
   * 배경음악 정지
   */
  stopBGM(fadeOut: boolean = true): void {
    if (!this.currentBGM) return;

    const track = this.tracks.get(this.currentBGM);
    if (!track || !track.audio) return;

    const audio = track.audio;

    if (fadeOut) {
      // 페이드 아웃 (1초)
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume -= 0.02;
        } else {
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fadeInterval);
        }
      }, 20); // 1000ms / 50 steps = 20ms
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    track.isPlaying = false;
    this.currentBGM = null;
  }

  /**
   * 배경음악 일시정지/재개
   */
  pauseBGM(): void {
    if (!this.currentBGM) return;
    const track = this.tracks.get(this.currentBGM);
    if (track?.audio) {
      track.audio.pause();
      track.isPlaying = false;
    }
  }

  resumeBGM(): void {
    if (!this.currentBGM) return;
    const track = this.tracks.get(this.currentBGM);
    if (track?.audio && !this.settings.muted) {
      track.audio.play();
      track.isPlaying = true;
    }
  }

  /**
   * 볼륨 설정
   */
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
    this.saveSettings();
  }

  setBGMVolume(volume: number): void {
    this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
    this.saveSettings();
  }

  setSFXVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  private updateBGMVolume(): void {
    if (!this.currentBGM) return;
    const track = this.tracks.get(this.currentBGM);
    if (track?.audio) {
      track.audio.volume = this.settings.bgmVolume * this.settings.masterVolume;
    }
  }

  /**
   * 음소거 토글
   */
  setMuted(muted: boolean): void {
    this.settings.muted = muted;
    
    if (muted) {
      this.pauseBGM();
    } else {
      this.resumeBGM();
    }
    
    this.saveSettings();
  }

  toggleMute(): boolean {
    this.setMuted(!this.settings.muted);
    return this.settings.muted;
  }

  /**
   * 설정 가져오기
   */
  getSettings(): Readonly<AudioSettings> {
    return { ...this.settings };
  }

  /**
   * 설정 저장 (localStorage)
   */
  private saveSettings(): void {
    localStorage.setItem('gals_audio_settings', JSON.stringify(this.settings));
  }

  /**
   * 설정 불러오기 (localStorage)
   */
  private loadSettings(): void {
    const saved = localStorage.getItem('gals_audio_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings = {
          masterVolume: parsed.masterVolume ?? 0.7,
          bgmVolume: parsed.bgmVolume ?? 0.5,
          sfxVolume: parsed.sfxVolume ?? 0.8,
          muted: parsed.muted ?? false,
        };
        console.log('[Audio] Settings loaded:', this.settings);
      } catch (e) {
        console.warn('[Audio] Failed to load settings:', e);
      }
    }
  }

  /**
   * 모든 사운드 정지
   */
  stopAll(): void {
    this.stopBGM(false);
    this.tracks.forEach(track => {
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
        track.isPlaying = false;
      }
    });
  }

  /**
   * 디버그 정보
   */
  getDebugInfo(): string {
    const loaded = Array.from(this.tracks.values()).filter(t => t.loaded).length;
    const total = this.tracks.size;
    return `Audio: ${loaded}/${total} loaded, BGM: ${this.currentBGM || 'none'}, Muted: ${this.settings.muted}`;
  }
}

// 싱글톤 인스턴스
export const audioManager = new AudioManager();

/**
 * 사운드 파일 경로 상수
 */
export const SoundPaths = {
  // SFX - 카드
  cardPlay: 'sounds/sfx/card_play.mp3',
  cardDraw: 'sounds/sfx/card_draw.mp3',
  cardShuffle: 'sounds/sfx/card_shuffle.mp3',
  
  // SFX - 전투
  damage: 'sounds/sfx/damage.mp3',
  heal: 'sounds/sfx/heal.mp3',
  shield: 'sounds/sfx/shield.mp3',
  critical: 'sounds/sfx/critical.mp3',
  
  // SFX - 상태이상
  burn: 'sounds/sfx/burn.mp3',
  freeze: 'sounds/sfx/freeze.mp3',
  shock: 'sounds/sfx/shock.mp3',
  
  // SFX - UI
  buttonClick: 'sounds/sfx/button_click.mp3',
  buttonHover: 'sounds/sfx/button_hover.mp3',
  menuOpen: 'sounds/sfx/menu_open.mp3',
  turnEnd: 'sounds/sfx/turn_end.mp3',
  
  // SFX - 게임 상태
  victory: 'sounds/sfx/victory.mp3',
  defeat: 'sounds/sfx/defeat.mp3',
  levelUp: 'sounds/sfx/level_up.mp3',
  
  // BGM
  bgmMenu: 'sounds/bgm/menu.mp3',
  bgmBattle: 'sounds/bgm/battle.mp3',
  bgmShop: 'sounds/bgm/shop.mp3',
  bgmVictory: 'sounds/bgm/victory_jingle.mp3',
};

/**
 * 모든 사운드 등록 (초기화)
 */
export function initAudio(): void {
  console.log('[Audio] Initializing audio system...');
  
  // SFX 등록
  audioManager.register('card_play', SoundPaths.cardPlay, 'sfx');
  audioManager.register('card_draw', SoundPaths.cardDraw, 'sfx');
  audioManager.register('card_shuffle', SoundPaths.cardShuffle, 'sfx');
  audioManager.register('damage', SoundPaths.damage, 'sfx');
  audioManager.register('heal', SoundPaths.heal, 'sfx');
  audioManager.register('shield', SoundPaths.shield, 'sfx');
  audioManager.register('critical', SoundPaths.critical, 'sfx');
  audioManager.register('burn', SoundPaths.burn, 'sfx');
  audioManager.register('freeze', SoundPaths.freeze, 'sfx');
  audioManager.register('shock', SoundPaths.shock, 'sfx');
  audioManager.register('button_click', SoundPaths.buttonClick, 'sfx');
  audioManager.register('button_hover', SoundPaths.buttonHover, 'sfx');
  audioManager.register('menu_open', SoundPaths.menuOpen, 'sfx');
  audioManager.register('turn_end', SoundPaths.turnEnd, 'sfx');
  audioManager.register('victory', SoundPaths.victory, 'sfx');
  audioManager.register('defeat', SoundPaths.defeat, 'sfx');
  audioManager.register('level_up', SoundPaths.levelUp, 'sfx');
  
  // BGM 등록
  audioManager.register('bgm_menu', SoundPaths.bgmMenu, 'bgm');
  audioManager.register('bgm_battle', SoundPaths.bgmBattle, 'bgm');
  audioManager.register('bgm_shop', SoundPaths.bgmShop, 'bgm');
  audioManager.register('bgm_victory', SoundPaths.bgmVictory, 'bgm');
  
  console.log('[Audio] Audio system initialized');
  console.log(audioManager.getDebugInfo());
}

