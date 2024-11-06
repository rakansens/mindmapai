import { useState, useEffect } from 'react';
import { AnimationType, ANIMATIONS } from '../styles/animations';

export const useAnimation = (type: AnimationType, isActive: boolean) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      setAnimationClass(ANIMATIONS[type].className);
    } else {
      setIsAnimating(false);
      setAnimationClass('');
    }
  }, [isActive, type]);

  return {
    isAnimating,
    animationClass,
    config: ANIMATIONS[type]
  };
}; 