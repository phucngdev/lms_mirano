import { jsonAxios } from '#/api/axios/axios';
import { CreateLessonCommentDto, UpsertLessonProgressDto } from '../requests';

export const getAllLessonBySessonIdService = async (id: string) =>
  await jsonAxios.get(`student/lessons?sessonId=${id}`);

export const getLessonByIdService = async (id: string) =>
  await jsonAxios.get(`student/lessons/${id}`);
