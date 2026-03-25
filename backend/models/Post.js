const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:     { type: String, required: true, maxlength: 500 },
    isToxic:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption:  { type: String, maxlength: 2000, default: '' },
    image:    { type: String, default: '' },
    video:    { type: String, default: '' },
    hashtags: [{ type: String }],
    likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    shares:   { type: Number, default: 0 },

    // Admin soft-delete
    isDeleted:     { type: Boolean, default: false },
    deletedReason: { type: String },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
