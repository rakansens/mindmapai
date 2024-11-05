export const validateNodeLabel = (label: string) => {
  if (label.trim().length === 0) {
    return '内容を入力してください';
  }
  if (label.length > 50) {
    return '50文字以内で入力してください';
  }
  return null;
}; 