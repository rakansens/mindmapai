import { useState, useCallback } from 'react';
import { useMindMapStore } from '../store/mindMapStore';
import { NodeData } from '../types/node';

export const useNodeInteraction = (id: string, data: NodeData) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.label);
  const [isHovered, setIsHovered] = useState(false);
  const store = useMindMapStore();

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing) {
      store.selectNode(id);
    }
  }, [isEditing, id, store]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing) {
      setInputValue(data.label);
      setIsEditing(true);
      store.selectNode(id);
    }
  }, [isEditing, data.label, id, store]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setInputValue(data.label);
        setIsEditing(false);
      }
    }
  }, [isEditing, data.label]);

  const handleBlur = useCallback(() => {
    if (inputValue.trim() !== '') {
      store.updateNodeData(id, {
        ...data,
        label: inputValue,
      });
    } else {
      setInputValue(data.label);
    }
    setIsEditing(false);
  }, [inputValue, data, id, store]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return {
    isEditing,
    setIsEditing,
    inputValue,
    setInputValue,
    isHovered,
    setIsHovered,
    handleClick,
    handleDoubleClick,
    handleKeyDown,
    handleBlur,
    handleInputChange,
  };
}; 