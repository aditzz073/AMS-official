import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "./redux/authSlice";
import toast from "react-hot-toast";
import logo from "./logo.png";
import Header from "./components/Header";
import axiosInstance from "./helper/axiosInstance";

// Code splitting - lazy load pages to reduce initial bundle size
const Page0 = lazy(() => import("./pages/Page0"));
const Page1 = lazy(() => import("./pages/Page1"));
const Page2 = lazy(() => import("./pages/Page2"));
const Page3 = lazy(() => import("./pages/Page3"));
const Page4 = lazy(() => import("./pages/Page4"));
const Page5 = lazy(() => import("./pages/Page5"));
const Page6 = lazy(() => import("./pages/Page6"));
const Page7 = lazy(() => import("./pages/Page7"));

const App = () => {
  // Persist currentPage across reloads
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedPage = localStorage.getItem("currentPage");
      return savedPage ? parseInt(savedPage, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [userName, setUserName] = useState("User Name");
  const [userRole, setUserRole] = useState("faculty");


  const categoriesTotal = {
    TLPSelf: "",
    TLPHoD: "",
    TLPExternal: "",
    PDRCSelf: "",
    PDRCHoD: "",
    PDRCExternal: "",
    CDLSelf: "",
    CDLHoD: "",
    CDLExternal: "",
    CILSelf: "",
    CILHoD: "",
    CILExternal: "",
    IOWSelf: "",
    IOWHoD: "",
    IOWExternal: "",
  };

  // Load formData from localStorage or set default values
  // All roles should persist their data - HOD/Principal/External can save their evaluations
  const [formData, setFormData] = useState(() => {
    try {
      // Try to load saved data for all roles
      const savedData = localStorage.getItem("formData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('[APP] Loaded formData from localStorage');
        return parsedData;
      }
    } catch (e) {
      console.error('[APP] Error loading formData from localStorage:', e);
    }
    
    // Default empty formData if nothing saved
    console.log('[APP] Starting with empty formData');
    return {
      email: "",
      employeeCode: "",
      name: "",
      designation: "",
      college: "DSCE",
      campus: "Kumarswamy Layout (Campus 1)",
      department: "Information Science and Engineering",
      joiningDate: "",
      periodOfAssessment: "",
      categoriesTotal,
      totalSelf: "",
      totalHoD: "",
      totalExternal: "",
      HODName: "",
      externalEvaluatorName: "",
      principleName: "",
    };
  });

  // Debug: Log formData changes to track image field persistence
  useEffect(() => {
    const imageFields = Object.keys(formData).filter(k => k.endsWith('Image') && formData[k]);
    if (imageFields.length > 0) {
      console.log('[APP] FormData has', imageFields.length, 'image URLs');
      console.log('[APP] Sample fields:', imageFields.slice(0, 3).map(k => {
        const val = formData[k];
        if (val instanceof File) return `${k}: [File: ${val.name}, ${val.size} bytes]`;
        if (typeof val === 'string') return `${k}: ${val.substring(0, 50)}...`;
        return `${k}: [${typeof val}]`;
      }));
    }
  }, [formData]);

  // Check user role from localStorage and set readonly flag
  useEffect(() => {
    try {
      const authStateString = localStorage.getItem("authState");
      if (authStateString) {
        const authState = JSON.parse(authStateString);
        if (authState && authState.role) {
          const userRole = authState.role.toLowerCase();
          setUserRole(authState.role)
          // Set readonly flag for roles that should not edit most form fields
          // Note: This is primarily for legacy form fields that don't use RoleBasedInput
          // Admin has FULL EDIT access - NOT read-only
          if (userRole === "principal") {
            setIsReadOnly(true);
          } else if (userRole === "hod" || userRole === "external") {
            // HOD and External can edit some fields, but most should be read-only
            setIsReadOnly(true);
          } else if (userRole === "admin") {
            // Admin has full edit access - do NOT set read-only
            setIsReadOnly(false);
          }
          
          // Use email as the userName display
          if (authState.email) {
            setUserName(authState.email);
          }
        }
      }
    } catch (error) {
      // Silently handle error
    }
  }, []);

  useEffect(() => {
    // Save formData to localStorage, converting File objects to data URLs for persistence
    const saveFormData = async () => {
      try {
        const dataForStorage = { ...formData };
        
        // Convert File objects to data URLs so they persist across reloads
        for (const key of Object.keys(dataForStorage)) {
          // Handle single File objects
          if (dataForStorage[key] instanceof File) {
            const file = dataForStorage[key];
            const dataUrl = await fileToDataURL(file);
            dataForStorage[key] = dataUrl;
          }
          // Handle arrays of File objects (for multiple uploads)
          else if (Array.isArray(dataForStorage[key])) {
            const hasFiles = dataForStorage[key].some(item => item instanceof File);
            if (hasFiles) {
              const convertedArray = await Promise.all(
                dataForStorage[key].map(async item => {
                  if (item instanceof File) {
                    return await fileToDataURL(item);
                  }
                  return item;
                })
              );
              dataForStorage[key] = convertedArray;
            }
          }
        }
        
        localStorage.setItem("formData", JSON.stringify(dataForStorage));
        
        // Debug: Track image fields in formData
        const imageFields = Object.keys(formData).filter(k => k.endsWith('Image') && formData[k]);
        if (imageFields.length > 0) {
          console.log('[APP] FormData saved with', imageFields.length, 'image fields');
        }
      } catch (error) {
        console.error('[APP] Error saving formData to localStorage:', error);
        // Don't throw - allow app to continue even if localStorage fails
      }
    };
    
    saveFormData();
  }, [formData]);

  // Save currentPage to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("currentPage", currentPage.toString());
    } catch (error) {
      console.error('[APP] Error saving currentPage:', error);
    }
  }, [currentPage]);

  // Helper function to convert File to data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleNext = () => {
    // No strict validation - allow navigation with optional fields
    // Only basic check for email/employeeCode for backend compatibility (skipped on intro page)
    if (currentPage !== 0 && !formData.email && !formData.employeeCode) {
      // Silently allow progression - backend will handle validation if needed
      console.warn("Proceeding without email/employeeCode - ensure backend allows partial saves");
    }
    console.log('[APP] Navigating to page', currentPage + 1, '- Image fields:', Object.keys(formData).filter(k => k.endsWith('Image') && formData[k]).length);
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    console.log('[APP] Navigating to page', currentPage - 1, '- Image fields:', Object.keys(formData).filter(k => k.endsWith('Image') && formData[k]).length);
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleBackToInstructions = () => {
    console.log('[APP] Navigating back to instructions page');
    setCurrentPage(0);
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      // Continue with logout even if API fails
    } finally {
      // Clean up local storage and state
      localStorage.removeItem("token");
      localStorage.removeItem("authState");
      localStorage.removeItem("formData");
      localStorage.removeItem("currentPage");
      
      // Dispatch logout action to Redux
      dispatch(logout());
      
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
      <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '18px', color: '#666'}}>Loading...</div>}>
        {currentPage === 0 && <Page0  onNext={handleNext}  />}
        {currentPage === 1 && <Page1 catTotal={categoriesTotal} formData={formData} setFormData={setFormData} onPrevious={handlePrevious} onNext={handleNext}  />}
        {currentPage === 2 && <Page3 formData={formData} setFormData={setFormData} onNext={handleNext} onPrevious={handlePrevious} isReadOnly={isReadOnly} userRole={userRole} />}
        {currentPage === 3 && <Page4 formData={formData} setFormData={setFormData} onNext={handleNext} onPrevious={handlePrevious} isReadOnly={isReadOnly} userRole={userRole}/>}
        {currentPage === 4 && <Page5 formData={formData} setFormData={setFormData} onNext={handleNext} onPrevious={handlePrevious} isReadOnly={isReadOnly} userRole={userRole}/>}
        {currentPage === 5 && <Page6 formData={formData} setFormData={setFormData} onNext={handleNext} onPrevious={handlePrevious} isReadOnly={isReadOnly} userRole={userRole}/>}
        {currentPage === 6 && <Page2 formData={formData} setFormData={setFormData} onNext={handleNext} onPrevious={handlePrevious} isReadOnly={isReadOnly} userRole={userRole}/>}
        {currentPage === 7 && <Page7 formData={formData} setFormData={setFormData} onPrevious={handlePrevious} isReadOnly={isReadOnly} userRole={userRole} />}
      </Suspense>
    </div>
  );
};

export default App;