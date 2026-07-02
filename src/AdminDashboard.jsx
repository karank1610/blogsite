import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';
import { useAuth } from './context/AuthContext';

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [editingId, setEditingId] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    const res = await api.get('/blogs');
    setBlogs(res.data);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setMediaType('none');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, description, mediaUrl, mediaType };

    if (editingId) {
      await api.put(`/blogs/${editingId}`, payload);
    } else {
      await api.post('/blogs', payload);
    }

    resetForm();
    fetchBlogs();
  };

  const handleEdit = (blog) => {
    setTitle(blog.title);
    setDescription(blog.description);
    setMediaUrl(blog.mediaUrl || '');
    setMediaType(blog.mediaType || 'none');
    setEditingId(blog._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog?')) return;
    await api.delete(`/blogs/${id}`);
    fetchBlogs();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="w-screen min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
          >
            Logout
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow mb-10"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Blog' : 'Add New Blog'}
          </h2>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none focus:border-blue-500"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none focus:border-blue-500"
            required
          />

          <input
            type="text"
            placeholder="Media URL (image/gif/video link)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none focus:border-blue-500"
          />

          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6 outline-none focus:border-blue-500"
          >
            <option value="none">No Media</option>
            <option value="image">Image</option>
            <option value="gif">GIF</option>
            <option value="video">Video</option>
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              {editingId ? 'Update Blog' : 'Add Blog'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 px-5 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold text-lg">{blog.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {blog.description}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <button
                  onClick={() => handleEdit(blog)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;