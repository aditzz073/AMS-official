import Evaluation from "../model/data.js"
import BasicEmployeeInfo from "../model/basicEmployeeInfo.js"
import fs from 'fs';
import cloudinary from "../server.js";

// Helper function to parse YYYY-MM date format from frontend
const parseDateYYYYMM = (dateString) => {
  if (!dateString) return null;
  
  // If already a Date object, return as is
  if (dateString instanceof Date) return dateString;
  
  // Handle YYYY-MM format (from month input)
  if (typeof dateString === 'string') {
    // Check if it's already in YYYY-MM-DD format or YYYY-MM format
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      // Create date with first day of the month if no day specified
      return new Date(`${year}-${month}-${day || '01'}`);
    }
  }
  
  // Fallback: try to parse as-is
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

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
    visible: ['self', 'external'] // External cannot see HOD column
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
  // IMPORTANT: Skip image/file fields (ending with 'Image') to preserve uploaded file URLs
  Object.keys(filteredData).forEach(key => {
    // Skip image fields - they should always be visible if they exist
    if (key.endsWith('Image')) {
      return;
    }
    
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
      resource_type: "auto", // Automatically detect file type (image, video, or raw)
      folder: `employees/${employeeCode}`,
      public_id: `${fieldName}-${Date.now()}`,
      access_mode: "public" // Ensure files are publicly accessible
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
    const { email, employeeCode, ...otherData } = req.body;    
    const userRole = req.user?.role;
    const userEmail = req.user?.email;
    
    // Validate user authentication
    if (!userRole || !userEmail) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required. Please ensure you are logged in with a valid role.' 
      });
    }
    
    // Determine the target email
    let targetEmail = email;
    
    // Faculty can only update their own data
    if (userRole?.toLowerCase() === 'faculty') {
      targetEmail = userEmail; // Force faculty to use their own email
    } else if (!targetEmail && !employeeCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or employee code is required. Please provide at least one identifier.' 
      });
    }
    
    // If employeeCode is provided, find the associated email
    let basicInfo = null;
    if (employeeCode && !targetEmail) {
      basicInfo = await BasicEmployeeInfo.findOne({ employeeCode });
      if (basicInfo) {
        targetEmail = basicInfo.email;
      }
    }
    
    // If email is provided, get or create BasicEmployeeInfo
    if (targetEmail) {
      basicInfo = await BasicEmployeeInfo.findOne({ email: targetEmail });
      
      // Extract basic info fields from request
      const basicInfoFields = {
        name: otherData.name,
        designation: otherData.designation,
        department: otherData.department,
        college: otherData.college,
        campus: otherData.campus,
        joiningDate: otherData.joiningDate ? parseDateYYYYMM(otherData.joiningDate) : undefined,
        periodOfAssessment: otherData.periodOfAssessment ? parseDateYYYYMM(otherData.periodOfAssessment) : undefined,
        externalEvaluatorName: otherData.externalEvaluatorName,
        principalName: otherData.principalName,
        HODName: otherData.HODName
      };
      
      // Remove undefined values
      Object.keys(basicInfoFields).forEach(key => 
        basicInfoFields[key] === undefined && delete basicInfoFields[key]
      );
      
      // Update or create BasicEmployeeInfo
      if (Object.keys(basicInfoFields).length > 0 || employeeCode) {
        basicInfo = await BasicEmployeeInfo.findOneAndUpdate(
          { email: targetEmail },
          { 
            email: targetEmail,
            employeeCode: employeeCode || basicInfo?.employeeCode,
            ...basicInfoFields
          },
          { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true 
          }
        );
      }
    }
    
    if (!targetEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not determine target email. Please provide a valid email address or employee code with associated email in the system.' 
      });
    }
    
    // Prepare evaluation update data (exclude basic info fields)
    let updateData = { ...otherData };
    const basicInfoFieldNames = [
      'name', 'designation', 'department', 'college', 'campus',
      'joiningDate', 'periodOfAssessment', 'externalEvaluatorName',
      'principalName', 'HODName'
    ];
    basicInfoFieldNames.forEach(field => delete updateData[field]);
    
    // Add email and employeeCode to evaluation
    updateData.email = targetEmail;
    updateData.employeeCode = basicInfo?.employeeCode || employeeCode;
    
    // Handle remarks separately - only HOD, External, and Admin can update
    if (updateData.remarks) {
      if (!['hod', 'external', 'admin'].includes(userRole?.toLowerCase())) {
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
            // Use employeeCode for folder structure (backward compatibility)
            const folderIdentifier = updateData.employeeCode || targetEmail.split('@')[0];
            const cloudinaryUrl = await uploadToCloudinary(file.path, folderIdentifier, fieldName);
            updateData[fieldName] = cloudinaryUrl;
          }
        }
      }
    }
    
    // Update or create the employee evaluation record
    const updatedEmployee = await Evaluation.findOneAndUpdate(
      { email: targetEmail },
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
        const { id } = req.params; // Can be email or employeeCode
        const userRole = req.user?.role;
        const userEmail = req.user?.email;
        
        // Faculty can only access their own data
        let targetIdentifier = id;
        if (userRole?.toLowerCase() === 'faculty') {
          targetIdentifier = userEmail;
        }
        
        // Determine if identifier is email or employeeCode
        let evaluation;
        let basicInfo;
        
        if (targetIdentifier.includes('@')) {
          // It's an email
          evaluation = await Evaluation.findOne({ email: targetIdentifier.toLowerCase() });
          basicInfo = await BasicEmployeeInfo.findOne({ email: targetIdentifier.toLowerCase() });
        } else {
          // It's an employeeCode
          evaluation = await Evaluation.findOne({ employeeCode: targetIdentifier });
          basicInfo = await BasicEmployeeInfo.findOne({ employeeCode: targetIdentifier });
        }
        
        if (!evaluation && !basicInfo) {
            return res.status(200).json({
              success: false, 
              message: 'Employee not found',
              data: null
            });
        }

        // Combine basic info with evaluation data
        let responseData = {
          ...(basicInfo ? basicInfo.toObject() : {}),
          ...(evaluation ? evaluation.toObject() : {})
        };

        // Filter data based on user role
        if (userRole && evaluation) {
            responseData = {
              ...basicInfo?.toObject(),
              ...filterDataForRole(evaluation, userRole)
            };
        }

        return res.status(200).json({
          success: true, 
          data: responseData 
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({
          success: false, 
          message: 'Internal server error', 
          error: error.message 
        });
    }
};


 const getAllEmployeeCodes = async (req, res) => {
  try {
    // Fetch all basic employee info with email and employeeCode
    const employees = await BasicEmployeeInfo.find({}, 'email employeeCode name');

    // Format the response
    const employeeList = employees.map((emp) => ({
      email: emp.email,
      employeeCode: emp.employeeCode,
      name: emp.name
    }));

    res.status(200).json({
      success: true,
      employees: employeeList,
      // Backward compatibility
      employeeCodes: employees.map(emp => emp.employeeCode).filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee data',
      error: error.message,
    });
  }
};


export {createOrUpdateEmployee,getEmployeeById,getAllEmployeeCodes}