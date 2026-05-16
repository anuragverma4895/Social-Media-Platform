const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testVideo() {
  const form = new FormData();
  // Create a dummy video file
  fs.writeFileSync('dummy.mp4', Buffer.from('AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAhtZGF0', 'base64'));
  form.append('image', fs.createReadStream('dummy.mp4'), { contentType: 'video/mp4' });
  
  try {
    const res = await axios.post('http://localhost:5001/upload', form, { headers: form.getHeaders() });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
testVideo();
