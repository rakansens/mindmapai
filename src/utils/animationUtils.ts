import { AnimationType, ANIMATIONS } from '../styles/animations';

export const getAnimationStyles = (type: AnimationType) => {
  const config = ANIMATIONS[type];
  return {
    animation: `${config.duration}ms ${config.timing} ${config.keyframes}`,
    animationFillMode: 'both'
  };
};

export const combineAnimationClasses = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
}; 