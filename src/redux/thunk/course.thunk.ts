import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllCourseService,
  getCourseByIdService,
} from '#/api/services/course.service';

export const getAllCourse = createAsyncThunk(
  'course/getAllCourse',
  async () => {
    const response = await getAllCourseService();
    return response.data;
  },
);

export const getCourseById = createAsyncThunk(
  'course/getCourseById',
  async (id: string) => {
    const response = await getCourseByIdService(id);
    return response.data;
  },
);
