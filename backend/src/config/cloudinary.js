import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export const configureCloudinary = () => {
  if (isConfigured) return;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  isConfigured = true;
  console.log('☁️  Cloudinary configuré:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
    api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌',
  });
};

export default cloudinary;
