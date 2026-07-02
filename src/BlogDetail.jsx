import { useState, useEffect, useRef } from 'react';
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

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
};

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [textFocused, setTextFocused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const articleRef = useRef(null);
  const visitorId = getVisitorId();

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch (err) {
      console.error('Failed to fetch blog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
    window.scrollTo(0, 0);
  }, [id]);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const total = articleRef.current.scrollHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setProgress(Math.min(1, total > 0 ? scrolled / total : 0));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handleLike = async () => {
    const res = await api.post(`/blogs/${id}/like`, { visitorId });
    setBlog((prev) => ({
      ...prev,
      likedBy: res.data.liked
        ? [...(prev.likedBy || []), visitorId]
        : (prev.likedBy || []).filter((v) => v !== visitorId),
    }));
    if (res.data.liked) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 400);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    const btn = document.querySelector('[data-share-btn]');
    const orig = btn.innerHTML;
    btn.innerHTML = `<span class="inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Copied</span>`;
    btn.classList.add('!border-accent', '!text-accent');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('!border-accent', '!text-accent');
    }, 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/blogs/${id}/comment`, { name, text });
      setBlog((prev) => ({ ...prev, comments: res.data }));
      setName('');
      setText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-paper">
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-ink/5 rounded mb-10" />
            <div className="h-96 bg-ink/5 rounded-2xl mb-10" />
            <div className="flex gap-3 mb-6">
              <div className="h-4 w-32 bg-ink/5 rounded" />
              <div className="h-4 w-20 bg-ink/5 rounded" />
            </div>
            <div className="h-12 w-3/4 bg-ink/5 rounded-lg mb-6" />
            <div className="space-y-3 mb-16">
              <div className="h-4 w-full bg-ink/5 rounded" />
              <div className="h-4 w-full bg-ink/5 rounded" />
              <div className="h-4 w-5/6 bg-ink/5 rounded" />
              <div className="h-4 w-full bg-ink/5 rounded" />
              <div className="h-4 w-2/3 bg-ink/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="w-screen min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-5xl text-ink/10 mb-4">404</p>
          <p className="text-ink/30 font-serif text-lg italic">Post not found</p>
          <Link to="/" className="inline-block mt-6 text-sm text-accent hover:underline">
            ← Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  const isLiked = (blog.likedBy || []).includes(visitorId);

  return (
    <div className="w-screen min-h-screen bg-paper">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] z-[60]">
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-[2px] z-50 bg-paper/80 backdrop-blur-xl border-b border-hairline/40">
        <div className="max-w-3xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[13px] text-ink/40 hover:text-ink transition-colors duration-300"
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="tracking-wide">All Posts</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                isLiked
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-ink/40 border border-hairline hover:border-ink/20 hover:text-ink/60'
              }`}
            >
              <span className={`text-sm transition-transform duration-300 ${likeAnim ? 'scale-125' : ''}`}>
                {isLiked ? '♥' : '♡'}
              </span>
              <span>{(blog.likedBy || []).length || ''}</span>
            </button>

            <button
              data-share-btn
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-ink/40 border border-hairline hover:border-ink/20 hover:text-ink/60 transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article ref={articleRef} className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <header className="pt-14 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <time className="text-[11px] uppercase tracking-[0.2em] text-ink/30 font-medium">
              {formatDate(blog.createdAt)}
            </time>
            <span className="w-1 h-1 rounded-full bg-ink/10" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink/30 font-medium">
              {(blog.likedBy || []).length} likes
            </span>
            <span className="w-1 h-1 rounded-full bg-ink/10" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-ink/30 font-medium">
              {(blog.comments || []).length} comments
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-[3.25rem] leading-[1.12] tracking-tight text-ink">
            {blog.title}
          </h1>
        </header>

        {/* Media */}
        {blog.mediaType === 'image' || blog.mediaType === 'gif' ? (
          <figure className="mb-14 -mx-6 md:mx-0">
            <img
              src={blog.mediaUrl}
              alt={blog.title}
              className="w-full h-auto max-h-[520px] object-cover md:rounded-xl"
            />
          </figure>
        ) : blog.mediaType === 'video' ? (
          <figure className="mb-14 -mx-6 md:mx-0">
            <video
              src={blog.mediaUrl}
              controls
              controlsList="nodownload"
              className="w-full h-auto max-h-[520px] object-cover md:rounded-xl bg-ink/5"
              preload="metadata"
            />
          </figure>
        ) : null}

        {/* Body */}
        <div className="prose-custom mb-16">
          {blog.description.split('\n').map((paragraph, i) => (
            <p
              key={i}
              className="text-[17px] md:text-[18px] leading-[1.85] text-ink/75 mb-5 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Inline action bar */}
        <div className="flex items-center gap-3 py-8 border-t border-b border-hairline mb-16">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isLiked
                ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm shadow-accent/5'
                : 'text-ink/50 border border-hairline hover:border-ink/20 hover:text-ink/70 hover:shadow-sm'
            }`}
          >
            <span className={`text-base transition-transform duration-300 ${likeAnim ? 'scale-130' : ''}`}>
              {isLiked ? '♥' : '♡'}
            </span>
            <span>Like{(blog.likedBy || []).length ? ` · ${(blog.likedBy || []).length}` : ''}</span>
          </button>

          <a
            href="#comments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-ink/50 border border-hairline hover:border-ink/20 hover:text-ink/70 hover:shadow-sm transition-all duration-300"
          >
            <span className="text-base">✎</span>
            <span>Comment{(blog.comments || []).length ? ` · ${(blog.comments || []).length}` : ''}</span>
          </a>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-ink/50 border border-hairline hover:border-ink/20 hover:text-ink/70 hover:shadow-sm transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <section id="comments" className="pb-24 scroll-mt-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-serif text-2xl tracking-tight">
              Responses
            </h2>
            <span className="text-[11px] font-medium text-ink/30 bg-ink/[0.04] px-2.5 py-1 rounded-full">
              {(blog.comments || []).length}
            </span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-14">
            <div className="bg-ink/[0.02] rounded-2xl border border-hairline/60 p-5 md:p-6 space-y-4">
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    nameFocused || name
                      ? 'top-1 text-[10px] uppercase tracking-widest text-accent font-semibold'
                      : 'top-3.5 text-sm text-ink/25'
                  }`}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  className="w-full bg-transparent border-b border-hairline focus:border-accent pt-6 pb-2 px-4 text-sm text-ink outline-none transition-colors duration-300 rounded-t-md"
                  required
                />
              </div>

              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                    textFocused || text
                      ? 'top-1 text-[10px] uppercase tracking-widest text-accent font-semibold'
                      : 'top-3.5 text-sm text-ink/25'
                  }`}
                >
                  Your thoughts
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={() => setTextFocused(true)}
                  onBlur={() => setTextFocused(false)}
                  rows={3}
                  className="w-full bg-transparent border-b border-hairline focus:border-accent pt-6 pb-2 px-4 text-sm text-ink outline-none transition-colors duration-300 resize-none rounded-t-md"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting || !name.trim() || !text.trim()}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold uppercase tracking-wide transition-all duration-300 ${
                    name.trim() && text.trim() && !submitting
                      ? 'bg-ink text-paper hover:bg-ink/85 hover:shadow-lg hover:shadow-ink/10 active:scale-[0.97]'
                      : 'bg-ink/10 text-ink/30 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Posting
                    </>
                  ) : (
                    'Post Response'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {blog.comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-ink/[0.02] flex items-center justify-center mx-auto mb-4">
                <span className="text-xl opacity-20">✎</span>
              </div>
              <p className="text-sm text-ink/25 font-serif italic">
                No responses yet — be the first.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blog.comments
                .slice()
                .reverse()
                .map((c, i) => {
                  const initials = c.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={i}
                      className="group flex gap-4 p-5 rounded-xl border border-transparent hover:border-hairline/60 hover:bg-ink/[0.01] transition-all duration-300"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent/8 text-accent flex items-center justify-center text-[11px] font-bold tracking-wide">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5 mb-1.5">
                          <span className="text-sm font-semibold text-ink/80">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-ink/20">
                            {timeAgo(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-[15px] leading-relaxed text-ink/55 whitespace-pre-line">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </article>

      {/* Footer */}
      <footer className="border-t border-hairline/40">
        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-serif text-sm text-ink/25 hover:text-ink/50 transition-colors">
            My<span className="italic text-accent/40">Blog</span>
          </Link>
          <Link
            to="/"
            className="text-[11px] uppercase tracking-widest text-ink/20 hover:text-ink/40 transition-colors"
          >
            ← All Posts
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default BlogDetail;