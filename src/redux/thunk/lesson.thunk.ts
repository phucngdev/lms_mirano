import { getAllLessonBySessonIdService } from '#/api/services/lession.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAllLessonBySessonId = createAsyncThunk(
  'lesson/getAllLessonBySessonId',
  async (id: string) => {
    const response = await getAllLessonBySessonIdService(id);
    return response.data;
  },
);
