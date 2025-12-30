import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface GameCardProps {
  imageUrl: string;
  loading?: boolean;
  blurLevel: number; // 0, 10, 20
  reveal?: boolean;
}

export function GameCard({ imageUrl, loading, blurLevel, reveal }: GameCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // If revealed, remove blur. Otherwise use prop.
  const currentBlur = reveal ? 0 : blurLevel;

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto mb-8">
      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl blur-xl animate-pulse" />
      
      {/* Card Container */}
      <div className="relative h-full w-full glass-panel rounded-2xl p-8 flex items-center justify-center overflow-hidden border-2 border-primary/30">
        
        <AnimatePresence mode="wait">
          {loading || !imageUrl ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-primary"
            >
              <Loader2 className="w-12 h-12 animate-spin" />
              <span className="font-display tracking-widest text-sm">LOADING ASSET...</span>
            </motion.div>
          ) : (
            <motion.div
              key={imageUrl}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Image Loading State within the container */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                   <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
              
              <img
                src={imageUrl}
                alt="Car Logo"
                onLoad={() => setImageLoaded(true)}
                className={`
                  max-w-full max-h-full object-contain transition-all duration-700 ease-out drop-shadow-2xl
                  ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
                `}
                style={{
                  filter: `blur(${currentBlur}px) grayscale(${reveal ? 0 : 0.2})`,
                  transform: reveal ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              
              {/* Overlay for intense blur to prevent cheating/peeking simply by inspecting */}
              {currentBlur > 0 && (
                 <div 
                   className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                   style={{ backdropFilter: `blur(${currentBlur / 2}px)` }}
                 />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative HUD Elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary opacity-50" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary opacity-50" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary opacity-50" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary opacity-50" />
      </div>
    </div>
  );
}
