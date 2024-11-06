import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  // ベジェ曲線のコントロールポイントを計算
  const midX = (sourceX + targetX) / 2;
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3  // 曲線の強さを調整
  });

  return (
    <g>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#2563eb',
          transition: 'stroke-width 0.2s, stroke 0.2s',
        }}
        markerEnd={markerEnd}
      />
      {/* アニメーション用のパス */}
      <path
        d={path}
        style={{
          stroke: '#60a5fa',
          strokeWidth: 1,
          strokeDasharray: 5,
          animation: 'flow 1s linear infinite',
          opacity: 0.5,
        }}
      />
      <style>
        {`
          @keyframes flow {
            from {
              stroke-dashoffset: 10;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </g>
  );
};

export default CustomEdge; 