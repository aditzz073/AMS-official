// multerMiddleware.js
import multer from 'multer';
import path from 'path';

// Setup storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Create a middleware function that captures all the image fields
const uploadFields = upload.fields([
  { name: 'CDL31SelfImage', maxCount: 1 },
  { name: 'CDL32SelfImage', maxCount: 1 },
  { name: 'CDL33SelfImage', maxCount: 1 },
  { name: 'CDL34SelfImage', maxCount: 1 },
  { name: 'CDL35SelfImage', maxCount: 1 },
  { name: 'CIL4SelfImage', maxCount: 1 },
  { name: 'IOW511SelfImage', maxCount: 1 },
  { name: 'IOW512SelfImage', maxCount: 1 },
  { name: 'IOW513SelfImage', maxCount: 1 },
  { name: 'IOW521SelfImage', maxCount: 1 },
  { name: 'IOW522SelfImage', maxCount: 1 },
  { name: 'IOW523SelfImage', maxCount: 1 },
  { name: 'IOW524SelfImage', maxCount: 1 },
  { name: 'IOW525SelfImage', maxCount: 1 },
  { name: 'PDRC211SelfImage', maxCount: 1 },
  { name: 'PDRC212SelfImage', maxCount: 1 },
  { name: 'PDRC213SelfImage', maxCount: 1 },
  { name: 'PDRC214SelfImage', maxCount: 1 },
  { name: 'PDRC221SelfImage', maxCount: 1 },
  { name: 'PDRC222SelfImage', maxCount: 1 },
  { name: 'TLP111SelfImage', maxCount: 1 },
  { name: 'TLP112SelfImage', maxCount: 1 },
  { name: 'TLP113SelfImage', maxCount: 1 },
  { name: 'TLP114SelfImage', maxCount: 1 }
]);

export default uploadFields;