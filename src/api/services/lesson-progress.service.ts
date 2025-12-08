import { jsonAxios } from '../axios/axios';
import { UpsertLessonProgressDto } from '../requests';

export const updateLessonProgress = async (data: UpsertLessonProgressDto) => {
  const response = await jsonAxios.post(`/lesson-progresses`, data);
  return response.data;
};
