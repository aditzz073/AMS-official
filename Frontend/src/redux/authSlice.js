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
        token: null,
        // employeeCode:null,
      };
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading auth state", error);
    return {
      userId: null,
      email: null,
      role: null,
      token: null,
    //   employeeCode:null,
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
          
          // Store email if provided in user object
          if (user && user.email) {
            state.email = user.email;
          }
          
          // Save to localStorage
          localStorage.setItem("authState", JSON.stringify({
            userId: decoded.id,
            email: user?.email || null,
            role: decoded.role,
            token: token,
          }));
        } catch (error) {
          console.error("Invalid token", error);
        }
      }
    },
    // setEmpCode:(state,action)=>{
    //     const empCode = action.payload;
    //     if(empCode){
    //         state.employeeCode=empCode
    //         localStorage.setItem("employeeCodes", JSON.stringify({
    //             employeeCode:empCode
    //           }));
    //     }
    // },
    logout: (state) => {
      state.userId = null;
      state.email = null;
      state.role = null;
      state.token = null;
      state.employeeCode=null
      
      // Clear from localStorage
      localStorage.removeItem("authState");
    //   localStorage.removeItem("employeeCode");
    },
  },
});

// Export actions
export const { setToken, logout,setEmpCode } = authSlice.actions;

// Export reducer
export default authSlice.reducer;