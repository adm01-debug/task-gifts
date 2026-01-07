import { useCallback, useEffect, useRef, memo } from "react";
import confetti from "canvas-confetti";

// Confetti presets
export type ConfettiPreset =
  | "celebration"
  | "achievement"
  | "levelUp"
  | "coins"
  | "fireworks"
  | "snow"
  | "stars"
  | "hearts"
  | "emoji";

interface ConfettiConfig {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  scalar?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: confetti.Shape[];
  zIndex?: number;
}

// Color palettes
const colorPalettes = {
  celebration: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
  gold: ["#FFD700", "#FFA500", "#FF8C00", "#DAA520", "#B8860B"],
  achievement: ["#9B59B6", "#3498DB", "#1ABC9C", "#F1C40F", "#E74C3C"],
  levelUp: ["#00D4FF", "#7C3AED", "#EC4899", "#10B981", "#F59E0B"],
  hearts: ["#FF69B4", "#FF1493", "#DB7093", "#FFB6C1", "#FFC0CB"],
  nature: ["#228B22", "#32CD32", "#90EE90", "#98FB98", "#00FA9A"],
};

// Create confetti instance
function fireConfetti(config: ConfettiConfig = {}) {
  const defaults: ConfettiConfig = {
    particleCount: 100,
    spread: 70,
    startVelocity: 30,
    gravity: 1,
    decay: 0.94,
    ticks: 200,
    origin: { x: 0.5, y: 0.5 },
    colors: colorPalettes.celebration,
    zIndex: 9999,
  };

  confetti({
    ...defaults,
    ...config,
  });
}

// Celebration burst
export function celebrationConfetti(origin?: { x: number; y: number }) {
  const count = 200;
  const defaults = {
    origin: origin || { x: 0.5, y: 0.5 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: ConfettiConfig) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: colorPalettes.celebration,
  });
  fire(0.2, {
    spread: 60,
    colors: colorPalettes.celebration,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: colorPalettes.celebration,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: colorPalettes.celebration,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: colorPalettes.celebration,
  });
}

// Level up confetti with stars
export function levelUpConfetti() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Burst from random positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: colorPalettes.levelUp,
    });
  }, 250);

  // Side cannons
  setTimeout(() => {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: colorPalettes.levelUp,
      zIndex: 9999,
    });
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: colorPalettes.levelUp,
      zIndex: 9999,
    });
  }, 100);
}

// Achievement unlock confetti
export function achievementConfetti(origin?: { x: number; y: number }) {
  const burstOrigin = origin || { x: 0.5, y: 0.6 };
  
  // Initial burst
  confetti({
    particleCount: 150,
    spread: 100,
    origin: burstOrigin,
    colors: colorPalettes.achievement,
    startVelocity: 45,
    zIndex: 9999,
  });

  // Delayed sparkle
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 360,
      origin: burstOrigin,
      colors: ["#FFD700", "#FFF"],
      startVelocity: 20,
      gravity: 0.5,
      scalar: 0.75,
      zIndex: 9999,
    });
  }, 200);
}

// Coin shower
export function coinConfetti() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    confetti({
      particleCount: 3,
      angle: 60 + Math.random() * 60,
      spread: 20,
      origin: { x: Math.random(), y: -0.1 },
      colors: colorPalettes.gold,
      shapes: ["circle"],
      gravity: 1.5,
      scalar: 1.5,
      drift: Math.random() - 0.5,
      zIndex: 9999,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// Fireworks effect
export function fireworksConfetti() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 9999 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      ...defaults,
      particleCount: 100,
      origin: {
        x: Math.random() * 0.6 + 0.2,
        y: Math.random() * 0.4 + 0.2,
      },
      colors: colorPalettes.celebration,
    });
  }, 400);
}

