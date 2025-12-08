import { jsonAxios } from '#/api/axios/axios';

export const getVideoByIdLessonService = async (
  id: string,
  limit: 1,
  offset: 0,
) =>
  await jsonAxios.get(`video-url/user/${id}?limit=${limit}&offset=${offset}`);
