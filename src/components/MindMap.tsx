import React, { useRef, useEffect, useState } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  ReactFlowInstance,
  Connection,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMindMapStore } from '../store/mindMapStore';
import CustomNode from './CustomNode';
import NodeMenu from './NodeMenu';

const nodeTypes = {
  custom: CustomNode,
};

const MindMap = () => {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect 
  } = useMindMapStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onLoad = (_reactFlowInstance: ReactFlowInstance) => {
    setReactFlowInstance(_reactFlowInstance);
    _reactFlowInstance.fitView();
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