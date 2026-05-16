const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { cloudinary } = require('./config/cloudinary');

async function testUpload() {
  try {
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    const result = await cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", {
      folder: 'test_folder'
    });
    console.log("Upload Success!", result.secure_url);
  } catch (error) {
    console.error("Upload Error:", error);
  }
}
testUpload();
