import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useBrands, useSubmitScore } from "@/hooks/use-game";
import { GameCard } from "@/components/GameCard";
import { ScoreBoard } from "@/components/ScoreBoard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle, XCircle, Home, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import type { CarBrand } from "@shared/schema";

export default function Game() {
  const params = useParams();
  const difficulty = (params.difficulty as 'easy' | 'medium' | 'hard' | 'impossible') || 'easy';
  const [_, setLocation] = useLocation();

  // Game State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'revealed'>('playing');
  const [inputValue, setInputValue] = useState("");
  const [shuffledOptions, setShuffledOptions] = useState<CarBrand[]>([]);

  // Data Fetching
  const { data: brands, isLoading, isError } = useBrands(difficulty === 'impossible' ? undefined : difficulty);
  const submitScoreMutation = useSubmitScore();

  // Refs for input focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const currentBrand = brands?.[currentQuestionIndex];
  const totalQuestions = brands?.length || 0;

  // Effects
  useEffect(() => {
    if (brands && currentBrand && gameState === 'playing') {
      if (difficulty !== 'impossible') {
        // Generate options for multiple choice
        const otherBrands = brands.filter(b => b.id !== currentBrand.id);
        const randomWrong = otherBrands.sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [...randomWrong, currentBrand].sort(() => 0.5 - Math.random());
        setShuffledOptions(options);
      }
      // Focus input for impossible mode
      if (difficulty === 'impossible') {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [brands, currentBrand, difficulty, gameState]);

  // Game Logic
  const handleAnswer = (answer: string) => {
    if (gameState === 'revealed') return;

    const isCorrect = answer.toLowerCase().trim() === currentBrand?.name.toLowerCase().trim();
    
    setGameState('revealed');
    
    if (isCorrect) {
      setScore(prev => prev + (difficulty === 'impossible' ? 20 : difficulty === 'hard' ? 15 : difficulty === 'medium' ? 10 : 5));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF4500', '#FFA500', '#FFFFFF']
      });
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => setGameOver(true), 1500);
        }
        return newLives;
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setGameOver(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setGameState('playing');
      setInputValue("");
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('playerName') as HTMLInputElement).value;
    
    await submitScoreMutation.mutateAsync({
      playerName: name,
      score,
      difficulty
    });
    
    setLocation('/leaderboard');
  };

  // Blur Logic
  const getBlurLevel = () => {
    // If the brand has text in it, we must blur it as per user request
    const mustBlur = currentBrand?.hasText;
    
    if (difficulty === 'impossible') return 20;
    if (difficulty === 'hard') return 15;
    if (difficulty === 'medium') return 10; // Increased from 5 for better challenge
    
    // For easy, only blur if it has text, otherwise 0
    return mustBlur ? 10 : 0;
  };


  // Loading & Error States
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="font-display text-white tracking-widest animate-pulse">PREPARING TRACK...</p>
      </div>
    </div>
  );

  if (isError || !brands || brands.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 border border-destructive/50 rounded-2xl bg-destructive/10">
        <h2 className="text-2xl font-display text-destructive mb-4">CRITICAL FAILURE</h2>
        <p className="text-muted-foreground mb-6">Could not load game data.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-destructive text-white rounded hover:bg-destructive/90">Retry</button>
      </div>
    </div>
  );

  // Game Over Screen
  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 w-full max-w-md glass-panel p-8 rounded-2xl border-t-4 border-primary text-center"
        >
          <h2 className="text-4xl font-display font-bold text-white mb-2">RACE FINISHED</h2>
          <p className="text-muted-foreground mb-8 font-mono">DIFFICULTY: {difficulty.toUpperCase()}</p>
          
          <div className="mb-8 py-6 bg-black/40 rounded-xl border border-white/10">
            <span className="text-sm text-primary uppercase tracking-widest block mb-2">Final Score</span>
            <span className="text-6xl font-display font-black text-white text-glow">{score}</span>
          </div>

          <form onSubmit={handleScoreSubmit} className="space-y-4 mb-6">
            <input 
              name="playerName"
              type="text" 
              placeholder="ENTER DRIVER NAME" 
              required
              maxLength={15}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white text-center font-display focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary uppercase placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={submitScoreMutation.isPending}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg font-display uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {submitScoreMutation.isPending ? "Submitting..." : "Save Record"}
            </button>
          </form>

          <div className="flex gap-4">
             <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2">
               <RefreshCw className="w-4 h-4" /> Retry
             </button>
             <button onClick={() => setLocation('/')} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2">
               <Home className="w-4 h-4" /> Menu
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Game Screen
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl pt-4">
        {/* Header / Scoreboard */}
        <ScoreBoard 
          score={score} 
          currentQuestion={currentQuestionIndex + 1} 
          totalQuestions={totalQuestions} 
          difficulty={difficulty}
          lives={lives}
        />

        {/* Main Game Area */}
        <div className="mt-8 flex flex-col items-center">
          <GameCard 
            imageUrl={currentBrand?.imageUrl || ""} 
            blurLevel={getBlurLevel()}
            reveal={gameState === 'revealed'}
          />

          {/* Answer Section */}
          <div className="w-full max-w-md space-y-4">
            
            {/* Answer Display (When revealed) */}
            <AnimatePresence>
              {gameState === 'revealed' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border mb-4 text-center ${
                    inputValue.toLowerCase().trim() === currentBrand?.name.toLowerCase().trim() ||
                    shuffledOptions.find(o => o.name === inputValue)?.name === currentBrand?.name
                    ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                    : 'bg-red-500/10 border-red-500/50 text-red-500'
                  }`}
                >
                  <p className="text-sm uppercase tracking-widest mb-1">Answer</p>
                  <h3 className="text-2xl font-display font-bold">{currentBrand?.name}</h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs */}
            {difficulty === 'impossible' ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnswer(inputValue);
                }}
                className="relative"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={gameState === 'revealed'}
                  placeholder="TYPE BRAND NAME..."
                  className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-6 py-4 text-xl text-center text-white font-display focus:border-primary focus:outline-none uppercase placeholder:text-white/10 disabled:opacity-50"
                  autoComplete="off"
                />
                {gameState === 'playing' && inputValue.length > 2 && (
                   <button 
                     type="submit"
                     className="absolute right-2 top-2 bottom-2 aspect-square bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                   >
                     <ArrowRight className="w-6 h-6 text-white" />
                   </button>
                )}
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {shuffledOptions.map((brand) => {
                  const isSelected = gameState === 'revealed' && brand.name === currentBrand?.name;
                  const isWrong = gameState === 'revealed' && brand.name !== currentBrand?.name;
                  
                  return (
                    <motion.button
                      key={brand.id}
                      whileHover={gameState === 'playing' ? { scale: 1.02 } : {}}
                      whileTap={gameState === 'playing' ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(brand.name)}
                      disabled={gameState === 'revealed'}
                      className={`
                        relative p-4 rounded-xl border-2 font-display text-lg tracking-wide uppercase transition-all duration-300
                        ${gameState === 'playing' 
                          ? 'bg-black/40 border-white/10 hover:border-primary/50 hover:bg-primary/5 text-gray-300' 
                          : isSelected
                            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                            : 'bg-black/20 border-transparent text-gray-600 opacity-50'
                        }
                      `}
                    >
                      {brand.name}
                      {isSelected && <CheckCircle className="absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5" />}
                      {isWrong && gameState === 'revealed' && brand.name === inputValue && <XCircle className="absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 text-red-500" />}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Next Button */}
            {gameState === 'revealed' && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full py-4 bg-white text-black font-display font-black text-xl rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                NEXT ROUND <ArrowRight className="w-6 h-6" />
              </motion.button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
