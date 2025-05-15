import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Dynamic CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const mime = file.mimetype;

    // Default settings
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    let folder = 'uploads';
    let allowed_formats: string[] = [];

    // Set based on MIME type
    if (mime.startsWith('image/')) {
      resourceType = 'image';
      folder = 'profile_pics';
      allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
    } else if (mime.startsWith('video/') || mime.startsWith('audio/')) {
      resourceType = 'video';
      folder = 'media';
      allowed_formats = ['mp4', 'webm', 'ogg','mov','avi','webm','mkv', 'mp3', `aac`,'wav'];
    } else {
      resourceType = 'raw';
      folder = 'documents';
      allowed_formats = ['pdf', 'doc', 'docx', 'pptx', 'txt'];
    }

    return {
      folder,
      resource_type: resourceType,
      allowed_formats,
      transformation:
        resourceType === 'image'
          ? [{ width: 500, height: 500, crop: 'limit' }]
          : undefined,
    };
  },
});

// Multer upload middleware
const upload = multer({ storage });

export default upload;
