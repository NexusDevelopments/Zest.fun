'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

interface GingerswipeProps {
  onSuccess: () => void;
  mode?: 'verify' | 'register';
}

export default function Gingerswipe({ onSuccess, mode = 'verify' }: GingerswipeProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const trackWidth = 380;
  const iconSize = 70;
  const threshold = trackWidth - iconSize - 16;


  const handleDragEnd = () => {
    const currentX = x.get();
    console.log('Drag ended at:', currentX, 'Threshold:', threshold);
    
    if (currentX >= threshold) {
      console.log('✅ Threshold reached! Unlocking...');
      setIsUnlocked(true);
      
      // Immediately call success
      setTimeout(() => {
        console.log('Calling onSuccess');
        onSuccess();
      }, 300);
    } else {
      console.log('Reset position');
      x.set(0);
    }
  };


  return (
    <div className="flex flex-col items-center space-y-6 w-full px-4">
      <div 
        ref={constraintsRef}
        className="relative rounded-full mx-auto"
        style={{ 
          width: '100%',
          maxWidth: `${trackWidth}px`,
          height: `${iconSize + 32}px`,
          border: '3px solid',
          borderColor: isUnlocked ? '#00FFFF' : '#D2691E',
          boxShadow: isUnlocked 
            ? '0 0 20px #00FFFF, 0 0 40px #00FFFF'
            : '0 0 10px #D2691E',
          backgroundColor: isUnlocked ? 'rgba(0, 255, 255, 0.1)' : 'rgba(139, 69, 19, 0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Track text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-sm font-semibold transition-all ${
            isUnlocked 
              ? 'text-cyan-400 opacity-100' 
              : 'text-amber-600 opacity-70'
          }`}>
            {isUnlocked ? '✅ Unlocking...' : '👉 Swipe right →'}
          </span>
        </div>

        {/* Draggable handle */}
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          dragMomentum={true}
          onDragStart={() => {
            console.log('Drag started');
          }}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute top-1/2 -translate-y-1/2 left-2 cursor-grab active:cursor-grabbing"
          whileTap={{ scale: 1.15 }}
        >
          <div 
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              background: isUnlocked 
                ? 'linear-gradient(135deg, #00FFFF 0%, #00CED1 100%)'
                : 'linear-gradient(135deg, #FF8C42 0%, #D2691E 100%)',
              boxShadow: isUnlocked
                ? '0 0 20px rgba(0, 255, 255, 0.8), inset 0 0 10px rgba(0, 255, 255, 0.4)'
                : '0 0 15px rgba(210, 105, 30, 0.6), inset 0 0 8px rgba(210, 105, 30, 0.3)',
              border: '2px solid white',
            }}
          >
            {isUnlocked ? (
              <Unlock className="w-10 h-10 text-black" strokeWidth={2.5} />
            ) : (
              <Lock className="w-10 h-10 text-white" strokeWidth={2.5} />
            )}
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-400">
          {isUnlocked 
            ? '🔓 Authentication successful!' 
            : 'Drag the circle to the right to authenticate'
          }
        </p>
      </div>
    </div>
  );
}
