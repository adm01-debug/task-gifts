import { useCallback, useRef, useEffect, useState, createContext, useContext } from "react";

// Sound types available in the system
export type GameSoundType =
  | "xp_gain"
  | "level_up"
  | "coin_collect"
  | "achievement_unlock"
  | "quest_complete"
  | "click"
  | "hover"
  | "success"
  | "error"
  | "notification"
  | "reward"
  | "streak"
  | "power_up"
  | "mystery_box"
  | "countdown"
  | "fanfare";

// Sound configuration
interface SoundConfig {
  volume: number;
  rate: number;
  variations?: number; // Number of pitch variations
}

// Default sound configurations
const soundConfigs: Record<GameSoundType, SoundConfig> = {
  xp_gain: { volume: 0.4, rate: 1.2, variations: 3 },
  level_up: { volume: 0.7, rate: 1.0 },
  coin_collect: { volume: 0.5, rate: 1.3, variations: 5 },
  achievement_unlock: { volume: 0.6, rate: 1.0 },
  quest_complete: { volume: 0.6, rate: 1.0 },
  click: { volume: 0.2, rate: 1.0 },
  hover: { volume: 0.1, rate: 1.2 },
  success: { volume: 0.5, rate: 1.0 },
  error: { volume: 0.4, rate: 0.8 },
  notification: { volume: 0.4, rate: 1.0 },
  reward: { volume: 0.6, rate: 1.0 },
  streak: { volume: 0.5, rate: 1.1 },
  power_up: { volume: 0.5, rate: 1.0 },
  mystery_box: { volume: 0.6, rate: 1.0 },
  countdown: { volume: 0.3, rate: 1.0 },
  fanfare: { volume: 0.7, rate: 1.0 },
};

// Web Audio API based sound generator
class GameAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.7;

  constructor() {
    // Initialize on first user interaction
    if (typeof window !== "undefined") {
      const initAudio = () => {
        this.init();
        document.removeEventListener("click", initAudio);
        document.removeEventListener("keydown", initAudio);
      };
      document.addEventListener("click", initAudio, { once: true });
      document.addEventListener("keydown", initAudio, { once: true });
    }
  }

  private init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.masterVolume;
    } catch (err: unknown) {
      console.warn("Web Audio API not supported", err);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  // Generate a simple tone
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume: number = 0.5,
    attack: number = 0.01,
    decay: number = 0.1
  ) {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration + 0.1);
  }

  // Play XP gain sound (ascending chime)
  playXPGain() {
    const variation = Math.random() * 200;
    this.playTone(800 + variation, 0.15, "sine", 0.3);
    setTimeout(() => this.playTone(1000 + variation, 0.15, "sine", 0.25), 50);
    setTimeout(() => this.playTone(1200 + variation, 0.2, "sine", 0.2), 100);
  }

  // Play level up fanfare
  playLevelUp() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, "triangle", 0.4);
      }, i * 100);
    });
    // Add sparkle
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTone(1500 + Math.random() * 1000, 0.1, "sine", 0.2);
        }, i * 50);
      }
    }, 400);
  }

  // Play coin collect sound
  playCoinCollect() {
    const pitch = 800 + Math.random() * 400;
    this.playTone(pitch, 0.08, "square", 0.2);
    this.playTone(pitch * 1.5, 0.1, "square", 0.15);
  }

  // Play achievement unlock
  playAchievement() {
    const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, "sine", 0.35);
        this.playTone(freq * 2, 0.25, "sine", 0.15); // Harmonic
      }, i * 80);
    });
  }

  // Play quest complete
  playQuestComplete() {
    this.playTone(523, 0.15, "triangle", 0.4);
    setTimeout(() => this.playTone(659, 0.15, "triangle", 0.35), 100);
    setTimeout(() => this.playTone(784, 0.3, "triangle", 0.4), 200);
  }

  // Play click sound
  playClick() {
    this.playTone(600, 0.05, "square", 0.15);
  }

  // Play hover sound
  playHover() {
    this.playTone(800, 0.03, "sine", 0.08);
  }

  // Play success sound
  playSuccess() {
    this.playTone(523, 0.1, "sine", 0.3);
    setTimeout(() => this.playTone(659, 0.15, "sine", 0.25), 80);
  }

  // Play error sound
  playError() {
    this.playTone(200, 0.15, "sawtooth", 0.25);
    setTimeout(() => this.playTone(150, 0.2, "sawtooth", 0.2), 100);
  }

  // Play notification
  playNotification() {
    this.playTone(880, 0.1, "sine", 0.3);
    setTimeout(() => this.playTone(1100, 0.15, "sine", 0.25), 100);
  }

  // Play reward sound
  playReward() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(600 + i * 200, 0.15, "sine", 0.3 - i * 0.05);
      }, i * 80);
    }
  }

  // Play streak sound
  playStreak() {
    const baseFreq = 440;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playTone(baseFreq * Math.pow(1.2, i), 0.1, "triangle", 0.3);
      }, i * 60);
    }
  }

  // Play power up sound
  playPowerUp() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.playTone(400 + i * 100, 0.05, "sawtooth", 0.2 - i * 0.015);
      }, i * 30);
    }
  }

  // Play mystery box opening
  playMysteryBox() {
    // Drum roll effect
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playTone(200 + Math.random() * 100, 0.05, "triangle", 0.2);
      }, i * 50);
    }
    // Reveal
    setTimeout(() => {
      this.playAchievement();
    }, 450);
  }

  // Play countdown tick
  playCountdown() {
    this.playTone(800, 0.08, "square", 0.25);
  }

  // Play fanfare
  playFanfare() {
    const melody = [523, 659, 784, 1047, 784, 1047]; // C-E-G-C-G-C
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, "triangle", 0.4);
        this.playTone(freq / 2, 0.2, "triangle", 0.2); // Bass
      }, i * 120);
    });
  }

  // Generic play method
  play(type: GameSoundType) {
    switch (type) {
      case "xp_gain": this.playXPGain(); break;
      case "level_up": this.playLevelUp(); break;
      case "coin_collect": this.playCoinCollect(); break;
      case "achievement_unlock": this.playAchievement(); break;
      case "quest_complete": this.playQuestComplete(); break;
      case "click": this.playClick(); break;
      case "hover": this.playHover(); break;
      case "success": this.playSuccess(); break;
      case "error": this.playError(); break;
      case "notification": this.playNotification(); break;
      case "reward": this.playReward(); break;
      case "streak": this.playStreak(); break;
      case "power_up": this.playPowerUp(); break;
      case "mystery_box": this.playMysteryBox(); break;
      case "countdown": this.playCountdown(); break;
      case "fanfare": this.playFanfare(); break;
    }
  }
}

