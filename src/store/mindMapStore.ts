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
import { TopicTree, TopicTreeNode } from '../types/common';
import dagre from 'dagre';

type LayoutType = 'horizontal' | 'vertical' | 'radial';
type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

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
  createNodesFromAIResponse: (parentId: string, response: TopicTree) => Promise<void>;
  addChildNode: (parentId: string) => void;
  addSiblingNode: (currentId: string) => void;
  autoLayout: () => void;
  layoutDirection: LayoutDirection;
  cycleLayout: () => void;
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
  layoutDirection: 'TB',

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
      horizontal: { x: 200, y: 100 },
      vertical: { x: 100, y: 150 },
      radial: { radius: 200 }
    };

    // ノードの階層を計算
    const levels = new Map<string, number>();
    const getNodeLevel = (nodeId: string): number => {
      if (levels.has(nodeId)) {
        return levels.get(nodeId)!;
      }

      const parentEdge = edges.find(e => e.target === nodeId);
      if (!parentEdge) {
        levels.set(nodeId, 0);
        return 0;
      }

      const parentLevel = getNodeLevel(parentEdge.source);
      const level = parentLevel + 1;
      levels.set(nodeId, level);
      return level;
    };

    // すべてのノードの階層を計算
    nodes.forEach(node => getNodeLevel(node.id));

    // ノードを階層ごとにグループ化
    const nodesByLevel = new Map<number, string[]>();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node.id);
    });

    // ノードの位置を更新
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      const levelNodes = nodesByLevel.get(level) || [];
      const index = levelNodes.indexOf(node.id);
      const totalNodesInLevel = levelNodes.length;

      let x, y;
      switch (layout) {
        case 'horizontal':
          x = level * spacing.horizontal.x;
          y = (index - (totalNodesInLevel - 1) / 2) * spacing.horizontal.y;
          break;
        case 'vertical':
          x = (index - (totalNodesInLevel - 1) / 2) * spacing.vertical.x;
          y = level * spacing.vertical.y;
          break;
        case 'radial':
          const angle = (index / totalNodesInLevel) * Math.PI * 2;
          const radius = level * spacing.radial.radius;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
          break;
        default:
          x = 0;
          y = 0;
      }

      // ルートノードの位置を基準に調整
      const rootNode = nodes.find(n => levels.get(n.id) === 0);
      if (rootNode) {
        x += rootNode.position.x;
        y += rootNode.position.y;
      }

      get().updateNodePosition(node.id, { x, y });
    });
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

  // JSONとしてエクポート
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
      // システムのテー変更を監視
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

  createNodesFromAIResponse: async (parentId: string, response: TopicTree) => {
    try {
      console.log('Processing AI response:', response);

      if (!response || !response.children) {
        throw new Error('Invalid response format');
      }

      const newNodes: ReactFlowNode[] = [];
      const newEdges: Edge[] = [];

      // 再帰的にノードを生成する関数
      const createChildNodes = (
        parentId: string,
        children: TopicTreeNode[],
        level: number = 0
      ) => {
        children.forEach((child, index) => {
          const nodeId = `${parentId}-${Date.now()}-${index}`;

          newNodes.push({
            id: nodeId,
            type: 'mindNode',
            position: { x: 0, y: 0 },
            data: { 
              label: child.label,
              isGenerating: false,
              description: child.description
            }
          });

          newEdges.push({
            id: `e${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: 'smoothstep'
          });

          if (child.children && child.children.length > 0) {
            createChildNodes(nodeId, child.children, level + 1);
          }
        });
      };

      createChildNodes(parentId, response.children);

      set((state) => ({
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...newEdges],
      }));

      setTimeout(() => {
        get().calculateLayout();
      }, 100);

    } catch (error) {
      console.error('Error creating nodes:', error);
      throw error;
    }
  },

  addChildNode: (parentId: string) => {
    const parentNode = get().nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    const existingChildEdges = get().edges.filter(edge => edge.source === parentId);
    const existingChildNodes = existingChildEdges
      .map(edge => get().nodes.find(n => n.id === edge.target))
      .filter((node): node is ReactFlowNode => node !== undefined);

    let newY = parentNode.position.y;
    
    if (existingChildNodes.length > 0) {
      const lastChild = existingChildNodes[existingChildNodes.length - 1];
      if (lastChild) {
        newY = lastChild.position.y + 100;
      }
    }

    const newNode = {
      id: `${parentId}-${Date.now()}`,
      type: 'mindNode',
      data: { label: '新しいノード' },
      position: { 
        x: parentNode.position.x + 250, // 親ノードから右に250px
        y: newY
      }
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, {
        id: `e${parentId}-${newNode.id}`,
        source: parentId,
        target: newNode.id,
        type: 'smoothstep'
      }]
    }));

    get().calculateLayout();
  },

  addSiblingNode: (currentId: string) => {
    const currentNode = get().nodes.find(n => n.id === currentId);
    if (!currentNode) return;

    // 親エッジを見つける
    const parentEdge = get().edges.find(e => e.target === currentId);
    if (!parentEdge) return;

    // 親ノードを取得
    const parentNode = get().nodes.find(n => n.id === parentEdge.source);
    if (!parentNode) return;

    // 同じ親を持つ兄弟ノードを取得
    const siblingEdges = get().edges.filter(edge => 
      edge.source === parentEdge.source && edge.target !== currentId
    );
    const siblingNodes = siblingEdges.map(edge => 
      get().nodes.find(n => n.id === edge.target)
    ).filter(Boolean);

    // 新しいノードのY座標を計算
    let newY = currentNode.position.y;
    if (siblingNodes.length > 0) {
      const lastSibling = siblingNodes[siblingNodes.length - 1];
      if (lastSibling) {
        newY = lastSibling.position.y + 100;
      }
    }

    const newNode = {
      id: `${parentEdge.source}-${Date.now()}`,
      type: 'mindNode',
      data: { label: '新しいノード' },
      position: { 
        x: currentNode.position.x, // 同じX座標
        y: newY
      }
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, {
        id: `e${parentEdge.source}-${newNode.id}`,
        source: parentEdge.source,
        target: newNode.id,
        type: 'smoothstep'
      }]
    }));

    get().calculateLayout();
  },

  autoLayout: () => {
    const { nodes, edges, layoutDirection } = get();
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    // レイアウトの設定を方向に応じて調整
    const settings = {
      TB: { nodesep: 100, ranksep: 150 },
      BT: { nodesep: 100, ranksep: 150 },
      LR: { nodesep: 60, ranksep: 250 },
      RL: { nodesep: 60, ranksep: 250 },
    };

    dagreGraph.setGraph({ 
      rankdir: layoutDirection,
      ...settings[layoutDirection],
      align: 'DL',
      ranker: 'tight-tree',
      edgesep: 50,
      marginx: 20,
      marginy: 20,
      acyclicer: 'greedy'
    });

    // Add nodes to dagre with adjusted sizes
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { 
        width: 180, 
        height: layoutDirection === 'TB' || layoutDirection === 'BT' ? 60 : 80
      });
    });

    // Add edges to dagre
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Update node positions with transition
    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 90,
          y: nodeWithPosition.y - (layoutDirection === 'TB' || layoutDirection === 'BT' ? 30 : 40),
        },
      };
    });

    // エッジの設定を変更 - カスタムスタイルを削除
    const newEdges = edges.map(edge => ({
      ...edge,
      type: 'smoothstep',  // 'custom'から'smoothstep'に変更
      animated: false,     // アニメーションを無効化
      style: {
        stroke: '#2563eb',
        strokeWidth: 2,
      },
    }));

    set({ 
      nodes: newNodes,
      edges: newEdges
    });
  },

  cycleLayout: () => {
    const directions: LayoutDirection[] = ['TB', 'LR', 'RL', 'BT'];
    const currentDirection = get().layoutDirection;
    const currentIndex = directions.indexOf(currentDirection);
    const nextDirection = directions[(currentIndex + 1) % directions.length];
    set({ layoutDirection: nextDirection });
    get().autoLayout();
  },
}));

// 自動保存の設定
if (typeof window !== 'undefined') {
  setInterval(() => {
    useMindMapStore.getState().autoSave();
  }, 60000); // 1分ごとに自動保存
}