import React, { createContext, useContext } from 'react';

const FormContext = createContext();

export const FormProvider = ({ children, userRole, formData, handleInputChange }) => {
  return (
    <FormContext.Provider value={{ userRole, formData, handleInputChange }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};