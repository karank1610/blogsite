import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api/axios';

const getVisitorId = () => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('visitorId', id);
    }
    return id;
};

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const visitorId = getVisitorId();

    const fetchBlog = async () => {
        const res = await api.get(`/blogs/${id}`);
        setBlog(res.data);
    };

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const handleLike = async () => {
        const res = await api.post(`/blogs/${id}/like`, { visitorId });
        setBlog((prev) => ({
            ...prev,
            likedBy: res.data.liked
                ? [...(prev.likedBy || []), visitorId]
                : (prev.likedBy || []).filter((v) => v !== visitorId),
        }));
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;

        const res = await api.post(`/blogs/${id}/comment`, { name, text });
        setBlog((prev) => ({ ...prev, comments: res.data }));
        setName('');
        setText('');
    };

    if (!blog) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const isLiked = (blog.likedBy || []).includes(visitorId);

    return (
        <div className="w-screen min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto px-4">
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                    ← Back to Blog
                </Link>

                <div className="bg-white rounded-lg shadow p-6 mt-4">
                    {blog.mediaType === 'image' || blog.mediaType === 'gif' ? (
                        <img
                            src={blog.mediaUrl}
                            alt={blog.title}
                            className="w-full h-80 object-cover rounded mb-5"
                        />
                    ) : blog.mediaType === 'video' ? (
                        <video
                            src={blog.mediaUrl}
                            controls
                            className="w-full h-80 object-cover rounded mb-5"
                        />
                    ) : null}

                    <h1 className="text-3xl font-bold">{blog.title}</h1>
                    <p className="text-gray-700 mt-3 whitespace-pre-line">
                        {blog.description}
                    </p>

                    <div className="flex items-center gap-4 mt-6 pb-6 border-b border-gray-200">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition ${isLiked
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {isLiked ? '❤️' : '🤍'} {(blog.likedBy || []).length}
                        </button>

                        <span className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700">
                            💬 {blog.comments.length}
                        </span>

                        <button
                            onClick={handleShare}
                            className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                            🔗 Share
                        </button>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Comments ({blog.comments.length})
                        </h2>

                        <form onSubmit={handleCommentSubmit} className="mb-6">
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 mb-2 outline-none focus:border-blue-500"
                                required
                            />
                            <textarea
                                placeholder="Write a comment..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded px-3 py-2 mb-2 outline-none focus:border-blue-500"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Post Comment
                            </button>
                        </form>

                        <div className="space-y-4">
                            {blog.comments
                                .slice()
                                .reverse()
                                .map((c, i) => (
                                    <div key={i} className="bg-gray-50 p-3 rounded">
                                        <p className="font-semibold text-sm">{c.name}</p>
                                        <p className="text-gray-700 text-sm mt-1">{c.text}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;