// Singleton instance
let audioEngine: GameAudioEngine | null = null;

function getAudioEngine(): GameAudioEngine {
  if (!audioEngine) {
    audioEngine = new GameAudioEngine();
  }
  return audioEngine;
}

// Context for sound settings
interface SoundContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  playSound: (type: GameSoundType) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

// Provider component
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("game-sounds-enabled");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("game-sounds-volume");
      return saved !== null ? parseFloat(saved) : 0.7;
    }
    return 0.7;
  });

  const setVolumeAndPersist = useCallback((vol: number) => {
    const newVol = Math.max(0, Math.min(1, vol));
    setVolumeState(newVol);
    localStorage.setItem("game-sounds-volume", newVol.toString());
    getAudioEngine().setMasterVolume(newVol);
  }, []);

  const setEnabledAndPersist = useCallback((en: boolean) => {
    setEnabled(en);
    localStorage.setItem("game-sounds-enabled", en.toString());
    getAudioEngine().setEnabled(en);
  }, []);

  const playSound = useCallback((type: GameSoundType) => {
    if (enabled) {
      getAudioEngine().play(type);
    }
  }, [enabled]);

  // Sync settings on mount
  useEffect(() => {
    getAudioEngine().setEnabled(enabled);
    getAudioEngine().setMasterVolume(volume);
  }, [enabled, volume]);

  return (
    <SoundContext.Provider
      value={{
        enabled,
        setEnabled: setEnabledAndPersist,
        volume,
        setVolume: setVolumeAndPersist,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

// Main hook
export function useGameSounds() {
  const context = useContext(SoundContext);
  
  // Fallback if used outside provider
  const playSound = useCallback((type: GameSoundType) => {
    getAudioEngine().play(type);
  }, []);

  if (context) {
    return context;
  }

  // Provide basic functionality even without context
  return {
    enabled: true,
    setEnabled: (enabled: boolean) => getAudioEngine().setEnabled(enabled),
    volume: 0.7,
    setVolume: (vol: number) => getAudioEngine().setMasterVolume(vol),
    playSound,
  };
}

// Specific sound hooks for convenience
export function useXPSound() {
  const { playSound } = useGameSounds();
  return useCallback(() => playSound("xp_gain"), [playSound]);
}

export function useLevelUpSound() {
  const { playSound } = useGameSounds();
  return useCallback(() => playSound("level_up"), [playSound]);
}

export function useCoinSound() {
  const { playSound } = useGameSounds();
  return useCallback(() => playSound("coin_collect"), [playSound]);
}

export function useAchievementSound() {
  const { playSound } = useGameSounds();
  return useCallback(() => playSound("achievement_unlock"), [playSound]);
}

export function useClickSound() {
  const { playSound } = useGameSounds();
  return useCallback(() => playSound("click"), [playSound]);
}
