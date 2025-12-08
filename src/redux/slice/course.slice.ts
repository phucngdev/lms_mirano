import { createSlice } from '@reduxjs/toolkit';

import { CourseEntity, EnrolledCourseEntity } from '#/api/requests';
import { getAllCourse, getCourseById } from '../thunk/course.thunk';

interface TopicState {
  data: EnrolledCourseEntity[] | [];
  dataEdit: CourseEntity | null;
}

const initialState: TopicState = {
  data: [],
  dataEdit: null,
};

const courseSlice = createSlice({
  extraReducers: builder => {
    builder

      .addCase(getAllCourse.fulfilled, (state, action) => {
        console.log('🚀 ~ builder ~ action:', action.payload);
        state.data = action.payload.data;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        // state.dataById = action.payload.data;
      });
  },
  initialState,
  name: 'course',
  reducers: {},
});

export default courseSlice.reducer;
