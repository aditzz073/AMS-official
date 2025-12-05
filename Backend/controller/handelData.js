import Evaluation from "../model/data.js"
import fs from 'fs';
import cloudinary from "../server.js";

// Role-based access control configuration
const roleAccess = {
  faculty: { 
    editable: ['self'], 
    visible: ['self'] 
  },
  hod: { 
    editable: ['hod'], 
    visible: ['self', 'hod'] 
  },
  external: { 
    editable: ['external'], 
    visible: ['self', 'hod', 'external'] 
  },
  principal: { 
    editable: [], 
    visible: ['self', 'hod', 'external'] 
  },
  admin: { 
    editable: ['self', 'hod', 'external'], 
    visible: ['self', 'hod', 'external'] 
  },
};

// Validate if user can edit specific fields based on role
const validateRoleBasedFields = (userRole, updateData) => {
  const permissions = roleAccess[userRole?.toLowerCase()] || roleAccess.faculty;
  const validatedData = { ...updateData };
  
  // List of field patterns to check
  const fieldPatterns = [
    { pattern: /Self$/, type: 'self' },
    { pattern: /HoD$/, type: 'hod' },
    { pattern: /External$/, type: 'external' }
  ];
  
  // Remove fields that the user role cannot edit
  Object.keys(validatedData).forEach(key => {
    for (const { pattern, type } of fieldPatterns) {
      if (pattern.test(key)) {
        if (!permissions.editable.includes(type)) {
          delete validatedData[key];
        }
        break;
      }
    }
  });
  
  return validatedData;
};

// Filter data for role-based visibility
const filterDataForRole = (data, userRole) => {
  const permissions = roleAccess[userRole?.toLowerCase()] || roleAccess.faculty;
  const filteredData = { ...data.toObject() };
  
  // Convert remarks Map to plain object if it exists
  if (filteredData.remarks && filteredData.remarks instanceof Map) {
    const remarksObj = {};
    filteredData.remarks.forEach((value, key) => {
      remarksObj[key] = value;
    });
    filteredData.remarks = remarksObj;
  }
  
  // List of field patterns to check
  const fieldPatterns = [
    { pattern: /Self$/, type: 'self' },
    { pattern: /HoD$/, type: 'hod' },
    { pattern: /External$/, type: 'external' }
  ];
  
  // Replace non-visible field values with empty string
  Object.keys(filteredData).forEach(key => {
    for (const { pattern, type } of fieldPatterns) {
      if (pattern.test(key)) {
        if (!permissions.visible.includes(type)) {
          filteredData[key] = '';
        }
        break;
      }
    }
  });
  
  return filteredData;
};

// Function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, employeeCode, fieldName) => {
  try {
    // Upload the file to cloudinary in a folder based on employeeCode
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: `employees/${employeeCode}`,
      public_id: `${fieldName}-${Date.now()}`
    });
    
    // Delete the file from local storage
    fs.unlinkSync(filePath);
    
    return result.secure_url;
  } catch (error) {
    // Delete the file from local storage if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const createOrUpdateEmployee = async (req, res) => {
  try {
    const { employeeCode } = req.body;    
    const userRole = req.user?.role; // Get user role from authenticated user
    
    if (!employeeCode) {
      return res.status(400).json({ success: false, message: 'Employee code is required' });
    }
    
    let updateData = { ...req.body };
    
    // Handle remarks separately - only HOD and Admin can update
    if (updateData.remarks) {
      if (!['hod', 'admin'].includes(userRole?.toLowerCase())) {
        delete updateData.remarks;
      } else {
        // Parse remarks if it's a JSON string
        if (typeof updateData.remarks === 'string') {
          try {
            updateData.remarks = JSON.parse(updateData.remarks);
          } catch (error) {
            delete updateData.remarks;
          }
        }
      }
    }
    
    // Validate role-based field access
    if (userRole) {
      updateData = validateRoleBasedFields(userRole, updateData);
    }
    
    // Process uploaded files (if any)
    if (req.files) {      
      // Process each uploaded file and upload to Cloudinary
      for (const [fieldName, files] of Object.entries(req.files)) {
        if (files && files.length > 0) {
          // Check if user can edit this field type
          let canUpload = true;
          if (userRole) {
            const permissions = roleAccess[userRole.toLowerCase()] || roleAccess.faculty;
            if (fieldName.endsWith('Self') && !permissions.editable.includes('self')) canUpload = false;
            else if (fieldName.endsWith('HoD') && !permissions.editable.includes('hod')) canUpload = false;
            else if (fieldName.endsWith('External') && !permissions.editable.includes('external')) canUpload = false;
          }
          
          if (canUpload) {
            const file = files[0];
            const cloudinaryUrl = await uploadToCloudinary(file.path, employeeCode, fieldName);
            updateData[fieldName] = cloudinaryUrl;
          }
        }
      }
    }
    
    // Update or create the employee record
    const updatedEmployee = await Evaluation.findOneAndUpdate(
      { employeeCode },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Employee record created/updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Error creating/updating employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role; // Get user role from authenticated user
        
        const employee = await Evaluation.findOne({employeeCode:id});
        if (!employee) {
            return res.status(200).json({success:false, message: 'Employee not found' });
        }

        // Filter data based on user role
        let responseData = employee;
        if (userRole) {
            responseData = filterDataForRole(employee, userRole);
        }

        return res.status(200).json({success:true, data: responseData });
    } catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({success:false, message: 'Internal server error', error: error.message });
    }
};


 const getAllEmployeeCodes = async (req, res) => {
  try {
    // Fetch all employee codes from the database
    const employeeCodes = await Evaluation.find({}, 'employeeCode');

    // Extract only the codes into an array
    const codesList = employeeCodes.map((item) => item.employeeCode);

    res.status(200).json({
      success: true,
      employeeCodes: codesList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee codes',
      error: error.message,
    });
  }
};


export {createOrUpdateEmployee,getEmployeeById,getAllEmployeeCodes}