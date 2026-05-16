const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ✅ Proper config (MOST IMPORTANT)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true,
});

// ✅ Debug (temporary - check env load ho rha ya nahi)
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
});

// ─────────────────────────────────────────────
// ✅ Post Image Storage
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    const params = {
      folder: 'socialmern/posts',
      resource_type: 'auto',
    };
    if (!isVideo) {
      params.transformation = [
        { width: 1080, height: 1080, crop: 'limit', quality: 'auto' },
      ];
    }
    return params;
  },
});

// ─────────────────────────────────────────────
// ✅ Profile Image Storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'socialmern/profiles',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  }),
});

// ─────────────────────────────────────────────
// ✅ Chat Media Storage
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    const params = {
      folder: 'socialmern/chats',
      resource_type: 'auto',
    };
    if (!isVideo) {
      params.transformation = [{ width: 1200, crop: 'limit', quality: 'auto' }];
    }
    return params;
  },
});

// ─────────────────────────────────────────────
// ✅ Upload middleware
const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to allow videos
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadChatMedia = multer({
  storage: chatStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ─────────────────────────────────────────────
// ✅ Delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const urlObj = new URL(imageUrl);
    const pathParts = urlObj.pathname.split('/');
    
    const uploadIndex = pathParts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return;
    
    const resourceType = pathParts[uploadIndex - 1] === 'video' ? 'video' : 'image';
    const publicIdWithExt = pathParts.slice(uploadIndex + 2).join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadPostImage,
  uploadProfileImage,
  uploadChatMedia,
  deleteFromCloudinary,
};