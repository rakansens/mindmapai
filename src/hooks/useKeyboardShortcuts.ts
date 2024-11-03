import { useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { useMindMapStore } from '../store/mindMapStore';

export function useKeyboardShortcuts() {
  const { addNode, nodes } = useMindMapStore();
  const { fitView } = useReactFlow();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const selectedNode = nodes.find((node) => node.selected);
        if (selectedNode) {
          addNode(selectedNode, 'New Topic');
        }
      } else if (event.key === 'f' && event.ctrlKey) {
        event.preventDefault();
        fitView();
      }
    },
    [nodes, addNode, fitView]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}