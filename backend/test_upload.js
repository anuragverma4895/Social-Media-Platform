const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function test() {
  const form = new FormData();
  // Create a dummy image
  fs.writeFileSync('dummy.jpg', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
  form.append('image', fs.createReadStream('dummy.jpg'), { contentType: 'image/jpeg' });
  
  try {
    const res = await axios.post('http://localhost:5001/upload', form, { headers: form.getHeaders() });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
