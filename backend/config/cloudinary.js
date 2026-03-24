const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ✅ Proper config (MOST IMPORTANT)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
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
  params: async (req, file) => ({
    folder: 'socialmern/posts',
    format: file.mimetype.split('/')[1], // FIX (important)
    transformation: [
      { width: 1080, height: 1080, crop: 'limit', quality: 'auto' },
    ],
  }),
});

// ─────────────────────────────────────────────
// ✅ Profile Image Storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'socialmern/profiles',
    format: file.mimetype.split('/')[1], // FIX
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  }),
});

// ─────────────────────────────────────────────
// ✅ Upload middleware
const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─────────────────────────────────────────────
// ✅ Delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const parts = imageUrl.split('/');
    const fileWithExt = parts[parts.length - 1];
    const filename = fileWithExt.split('.')[0];
    const folder = parts[parts.length - 2];

    await cloudinary.uploader.destroy(`${folder}/${filename}`);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = {
  cloudinary,
  uploadPostImage,
  uploadProfileImage,
  deleteFromCloudinary,
};