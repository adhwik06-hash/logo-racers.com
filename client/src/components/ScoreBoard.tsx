import { motion } from "framer-motion";
import { Trophy, Target, AlertTriangle } from "lucide-react";

interface ScoreBoardProps {
  score: number;
  totalQuestions: number;
  currentQuestion: number;
  difficulty: string;
  lives: number;
}

export function ScoreBoard({ score, totalQuestions, currentQuestion, difficulty, lives }: ScoreBoardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Score */}
      <div className="bg-black/40 border border-primary/20 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="flex items-center gap-2 text-primary/80 mb-1">
          <Trophy className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-bold">Score</span>
        </div>
        <span className="text-2xl font-display text-white text-glow">{score}</span>
      </div>

      {/* Progress */}
      <div className="bg-black/40 border border-primary/20 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="flex items-center gap-2 text-secondary/80 mb-1">
          <Target className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-bold">Progress</span>
        </div>
        <span className="text-2xl font-display text-white">
          {currentQuestion} <span className="text-muted-foreground text-lg">/ {totalQuestions}</span>
        </span>
      </div>

      {/* Difficulty Indicator */}
      <div className="bg-black/40 border border-primary/20 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm relative overflow-hidden group">
        <div className={`absolute inset-0 opacity-10 ${
            difficulty === 'impossible' ? 'bg-red-600 animate-pulse' : 
            difficulty === 'hard' ? 'bg-orange-500' : 'bg-blue-500'
          }`} 
        />
        <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">Level</span>
        <span className={`text-xl font-display uppercase font-bold
          ${difficulty === 'impossible' ? 'text-red-500' : 'text-white'}
        `}>
          {difficulty}
        </span>
      </div>
      
      {/* Lives / Health */}
      <div className="bg-black/40 border border-primary/20 rounded-xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
        <div className="flex items-center gap-2 text-red-500/80 mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-bold">Lives</span>
        </div>
        <div className="flex gap-1">
           {[...Array(3)].map((_, i) => (
             <motion.div 
               key={i}
               initial={false}
               animate={{ opacity: i < lives ? 1 : 0.2, scale: i < lives ? 1 : 0.8 }}
               className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
             />
           ))}
        </div>
      </div>
    </div>
  );
}
