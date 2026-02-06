'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

interface GingerswipeProps {
  onSuccess: () => void;
}

export default function Gingerswipe({ onSuccess }: GingerswipeProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'prompt' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const trackWidth = 320; // Track width
  const iconSize = 60; // Slider icon size
  const threshold = trackWidth - iconSize - 16; // Unlock threshold

  const backgroundColor = useTransform(
    x,
    [0, threshold],
    ['rgba(139, 69, 19, 0.2)', 'rgba(0, 255, 255, 0.3)']
  );

  const borderColor = useTransform(
    x,
    [0, threshold],
    ['#D2691E', '#00FFFF']
  );

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    
    if (currentX >= threshold) {
      // User completed the swipe
      setIsUnlocked(true);
      setAuthStatus('success');
      setAuthMessage('✅ Authenticated!');
      setTimeout(() => {
        onSuccess();
      }, 600);
    } else {
      // Snap back to start
      x.set(0);
    }
  };

  const resetSwipe = () => {
    setIsUnlocked(false);
    x.set(0);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div 
        ref={constraintsRef}
        className="relative rounded-full overflow-visible mx-auto"
        style={{ 
          width: '100%',
          maxWidth: `${trackWidth}px`,
          height: `${iconSize + 24}px`,
          border: '3px solid',
          borderColor: isUnlocked ? '#00FFFF' : '#D2691E',
          boxShadow: isUnlocked 
            ? '0 0 20px #00FFFF, 0 0 40px #00FFFF'
            : '0 0 10px #D2691E',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Background */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            backgroundColor: isUnlocked ? 'rgba(0, 255, 255, 0.3)' : 'rgba(139, 69, 19, 0.2)'
          }}
        />

        {/* Instruction Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-sm font-semibold ${isUnlocked ? 'text-cyan-neon' : 'text-ginger'}`}>
            {isUnlocked ? '✅ Unlocking...' : 'Slide to Unlock →'}
          </span>
        </div>

        {/* Draggable Icon */}
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute top-1/2 -translate-y-1/2 left-2 cursor-grab active:cursor-grabbing"
          whileTap={{ scale: 1.1 }}
        >
          <div 
            className="flex items-center justify-center rounded-full"
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              background: isUnlocked 
                ? 'linear-gradient(135deg, #00FFFF 0%, #008B8B 100%)'
                : 'linear-gradient(135deg, #F4A460 0%, #D2691E 100%)',
              boxShadow: isUnlocked
                ? '0 4px 15px rgba(0, 255, 255, 0.5)'
                : '0 4px 15px rgba(210, 105, 30, 0.5)',
            }}
          >
            {isUnlocked ? (
              <Unlock className="w-8 h-8 text-black" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
        </motion.div>
      </div>

      <p className="text-sm text-cyan-neon/60 text-center max-w-md">
        Drag to unlock and authenticate
      </p>

      {authStatus !== 'idle' && (
        <p
          className={`text-xs text-center max-w-md ${
            authStatus === 'error' ? 'text-red-400' : 'text-cyan-neon/80'
          }`}
        >
          {authMessage}
        </p>
      )}
    </div>
  );
}
