/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { QuestionGroupEntity } from './QuestionGroupEntity';
import type { QuestionEntity } from './QuestionEntity';

export type ExamWithMappingEntity = {
  id: string;
  name: string;
  questionMapping: Array<QuestionGroupEntity | QuestionEntity>;
};
