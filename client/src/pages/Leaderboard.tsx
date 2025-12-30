import { useScores } from "@/hooks/use-game";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: scores, isLoading } = useScores();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-wider">
            Hall of Fame
          </h1>
        </div>

        {/* List */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/20 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Driver</div>
            <div className="col-span-3">Score</div>
            <div className="col-span-2 text-right">Mode</div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">
                Loading records...
              </div>
            ) : scores?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No records yet. Be the first!
              </div>
            ) : (
              scores?.map((score, index) => (
                <motion.div 
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group"
                >
                  <div className="col-span-2 flex justify-center">
                    {index === 0 ? (
                      <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="w-6 h-6 text-amber-700" />
                    ) : (
                      <span className="font-mono text-gray-500 font-bold">#{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-5 font-display text-white font-bold tracking-wide group-hover:text-primary transition-colors truncate">
                    {score.playerName}
                  </div>
                  <div className="col-span-3 font-mono text-lg text-primary text-glow">
                    {score.score.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`
                      text-[10px] uppercase font-bold px-2 py-1 rounded-full
                      ${score.difficulty === 'impossible' ? 'bg-red-900/50 text-red-300 border border-red-800' :
                        score.difficulty === 'hard' ? 'bg-orange-900/50 text-orange-300 border border-orange-800' :
                        score.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-800' :
                        'bg-green-900/50 text-green-300 border border-green-800'}
                    `}>
                      {score.difficulty}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
