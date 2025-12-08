import { LessonStudentEntity } from '#/api/requests';
import { createSlice } from '@reduxjs/toolkit';
import { getAllLessonBySessonId } from '../thunk/lesson.thunk';

interface LessonState {
  data: LessonStudentEntity[] | [];
}

const initialState: LessonState = {
  data: [],
};

const lessonSlice = createSlice({
  initialState,
  name: 'lesson',
  reducers: {
    updateLessonProgress: (state, action) => {
      const { lessonId, progress } = action.payload;
      const lesson = state.data.find(lesson => lesson.id === lessonId);
      if (lesson) {
        lesson.progress = progress;
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(getAllLessonBySessonId.fulfilled, (state, action) => {
      state.data = action.payload.data;
    });
  },
});

export const { updateLessonProgress } = lessonSlice.actions;
export default lessonSlice.reducer;
