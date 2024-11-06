import { useGenerationStore } from '../store/generationStore';
import { useMindMapStore } from '../store/mindMapStore';

export const useGeneration = (nodeId: string) => {
  const { setNodeGenerating, isNodeGenerating } = useGenerationStore();
  const { updateNodeData } = useMindMapStore();

  const startGeneration = async (generator: () => Promise<any>) => {
    try {
      setNodeGenerating(nodeId, true);
      const result = await generator();
      return result;
    } finally {
      setNodeGenerating(nodeId, false);
    }
  };

  return {
    isGenerating: isNodeGenerating(nodeId),
    startGeneration,
  };
}; 