// Snow effect
export function snowConfetti() {
  const duration = 10 * 1000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    confetti({
      particleCount: 2,
      angle: 90,
      spread: 180,
      origin: { x: Math.random(), y: -0.1 },
      colors: ["#FFFFFF", "#E0E0E0", "#F5F5F5"],
      shapes: ["circle"],
      gravity: 0.4,
      scalar: 1,
      drift: Math.random() * 2 - 1,
      ticks: 400,
      zIndex: 9999,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// Star burst
export function starsConfetti(origin?: { x: number; y: number }) {
  confetti({
    particleCount: 100,
    spread: 360,
    origin: origin || { x: 0.5, y: 0.5 },
    colors: ["#FFD700", "#FFF", "#FFFACD", "#F0E68C"],
    shapes: ["star"],
    startVelocity: 40,
    gravity: 0.8,
    scalar: 1.2,
    ticks: 150,
    zIndex: 9999,
  });
}

// Hearts
export function heartsConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const heart = confetti.shapeFromPath({
    path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  });

  const frame = () => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return;

    confetti({
      particleCount: 3,
      angle: 90,
      spread: 70,
      origin: { x: Math.random(), y: -0.1 },
      colors: colorPalettes.hearts,
      shapes: [heart],
      gravity: 0.8,
      scalar: 2,
      zIndex: 9999,
    });

    requestAnimationFrame(frame);
  };

  frame();
}

// Emoji confetti
export function emojiConfetti(emojis: string[] = ["🎉", "🎊", "✨", "🌟", "💫"]) {
  const shapes = emojis.map((emoji) => 
    confetti.shapeFromText({ text: emoji, scalar: 2 })
  );

  confetti({
    particleCount: 50,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    shapes,
    scalar: 3,
    gravity: 0.8,
    ticks: 200,
    zIndex: 9999,
  });
}

// Main hook for confetti
export function useConfetti() {
  const fire = useCallback((preset: ConfettiPreset, options?: { origin?: { x: number; y: number } }) => {
    switch (preset) {
      case "celebration":
        celebrationConfetti(options?.origin);
        break;
      case "achievement":
        achievementConfetti(options?.origin);
        break;
      case "levelUp":
        levelUpConfetti();
        break;
      case "coins":
        coinConfetti();
        break;
      case "fireworks":
        fireworksConfetti();
        break;
      case "snow":
        snowConfetti();
        break;
      case "stars":
        starsConfetti(options?.origin);
        break;
      case "hearts":
        heartsConfetti();
        break;
      case "emoji":
        emojiConfetti();
        break;
    }
  }, []);

  const fireCustom = useCallback((config: ConfettiConfig) => {
    fireConfetti(config);
  }, []);

  const fireAtElement = useCallback((
    element: HTMLElement,
    preset: ConfettiPreset = "celebration"
  ) => {
    const rect = element.getBoundingClientRect();
    const origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
    fire(preset, { origin });
  }, [fire]);

  return {
    fire,
    fireCustom,
    fireAtElement,
    presets: {
      celebration: () => fire("celebration"),
      achievement: () => fire("achievement"),
      levelUp: () => fire("levelUp"),
      coins: () => fire("coins"),
      fireworks: () => fire("fireworks"),
      snow: () => fire("snow"),
      stars: () => fire("stars"),
      hearts: () => fire("hearts"),
      emoji: () => fire("emoji"),
    },
  };
}

// Confetti trigger button (for testing)
export const ConfettiButton = memo(function ConfettiButton({
  preset = "celebration",
  children,
  className,
}: {
  preset?: ConfettiPreset;
  children?: React.ReactNode;
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { fireAtElement } = useConfetti();

  const handleClick = () => {
    if (buttonRef.current) {
      fireAtElement(buttonRef.current, preset);
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={className}
    >
      {children || "🎉 Celebrate!"}
    </button>
  );
});

// Auto confetti on mount (for celebrations)
export function useAutoConfetti(
  preset: ConfettiPreset,
  trigger: boolean,
  delay: number = 0
) {
  const { fire } = useConfetti();

  useEffect(() => {
    if (trigger) {
      const timeout = setTimeout(() => {
        fire(preset);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [trigger, preset, delay, fire]);
}
