// multerMiddleware.js
import multer from 'multer';
import path from 'path';

// Setup storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Clean the filename - remove special characters and spaces
    const cleanName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/\s+/g, '_'); // Replace spaces with underscore
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image , PDF , doc , xls ,xlsx , ppt and ppts files are allowed!'));
  }
};

// Middleware for handling multiple image fields
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 50 // Maximum 50 files per request
  },
  fileFilter: fileFilter
});

// Create a comprehensive list of all possible file upload fields
// TLP fields (Teaching Learning Process) - Page 3
const tlpFields = [
  'TLP111', 'TLP112', 'TLP113', 'TLP114', 'TLP115', 'TLP116',
  'TLP121', 'TLP122', 'TLP123'
];

// PDRC fields (Professional Development & Research Contribution) - Page 4
const pdrcFields = [
  'PDRC211', 'PDRC212', 'PDRC213', 'PDRC214',
  'PDRC221', 'PDRC222', 'PDRC223', 'PDRC224', 'PDRC225', 'PDRC226', 'PDRC227', 'PDRC228', 'PDRC229'
];

// CDL fields (Co-curricular Development & Leadership) - Page 5
const cdlFields = [
  'CDL31', 'CDL32', 'CDL33', 'CDL34', 'CDL35'
];

// CIL fields (Contribution to Institutional Leadership) - Page 5
const cilFields = ['CIL4'];

// IOW fields (Initiative & Outreach Work) - Page 6
const iowFields = [
  'IOW511', 'IOW512', 'IOW513',
  'IOW521', 'IOW522', 'IOW523', 'IOW524', 'IOW525'
];

// Combine all field prefixes
const allFieldPrefixes = [...tlpFields, ...pdrcFields, ...cdlFields, ...cilFields, ...iowFields];

// Generate field configurations for Self, HoD, and External columns
const fieldConfigurations = [];
const columnSuffixes = ['Self', 'HoD', 'External'];

allFieldPrefixes.forEach(prefix => {
  columnSuffixes.forEach(suffix => {
    fieldConfigurations.push({ name: `${prefix}${suffix}Image`, maxCount: 1 });
  });
});

// Create a middleware function that captures all the image fields
const uploadFields = upload.fields(fieldConfigurations);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field: ${err.field}. Please check the field name.`
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  
  next();
};

export { handleMulterError };
export default uploadFields;