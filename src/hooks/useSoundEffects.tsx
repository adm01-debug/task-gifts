import { useCallback, useRef } from "react";

// Audio context for sound generation
const createAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Achievement unlock sound - triumphant fanfare
  const playAchievementSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Create multiple oscillators for a rich sound
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      osc.type = "sine";
      
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }, [getAudioContext]);

  // Level up sound - epic ascending fanfare
  const playLevelUpSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Sweep effect
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    
    sweep.type = "sawtooth";
    sweep.frequency.setValueAtTime(200, now);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    sweep.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
    
    sweepGain.gain.setValueAtTime(0.1, now);
    sweepGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    
    sweep.start(now);
    sweep.stop(now + 0.8);

    // Chord burst
    const chordNotes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    
    chordNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + 0.3);
      osc.type = "triangle";
      
      gain.gain.setValueAtTime(0, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc.start(now + 0.3);
      osc.stop(now + 1.3);
    });
  }, [getAudioContext]);

  // XP gain sound - quick positive blip
  const playXPSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }, [getAudioContext]);

  // Click/tap sound
  const playClickSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }, [getAudioContext]);

  // Quest complete sound
  const playQuestCompleteSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5 (A major)
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }, [getAudioContext]);

  return {
    playAchievementSound,
    playLevelUpSound,
    playXPSound,
    playClickSound,
    playQuestCompleteSound,
  };
};
