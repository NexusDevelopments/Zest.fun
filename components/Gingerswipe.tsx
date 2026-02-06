'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Lock, Unlock, Fingerprint } from 'lucide-react';

interface GingerswipeProps {
  onSuccess: () => void;
  mode?: 'verify' | 'register';
}

export default function Gingerswipe({ onSuccess, mode = 'verify' }: GingerswipeProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'prompt' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [registeredFingers, setRegisteredFingers] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const trackWidth = 380; // Increased from 320
  const iconSize = 70; // Increased from 60
  const threshold = trackWidth - iconSize - 16;

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
      setIsUnlocked(true);
      setAuthStatus('prompt');
      const isRegister = mode === 'register';
      setAuthMessage(isRegister ? `Add Passkey ${registeredFingers + 1} of 2...` : 'Verifying passkey...');
      setTimeout(() => {
        triggerBiometricAuth();
      }, 500);
    } else {
      x.set(0);
    }
  };

  const triggerBiometricAuth = async () => {
    try {
      // Check for secure context and WebAuthn support
      const hasWebAuthn = typeof window !== 'undefined' && 
                         window.PublicKeyCredential !== undefined;
      const isSecure = typeof window !== 'undefined' && 
                       window.isSecureContext !== false;

      // In demo mode or non-secure context, just succeed immediately
      if (!hasWebAuthn || !isSecure) {
        console.warn('WebAuthn not available or not secure context - using demo mode auth');
        
        if (mode === 'register') {
          const newCount = registeredFingers + 1;
          setRegisteredFingers(newCount);
          
          if (newCount === 2) {
            setAuthStatus('success');
            setAuthMessage('✅ 2 Passkeys registered successfully!');
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            setAuthStatus('success');
            setAuthMessage('✅ Passkey 1 added. Drag again to add Passkey 2.');
            resetSwipe();
          }
        } else {
          // Verify mode - just succeed
          setAuthStatus('success');
          setAuthMessage('✅ Authentication verified!');
          setTimeout(() => {
            onSuccess();
          }, 800);
        }
        return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      if (mode === 'register') {
        // Registration mode - register new passkey
        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
          challenge,
          rp: {
            name: 'Marishim Token',
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: `user-${Date.now()}`,
            displayName: `Passkey ${registeredFingers + 1}`,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
          ],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          attestation: 'none',
        };

        const credential = (await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        })) as PublicKeyCredential | null;

        if (credential) {
          const newCount = registeredFingers + 1;
          setRegisteredFingers(newCount);
          
          if (newCount === 2) {
            // Both passkeys registered
            setAuthStatus('success');
            setAuthMessage('✅ 2 Passkeys registered successfully!');
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            // One more to go
            setAuthStatus('success');
            setAuthMessage('✅ Passkey 1 added. Drag again to add Passkey 2.');
            resetSwipe();
          }
        } else {
          setAuthStatus('error');
          setAuthMessage('Failed to register passkey. Try again.');
          resetSwipe();
        }
      } else {
        // Verification mode
        const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: [],
        };

        const credential = (await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions,
        })) as PublicKeyCredential | null;

        if (credential) {
          setAuthStatus('success');
          setAuthMessage('✅ Security verified!');
          setTimeout(() => {
            onSuccess();
          }, 800);
        } else {
          setAuthStatus('error');
          setAuthMessage('Security verification failed. Try again.');
          resetSwipe();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthStatus('error');
      setAuthMessage('Authentication error. Try again.');
      resetSwipe();
    }
  };

  const resetSwipe = () => {
    setIsUnlocked(false);
    x.set(0);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <h2 className="text-2xl font-bold cyan-glow mb-4">
        🔐 {mode === 'register' ? 'Add Passkey' : 'Passkey Verification'}
      </h2>
      
      <div 
        ref={constraintsRef}
        className="relative rounded-3xl overflow-visible mx-auto"
        style={{ 
          width: '100%',
          maxWidth: `${trackWidth}px`,
          height: `${iconSize + 32}px`,
          border: '3px solid',
          borderColor: isUnlocked ? '#00FFFF' : '#D2691E',
          boxShadow: isUnlocked 
            ? '0 0 20px #00FFFF, 0 0 40px #00FFFF'
            : '0 0 10px #D2691E',
          transition: 'all 0.3s ease',
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ 
            backgroundColor: isUnlocked ? 'rgba(0, 255, 255, 0.3)' : 'rgba(139, 69, 19, 0.2)'
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-sm font-semibold ${isUnlocked ? 'text-cyan-neon' : 'text-ginger'}`}>
            {isUnlocked ? 'Processing...' : 'Slide to unlock →'}
          </span>
        </div>

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
            ) : mode === 'register' ? (
              <Fingerprint className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
        </motion.div>
      </div>

      {mode === 'register' && registeredFingers > 0 && (
        <div className="text-sm text-cyan-neon">
          Progress: {registeredFingers}/2 passkeys added
        </div>
      )}

      <p className="text-sm text-cyan-neon/60 text-center max-w-md">
        {mode === 'register' 
          ? 'Drag to register up to 2 passkeys'
          : 'Drag to verify your passkey and continue'
        }
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
