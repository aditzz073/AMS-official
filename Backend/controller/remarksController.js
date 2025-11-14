import Evaluation from "../model/data.js";

// Get remarks for a specific appraisal
export const getRemarks = async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const userRole = req.user?.role;

    const evaluation = await Evaluation.findOne({ employeeCode });
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Check if user has permission to view remarks
    const canViewRemarks = ['hod', 'principal', 'admin'].includes(userRole?.toLowerCase());
    
    if (!canViewRemarks) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view remarks'
      });
    }

    return res.status(200).json({
      success: true,
      remarks: evaluation.remarks || {}
    });
  } catch (error) {
    console.error('Error fetching remarks:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update remarks for a specific section
export const updateRemarks = async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const { sectionId, remark } = req.body;
    const userRole = req.user?.role;

    // Only HOD and Admin can update remarks
    if (!['hod', 'admin'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Only HOD can update remarks'
      });
    }

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID is required'
      });
    }

    const evaluation = await Evaluation.findOne({ employeeCode });
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Initialize remarks if not exists
    if (!evaluation.remarks) {
      evaluation.remarks = new Map();
    }

    // Update the remark for the specific section
    evaluation.remarks.set(sectionId, remark || '');
    
    // Mark the field as modified (required for Map types)
    evaluation.markModified('remarks');
    
    await evaluation.save();

    return res.status(200).json({
      success: true,
      message: 'Remark updated successfully',
      remarks: evaluation.remarks
    });
  } catch (error) {
    console.error('Error updating remark:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Bulk update remarks for multiple sections
export const bulkUpdateRemarks = async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const { remarks } = req.body;
    const userRole = req.user?.role;

    // Only HOD and Admin can update remarks
    if (!['hod', 'admin'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'Only HOD can update remarks'
      });
    }

    if (!remarks || typeof remarks !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Remarks object is required'
      });
    }

    const evaluation = await Evaluation.findOne({ employeeCode });
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    // Initialize remarks if not exists
    if (!evaluation.remarks) {
      evaluation.remarks = new Map();
    }

    // Update all remarks
    Object.entries(remarks).forEach(([sectionId, remark]) => {
      evaluation.remarks.set(sectionId, remark || '');
    });
    
    // Mark the field as modified (required for Map types)
    evaluation.markModified('remarks');
    
    await evaluation.save();

    return res.status(200).json({
      success: true,
      message: 'Remarks updated successfully',
      remarks: evaluation.remarks
    });
  } catch (error) {
    console.error('Error bulk updating remarks:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
