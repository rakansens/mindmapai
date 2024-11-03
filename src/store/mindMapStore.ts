import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';

type LayoutType = 'horizontal' | 'vertical' | 'radial';

interface MindMapState {
  nodes: Node[];
  edges: Edge[];
  layout: LayoutType;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (parentNode: Node | null, label: string) => Node;
  updateNodeText: (id: string, text: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setLayout: (layout: LayoutType) => void;
  calculateLayout: () => void;
}

const HORIZONTAL_SPACING = {
  horizontal: { main: 280, sub: 240 },
  vertical: { main: 200, sub: 180 },
  radial: { main: 250, sub: 200 },
};

const VERTICAL_SPACING = {
  horizontal: { main: 100, sub: 80 },
  vertical: { main: 120, sub: 100 },
  radial: { main: 60, sub: 45 },
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

  addNode: (parentNode, label) => {
    const { layout } = get();
    const spacing = HORIZONTAL_SPACING[layout];
    
    const newNode = {
      id: `${Date.now()}`,
      type: 'mindNode',
      data: { label, isNew: true },
      position: parentNode ? {
        x: parentNode.position.x + spacing.main,
        y: parentNode.position.y,
      } : { x: window.innerWidth / 2, y: window.innerHeight / 3 },
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

  updateNodeText: (id, text) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: text } } : node
      ),
    });
  },

  updateNodePosition: (id, position) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, position } : node
      ),
    });
  },

  setLayout: (layout) => {
    set({ layout });
    get().calculateLayout();
  },

  calculateLayout: () => {
    const { nodes, edges, layout } = get();
    const spacing = {
      h: HORIZONTAL_SPACING[layout],
      v: VERTICAL_SPACING[layout],
    };

    // ノードの階層ごとにグループ化
    const nodesByLevel: { [key: number]: Node[] } = {};
    nodes.forEach(node => {
      let level = 0;
      let currentId = node.id;
      
      while (true) {
        const parentEdge = edges.find(edge => edge.target === currentId);
        if (!parentEdge) break;
        level++;
        currentId = parentEdge.source;
      }
      
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      nodesByLevel[level].push(node);
    });

    // 中心ノードの位置を設定
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;
    const rootNode = nodesByLevel[0]?.[0];
    
    if (rootNode) {
      get().updateNodePosition(rootNode.id, { x: centerX, y: centerY });
    }

    // 各階層のノードを配置
    Object.entries(nodesByLevel).forEach(([levelStr, levelNodes]) => {
      const level = parseInt(levelStr);
      if (level === 0) return;

      levelNodes.forEach((node, index) => {
        const parentEdge = edges.find(edge => edge.target === node.id);
        if (!parentEdge) return;
        
        const parentNode = nodes.find(n => n.id === parentEdge.source);
        if (!parentNode) return;

        let newPosition;
        
        switch (layout) {
          case 'vertical':
            newPosition = {
              x: parentNode.position.x,
              y: parentNode.position.y + spacing.v.main + (index * spacing.v.sub),
            };
            break;
            
          case 'radial':
            const angle = (index / levelNodes.length) * 2 * Math.PI;
            const radius = level * spacing.h.main;
            newPosition = {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
            };
            break;
            
          default: // horizontal
            const siblingCount = levelNodes.length;
            const verticalOffset = (index - (siblingCount - 1) / 2) * spacing.v.main;
            newPosition = {
              x: parentNode.position.x + spacing.h.main,
              y: parentNode.position.y + verticalOffset,
            };
        }

        get().updateNodePosition(node.id, newPosition);
      });
    });
  },
}));