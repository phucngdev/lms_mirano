import { jsonAxios } from '#/api/axios/axios';

export const getAllCourseService = async () =>
  await jsonAxios.get(`student/courses`);

export const getCourseByIdService = async (id: string) =>
  await jsonAxios.get(`student/courses/${id}`);
