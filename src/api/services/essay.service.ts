import { jsonAxios } from '#/api/axios/axios';
import { CreateEssayTestDto, UpdateSubmitEssayUserDto } from '../requests';

export const postEssayService = async (data: CreateEssayTestDto) =>
  await jsonAxios.post(`essay-test`, data);

export const deleteEssayService = async (id: string) =>
  await jsonAxios.delete(`essay-test/${id}`);

export const getEssayByUserService = async (userId: string,examId:string) =>
  await jsonAxios.get(`essay-test/by-user/test?userId=${userId}&examId=${examId}`);

export const updateEssayService = async (id: string,data:UpdateSubmitEssayUserDto) =>
  await jsonAxios.put(`essay-test/submit/${id}`,data);

