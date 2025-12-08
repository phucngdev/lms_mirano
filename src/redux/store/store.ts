import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import courseSlice from '../slice/course.slice';
import sessonSlice from '../slice/sesson.slice';
import lessonSlice from '../slice/lesson.slice';

const store = configureStore({
  reducer: {
    course: courseSlice,
    sesson: sessonSlice,
    lesson: lessonSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
