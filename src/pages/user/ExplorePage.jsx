// ExplorePage.js
import { useState, useEffect } from 'react';
import { postAPI } from '../../services/api.js';
import PostCard from '../../components/posts/PostCard.jsx';

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await postAPI.explorePosts({ page: pageNum, limit: 12 });
      setPosts(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
      setHasMore(pageNum < data.pagination.pages);
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(1); }, []);

  const handleDelete = (id) => setPosts(prev => prev.filter(p => p._id !== id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Explore</h1>
      {loading && page === 1 ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {posts.map(post => <PostCard key={post._id} post={post} onDelete={handleDelete} />)}
          {hasMore && (
            <div className="text-center mt-4">
              <button className="btn-secondary" onClick={() => { const n = page + 1; setPage(n); fetchPosts(n); }}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
