import { jsonAxios } from '#/api/axios/axios';

export const getAllQuestionService = async (limit: number, offset: number) =>
  await jsonAxios.get(`questions?limit=${limit}&offset=${offset}`);
