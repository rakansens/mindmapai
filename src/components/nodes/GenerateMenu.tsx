import React from 'react';
import { useMenuStore } from '../store/menuStore';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { useMindMapStore } from '../store/mindMapStore';
import { ButtonColorType } from '../types/common';
import { Zap, FileText, HelpCircle, ListChecks, Lightbulb } from 'lucide-react';

interface GenerateMenuProps {
  nodeId: string;
}

// 生成メニューの設定を定義
const GENERATE_MENU_ITEMS = [
  {
    id: 'quick',
    icon: <Zap size={16} />,
    title: 'シンプル生成',
    description: '3階層の単語ツリー',
    color: 'blue' as ButtonColorType,
    handler: 'handleQuickGenerate'
  },
  {
    id: 'detailed',
    icon: <FileText size={16} />,
    title: '詳細生成',
    description: '説明文付きの展開',
    color: 'purple' as ButtonColorType,
    handler: 'handleDetailedGenerate'
  },
  {
    id: 'why',
    icon: <HelpCircle size={16} />,
    title: 'Why分析',
    description: '理由の展開',
    color: 'green' as ButtonColorType,
    handler: 'handleWhyGenerate'
  },
  {
    id: 'how',
    icon: <ListChecks size={16} />,
    title: 'How分析',
    description: '手順の展開',
    color: 'orange' as ButtonColorType,
    handler: 'handleHowGenerate'
  },
  {
    id: 'ideas',
    icon: <Lightbulb size={16} />,
    title: 'アイディア生成',
    description: '10個のアイディアを生成',
    color: 'yellow' as ButtonColorType,
    handler: 'handleIdeaGenerate'
  }
];

export const GenerateMenu: React.FC<GenerateMenuProps> = ({ nodeId }) => {
  const { setActiveMenuNodeId } = useMenuStore();
  const { setNodeGenerating } = useMindMapStore();
  const aiGeneration = useAIGeneration();

  // 生成ハンドラー
  const handleGenerate = async (generatorName: string) => {
    try {
      setNodeGenerating(nodeId, true);
      const generator = aiGeneration[generatorName as keyof typeof aiGeneration];
      if (typeof generator === 'function') {
        await generator(nodeId);
      }
      setActiveMenuNodeId(null);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成に失敗しました');
    } finally {
      setNodeGenerating(nodeId, false);
    }
  };

  return (
    <div
      className="absolute left-full top-0 ml-4 bg-white/95 dark:bg-gray-800/95 
        rounded-2xl shadow-lg backdrop-blur-sm
        border border-gray-200/50 dark:border-gray-700/50
        p-4 min-w-[280px]
        transform transition-all duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {GENERATE_MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleGenerate(item.handler)}
              className="flex items-start gap-3 p-3 rounded-lg
                bg-white dark:bg-gray-800
                hover:bg-gray-100 dark:hover:bg-gray-700
                border border-gray-200 dark:border-gray-700
                transition-colors duration-200
                text-left"
            >
              <div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/20
                text-${item.color}-600 dark:text-${item.color}-400`}>
                {item.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 