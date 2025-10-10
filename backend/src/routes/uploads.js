import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// POST /api/uploads/image
router.post('/image', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const folder = (req.body && req.body.folder) || 'job-portal';
    const { buffer, originalname, mimetype } = req.file;
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', use_filename: true, unique_filename: true, filename_override: originalname },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });
    return res.status(201).json({ success: true, data: { url: uploadResult.secure_url, publicId: uploadResult.public_id, width: uploadResult.width, height: uploadResult.height, format: uploadResult.format, bytes: uploadResult.bytes, mime: mimetype } });
  } catch (error) {
    console.error('cloudinary_upload_error', error);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

export default router;





