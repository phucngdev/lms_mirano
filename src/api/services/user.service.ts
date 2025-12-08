import { jsonAxios } from '#/api/axios/axios';
import { UpdateUserDto, UpdateUserPasswordDto } from '../requests';

export const putUpdatePassService = async (data: UpdateUserPasswordDto) =>
  await jsonAxios.put(`users/me/update-password`, data);

export const putUpdateProfileService = async (data: UpdateUserDto) => {
  return await jsonAxios.put(`users/me`, data);
};

export const getProfileService = async () => await jsonAxios.get(`users/me`);
