import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {  AuthState } from "@/types";

const initialState: AuthState = {
    uid: null,
    email: null,
    role: null,
    loading: true,
    error: null
}


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ uid: string; email: string | null; role: 'user' | 'admin' }>) =>{
            state.uid = action.payload.uid;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.loading = false;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        logout: (state) => {
            state.uid = null;
            state.email = null;
            state.role = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
