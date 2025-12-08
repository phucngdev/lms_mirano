import { IMeta, SessonEntity, SessonStudentEntity } from '#/api/requests';
import { createSlice } from '@reduxjs/toolkit';
import { getAllSessonByIdCourse } from '../thunk/sesson.thunk';

interface SessonState {
  data: {
    items: SessonStudentEntity[] | [];
    meta: IMeta;
  };
}

const initialState: SessonState = {
  data: {
    items: [],
    meta: {
      limit: 0,
      offset: 0,
      total: 0,
      totalPages: 0,
    },
  },
};

const sessonSlice = createSlice({
  initialState,
  name: 'sesson',
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getAllSessonByIdCourse.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export default sessonSlice.reducer;
