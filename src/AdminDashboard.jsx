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
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Focus states for floating labels
  const [focusStates, setFocusStates] = useState({
    title: false,
    desc: false,
    media: false,
  });

  const handleFocus = (field) =>
    setFocusStates((prev) => ({ ...prev, [field]: true }));
  const handleBlur = (field) =>
    setFocusStates((prev) => ({ ...prev, [field]: false }));

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
    setSubmitting(true);
    const payload = { title, description, mediaUrl, mediaType };

    try {
      if (editingId) {
        await api.put(`/blogs/${editingId}`, payload);
      } else {
        await api.post('/blogs', payload);
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      console.error('Failed to save post', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (blog) => {
    setTitle(blog.title);
    setDescription(blog.description);
    setMediaUrl(blog.mediaUrl || '');
    setMediaType(blog.mediaType || 'none');
    setEditingId(blog._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    await api.delete(`/blogs/${id}`);
    setDeleteConfirmId(null);
    fetchBlogs();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const mediaTypes = ['none', 'image', 'gif', 'video'];

  return (
    <div className="w-screen min-h-screen bg-paper">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-paper/80 backdrop-blur-xl border-b border-hairline/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl tracking-tight text-ink">
              Dashboard
            </h1>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.25em] text-ink/20 font-medium bg-ink/[0.03] px-2.5 py-1 rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-ink/35 hover:text-ink/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-semibold text-ink/40 hover:text-red-500 border border-hairline hover:border-red-200 px-4 py-2 rounded-full transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Form Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl tracking-tight">
              {editingId ? 'Edit Post' : 'Create New Post'}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-[12px] uppercase tracking-widest font-medium text-ink/30 hover:text-ink/60 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-ink/[0.015] border border-hairline/60 rounded-2xl p-6 md:p-8 space-y-1"
          >
            {/* Title Input */}
            <div className="relative">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                  focusStates.title || title
                    ? 'top-1.5 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold'
                    : 'top-[14px] text-sm text-ink/25'
                }`}
              >
                Post Title
              </label>
              <div
                className={`border-b transition-colors duration-300 rounded-t-md ${
                  focusStates.title ? 'border-accent' : 'border-hairline'
                }`}
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => handleFocus('title')}
                  onBlur={() => handleBlur('title')}
                  className="w-full bg-transparent pt-7 pb-3 px-4 text-sm text-ink outline-none"
                  required
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="relative mt-6">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                  focusStates.desc || description
                    ? 'top-1.5 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold'
                    : 'top-[14px] text-sm text-ink/25'
                }`}
              >
                Content
              </label>
              <div
                className={`border-b transition-colors duration-300 rounded-t-md ${
                  focusStates.desc ? 'border-accent' : 'border-hairline'
                }`}
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => handleFocus('desc')}
                  onBlur={() => handleBlur('desc')}
                  rows={5}
                  className="w-full bg-transparent pt-7 pb-3 px-4 text-sm text-ink outline-none resize-none leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Media Type Selector (Pills) */}
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/30 font-semibold mb-3 px-1">
                Media Type
              </p>
              <div className="flex gap-2 flex-wrap">
                {mediaTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMediaType(type)}
                    className={`px-4 py-2 rounded-full text-[12px] font-medium uppercase tracking-wide border transition-all duration-300 ${
                      mediaType === type
                        ? 'bg-ink text-paper border-ink shadow-sm'
                        : 'bg-transparent text-ink/40 border-hairline hover:border-ink/20 hover:text-ink/60'
                    }`}
                  >
                    {type === 'none' ? 'No Media' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Media URL Input (Conditional) */}
            {mediaType !== 'none' && (
              <div className="relative mt-6 overflow-hidden transition-all duration-400">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                    focusStates.media || mediaUrl
                      ? 'top-1.5 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold'
                      : 'top-[14px] text-sm text-ink/25'
                  }`}
                >
                  {mediaType === 'video' ? 'Video URL (mp4)' : 'Image URL'}
                </label>
                <div
                  className={`border-b transition-colors duration-300 rounded-t-md ${
                    focusStates.media ? 'border-accent' : 'border-hairline'
                  }`}
                >
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    onFocus={() => handleFocus('media')}
                    onBlur={() => handleBlur('media')}
                    className="w-full bg-transparent pt-7 pb-3 px-4 text-sm text-ink outline-none"
                    placeholder=" "
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={submitting}
                className={`group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide transition-all duration-300 ${
                  submitting
                    ? 'bg-ink/80 text-paper/60 cursor-wait'
                    : 'bg-ink text-paper hover:bg-ink/85 hover:shadow-xl hover:shadow-ink/10 active:scale-[0.98]'
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? 'Update Post' : 'Publish Post'}
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Posts List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl tracking-tight">All Posts</h2>
              <span className="text-[11px] font-medium text-ink/25 bg-ink/[0.03] px-2.5 py-1 rounded-full">
                {blogs.length}
              </span>
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-hairline rounded-2xl bg-ink/[0.01]">
              <div className="w-16 h-16 rounded-full bg-ink/[0.03] flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-ink/10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="font-serif text-xl text-ink/20 italic mb-1">No posts yet</p>
              <p className="text-sm text-ink/15">Create your first post using the form above.</p>
            </div>
          ) : (
            <div className="border border-hairline/60 rounded-2xl overflow-hidden bg-ink/[0.01] divide-y divide-hairline/60">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="group flex items-center gap-5 p-4 md:p-5 hover:bg-ink/[0.015] transition-colors duration-300"
                >
                  {/* Thumbnail */}
                  <div className="hidden sm:block flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-ink/5">
                    {blog.mediaType === 'image' || blog.mediaType === 'gif' ? (
                      <img
                        src={blog.mediaUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : blog.mediaType === 'video' ? (
                      <div className="w-full h-full bg-ink/10 flex items-center justify-center text-ink/20">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/10 text-xs font-bold uppercase tracking-widest">
                        Text
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-base tracking-tight text-ink truncate">
                        {blog.title}
                      </h3>
                      {blog.mediaType === 'video' && (
                        <span className="flex-shrink-0 text-[9px] uppercase tracking-widest font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          Video
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-ink/35 line-clamp-1 leading-relaxed">
                      {blog.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-ink/20">
                      <span>♥ {(blog.likedBy || []).length}</span>
                      <span>✎ {(blog.comments || []).length}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {deleteConfirmId === blog._id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5 animate-in">
                        <span className="text-[11px] text-red-500 font-medium pr-1">Delete?</span>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-[11px] font-bold text-red-600 bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[11px] font-medium text-ink/40 hover:text-ink/60 px-2 py-1 rounded transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-2 rounded-lg text-ink/25 hover:text-ink/60 hover:bg-ink/[0.04] transition-all duration-200"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(blog._id)}
                          className="p-2 rounded-lg text-ink/25 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;