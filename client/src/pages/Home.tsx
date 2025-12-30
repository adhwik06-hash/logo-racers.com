import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Play, Trophy, Info, Zap } from "lucide-react";

const difficulties = [
  { 
    id: 'easy', 
    label: 'Easy', 
    desc: 'Normal Logos • Multiple Choice', 
    color: 'from-green-500 to-emerald-700',
    icon: <Play className="w-5 h-5" /> 
  },
  { 
    id: 'medium', 
    label: 'Medium', 
    desc: 'Slight Blur • Multiple Choice', 
    color: 'from-yellow-500 to-amber-700',
    icon: <Zap className="w-5 h-5" /> 
  },
  { 
    id: 'hard', 
    label: 'Hard', 
    desc: 'Heavy Blur • Multiple Choice', 
    color: 'from-orange-500 to-red-700',
    icon: <AlertTriangle className="w-5 h-5" /> 
  },
  { 
    id: 'impossible', 
    label: 'Impossible', 
    desc: 'Max Blur • Type the Name', 
    color: 'from-red-600 to-rose-900',
    icon: <Target className="w-5 h-5" /> 
  },
];

import { AlertTriangle, Target } from "lucide-react"; // Import missing icons

export default function Home() {
  const [_, setLocation] = useLocation();
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500 text-glow mb-4">
          LOGO<br/>RACER
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-body tracking-widest uppercase">
          Guess the Hypercar Brand
        </p>
      </motion.div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Difficulty Selection */}
        <div className="space-y-4">
          <h2 className="text-white font-display text-xl mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary block" />
            Select Difficulty
          </h2>
          
          <div className="grid gap-4">
            {difficulties.map((diff) => (
              <motion.button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative overflow-hidden group p-4 rounded-xl border transition-all duration-300 text-left
                  ${selectedDifficulty === diff.id 
                    ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,69,0,0.2)]' 
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                  }
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${diff.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className={`font-display text-lg ${selectedDifficulty === diff.id ? 'text-white' : 'text-gray-300'}`}>
                      {diff.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{diff.desc}</p>
                  </div>
                  <div className={`p-2 rounded-full bg-white/5 ${selectedDifficulty === diff.id ? 'text-primary' : 'text-gray-500'}`}>
                    {diff.icon}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-col gap-6 h-full justify-center md:pl-8 md:border-l border-white/5">
           <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
             <h3 className="text-primary font-display mb-2 text-lg">Mission Briefing</h3>
             <p className="text-gray-400 leading-relaxed mb-4">
               Identify 150+ luxury and hypercar brands from their logos. 
               Higher difficulties blur the names and logos, testing your true automotive knowledge.
             </p>
             <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
               <Info className="w-4 h-4" />
               <span>Non-EV • Luxury • Hypercars</span>
             </div>
           </div>

           <motion.button
             onClick={() => setLocation(`/game/${selectedDifficulty}`)}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="w-full py-6 bg-gradient-to-r from-primary to-orange-600 rounded-xl font-display text-2xl font-bold text-white shadow-lg shadow-orange-900/20 hover:shadow-orange-500/40 transition-shadow cyber-button group"
           >
             <span className="flex items-center justify-center gap-3">
               START ENGINE <Play className="w-6 h-6 fill-current" />
             </span>
           </motion.button>

           <Link href="/leaderboard" className="w-full">
             <motion.div
               whileHover={{ scale: 1.02 }}
               className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-display text-lg text-center text-gray-300 cursor-pointer flex items-center justify-center gap-2 transition-colors"
             >
               <Trophy className="w-5 h-5 text-yellow-500" /> View Leaderboard
             </motion.div>
           </Link>
        </div>
      </div>
    </div>
  );
}
