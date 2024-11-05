import { Node as ReactFlowNode } from 'reactflow';
import { useOpenAI } from './useOpenAI';
import { useMindMapStore } from '../store/mindMapStore';
import { useReactFlow } from 'reactflow';
import { TopicTree } from '../types/common';

export const useAIGeneration = () => {
  const { generateSubTopics, apiKey } = useOpenAI();
  const store = useMindMapStore();
  const { fitView } = useReactFlow();

  const handleGenerate = async (
    nodeId: string, 
    mode: 'quick' | 'detailed' | 'why' | 'how' = 'quick',
    options?: {
      style?: string;
      depth?: number;
      count?: number;
    }
  ): Promise<void> => {
    try {
      const currentNode = store.nodes.find(n => n.id === nodeId);
      if (!currentNode) {
        console.error('Node not found:', nodeId);
        return;
      }

      console.log('Starting generation for:', currentNode.data.label);
      
      // 生成中の状態を設定
      store.setNodeGenerating(nodeId, true);

      const response = await generateSubTopics(currentNode.data.label, {
        mode,
        ...options
      });

      console.log('Generation response:', response);

      // レスポンスの���証
      if (!response || !response.children || response.children.length === 0) {
        throw new Error('Invalid response format or empty response');
      }

      // ノードの生成
      await store.createNodesFromAIResponse(nodeId, response);

      // レイアウトの調整
      setTimeout(() => {
        fitView({
          duration: 800,
          padding: 0.3,
          minZoom: 0.4,
          maxZoom: 1,
        });
      }, 500);

    } catch (error) {
      console.error('Generation error:', error);
      alert('生成に失敗しました');
    } finally {
      store.setNodeGenerating(nodeId, false);
    }
  };

  const handleQuickGenerate = async (nodeId: string) => {
    return handleGenerate(nodeId, 'quick');
  };

  const handleDetailedGenerate = async (nodeId: string) => {
    return handleGenerate(nodeId, 'detailed', {
      style: 'technical',
      depth: 2,
      count: 3
    });
  };

  const handleWhyGenerate = async (nodeId: string) => {
    return handleGenerate(nodeId, 'why', {
      depth: 2,
      count: 3
    });
  };

  const handleHowGenerate = async (nodeId: string) => {
    return handleGenerate(nodeId, 'how', {
      depth: 2,
      count: 3
    });
  };

  return {
    handleQuickGenerate,
    handleDetailedGenerate,
    handleWhyGenerate,
    handleHowGenerate,
    apiKey
  };
}; 