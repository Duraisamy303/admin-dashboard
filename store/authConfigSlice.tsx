import { createSlice } from '@reduxjs/toolkit';

const initialState: any = {
    catList: [],
    productPreview: null,
};

const authConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        catList(state, { payload }) {
            state = payload;
        },
        productPreview(state, { payload }) {
            state.productPreview = payload;
        },
    },
});

export const { catList, productPreview } = authConfigSlice.actions;

export default authConfigSlice.reducer;
