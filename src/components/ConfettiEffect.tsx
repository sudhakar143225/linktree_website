import { useEffect } from "react";

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

const ConfettiEffect = ({ trigger, onComplete }: ConfettiEffectProps) => {
  useEffect(() => {
    if (!trigger) return;

    // Simple confetti effect using CSS animations
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];

    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];

    // Create confetti particles
    for (let i = 0; i < 100; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 5,
      });
    }

    let animationFrame: number;
    let startTime = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity

        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

        if (particle.y > canvas.height) {
          confetti.splice(index, 1);
        }
      });

      if (confetti.length > 0 && Date.now() - startTime < 3000) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [trigger, onComplete]);

  return null;
};

export default ConfettiEffect;

