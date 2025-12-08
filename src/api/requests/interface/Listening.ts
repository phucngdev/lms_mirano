import { ExamLessonWithMappingEntity } from "../models/ExamLessonWithMappingEntity";
import { QuestionEntity } from "../models/QuestionEntity";
import { QuestionGroupEntity } from "../models/QuestionGroupEntity";

export interface ListeningProps {
  lessonId: string;
  onClickNext: () => void;
}

export interface DecryptedDataListen {
  items: ExamLessonWithMappingEntity[];
}

export interface ShuffledGroup extends Omit<QuestionGroupEntity, 'questions'> {
  questions: QuestionEntity[];
}

