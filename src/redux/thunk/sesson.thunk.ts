import { getAllSessionByIdCourseService } from '#/api/services/session.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getAllSessonByIdCourse = createAsyncThunk(
  'sesson/getAllSessonByIdCourse',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getAllSessionByIdCourseService(id, limit, offset);
    return response.data;
  },
);
