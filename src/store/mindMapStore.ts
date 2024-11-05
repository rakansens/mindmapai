import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node as ReactFlowNode,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ReactFlowInstance } from 'reactflow';

type LayoutType = 'horizontal' | 'vertical' | 'radial';

interface CopiedSubtree {
  root: ReactFlowNode;
  children: ReactFlowNode[];
}

interface MindMapState {
  nodes: ReactFlowNode[];
  edges: Edge[];
  layout: LayoutType;
  history: HistoryState;
  isEditing: boolean;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (parentNode: ReactFlowNode | null, label: string, index?: number, totalSiblings?: number) => ReactFlowNode;
  updateNodeText: (id: string, text: string, withAnimation?: boolean) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setLayout: (layout: LayoutType) => void;
  calculateLayout: () => void;
  updateNodeLabel: (id: string, newLabel: string) => void;
  updateNodesWithHistory: (nodes: ReactFlowNode[]) => void;
  undo: () => void;
  exitEditMode: () => void;
  deleteNode: (nodeId: string) => void;
  toggleCollapse: (nodeId: string) => void;
  copyNode: (nodeId: string) => void;
  pasteNode: (parentNodeId: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  copiedNode: CopiedSubtree | null;
  saveMap: () => void;
  loadMap: () => void;
  exportAsImage: () => void;
  exportAsPDF: () => void;
  exportAsJSON: () => void;
  importFromJSON: (jsonData: string) => void;
  autoSave: () => void;
  theme: 'light' | 'dark' | 'system';
  showMinimap: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleMinimap: () => void;
  focusNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  flowInstance: ReactFlowInstance | null;
  setFlowInstance: (instance: ReactFlowInstance) => void;
  updateNodeData: (id: string, data: any) => void;
  selectNode: (nodeId: string) => void;
  setNodeGenerating: (nodeId: string, isGenerating: boolean) => void;
  createNodesFromAIResponse: (parentId: string, response: string) => Promise<void>;
}

interface HistoryState {
  past: ReactFlowNode[][];
  present: ReactFlowNode[];
  future: ReactFlowNode[][];
}

const HORIZONTAL_SPACING = {
  horizontal: { main: 250, sub: 200 },
  vertical: { main: 200, sub: 150 },
  radial: { main: 250, sub: 200 },
};

const VERTICAL_SPACING = {
  horizontal: { main: 100, sub: 80 },
  vertical: { main: 120, sub: 100 },
  radial: { main: 100, sub: 80 },
};

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'mindNode',
      data: { label: 'Central Topic' },
      position: { x: window.innerWidth / 2, y: window.innerHeight / 3 },
    },
  ],
  edges: [],
  layout: 'horizontal',
  history: {
    past: [],
    present: [],
    future: [],
  },
  isEditing: false,
  copiedNode: null,
  theme: 'light',
  showMinimap: false,
  flowInstance: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  addNode: (parentNode, label, index = 0, totalSiblings = 1) => {
    const { layout } = get();
    const spacing = HORIZONTAL_SPACING[layout];
    const verticalSpacing = VERTICAL_SPACING[layout];
    
    // 子ノードの位置を計算
    const calculatePosition = () => {
      if (!parentNode) {
        return { x: window.innerWidth / 2, y: window.innerHeight / 3 };
      }

      const verticalOffset = ((index - (totalSiblings - 1) / 2) * verticalSpacing.sub);
      
      switch (layout) {
        case 'vertical':
          return {
            x: parentNode.position.x + ((index - (totalSiblings - 1) / 2) * spacing.sub),
            y: parentNode.position.y + spacing.main,
          };
        case 'radial':
          const angleStep = (Math.PI * 0.8) / Math.max(totalSiblings - 1, 1);
          const startAngle = -Math.PI * 0.4;
          const angle = startAngle + (index * angleStep);
          const radius = spacing.main;
          return {
            x: parentNode.position.x + Math.cos(angle) * radius,
            y: parentNode.position.y + Math.sin(angle) * radius,
          };
        default: // horizontal
          return {
            x: parentNode.position.x + spacing.main,
            y: parentNode.position.y + verticalOffset,
          };
      }
    };

    const position = calculatePosition();
    
    const newNode = {
      id: `${Date.now()}-${index}`,
      type: 'mindNode',
      data: { label, isNew: true },
      position,
    };

    set({ nodes: [...get().nodes, newNode] });

    if (parentNode) {
      const newEdge = {
        id: `e${parentNode.id}-${newNode.id}`,
        source: parentNode.id,
        target: newNode.id,
      };
      set({ edges: [...get().edges, newEdge] });
    }

    return newNode;
  },

  updateNodeText: (id: string, text: string, withAnimation = false) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { 
              ...node.data, 
              label: text,
              isGenerating: withAnimation 
            }
          };
        }
        return node;
      });

      // アニメーション付きの場合、タイピングエフェクトを開始
      if (withAnimation) {
        setTimeout(() => {
          set((state) => ({
            nodes: state.nodes.map((node) =>
              node.id === id
                ? { ...node, data: { ...node.data, isGenerating: false } }
                : node
            ),
          }));
        }, text.length * 50 + 500); // テキストの長さに応じて遅延を調整
      }

      return {
        nodes: updatedNodes,
        history: {
          past: [...state.history.past, state.nodes],
          present: updatedNodes,
          future: [],
        }
      };
    });
  },

  updateNodePosition: (id: string, position: { x: number; y: number }) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    });
  },

  setLayout: (layout: LayoutType) => {
    set({ layout });
    get().calculateLayout();
  },

  calculateLayout: () => {
    const { nodes, edges, layout } = get();
    const spacing = {
      h: HORIZONTAL_SPACING[layout],
      v: VERTICAL_SPACING[layout],
    };

    // ノードの階層とグループを計算
    const nodeHierarchy = new Map<string, number>();
    const nodeGroups = new Map<string, string>();
    const childrenCount = new Map<string, number>();

    // 階層とグループを計算
    const calculateHierarchy = (nodeId: string, level: number = 0, parentId: string | null = null) => {
      nodeHierarchy.set(nodeId, level);
      if (parentId) nodeGroups.set(nodeId, parentId);

      const children = edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);

      childrenCount.set(nodeId, children.length);
      children.forEach(childId => calculateHierarchy(childId, level + 1, nodeId));
    };

    // ルートノードを見つけて階層計算を開始
    const rootNode = nodes.find(node => !edges.some(edge => edge.target === node.id));
    if (rootNode) {
      calculateHierarchy(rootNode.id);
    }

    // 中心位置を計算
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;

    // ルートノードを配置
    if (rootNode) {
      get().updateNodePosition(rootNode.id, { x: centerX, y: centerY });
    }

    // 各レベルノードを配置
    const maxLevel = Math.max(...Array.from(nodeHierarchy.values()));
    
    for (let level = 1; level <= maxLevel; level++) {
      const levelNodes = nodes.filter(node => nodeHierarchy.get(node.id) === level);
      
      levelNodes.forEach(node => {
        const parentId = nodeGroups.get(node.id);
        if (!parentId) return;

        const parent = nodes.find(n => n.id === parentId);
        if (!parent) return;

        const siblings = edges
          .filter(edge => edge.source === parentId)
          .map(edge => edge.target);
        
        const nodeIndex = siblings.indexOf(node.id);
        const totalSiblings = siblings.length;

        let newPosition;
        const levelMultiplier = Math.sqrt(level); // 階層が深くなるほど距離を調整

        switch (layout) {
          case 'vertical':
            const xOffset = ((nodeIndex - (totalSiblings - 1) / 2) * spacing.h.sub * 1.2);
            newPosition = {
              x: parent.position.x + xOffset,
              y: parent.position.y + (spacing.v.main * levelMultiplier),
            };
            break;

          case 'radial':
            const angleStep = (2 * Math.PI) / totalSiblings;
            const baseAngle = -Math.PI / 2; // 上方向から開始
            const angle = baseAngle + (nodeIndex * angleStep);
            const radius = level * spacing.h.main;
            newPosition = {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
            };
            break;

          default: // horizontal
            const horizontalOffset = spacing.h.main * levelMultiplier;
            const verticalOffset = ((nodeIndex - (totalSiblings - 1) / 2) * spacing.v.sub * 1.2);
            newPosition = {
              x: parent.position.x + horizontalOffset,
              y: parent.position.y + verticalOffset,
            };
        }

        get().updateNodePosition(node.id, newPosition);
      });
    }
  },

  updateNodeLabel: (id: string, newLabel: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      ),
    }));
  },

  updateNodesWithHistory: (nodes: ReactFlowNode[]) => {
    set((state) => ({
      history: {
        past: [...state.history.past, state.nodes],
        present: nodes,
        future: [],
      },
      nodes,
    }));
  },

  undo: () => {
    set((state) => {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      
      return {
        history: {
          past: newPast,
          present: previous,
          future: [state.nodes, ...state.history.future],
        },
        nodes: previous,
      };
    });
  },

  exitEditMode: () => {
    set({ isEditing: false });
  },

  deleteNode: (nodeId: string) => {
    set((state) => {
      // 削除するノードとその子ノードのIDを収集
      const nodesToDelete = new Set<string>();
      const collectNodes = (id: string) => {
        nodesToDelete.add(id);
        state.edges
          .filter(edge => edge.source === id)
          .forEach(edge => collectNodes(edge.target));
      };
      collectNodes(nodeId);

      return {
        nodes: state.nodes.filter(node => !nodesToDelete.has(node.id)),
        edges: state.edges.filter(edge => 
          !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)
        ),
      };
    });
  },

  toggleCollapse: (nodeId: string) => {
    set((state) => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, isCollapsed: !node.data.isCollapsed }
          };
        }
        return node;
      });

      // 子ノードの表示/非表示を切り替え
      const childNodes = new Set<string>();
      const collectChildNodes = (id: string) => {
        state.edges
          .filter(edge => edge.source === id)
          .forEach(edge => {
            childNodes.add(edge.target);
            collectChildNodes(edge.target);
          });
      };
      collectChildNodes(nodeId);

      const isCollapsed = !state.nodes.find(n => n.id === nodeId)?.data.isCollapsed;
      const finalNodes = updatedNodes.map(node => {
        if (childNodes.has(node.id)) {
          return {
            ...node,
            hidden: isCollapsed
          };
        }
        return node;
      });

      return { nodes: finalNodes };
    });
  },

  copyNode: (nodeId: string) => {
    const nodeToCopy = get().nodes.find(node => node.id === nodeId);
    if (nodeToCopy) {
      const childNodes = new Set<string>();
      const edges = get().edges;
      const collectChildNodes = (id: string) => {
        edges
          .filter(edge => edge.source === id)
          .forEach(edge => {
            childNodes.add(edge.target);
            collectChildNodes(edge.target);
          });
      };
      collectChildNodes(nodeId);

      const copiedSubtree: CopiedSubtree = {
        root: nodeToCopy,
        children: get().nodes.filter(node => childNodes.has(node.id))
      };

      set({ copiedNode: copiedSubtree });
    }
  },

  pasteNode: (parentNodeId: string) => {
    const { copiedNode } = get();
    if (!copiedNode) return;

    const createNewId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const idMap = new Map<string, string>();

    const calculateNewPosition = (parentId: string | null) => {
      if (!parentId) return { x: 0, y: 0 };
      const parentNode = get().nodes.find(n => n.id === parentId);
      if (!parentNode) return { x: 0, y: 0 };
      
      return {
        x: parentNode.position.x + HORIZONTAL_SPACING[get().layout].main,
        y: parentNode.position.y
      };
    };

    const cloneNode = (node: ReactFlowNode, parentId: string | null) => {
      const newId = createNewId();
      idMap.set(node.id, newId);

      const newNode = {
        ...node,
        id: newId,
        data: { ...node.data },
        position: calculateNewPosition(parentId)
      };

      set(state => ({
        nodes: [...state.nodes, newNode],
        edges: parentId ? [
          ...state.edges,
          {
            id: `e${parentId}-${newId}`,
            source: parentId,
            target: newId
          }
        ] : state.edges
      }));

      return newId;
    };

    const newRootId = cloneNode(copiedNode.root, parentNodeId);
    copiedNode.children.forEach((child: ReactFlowNode) => cloneNode(child, newRootId));

    get().calculateLayout();
  },

  updateNodeColor: (nodeId: string, color: string) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    }));
  },

  // マインドマップを保存
  saveMap: () => {
    const state = {
      nodes: get().nodes,
      edges: get().edges,
      layout: get().layout,
    };
    localStorage.setItem('mindmap', JSON.stringify(state));
  },

  // マインドマップを読み込み
  loadMap: () => {
    const savedData = localStorage.getItem('mindmap');
    if (savedData) {
      try {
        const state = JSON.parse(savedData);
        set({
          nodes: state.nodes,
          edges: state.edges,
          layout: state.layout,
        });
      } catch (error) {
        console.error('Failed to load mindmap:', error);
      }
    }
  },

  // 画像としてエクスポート
  exportAsImage: async () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    try {
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#f8fafc',
        quality: 1,
      });
      
      const link = document.createElement('a');
      link.download = `mindmap-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export as image:', error);
    }
  },

  // PDFとしてエクスポート
  exportAsPDF: async () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!flowElement) return;

    try {
      const dataUrl = await toPng(flowElement, {
        backgroundColor: '#f8fafc',
        quality: 1,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`mindmap-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Failed to export as PDF:', error);
    }
  },

  // JSONとしてエクスポート
  exportAsJSON: () => {
    const state = {
      nodes: get().nodes,
      edges: get().edges,
      layout: get().layout,
    };
    
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.download = `mindmap-${Date.now()}.json`;
    link.href = dataUri;
    link.click();
  },

  // JSONからインポート
  importFromJSON: (jsonData: string) => {
    try {
      const state = JSON.parse(jsonData);
      set({
        nodes: state.nodes,
        edges: state.edges,
        layout: state.layout,
      });
    } catch (error) {
      console.error('Failed to import JSON:', error);
    }
  },

  // 自動保存
  autoSave: () => {
    const state = {
      nodes: get().nodes,
      edges: get().edges,
      layout: get().layout,
    };
    localStorage.setItem('mindmap_autosave', JSON.stringify(state));
  },

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
      // システムのテーマ変更を監視
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        document.documentElement.classList.toggle('dark', e.matches);
      });
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },

  toggleMinimap: () => {
    set((state) => ({ showMinimap: !state.showMinimap }));
  },

  focusNode: (nodeId) => {
    const { flowInstance } = get();
    if (!flowInstance) return;

    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;

    flowInstance.setCenter(
      node.position.x,
      node.position.y,
      { duration: 800, zoom: 1.5 }
    );
  },

  zoomIn: () => {
    const { flowInstance } = get();
    if (!flowInstance) return;

    flowInstance.zoomIn({ duration: 300 });
  },

  zoomOut: () => {
    const { flowInstance } = get();
    if (!flowInstance) return;

    flowInstance.zoomOut({ duration: 300 });
  },

  fitView: () => {
    const { flowInstance } = get();
    if (!flowInstance) return;

    flowInstance.fitView({ duration: 300, padding: 0.2 });
  },

  setFlowInstance: (instance) => {
    set({ flowInstance: instance });
  },

  updateNodeData: (id: string, data: any) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data }
          : node
      ),
    }));
  },

  selectNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === nodeId,
        },
      })),
    }));
  },

  setNodeGenerating: (nodeId: string, isGenerating: boolean) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                isGenerating,
              },
            }
          : node
      ),
    }));
  },

  createNodesFromAIResponse: async (parentId, response) => {
    try {
      console.log('Processing AI response:', response);

      // レスポンスをパースしてノード構造に変換
      const lines = response.split('\n').filter(line => line.trim());
      const newNodes: ReactFlowNode[] = [];
      const newEdges: Edge[] = [];

      lines.forEach((line, index) => {
        const level = (line.match(/└──|├──/g) || []).length;
        const label = line.replace(/[└──├]/g, '').trim();
        const nodeId = `${parentId}-${index + 1}`;

        newNodes.push({
          id: nodeId,
          type: 'custom',
          position: { x: 0, y: 0 }, // 位置はレイアウト関数で設定
          data: { label, isGenerating: false }
        });

        newEdges.push({
          id: `edge-${parentId}-${index + 1}`,
          source: parentId,
          target: nodeId
        });
      });

      // 既存のノードとエッジに追加
      set((state) => ({
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...newEdges],
      }));

      // レイアウトを再計算
      get().calculateLayout();
    } catch (error) {
      console.error('Error creating nodes:', error);
      throw error;
    }
  },
}));

// 自動保存の設定
if (typeof window !== 'undefined') {
  setInterval(() => {
    useMindMapStore.getState().autoSave();
  }, 60000); // 1分ごとに自動保存
}