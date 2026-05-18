const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const text = 'general';
    const prompt = `Generate up to 8 highly relevant and trending hashtags for a social media post with the following content. Return ONLY a single line comma-separated list of hashtags (e.g., #tag1, #tag2). Content: "${text}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("RAW RESPONSE:", responseText);

    let hashtags = [];
    const hashMatches = responseText.match(/#[\w\u0590-\u05ff\u0600-\u06ff\u0900-\u097f]+/g);
    if (hashMatches && hashMatches.length > 0) {
      hashtags = hashMatches;
    } else {
      hashtags = responseText.split(/[\s,]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 1)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    }
    console.log("PARSED HASHTAGS:", hashtags);
  } catch(err) {
    console.error(err);
  }
}
test();
