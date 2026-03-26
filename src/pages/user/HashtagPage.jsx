import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postAPI } from '../../services/api.js';
import PostCard from '../../components/posts/PostCard.jsx';
import { HashtagIcon } from '@heroicons/react/24/outline';

export default function HashtagPage() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await postAPI.getByHashtag(tag);
        setPosts(data.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [tag]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">#</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">#{tag}</h1>
          <p className="text-gray-500">{posts.length} posts</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <HashtagIcon className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-gray-500">No posts with #{tag} yet</p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post._id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p._id !== id))} />)
      )}
    </div>
  );
}
