import { create } from 'zustand';
import { TopicTree, GenerateOptions } from '../types/common';
import OpenAI from 'openai';

interface OpenAIState {
  apiKey: string | null;
  isLoading: boolean;
  setApiKey: (key: string) => void;
  generateSubTopics: (topic: string, options: GenerateOptions) => Promise<TopicTree>;
}

export const useOpenAI = create<OpenAIState>((set, get) => ({
  apiKey: localStorage.getItem('openai_api_key'),
  isLoading: false,

  setApiKey: (key: string) => {
    localStorage.setItem('openai_api_key', key);
    set({ apiKey: key });
  },

  generateSubTopics: async (topic: string, options: GenerateOptions) => {
    const { apiKey } = get();
    if (!apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    set({ isLoading: true });
    try {
      let prompt = '';
      
      switch (options.mode) {
        case 'quick':
          prompt = `
以下のトピックについて、3階層の階層的なマインドマップを生成してください。

トピック: "${topic}"

要件:
1. 第1階層: 3-4個の主要カテゴリを生成
2. 第2階層: 各カテゴリに2-3個のサブトピックを生成
3. 第3階層: 各サブトピックに1-2個の具体的な項目を生成
4. シンプルで分かりやすい単語や短いフレーズを使用

応答は以下のような階層的なJSON形式にしてください:
{
  "label": "${topic}",
  "children": [
    {
      "label": "カテゴリ1",
      "children": [
        {
          "label": "サブトピック1-1",
          "children": [
            {
              "label": "具体的な項目1-1-1",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}`;
          break;

        case 'detailed':
          prompt = `
以下のトピックについて、詳細な説明付きのマインドマップを生成してください。

トピック: "${topic}"

要件:
1. 3つのメインカテゴリを生成
2. 各カテゴリに詳細な説明文（200-300文字）を含める
3. 説明は専門的かつ具体的に
4. 重要なポイントを箇条書きで含める

必ず以下のJSON形式で返してください。他の文章は含めないでください:
{
  "label": "${topic}",
  "children": [
    {
      "label": "メインカテゴリ1",
      "description": "このカテゴリの詳細な説明を200-300文字で記述。\\n\\n• 重要なポイント1\\n• 重要なポイント2\\n• 重要なポイント3",
      "children": []
    },
    {
      "label": "メインカテゴリ2",
      "description": "このカテゴリの詳細な説明を200-300文字で記述。\\n\\n• 重要なポイント1\\n• 重要なポイント2\\n• 重要なポイント3",
      "children": []
    },
    {
      "label": "メインカテゴリ3",
      "description": "このカテゴリの詳細な説明を200-300文字で記述。\\n\\n• 重要なポイント1\\n• 重要なポイント2\\n• 重要なポイント3",
      "children": []
    }
  ]
}`;
          break;

        case 'why':
          prompt = `
以下のトピックについて、「なぜ？」という質問形式で分析を生成してください。

トピック: "${topic}"

要件:
1. 3つの「なぜ〜？」という質問を生成
2. 各質問に対して2-3個の回答を生成
3. 回答は2-3行の簡潔な説明
4. 詳細な説明が必要な場合のみdescriptionを含める

必ず以下のJSON形式で返してください。他の文章は含めないでください:
{
  "label": "${topic}",
  "children": [
    {
      "label": "なぜ[トピックの側面1]なのか？",
      "children": [
        {
          "label": "回答1: [簡潔な回答]",
          "children": []
        },
        {
          "label": "回答2: [簡潔な回答]",
          "children": []
        }
      ]
    },
    {
      "label": "なぜ[トピックの側面2]なのか？",
      "children": [
        {
          "label": "回答1: [簡潔な回答]",
          "children": []
        },
        {
          "label": "回答2: [簡潔な回答]",
          "children": []
        }
      ]
    },
    {
      "label": "なぜ[トピックの側面3]なのか？",
      "children": [
        {
          "label": "回答1: [簡潔な回答]",
          "children": []
        },
        {
          "label": "回答2: [簡潔な回答]",
          "children": []
        }
      ]
    }
  ]
}`;
          break;

        case 'how':
          prompt = `
以下のトピックについて、具体的な実行手順とタスクを生成してください。

トピック: "${topic}"

要件:
1. 3-4つの主要な実行ステップを生成
2. 各ステップの下に3つの具体的なタスクを生成
3. タスクは実践的で具体的な内容にする
4. 時系列に沿った論理的な順序で並べる

必ず以下のJSON形式で返してください。他の文章は含めないでください:
{
  "label": "${topic}の実行手順",
  "children": [
    {
      "label": "ステップ1: 準備フェーズ",
      "children": [
        {
          "label": "タスク1-1: [具体的なタスク内容]",
          "children": []
        },
        {
          "label": "タスク1-2: [具体的なタスク内容]",
          "children": []
        },
        {
          "label": "タスク1-3: [具体的なタスク内容]",
          "children": []
        }
      ]
    },
    {
      "label": "ステップ2: 実行フェーズ",
      "children": [
        {
          "label": "タスク2-1: [具体的なタスク内容]",
          "children": []
        },
        {
          "label": "タスク2-2: [具体的なタスク内容]",
          "children": []
        },
        {
          "label": "タスク2-3: [具体的なタスク内容]",
          "children": []
        }
      ]
    },
    {
      "label": "ステップ3: 完了フェーズ",
      "children": [
        {
          "label": "タスク3-1: [具体的なタスク内容]",
          "children": []
        },
        {
          "label": "タスク3-2: [具体的なタスク内容]",
          "children": []
        },
        {
          "label": "タスク3-3: [具体的なタスク内容]",
          "children": []
        }
      ]
    }
  ]
}`;
          break;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "あなたはマインドマップ作成を支援するAIアシスタントです。与えられたトピックについて、階層的な構造を持つサブトピックを生成します。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content generated');

      try {
        const topicTree = JSON.parse(content);
        return topicTree;
      } catch (e) {
        console.error('Failed to parse response:', content);
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
})); 