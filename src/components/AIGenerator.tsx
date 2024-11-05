import { useState } from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { Sparkles } from 'lucide-react';
import { useMindMapStore } from '../store/mindMapStore';
import { useOpenAI, TopicTree } from '../utils/openai';

type LayoutStyle = 'horizontal' | 'radial';

// 階層構造の型を定義
interface HierarchyItem {
  level: number;
  text: string;
  children: HierarchyItem[];
}

export function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('horizontal');
  const { addNode, nodes, updateNodeText } = useMindMapStore();
  const { generateSubTopics, apiKey } = useOpenAI();
  const { fitView } = useReactFlow();

  const parseTopicTree = (topicTree: TopicTree): HierarchyItem[] => {
    const hierarchy: HierarchyItem[] = [];
    
    const processNode = (node: TopicTree, level: number = 0): HierarchyItem => {
      const item: HierarchyItem = {
        level,
        text: node.label,
        children: []
      };
      
      if (node.children && node.children.length > 0) {
        item.children = node.children.map(child => processNode(child, level + 1));
      }
      
      return item;
    };

    if (topicTree.children) {
      hierarchy.push(...topicTree.children.map(child => processNode(child, 0)));
    }

    return hierarchy;
  };

  const generateNodes = async (
    parentNode: any,
    items: HierarchyItem[],  // 型を修正
    level: number = 0
  ) => {
    for (const [index, item] of items.entries()) {
      await new Promise(resolve => setTimeout(resolve, 150));

      const newNode = addNode(parentNode, item.text, index);

      if (item.children && item.children.length > 0) {
        await generateNodes(newNode, item.children, level + 1);
      }
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert('OpenAI APIキーを設定してください');
      return;
    }

    if (!prompt.trim()) {
      alert('テーマを入力してください');
      return;
    }

    try {
      setIsLoading(true);
      const response = await generateSubTopics(prompt, {
        mode: 'quick',
        quickType: 'simple'
      });
      
      const hierarchy = parseTopicTree(response);

      const rootNode = nodes.find(n => n.id === '1');
      if (rootNode) {
        updateNodeText(rootNode.id, prompt);
        
        fitView({ 
          duration: 800,
          padding: 0.5,
        });

        await generateNodes(rootNode, hierarchy);

        setTimeout(() => {
          fitView({ 
            duration: 800,
            padding: 0.3,
            minZoom: 0.4,
            maxZoom: 1,
          });
        }, 1000);
      }

      setPrompt('');
      setIsOpen(false);
    } catch (error) {
      console.error('AI生成エラー:', error);
      alert('マインドマップの生成に失敗しました。APIキーを確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Panel position="bottom-right" className="mr-4 mb-4">
      {isOpen ? (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              レイアウトスタイル
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLayoutStyle('horizontal')}
                className={`flex-1 px-3 py-2 rounded border ${
                  layoutStyle === 'horizontal'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                横方向
              </button>
              <button
                onClick={() => setLayoutStyle('radial')}
                className={`flex-1 px-3 py-2 rounded border ${
                  layoutStyle === 'radial'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                放射状
              </button>
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="探求したいテーマを入力してください..."
            className="w-80 h-32 p-2 border rounded mb-2 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>マインドマップを生成</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 shadow-lg tooltip"
          title="AIマインドマップを生成"
        >
          <Sparkles size={24} />
        </button>
      )}
    </Panel>
  );
}