import BasicEmployeeInfo from "../model/basicEmployeeInfo.js";
import User from "../model/user.js";

// Get or create basic employee info
export const getOrCreateBasicInfo = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'User email not found'
      });
    }

    let basicInfo = await BasicEmployeeInfo.findOne({ email: userEmail });
    
    if (!basicInfo) {
      // Create new basic info for this user
      basicInfo = await BasicEmployeeInfo.create({ email: userEmail });
    }

    return res.status(200).json({
      success: true,
      data: basicInfo
    });
  } catch (error) {
    console.error('Error fetching basic info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update basic employee info
export const updateBasicInfo = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'User email not found'
      });
    }

    const {
      employeeCode,
      name,
      designation,
      department,
      college,
      campus,
      joiningDate,
      periodOfAssessment,
      externalEvaluatorName,
      principalName,
      HODName
    } = req.body;

    // Check if employeeCode is being changed and if it's available
    if (employeeCode) {
      const existingEmployee = await BasicEmployeeInfo.findOne({ 
        employeeCode,
        email: { $ne: userEmail }
      });
      
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee code already in use by another user'
        });
      }
    }

    const updateData = {};
    if (employeeCode !== undefined) updateData.employeeCode = employeeCode;
    if (name !== undefined) updateData.name = name;
    if (designation !== undefined) updateData.designation = designation;
    if (department !== undefined) updateData.department = department;
    if (college !== undefined) updateData.college = college;
    if (campus !== undefined) updateData.campus = campus;
    if (joiningDate !== undefined) updateData.joiningDate = joiningDate;
    if (periodOfAssessment !== undefined) updateData.periodOfAssessment = periodOfAssessment;
    if (externalEvaluatorName !== undefined) updateData.externalEvaluatorName = externalEvaluatorName;
    if (principalName !== undefined) updateData.principalName = principalName;
    if (HODName !== undefined) updateData.HODName = HODName;

    const basicInfo = await BasicEmployeeInfo.findOneAndUpdate(
      { email: userEmail },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Update employeeCode in User model if changed
    if (employeeCode !== undefined) {
      await User.findOneAndUpdate(
        { email: userEmail },
        { employeeCode }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Basic information updated successfully',
      data: basicInfo
    });
  } catch (error) {
    console.error('Error updating basic info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get basic info by identifier (for HOD/External/Admin)
export const getBasicInfoByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    const userRole = req.user?.role;

    // Only allow HOD, External, Admin, and Principal to search by identifier
    if (!['hod', 'external', 'admin', 'principal'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    let basicInfo;
    if (identifier.includes('@')) {
      basicInfo = await BasicEmployeeInfo.findOne({ email: identifier.toLowerCase() });
    } else {
      basicInfo = await BasicEmployeeInfo.findOne({ employeeCode: identifier });
    }

    if (!basicInfo) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: basicInfo
    });
  } catch (error) {
    console.error('Error fetching basic info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
