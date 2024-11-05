import React, { useRef, useEffect, useState } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  ReactFlowInstance,
  Connection,
  Edge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMindMapStore } from '../store/mindMapStore';
import CustomNode from './CustomNode';
import NodeMenu from './NodeMenu';
import { Layout } from 'lucide-react';

const nodeTypes = {
  mindNode: CustomNode,
};

const MindMap = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    calculateLayout
  } = useMindMapStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onLoad = (_reactFlowInstance: ReactFlowInstance) => {
    setReactFlowInstance(_reactFlowInstance);
    _reactFlowInstance.fitView();
  };

  const handleLayoutClick = () => {
    calculateLayout();
    setTimeout(() => {
      reactFlowInstance?.fitView({ duration: 500, padding: 0.2 });
    }, 100);
  };

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    event.stopPropagation();
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (bounds) {
      setMenuPosition({
        x: node.position.x + bounds.left,
        y: node.position.y + bounds.top,
      });
      setSelectedNodeId(node.id);
    }
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
    setSelectedNodeId(null);
  };

  return (
    <div className="react-flow-wrapper" ref={reactFlowWrapper} style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        onInit={onLoad}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        
        <Panel position="bottom-right" className="flex gap-2 mb-20 mr-4">
          <button
            onClick={handleLayoutClick}
            className="p-2.5 rounded-lg bg-white/90 hover:bg-white
              shadow-lg hover:shadow-xl
              text-gray-700 hover:text-gray-900
              border border-gray-200
              transition-all duration-200
              hover:scale-105
              tooltip"
            title="レイアウトを整える"
          >
            <Layout 
              size={20}
              className="stroke-current"
            />
          </button>
        </Panel>
      </ReactFlow>
      
      {selectedNodeId && menuPosition && (
        <NodeMenu
          nodeId={selectedNodeId}
          position={menuPosition}
          onClose={handleCloseMenu}
        />
      )}
    </div>
  );
};

export default MindMap; 