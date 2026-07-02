import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';

const getVisitorId = () => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('visitorId', id);
    }
    return id;
};

const Home = () => {
    const [blogs, setBlogs] = useState([]);
    const visitorId = getVisitorId();

    const fetchBlogs = async () => {
        const res = await api.get('/blogs');
        setBlogs(res.data);
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleLike = async (id) => {
        const res = await api.post(`/blogs/${id}/like`, { visitorId });
        setBlogs((prev) =>
            prev.map((b) =>
                b._id === id
                    ? {
                        ...b,
                        likedBy: res.data.liked
                            ? [...(b.likedBy || []), visitorId]
                            : (b.likedBy || []).filter((v) => v !== visitorId),
                    }
                    : b
            )
        );
    };

    const handleShare = (id) => {
        const url = `${window.location.origin}/blog/${id}`;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="w-screen min-h-screen bg-gray-50">
            {/* Nav bar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">MyBlog</h1>
                    <Link
                        to="/admin/login"
                        className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                    >
                        Admin Login
                    </Link>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-10">
                {blogs.length === 0 && (
                    <p className="text-gray-500 text-center mt-20">No blogs yet.</p>
                )}

                <div className="space-y-6">
                    {blogs.map((blog) => {
                        const isLiked = (blog.likedBy || []).includes(visitorId);

                        return (
                            <div
                                key={blog._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                            >
                                {blog.mediaType === 'image' || blog.mediaType === 'gif' ? (
                                    <img
                                        src={blog.mediaUrl}
                                        alt={blog.title}
                                        className="w-full h-64 object-cover rounded-lg mb-4"
                                    />
                                ) : blog.mediaType === 'video' ? (
                                    <video
                                        src={blog.mediaUrl}
                                        controls
                                        className="w-full h-64 object-cover rounded-lg mb-4"
                                    />
                                ) : null}

                                <Link to={`/blog/${blog._id}`}>
                                    <h2 className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition">
                                        {blog.title}
                                    </h2>
                                </Link>

                                <p className="text-gray-600 mt-3 leading-relaxed line-clamp-3">
                                    {blog.description}
                                </p>

                                <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleLike(blog._id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${isLiked
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {isLiked ? '❤️' : '🤍'} {(blog.likedBy || []).length}
                                    </button>

                                    <Link
                                        to={`/blog/${blog._id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                    >
                                        💬 {blog.comments.length}
                                    </Link>

                                    <button
                                        onClick={() => handleShare(blog._id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                                    >
                                        🔗 Share
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Home;