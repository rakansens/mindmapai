import React from 'react';
import { useMenuStore } from '../store/menuStore';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { useMindMapStore } from '../store/mindMapStore';

interface GenerateMenuProps {
  nodeId: string;
}

export const GenerateMenu: React.FC<GenerateMenuProps> = ({ nodeId }) => {
  const { setActiveMenuNodeId } = useMenuStore();
  const { setNodeGenerating } = useMindMapStore();
  const { 
    handleQuickGenerate, 
    handleDetailedGenerate,
    handleWhyGenerate,
    handleHowGenerate 
  } = useAIGeneration();

  // 生成ハンドラーを修正
  const handleGenerate = async (generator: (nodeId: string) => Promise<void>) => {
    try {
      // 生成中状態を設定
      setNodeGenerating(nodeId, true);
      
      // 生成実行
      await generator(nodeId);
      
      // メニューを閉じる
      setActiveMenuNodeId(null);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成に失敗しました');
    } finally {
      // 生成状態をリセット
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
        <div>
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            クイック生成
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleGenerate(handleQuickGenerate)}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10
                hover:from-blue-500/20 hover:to-blue-600/20
                text-left transition-all duration-200
                group"
            >
              <span className="inline-block p-2 rounded-lg bg-blue-500 text-white mb-2 
                group-hover:scale-110 transition-transform"
              >
                ⚡
              </span>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                シンプル生成
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                3階層の単語ツリー
              </div>
            </button>

            <button
              onClick={() => handleGenerate(handleDetailedGenerate)}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-600/10
                hover:from-purple-500/20 hover:to-purple-600/20
                text-left transition-all duration-200
                group"
            >
              <span className="inline-block p-2 rounded-lg bg-purple-500 text-white mb-2 
                group-hover:scale-110 transition-transform"
              >
                📝
              </span>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                詳細生成
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                説明文付きの展開
              </div>
            </button>

            <button
              onClick={() => handleGenerate(handleWhyGenerate)}
              className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10
                hover:from-green-500/20 hover:to-green-600/20
                text-left transition-all duration-200
                group"
            >
              <span className="inline-block p-2 rounded-lg bg-green-500 text-white mb-2 
                group-hover:scale-110 transition-transform"
              >
                ❓
              </span>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Why分析
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                理由の展開
              </div>
            </button>

            <button
              onClick={() => handleGenerate(handleHowGenerate)}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10
                hover:from-orange-500/20 hover:to-orange-600/20
                text-left transition-all duration-200
                group"
            >
              <span className="inline-block p-2 rounded-lg bg-orange-500 text-white mb-2 
                group-hover:scale-110 transition-transform"
              >
                📝
              </span>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                How分析
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                手順の展開
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 