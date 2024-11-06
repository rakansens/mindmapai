export interface NodeData {
  label: string;
  isEditing?: boolean;
  isGenerating?: boolean;
  isCollapsed?: boolean;
  color?: string;
  description?: string;
  selected?: boolean;
  images?: string[];
}

export interface NodeInteractionState {
  isEditing: boolean;
  isHovered: boolean;
  showMenu: boolean;
  // ... その他の状態
} 