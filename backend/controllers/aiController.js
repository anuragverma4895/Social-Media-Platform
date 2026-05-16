const { asyncHandler } = require('../middleware/errorMiddleware');

const TOXIC_PATTERNS = [
  /\b(kill|die|hate|stupid|idiot|moron|dumb|trash|ugly)\b/i,
  /\b(fuck|shit|bitch|asshole|bastard)\b/i,
];

const detectToxicity = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  const matches = TOXIC_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const confidence = matches > 0 ? Math.min(0.95, 0.65 + matches * 0.15) : 0.05;

  res.json({
    success: true,
    data: {
      isToxic: matches > 0,
      confidence,
    },
  });
});

const generateHashtags = asyncHandler(async (req, res) => {
  const text = String(req.body.text || req.body.caption || '').toLowerCase();
  const words = text
    .replace(/#[a-z0-9_]+/gi, '')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 8);

  const hashtags = [...new Set(words)].map((word) => `#${word}`);
  res.json({ success: true, data: { hashtags } });
});

const suggestCaption = asyncHandler(async (req, res) => {
  const topic = String(req.body.topic || req.body.prompt || req.body.text || 'this moment').trim();
  res.json({
    success: true,
    data: {
      caption: `Sharing ${topic} with my circle.`,
    },
  });
});

const passthroughChat = asyncHandler(async (req, res) => {
  const message = String(req.body.message || req.body.prompt || '').trim();
  res.json({
    success: true,
    data: {
      reply: message ? `I hear you: ${message}` : 'Tell me what you want to create.',
    },
  });
});

module.exports = {
  detectToxicity,
  generateHashtags,
  suggestCaption,
  passthroughChat,
};
