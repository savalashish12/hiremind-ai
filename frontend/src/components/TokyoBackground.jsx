import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, CloudRain, Volume2, VolumeX, Sparkles, Cpu } from 'lucide-react';
import { isMuted, setMuted } from '../utils/SoundEffects';

const TokyoBackground = ({ children, timeMode, setTimeMode, weather, setWeather }) => {
  const [muted, setLocalMuted] = useState(isMuted());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Mouse move handler for parallax offsets
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientWidth, clientHeight } = document.documentElement;
      const x = (e.clientX / clientWidth - 0.5) * 40; // Max 40px offset
      const y = (e.clientY / clientHeight - 0.5) * 40;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas loop for rain, sakura, shooting stars, and floating cyber particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles definitions
    const particles = [];
    const sakuraPetals = [];
    const raindrops = [];
    const shootingStars = [];

    // Initialize Sakura
    for (let i = 0; i < 25; i++) {
      sakuraPetals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 4 + 2,
        d: Math.random() * 1.5 + 0.5,
        speedX: Math.random() * 1 - 0.5 + 0.6,
        speedY: Math.random() * 1 + 0.6,
        angle: Math.random() * 360,
        spin: Math.random() * 2 - 1,
      });
    }

    const createRaindrop = () => {
      return {
        x: Math.random() * canvas.width,
        y: -15,
        length: Math.random() * 25 + 15,
        speed: Math.random() * 12 + 18,
        opacity: Math.random() * 0.35 + 0.1,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Sakura Petals
      ctx.fillStyle = 'rgba(244, 63, 94, 0.6)'; // Neon pink tint
      sakuraPetals.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.6, p.r, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        if (p.y > canvas.height || p.x > canvas.width) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      // 2. Draw Rain
      if (weather === 'rain') {
        if (raindrops.length < 120) {
          raindrops.push(createRaindrop());
        }

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; // Cyan rain
        ctx.lineWidth = 1.2;
        raindrops.forEach((r, idx) => {
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 3, r.y + r.length);
          ctx.stroke();

          r.y += r.speed;
          r.x -= 0.6;

          if (r.y > canvas.height) {
            raindrops[idx] = createRaindrop();
          }
        });
      }

      // 3. Shooting Stars
      if (Math.random() < 0.007 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * canvas.width * 0.8,
          y: Math.random() * canvas.height * 0.3,
          dx: Math.random() * 4 + 7,
          dy: Math.random() * 2 + 4,
          length: Math.random() * 90 + 60,
          opacity: 1,
        });
      }

      ctx.lineWidth = 2.5;
      shootingStars.forEach((star, idx) => {
        const grad = ctx.createLinearGradient(star.x, star.y, star.x - star.dx, star.y - star.dy);
        grad.addColorStop(0, `rgba(56, 189, 248, ${star.opacity})`); // Cyan glowing star trails
        grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.dx * 8, star.y - star.dy * 8);
        ctx.stroke();

        star.x += star.dx;
        star.y += star.dy;
        star.opacity -= 0.025;

        if (star.opacity <= 0) {
          shootingStars.splice(idx, 1);
        }
      });

      // 4. Cybernetic floating matrix/AI codes
      if (Math.random() < 0.08) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? 'rgba(6, 182, 212, 0.65)' : 'rgba(168, 85, 247, 0.65)',
          life: 80,
          dy: -Math.random() * 0.8 - 0.2
        });
      }

      particles.forEach((p, idx) => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        p.y += p.dy;
        p.life--;
        if (p.life <= 0) {
          particles.splice(idx, 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [weather]);

  const handleMuteToggle = () => {
    const isNowMuted = !muted;
    setLocalMuted(isNowMuted);
    setMuted(isNowMuted);
  };

  const skyGradient = timeMode === 'night' 
    ? 'from-slate-950 via-indigo-950 to-purple-950'
    : 'from-orange-950 via-rose-900 to-indigo-950';

  const skylineColor = timeMode === 'night' ? 'fill-slate-900' : 'fill-rose-950';

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${skyGradient} relative overflow-hidden flex items-center justify-center p-4 md:p-8`}>
      
      {/* Aurora Borealis Neon Shifting Ribbons */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[60%] bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-purple-500/30 blur-[130px] rounded-full animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute top-[10%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-l from-pink-500/20 via-purple-500/35 to-blue-500/20 blur-[150px] rounded-full animate-[pulse_12s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating Holographic Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30 z-0" />

      {/* Parallax Skyline Cityscape Layer 1 */}
      <svg
        className={`absolute bottom-0 left-0 w-full h-[35vh] opacity-25 transition-transform duration-300 pointer-events-none ${skylineColor} z-0`}
        style={{ transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)` }}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path d="M0,280 L40,240 L60,260 L120,200 L180,240 L220,180 L280,240 L340,160 L400,220 L440,190 L500,250 L560,170 L620,220 L680,180 L720,240 L800,150 L860,230 L920,180 L980,240 L1040,160 L1100,220 L1160,190 L1220,250 L1280,170 L1340,220 L1400,180 L1440,280 L1440,320 L0,320 Z" />
      </svg>

      {/* Skyline Cityscape Layer 2: Closer towers with neon lights */}
      <div
        className="absolute bottom-0 left-0 w-full h-[25vh] opacity-35 transition-transform duration-300 pointer-events-none flex justify-around items-end z-0"
        style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => {
          const width = 60 + (id % 3) * 35;
          const height = 110 + (id % 4) * 45;
          const neonColor = id % 3 === 0 ? 'shadow-[0_0_15px_rgba(56,189,248,0.4)] border-cyan-400/40' : id % 2 === 0 ? 'shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-400/40' : 'shadow-[0_0_15px_rgba(244,63,94,0.4)] border-pink-400/40';
          return (
            <div
              key={id}
              className={`bg-slate-950/90 border-t ${neonColor} rounded-t-xl relative`}
              style={{ width: `${width}px`, height: `${height}px` }}
            >
              {/* Blinking Windows */}
              <div className="grid grid-cols-3 gap-1 p-2 opacity-50">
                {Array(6).fill(0).map((_, wId) => (
                  <div
                    key={wId}
                    className={`h-1.5 rounded-sm transition-all duration-[2000ms] ${
                      (wId + id) % 2 === 0 ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-slate-800'
                    } animate-pulse`}
                    style={{ animationDelay: `${wId * 300}ms` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Effect Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Interactive controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {/* Time mode toggle */}
        <button
          onClick={() => setTimeMode(timeMode === 'night' ? 'day' : 'night')}
          className="p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer active:scale-95"
          title="Toggle Time Mode"
        >
          {timeMode === 'night' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Weather mode toggle */}
        <button
          onClick={() => setWeather(weather === 'clear' ? 'rain' : 'clear')}
          className="p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer active:scale-95"
          title="Toggle Weather"
        >
          {weather === 'clear' ? <CloudRain size={15} /> : <Sparkles size={15} />}
        </button>

        {/* Mute button */}
        <button
          onClick={handleMuteToggle}
          className="p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer active:scale-95"
          title="Mute Soundtracks"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Mouse follow spotlight glow */}
      <div
        className="absolute w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none hidden lg:block"
        style={{
          left: `calc(50% + ${mousePos.x * 2}px - 225px)`,
          top: `calc(50% + ${mousePos.y * 2}px - 225px)`,
        }}
      />

      {/* Main children card container */}
      <div className="relative z-20 w-full flex justify-center items-center px-2">
        {children}
      </div>
    </div>
  );
};

export default TokyoBackground;
