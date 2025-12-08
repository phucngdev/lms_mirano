export interface CardMergeProps {
  lessonId: string;
  onExit: () => void;
}

export interface CardItem {
  key: string;
  text: string;
  cardId: string;
}