import Evaluation from "../model/data.js"
import fs from 'fs';
import cloudinary from "../server.js";

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
    
    
    if (!employeeCode) {
      return res.status(400).json({ success: false, message: 'Employee code is required' });
    }
    
    const updateData = { ...req.body };
    
    // Process uploaded files (if any)
    if (req.files) {      
      // Process each uploaded file and upload to Cloudinary
      for (const [fieldName, files] of Object.entries(req.files)) {
        if (files && files.length > 0) {
          const file = files[0];
          const cloudinaryUrl = await uploadToCloudinary(file.path, employeeCode, fieldName);
          updateData[fieldName] = cloudinaryUrl;
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
        console.log(id);
        
        const employee = await Evaluation.findOne({employeeCode:id});
        if (!employee) {
            return res.status(200).json({success:false, message: 'Employee not found' });
        }

        return res.status(200).json({success:true, data: employee });
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