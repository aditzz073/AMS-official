import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from './Header';
import axiosInstance from '../helper/axiosInstance';

const ThankYouPage = () => {
   const navigate=useNavigate()
     const [userName, setUserName] = useState("User Name");
     const [userRole, setUserRole] = useState("faculty");
     
     // Get user email and role from auth state
     useEffect(() => {
       try {
         const authStateString = localStorage.getItem("authState");
         if (authStateString) {
           const authState = JSON.parse(authStateString);
           if (authState && authState.email) {
             setUserName(authState.email);
           }
           if (authState && authState.role) {
             setUserRole(authState.role);
           }
         }
       } catch (error) {
         console.error("Error parsing authState from localStorage:", error);
       }
     }, []);
     
     const handleLogout = async () => {
       try {
         await axiosInstance.post("/logout");
       } catch (error) {
         console.error("Logout API error:", error);
         // Continue with logout even if API fails
       } finally {
         // Clean up local storage and state
         localStorage.removeItem("token");
         localStorage.removeItem("authState");
         localStorage.removeItem("currentPage");
         localStorage.clear();
         
         // Clear axios headers
         delete axiosInstance.defaults.headers.common["Authorization"];
         
         // Navigate to login
         navigate("/");
         toast.success("Logged out successfully");
       }
     };
  return (
    <div>
        <header>
        <Header 
          userName={userName} 
          onLogout={handleLogout} 
        />
      </header>
    <div className="max-w-2xl mx-auto p-8">
        
      <div className="border border-gray-200 rounded-lg shadow-md p-8 text-center">
        <div className="mb-8">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-gray-600">Your faculty appraisal form has been successfully submitted.</p>
        </div>

        {userRole === "principal" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700 mb-3 font-semibold">Please upload your finalised form in this drive:</p>
            <a 
              href="https://drive.google.com/drive/folders/1dmjuw2_KPnzHMCdz2dLj6plx0BRjp6mM" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              https://drive.google.com/drive/folders/1dmjuw2_KPnzHMCdz2dLj6plx0BRjp6mM
            </a>
          </div>
        )}

        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-4">Please click on this button to go back to instruction page.</p>
          <button 
            onClick={()=>{
              localStorage.setItem("currentPage", "0");
              navigate("/page");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition duration-300"
          >
            Back to Instructions
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ThankYouPage;