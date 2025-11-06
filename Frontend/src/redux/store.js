import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";


// Configure store
export const store=configureStore({
    reducer:{
        auth: authReducer,
    },
    devTools:true
})


