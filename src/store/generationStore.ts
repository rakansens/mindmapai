import { create } from 'zustand';

interface GenerationState {
  generatingNodes: Map<string, {
    type: 'pulse' | 'typing';
    startTime: number;
  }>;
  setNodeGenerating: (nodeId: string, isGenerating: boolean) => void;
  isNodeGenerating: (nodeId: string) => boolean;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  generatingNodes: new Map(),
  
  setNodeGenerating: (nodeId: string, isGenerating: boolean) => {
    set(state => {
      const newMap = new Map(state.generatingNodes);
      if (isGenerating) {
        newMap.set(nodeId, { type: 'pulse', startTime: Date.now() });
      } else {
        newMap.delete(nodeId);
      }
      return { generatingNodes: newMap };
    });
  },

  isNodeGenerating: (nodeId: string) => {
    return get().generatingNodes.has(nodeId);
  },
})); 