import React from 'react';
import { EdgeProps, getBezierPath, getSmoothStepPath } from 'reactflow';
import { useMindMapStore } from '../../store/mindMapStore';

type EdgeStyle = 'bezier' | 'smoothstep' | 'organic';

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
  const { edgeStyle } = useMindMapStore();

  // エッジスタイルに応じてパスを生成
  const getPath = () => {
    const commonParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    switch (edgeStyle) {
      case 'bezier':
        return getBezierPath({
          ...commonParams,
          curvature: 0.3,
        });
      case 'organic':
        // オーガニックスタイルはベジェ曲線をベースに、より自然な曲線を生成
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);
        const controlLength = length * 0.4;
        
        const control1X = sourceX + Math.cos(angle + Math.PI / 6) * controlLength;
        const control1Y = sourceY + Math.sin(angle + Math.PI / 6) * controlLength;
        const control2X = targetX - Math.cos(angle - Math.PI / 6) * controlLength;
        const control2Y = targetY - Math.sin(angle - Math.PI / 6) * controlLength;
        
        return [`M ${sourceX},${sourceY} C ${control1X},${control1Y} ${control2X},${control2Y} ${targetX},${targetY}`];
      default:
        return getSmoothStepPath({
          ...commonParams,
          borderRadius: 16,
          offset: 16,
        });
    }
  };

  const [path] = getPath();

  return (
    <g>
      {/* メインのパス */}
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
