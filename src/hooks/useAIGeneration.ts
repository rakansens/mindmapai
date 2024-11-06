import { Node as ReactFlowNode } from 'reactflow';
import { useOpenAI } from './useOpenAI';
import { useMindMapStore } from '../store/mindMapStore';
import { useReactFlow } from 'reactflow';
import { TopicTree } from '../types/common';
import OpenAI from 'openai';

export const useAIGeneration = () => {
  const { generateSubTopics, apiKey } = useOpenAI();
  const store = useMindMapStore();
  const { fitView } = useReactFlow();

  // OpenAIクライアントの初期化
  const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  }) : null;

  const handleGenerate = async (
    nodeId: string, 
    mode: 'quick' | 'detailed' | 'why' | 'how' | 'ideas' = 'quick',
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

      // レスポンスの証
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

  const handleIdeaGenerate = async (nodeId: string) => {
    return handleGenerate(nodeId, 'ideas', {
      depth: 1,
      count: 10
    });
  };

  const handleImageGenerate = async (nodeId: string) => {
    const node = store.nodes.find(n => n.id === nodeId);
    if (!node || !openai) return;

    try {
      if (!apiKey) {
        throw new Error('OpenAI API key is not set');
      }

      console.log('Starting image generation for:', node.data.label);

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a visual representation of "${node.data.label}". 
                Context: This is part of a mind map about ${getRootNodeLabel()}.
                Style: Professional, clean, and conceptual illustration.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      // レスポンスの詳細なデバッグログ
      console.log('Full image generation response:', JSON.stringify(response, null, 2));

      // DALL-E 3のレスポンス構造に合わせて修正
      if (response.data && response.data.length > 0) {
        // revised_promptも確認
        console.log('Revised prompt:', response.data[0].revised_prompt);
        const imageUrl = response.data[0].url;
        console.log('Image URL:', imageUrl);

        if (!imageUrl) {
          throw new Error('No image URL in response');
        }

        // 画像URLを保存する前にログ
        console.log('Saving image URL to node:', {
          nodeId,
          currentData: node.data,
          imageUrl
        });

        // 画像URLを保存
        store.updateNodeData(nodeId, {
          ...node.data,
          images: [imageUrl]
        });

        // 更新後のノードデータを確認
        const updatedNode = store.nodes.find(n => n.id === nodeId);
        console.log('Updated node data:', updatedNode?.data);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      if (error instanceof Error) {
        alert(`生成に失敗しました: ${error.message}`);
      } else {
        alert('生成に失敗しました');
      }
      throw error;
    }
  };

  // ルートノードのラベルを取得する補助関数
  const getRootNodeLabel = () => {
    const nodes = store.nodes;
    const edges = store.edges;
    const nodeId = store.nodes[0]?.id;
    if (!nodeId) return '';

    let currentId = nodeId;
    let rootNode = nodes.find(n => n.id === currentId);
    
    while (true) {
      const parentEdge = edges.find(e => e.target === currentId);
      if (!parentEdge) break;
      currentId = parentEdge.source;
      const parent = nodes.find(n => n.id === currentId);
      if (parent) rootNode = parent;
    }

    return rootNode?.data.label || '';
  };

  return {
    handleQuickGenerate,
    handleDetailedGenerate,
    handleWhyGenerate,
    handleHowGenerate,
    handleIdeaGenerate,
    handleImageGenerate,
    apiKey
  };
}; 