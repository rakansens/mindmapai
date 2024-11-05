import { Node as ReactFlowNode } from 'reactflow';
import { useOpenAI } from '../utils/openai';
import { useMindMapStore } from '../store/mindMapStore';
import { useReactFlow } from 'reactflow';
import { HierarchyItem, TopicTree } from '../types/common';
import { parseTopicTree } from '../utils/nodeUtils';

export const useAIGeneration = () => {
  const { generateSubTopics } = useOpenAI();
  const store = useMindMapStore();
  const { fitView } = useReactFlow();

  const generateNodes = async (
    parentNode: ReactFlowNode,
    items: HierarchyItem[],
    level: number = 0
  ) => {
    const totalItems = items.length;
    
    for (const [index, item] of items.entries()) {
      await new Promise(resolve => setTimeout(resolve, 50 + level * 30));
      
      const newNode = store.addNode(
        parentNode,
        item.text,
        index,
        totalItems
      );

      if (item.children && item.children.length > 0) {
        await generateNodes(newNode, item.children, level + 1);
      }
    }
  };

  const handleGenerate = async (
    nodeId: string, 
    mode: 'quick' | 'detailed' | 'why' | 'how' | 'what' | 'which' = 'quick',
    type: 'simple' | 'detailed' = 'simple'
  ): Promise<void> => {
    const currentNode = store.nodes.find(n => n.id === nodeId);
    if (!currentNode) {
      console.error('Node not found:', nodeId);
      return;
    }

    try {
      console.log('Generating for node:', currentNode.data.label);
      console.log('Mode:', mode, 'Type:', type);
      
      const response = await generateSubTopics(currentNode.data.label, {
        mode,
        quickType: type,
      });

      console.log('API Response:', response);
      
      if (!response || !response.children) {
        throw new Error('Invalid API response');
      }

      const hierarchy = parseTopicTree(response);
      await generateNodes(currentNode, hierarchy);

      store.calculateLayout();
      
      setTimeout(() => {
        fitView({
          duration: 800,
          padding: 0.3,
          minZoom: 0.4,
          maxZoom: 1,
        });
      }, 500);
    } catch (error) {
      console.error('Generation failed:', error);
      throw error;
    }
  };

  const handleQuickGenerate = async (nodeId: string): Promise<void> => {
    await handleGenerate(nodeId, 'quick', 'simple');
  };

  const handleDetailedGenerate = async (nodeId: string): Promise<void> => {
    await handleGenerate(nodeId, 'quick', 'detailed');
  };

  const handleWhyGenerate = async (nodeId: string, detailed = false): Promise<void> => {
    await handleGenerate(nodeId, 'why', detailed ? 'detailed' : 'simple');
  };

  const handleHowGenerate = async (nodeId: string, detailed = false): Promise<void> => {
    await handleGenerate(nodeId, 'how', detailed ? 'detailed' : 'simple');
  };

  const handleWhatGenerate = async (nodeId: string, detailed = false): Promise<void> => {
    await handleGenerate(nodeId, 'what', detailed ? 'detailed' : 'simple');
  };

  const handleWhichGenerate = async (nodeId: string, detailed = false): Promise<void> => {
    await handleGenerate(nodeId, 'which', detailed ? 'detailed' : 'simple');
  };

  return {
    generateNodes,
    handleGenerate,
    handleQuickGenerate,
    handleDetailedGenerate,
    handleWhyGenerate,
    handleHowGenerate,
    handleWhatGenerate,
    handleWhichGenerate,
  };
}; 