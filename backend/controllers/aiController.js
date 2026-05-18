const { GoogleGenerativeAI } = require('@google/generative-ai');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment variables.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

const detectToxicity = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  try {
    const model = getModel();
    const prompt = `Analyze the following text for toxicity (hate speech, severe profanity, harassment). Return a JSON object with two fields: "isToxic" (boolean) and "confidence" (number between 0 and 1). Do not return markdown, just the JSON string. Text: "${text}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
    
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Gemini Error (detectToxicity):', error);
    // Fallback if AI fails
    const TOXIC_PATTERNS = [
      /\b(kill|die|hate|stupid|idiot|moron|dumb|trash|ugly)\b/i,
      /\b(fuck|shit|bitch|asshole|bastard)\b/i,
    ];
    const matches = TOXIC_PATTERNS.filter((pattern) => pattern.test(text)).length;
    res.json({ success: true, data: { isToxic: matches > 0, confidence: matches > 0 ? 0.8 : 0 } });
  }
});

const generateHashtags = asyncHandler(async (req, res) => {
  const text = String(req.body.text || req.body.caption || '').trim();
  try {
    const model = getModel();
    const prompt = `Generate up to 8 highly relevant and trending hashtags for a social media post with the following content. Return ONLY a single line comma-separated list of hashtags (e.g., #tag1, #tag2). Content: "${text}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const hashtags = responseText.split(',').map(tag => tag.trim().replace(/^([^#])/, '#$1')).filter(t => t !== '#' && t.length > 1);
    
    res.json({ success: true, data: { hashtags } });
  } catch (error) {
    console.error('Gemini Error (generateHashtags):', error);
    res.json({ success: true, data: { hashtags: ['#trending', '#social'] } });
  }
});

const suggestCaption = asyncHandler(async (req, res) => {
  const topic = String(req.body.topic || req.body.prompt || req.body.text || 'this moment').trim();
  try {
    const model = getModel();
    const prompt = `You are an expert social media content generator. 
The user has provided the following input: "${topic}".

INSTRUCTIONS:
1. If the input is a specific request like "motivational line", "motivation shayari", "sad quote", etc., generate EXACTLY that. Do NOT write "Here is your shayari:". Just output the shayari/quote/line directly.
2. If the input is just a topic like "sunset" or "my new car", generate a highly engaging caption for that topic.
3. If the input is generic or empty, generate a general engaging social media caption.
4. Include appropriate emojis.
5. Provide ONLY the final text. No surrounding quotes, no introductory text, no conversational filler.`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/^"|"$/g, '');
    
    res.json({
      success: true,
      data: {
        caption: responseText,
      },
    });
  } catch (error) {
    console.error('Gemini Error (suggestCaption):', error);
    res.json({ success: true, data: { caption: `Sharing ${topic} with my circle! ✨` } });
  }
});

const passthroughChat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || req.body.prompt || '').trim();
  try {
    const model = getModel();
    const prompt = `You are an incredibly helpful, friendly, and smart AI assistant integrated into a social media platform called SocialMERN. The user says: "${message}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    res.json({
      success: true,
      data: {
        reply: responseText,
      },
    });
  } catch (error) {
    console.error('Gemini Error (passthroughChat):', error);
    res.json({ success: true, data: { reply: 'Oops! I am having trouble connecting to my AI brain right now. Please check if GEMINI_API_KEY is properly configured.' } });
  }
});

module.exports = {
  detectToxicity,
  generateHashtags,
  suggestCaption,
  passthroughChat,
};
