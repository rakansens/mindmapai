import { useState } from 'react';

const API_BASE_URL = 'https://api.openai.com/v1';

const SYSTEM_PROMPT = `あなたは構造化されたマインドマップを生成するAIアシスタントです。
以下の制約を厳密に守ってマインドマップを生成してください：

【必須の構造】
1. メインブランチ: 必ず3つ
2. 子ノード: 各メインブランチに3つ
3. 孫ノード: 各子ノードに2つ
4. 階層: メインブランチ→子ノード→孫ノードの3段階構造を必ず守る

【文章のルール】
1. 文字数: 各項目20文字以内
2. 文体: 名詞止め、または簡潔な表現
3. 内容: 具体的で実践的な情報

【出力形式】
テーマ：[中心テーマ]

メインブランチ1：[項目]
├── 子1-1：[項目]
│   ├── 孫1-1-1：[詳細]
│   └── 孫1-1-2：[詳細]
├── 子1-2：[項目]
│   ├── 孫1-2-1：[詳細]
│   └── 孫1-2-2：[詳細]
└── 子1-3：[項目]
    ├── 孫1-3-1：[詳細]
    └── 孫1-3-2：[詳細]

メインブランチ2：[項目]
├── 子2-1：[項目]
│   ├── 孫2-1-1：[詳細]
│   └── 孫2-1-2：[詳細]
├── 子2-2：[項目]
│   ├── 孫2-2-1：[詳細]
│   └── 孫2-2-2：[詳細]
└── 子2-3：[項目]
    ├── 孫2-3-1：[詳細]
    └── 孫2-3-2：[詳細]

メインブランチ3：[項目]
├── 子3-1：[項目]
│   ├── 孫3-1-1：[詳細]
│   └── 孫3-1-2：[詳細]
├── 子3-2：[項目]
│   ├── 孫3-2-1：[詳細]
│   └── 孫3-2-2：[詳細]
└── 子3-3：[項目]
    ├── 孫3-3-1：[詳細]
    └── 孫3-3-2：[詳細]`;

export const useOpenAI = () => {
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem('openai_api_key')
  );

  const generateMindMap = async (prompt: string) => {
    if (!apiKey) {
      throw new Error('OpenAI API key not set');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: `テーマ「${prompt}」について、マインドマップを生成してください。
以下の点を厳守してください：

1. メインブランチは3つ作成
2. 各メインブランチに3つの子ノードを作成
3. 各子ノードに2つの孫ノードを作成
4. 全ての項目は20文字以内の簡潔な表現
5. 実践的で具体的な内容を含める
6. 3階層の構造を必ず維持する

※指定された構造（3メインブランチ×各3子ノード×各2孫ノード）は必ず守ってください。
※必ず└──や├──などの記号を使って階層を表現してください。`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI生成エラー:', error);
      throw error;
    }
  };

  return {
    apiKey,
    setApiKey,
    generateMindMap,
  };
};