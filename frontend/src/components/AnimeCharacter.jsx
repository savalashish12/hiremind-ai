import { motion, AnimatePresence } from 'framer-motion';
import maleChar from '../assets/male_character.png';
import femaleChar from '../assets/female_character.png';

const AnimeCharacter = ({ gender = 'boy', state = 'idle' }) => {
  const isBoy = gender === 'boy';
  const charImage = isBoy ? maleChar : femaleChar;

  // Render different holographic text depending on state
  const getHoloText = () => {
    switch (state) {
      case 'username-focus':
        return "SYNCING IDENTITY...";
      case 'password-focus':
        return "SECURE PASS ENVELOPE";
      case 'password-visible':
        return "PASSPHRASE VISIBLE";
      case 'wrong':
        return "ANOMALY DETECTED // ACCESS DENIED";
      case 'success':
        return "PORTAL ENGAGED // ACCESS GRANTED";
      default:
        return "COGNITIVE ASSISTANT ACTIVE";
    }
  };

  return (
    <div className="relative w-full h-[480px] flex items-center justify-center overflow-hidden bg-slate-950/20 rounded-2xl border border-slate-900/50">
      {/* 1. Cyber Ring Portal Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`w-72 h-72 rounded-full border border-dashed opacity-25 ${
            state === 'wrong' ? 'border-red-500 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]' :
            state === 'success' ? 'border-green-500 bg-green-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' :
            isBoy ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.05)]' : 'border-purple-500 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.05)]'
          }`}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute w-60 h-60 rounded-full border border-double opacity-20 ${
            state === 'wrong' ? 'border-red-500' :
            state === 'success' ? 'border-green-500' :
            isBoy ? 'border-cyan-400' : 'border-purple-400'
          }`}
        />
      </div>

      {/* 2. Character Canvas Frame */}
      <motion.div
        animate={
          state === 'wrong' 
            ? { x: [0, -8, 8, -6, 6, 0], y: [0, 6, -6, 4, -4, 0] }
            : {}
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Breathing Character Wrapper */}
        <motion.div
          animate={{
            y: [0, -6, 0],
            scale: state === 'success' ? [1, 1.05, 1] : [1, 1.01, 1]
          }}
          transition={{
            y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-[340px] h-[450px] flex items-center justify-center"
        >
          {/* Main Full Body Generated Anime Character */}
          <img
            src={charImage}
            alt="AI Character assistant"
            className={`w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] select-none transition-all duration-300 ${
              state === 'wrong' ? 'brightness-75 contrast-125 sepia-[0.3] hue-rotate-[320deg]' :
              state === 'success' ? 'brightness-110 contrast-105' : 'brightness-95 hover:brightness-100'
            }`}
          />

          {/* 3. Interactive Overlays */}
          
          {/* Eyes Visor / Privacy mode for Password field */}
          <AnimatePresence>
            {state === 'password-focus' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute top-[28%] w-[120px] h-[16px] bg-slate-900/90 border border-amber-500/70 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] pointer-events-none"
              >
                <span className="text-[7px] font-black tracking-widest text-amber-400 uppercase animate-pulse">
                  SECURE MODE
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Eyes Visor / Peek mode for Password Visible field */}
          <AnimatePresence>
            {state === 'password-visible' && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 0.8, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute top-[28%] w-[120px] h-[16px] bg-slate-900/90 border border-green-500/70 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] pointer-events-none"
              >
                <span className="text-[7px] font-black tracking-widest text-green-400 uppercase animate-pulse">
                  DECRYPTING...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typings / Username active: Holographic Monitor Overlay */}
          <AnimatePresence>
            {state === 'username-focus' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                className={`absolute bottom-[10%] w-[250px] bg-slate-950/80 border rounded-2xl p-3.5 backdrop-blur-sm pointer-events-none shadow-2xl ${
                  isBoy ? "border-cyan-500/30" : "border-purple-500/30"
                }`}
              >
                <div className="flex justify-between items-center text-[7px] font-black text-slate-500 border-b border-slate-900 pb-1.5 mb-2">
                  <span>TERMINAL_SYNC_V1.0</span>
                  <span className={`animate-pulse ${isBoy ? "text-cyan-400" : "text-purple-400"}`}>● LINKED</span>
                </div>
                <div className="font-mono text-[8px] space-y-1 text-slate-400 text-left">
                  <p className="text-green-400">$ fetch _identity_meta</p>
                  <p className="opacity-90">Searching directory nodes...</p>
                  <p className="opacity-70">Awaiting user form parameters...</p>
                  <div className="flex gap-1 mt-2">
                    <span className="w-1.5 h-1 bg-slate-800 animate-pulse" />
                    <span className="w-4 h-1 bg-slate-800 animate-pulse" style={{ animationDelay: '100ms' }} />
                    <span className="w-2.5 h-1 bg-slate-800 animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success portal energy sparks */}
          <AnimatePresence>
            {state === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-500/10 pointer-events-none rounded-2xl flex items-center justify-center"
              >
                {/* Floating energy particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    style={{
                      left: `${30 + Math.random() * 260}px`,
                      bottom: "50px",
                    }}
                    animate={{
                      y: [0, -350],
                      x: [0, (Math.random() - 0.5) * 50],
                      scale: [1, 2, 0.5],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5 + Math.random() * 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Failure Alert warning hologram overlay */}
          <AnimatePresence>
            {state === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-red-650/10 flex items-center justify-center p-6 border-2 border-red-500/30 rounded-2xl pointer-events-none"
              >
                <div className="bg-slate-950/95 border border-red-500/50 rounded-2xl px-5 py-4 shadow-2xl text-center space-y-1.5 max-w-[200px]">
                  <span className="text-2xl animate-pulse">⚠️</span>
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">ACCESS DENIED</h4>
                  <p className="text-[8px] text-slate-450 leading-normal">Credential mismatch detected. System lock engaged.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* 4. Bottom HUD Status Strip */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 border border-slate-900 rounded-xl px-4 py-2 flex justify-between items-center z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            state === 'wrong' ? 'bg-red-500 animate-ping' :
            state === 'success' ? 'bg-green-500 animate-ping' :
            state === 'idle' ? 'bg-slate-500' : 'bg-cyan-500 animate-pulse'
          }`} />
          <span className="text-[8px] font-black text-slate-400 tracking-wider">
            STATUS // {state.toUpperCase()}
          </span>
        </div>
        <span className="text-[8px] font-mono text-slate-550 truncate max-w-[140px] md:max-w-none">
          {getHoloText()}
        </span>
      </div>
    </div>
  );
};

export default AnimeCharacter;
