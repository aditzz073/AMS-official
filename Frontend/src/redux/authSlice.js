import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Load state from localStorage if it exists
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return {
        userId: null,
        email: null,
        role: null,
        employeeCode: null,
        token: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (error) {
    return {
      userId: null,
      email: null,
      role: null,
      employeeCode: null,
      token: null,
    };
  }
};

// Initial state
const initialState = loadAuthState();

// Create slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      const { token, user } = action.payload;
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          state.userId = decoded.id;
          state.role = decoded.role;
          state.token = token;
          
          // Store email and employeeCode from decoded token or user object
          state.email = decoded.email || user?.email || null;
          state.employeeCode = decoded.employeeCode || user?.employeeCode || null;
          
          // Save to localStorage
          localStorage.setItem("authState", JSON.stringify({
            userId: decoded.id,
            email: state.email,
            role: decoded.role,
            employeeCode: state.employeeCode,
            token: token,
          }));
        } catch (error) {
          // Invalid token - silently fail
        }
      }
    },
    logout: (state) => {
      state.userId = null;
      state.email = null;
      state.role = null;
      state.employeeCode = null;
      state.token = null;
      
      // Clear from localStorage
      localStorage.removeItem("authState");
    },
  },
});

// Export actions
export const { setToken, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;