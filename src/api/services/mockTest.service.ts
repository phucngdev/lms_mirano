import { jsonAxios } from '#/api/axios/axios';
import { CreateTestResultDto } from '../requests';

export const getMockTestService = async (
  userId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `test-category/user/${userId}?limit=${limit}&offset=${offset}`,
  );

export const getTestByIdMockTestService = async (
  id: string,
  limit: number,
  offset: number,
) => await jsonAxios.get(`test/${id}?limit=${limit}&offset=${offset}`);
export const getByIdMockTestService = async (id: string) =>
  await jsonAxios.get(`test-category/${id}`);
export const getTestDetailByIdTestService = async (
  id: string,
  limit: number,
  offset: number,
) => await jsonAxios.get(`test-detail/${id}?limit=${limit}&offset=${offset}`);

export const postTestService = async (data: CreateTestResultDto) =>
  await jsonAxios.post(`/test-result`, data);

export const getTestResultService = async (
  userId: string,
  testId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `/test-result/user/${userId}/test/${testId}/?limit=${limit}&offset=${offset}`,
  );

export const getTestResultUserService = async (
  userId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `/test-result/user-all-test-result/${userId}/?limit=${limit}&offset=${offset}`,
  );

export const getTestByIdService = async (id: string) =>
  await jsonAxios.get(`test/${id}`);
