const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const { uploadPostImage } = require('./config/cloudinary');

const app = express();

app.post('/upload', uploadPostImage.single('image'), (req, res) => {
  if (req.file) {
    res.json({ success: true, url: req.file.path });
  } else {
    res.status(400).json({ success: false, message: 'No file' });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message, stack: err.stack });
});

app.listen(5001, () => console.log('Test server on 5001'));
