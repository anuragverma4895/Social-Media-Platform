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
    const prompt = `Act as an expert social media manager. I have a post with the following text content: "${text}".
Generate 5-10 highly engaging, strictly relevant, and trending hashtags specifically tailored to this exact text. 
Do not provide generic tags if the text is specific.
Format Requirement: Return ONLY a single line space-separated list of hashtags (e.g. #tag1 #tag2). Do NOT include any introductory or conversational text whatsoever.`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Robust parsing: extract words starting with #, or split by comma/space
    let hashtags = [];
    const hashMatches = responseText.match(/#[\w\u0590-\u05ff\u0600-\u06ff\u0900-\u097f]+/g); // Added support for unicode like Hindi/Arabic etc if any
    if (hashMatches && hashMatches.length > 0) {
      hashtags = hashMatches;
    } else {
      hashtags = responseText.split(/[\s,]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 1)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    }
    
    // remove duplicates and limit to 10
    hashtags = [...new Set(hashtags)].slice(0, 10);
    
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
    const prompt = `Act as an expert social media content creator. The user has provided a prompt or topic: "${topic}". 
Generate exactly what they requested (e.g., a motivational quote, a shayari, a joke, or a standard caption). Make it highly engaging, include emojis, and return ONLY the final generated text without surrounding quotes.`;
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
