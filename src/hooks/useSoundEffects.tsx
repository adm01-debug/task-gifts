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

  // Epic reward celebration - magical shimmer with chimes
  const playEpicCelebrationSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Magical shimmer sweep
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(800, now);
    shimmer.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
    shimmer.frequency.exponentialRampToValueAtTime(1500, now + 0.4);
    
    shimmerGain.gain.setValueAtTime(0.08, now);
    shimmerGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    shimmer.start(now);
    shimmer.stop(now + 0.6);

    // Purple/pink themed chord (minor with mystical feel)
    const chordNotes = [523.25, 622.25, 783.99, 932.33, 1046.50]; // C5, Eb5, G5, Bb5, C6
    
    chordNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + 0.15 + i * 0.04);
      osc.type = "triangle";
      
      gain.gain.setValueAtTime(0, now + 0.15 + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.2 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      osc.start(now + 0.15 + i * 0.04);
      osc.stop(now + 0.9);
    });

    // Sparkle effects
    for (let i = 0; i < 5; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      sparkle.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      
      const sparkleFreq = 1500 + Math.random() * 1500;
      sparkle.frequency.setValueAtTime(sparkleFreq, now + 0.3 + i * 0.08);
      sparkle.type = "sine";
      
      sparkleGain.gain.setValueAtTime(0, now + 0.3 + i * 0.08);
      sparkleGain.gain.linearRampToValueAtTime(0.05, now + 0.32 + i * 0.08);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45 + i * 0.08);
      
      sparkle.start(now + 0.3 + i * 0.08);
      sparkle.stop(now + 0.5 + i * 0.08);
    }
  }, [getAudioContext]);

  // Legendary reward celebration - epic fanfare with golden shimmer
  const playLegendaryCelebrationSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Grand opening sweep (brass-like)
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    
    sweep.type = "sawtooth";
    sweep.frequency.setValueAtTime(150, now);
    sweep.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    
    sweepGain.gain.setValueAtTime(0.08, now);
    sweepGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    sweep.start(now);
    sweep.stop(now + 0.7);

    // Triumphant fanfare notes (golden major chord progression)
    const fanfareNotes = [
      { freq: 392.00, time: 0.1 },   // G4
      { freq: 493.88, time: 0.2 },   // B4
      { freq: 587.33, time: 0.3 },   // D5
      { freq: 783.99, time: 0.4 },   // G5
      { freq: 987.77, time: 0.5 },   // B5
      { freq: 1174.66, time: 0.6 },  // D6
    ];
    
    fanfareNotes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + time);
      osc.type = "triangle";
      
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.12, now + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.5);
      
      osc.start(now + time);
      osc.stop(now + time + 0.6);
    });

    // Final grand chord
    const grandChord = [392.00, 493.88, 587.33, 783.99]; // G major
    
    grandChord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + 0.7);
      osc.type = "sine";
      
      gain.gain.setValueAtTime(0, now + 0.7);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.75);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      osc.start(now + 0.7);
      osc.stop(now + 1.6);
    });

    // Golden shimmer sparkles
    for (let i = 0; i < 8; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      sparkle.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      
      const sparkleFreq = 2000 + Math.random() * 2000;
      sparkle.frequency.setValueAtTime(sparkleFreq, now + 0.8 + i * 0.1);
      sparkle.type = "sine";
      
      sparkleGain.gain.setValueAtTime(0, now + 0.8 + i * 0.1);
      sparkleGain.gain.linearRampToValueAtTime(0.04, now + 0.82 + i * 0.1);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95 + i * 0.1);
      
      sparkle.start(now + 0.8 + i * 0.1);
      sparkle.stop(now + 1.0 + i * 0.1);
    }
  }, [getAudioContext]);

  return {
    playAchievementSound,
    playLevelUpSound,
    playXPSound,
    playClickSound,
    playQuestCompleteSound,
    playEpicCelebrationSound,
    playLegendaryCelebrationSound,
  };
};
