
import multer from 'multer';

const MAX_SIZE = 500 * 1024;

export const menuImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE,
    files: 1,
  },
}).single('image');

export function receiveMenuImage(req, res, next) {
  menuImageUpload(req, res, error => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          error.code === 'LIMIT_FILE_SIZE'
            ? 'Image must be 500 KB or smaller.'
            : 'Invalid image upload.',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unable to process image upload.',
    });
  });
}
