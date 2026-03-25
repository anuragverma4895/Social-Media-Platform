import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../../services/api.js';
import toast from 'react-hot-toast';
import {
  PhotoIcon, XMarkIcon, ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast.error('File must be under 50MB (Max ~10 min video)');
    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption && !media) return toast.error('Add a caption or media to your post');

    setLoading(true);
    try {
      const formData = new FormData();
      if (caption) formData.append('caption', caption);
      if (media) formData.append('image', media);
      if (hashtags.length > 0) formData.append('hashtags', JSON.stringify(hashtags));

      await postAPI.createPost(formData);
      toast.success('Post published! 🎉');
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Media upload */}
        <div className="card p-4">
          {mediaPreview ? (
            <div className="relative">
              {media?.type?.startsWith('video') ? (
                <video src={mediaPreview} controls className="w-full max-h-80 object-cover rounded-xl" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-80 object-cover rounded-xl" />
              )}
              <button type="button" onClick={removeMedia}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-400 transition-colors group">
              <PhotoIcon className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-medium">Click to upload image or video</p>
              <p className="text-xs mt-1">JPG, PNG, GIF, MP4 (Max 50MB, upto 10 mins)</p>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
        </div>

        {/* Caption */}
        <div className="card p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption... Use #hashtags to categorize your post"
            className="w-full resize-none text-gray-800 placeholder-gray-400 focus:outline-none text-base leading-relaxed"
            rows={5}
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">{caption.length}/2000</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading || (!caption && !media)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" />
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}