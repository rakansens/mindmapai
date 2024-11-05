export const preventEvent = (e: React.MouseEvent | React.PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.target instanceof HTMLElement) {
    e.target.style.pointerEvents = 'auto';
  }
}; 