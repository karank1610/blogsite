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

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const readTime = (text) => {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const visitorId = getVisitorId();

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
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
    navigator.clipboard.writeText(`${window.location.origin}/blog/${id}`);
    const btn = document.querySelector(`[data-share="${id}"]`);
    const original = btn.innerHTML;
    btn.innerHTML = `<span class="inline-flex items-center gap-1.5">✓ Copied</span>`;
    btn.classList.add('!border-accent', '!text-accent');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('!border-accent', '!text-accent');
    }, 2000);
  };

  // Skeleton loader
  const Skeleton = () => (
    <div className="animate-pulse">
      <div className="bg-ink/5 rounded-2xl h-72 mb-6" />
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-ink/5 rounded-full h-5 w-24" />
        <div className="bg-ink/5 rounded-full h-5 w-16" />
      </div>
      <div className="bg-ink/5 rounded-lg h-8 w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="bg-ink/5 rounded h-4 w-full" />
        <div className="bg-ink/5 rounded h-4 w-5/6" />
        <div className="bg-ink/5 rounded h-4 w-2/3" />
      </div>
    </div>
  );

  // Featured post (first blog)
  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <div className="w-screen min-h-screen bg-paper">
      {/* Nav bar */}
      <nav className="sticky top-0 z-50 bg-paper/80 backdrop-blur-xl border-b border-hairline/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="group flex items-center gap-1">
            <span className="font-serif text-2xl tracking-tight">
              My
            </span>
            <span className="font-serif italic text-2xl text-accent group-hover:scale-105 transition-transform origin-bottom-left">
              Blog
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="text-[11px] uppercase tracking-widest font-medium text-ink/50 hover:text-ink border border-hairline hover:border-ink/20 px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6">
        {/* Hero / Featured Post */}
        {loading ? (
          <div className="pt-16 pb-10">
            <Skeleton />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-ink/[0.03] flex items-center justify-center mb-6">
              <span className="text-3xl opacity-30">✦</span>
            </div>
            <p className="font-serif text-2xl text-ink/30 italic mb-2">
              No stories yet
            </p>
            <p className="text-sm text-ink/20 max-w-xs">
              Check back soon — the first post is on its way.
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            <section className="pt-12 pb-10">
              <Link
                to={`/blog/${featured._id}`}
                className="group block"
                onMouseEnter={() => setHoveredCard(featured._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative overflow-hidden rounded-2xl mb-6">
                  {featured.mediaType === 'image' || featured.mediaType === 'gif' ? (
                    <img
                      src={featured.mediaUrl}
                      alt={featured.title}
                      className={`w-full h-[420px] object-cover transition-transform duration-700 ease-out ${
                        hoveredCard === featured._id ? 'scale-[1.03]' : 'scale-100'
                      }`}
                    />
                  ) : featured.mediaType === 'video' ? (
                    <div className="relative">
                      <video
                        src={featured.mediaUrl}
                        className="w-full h-[420px] object-cover"
                        muted
                        onMouseOver={(e) => e.target.play()}
                        onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-paper/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-xl ml-1">▶</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[420px] bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-2xl flex items-center justify-center">
                      <span className="font-serif text-8xl text-accent/15">✦</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold bg-paper/90 backdrop-blur-md text-ink/70 px-3.5 py-1.5 rounded-full border border-hairline/50">
                      Featured
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <time className="text-[11px] uppercase tracking-widest text-ink/35 font-medium">
                    {formatDate(featured.createdAt)}
                  </time>
                  <span className="w-1 h-1 rounded-full bg-ink/15" />
                  <span className="text-[11px] uppercase tracking-widest text-ink/35 font-medium">
                    {readTime(featured.description)} min read
                  </span>
                </div>

                <h2 className="font-serif text-4xl md:text-5xl leading-[1.15] tracking-tight text-ink group-hover:text-accent transition-colors duration-500">
                  {featured.title}
                </h2>

                <p className="text-ink/50 mt-4 leading-relaxed text-[17px] max-w-2xl line-clamp-2">
                  {featured.description}
                </p>

                <div className="flex items-center gap-2 mt-6 text-accent text-sm font-medium">
                  <span>Read story</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </section>

            {/* Divider */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-hairline" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-ink/20 font-medium">
                Latest
              </span>
              <div className="flex-1 h-px bg-hairline" />
            </div>

            {/* Blog Grid */}
            <section className="py-8 pb-24">
              {loading ? (
                <div className="space-y-14">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-12">
                  {rest.map((blog, index) => {
                    const isLiked = (blog.likedBy || []).includes(visitorId);
                    const isEven = index % 2 === 0;

                    return (
                      <article
                        key={blog._id}
                        className={`group flex flex-col ${
                          isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                        } gap-8 md:gap-10 items-start`}
                        onMouseEnter={() => setHoveredCard(blog._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        {/* Media */}
                        <Link
                          to={`/blog/${blog._id}`}
                          className={`relative overflow-hidden rounded-xl flex-shrink-0 w-full md:w-[280px] h-52 md:h-auto ${
                            isEven ? 'md:order-1' : 'md:order-2'
                          }`}
                        >
                          {blog.mediaType === 'image' || blog.mediaType === 'gif' ? (
                            <img
                              src={blog.mediaUrl}
                              alt={blog.title}
                              className={`w-full h-full object-cover transition-transform duration-600 ease-out ${
                                hoveredCard === blog._id ? 'scale-[1.05]' : 'scale-100'
                              }`}
                            />
                          ) : blog.mediaType === 'video' ? (
                            <div className="relative w-full h-full">
                              <video
                                src={blog.mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                                onMouseOver={(e) => e.target.play()}
                                onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-paper/80 backdrop-blur-sm flex items-center justify-center">
                                  <span className="text-sm ml-0.5">▶</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full min-h-[208px] bg-gradient-to-br from-accent/8 via-accent/4 to-transparent rounded-xl flex items-center justify-center">
                              <span className="font-serif text-5xl text-accent/12">✦</span>
                            </div>
                          )}
                        </Link>

                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <time className="text-[11px] uppercase tracking-widest text-ink/35 font-medium">
                              {formatDate(blog.createdAt)}
                            </time>
                            <span className="w-1 h-1 rounded-full bg-ink/15" />
                            <span className="text-[11px] uppercase tracking-widest text-ink/35 font-medium">
                              {readTime(blog.description)} min read
                            </span>
                          </div>

                          <Link to={`/blog/${blog._id}`}>
                            <h3 className="font-serif text-2xl md:text-[28px] leading-snug tracking-tight text-ink group-hover:text-accent transition-colors duration-400">
                              {blog.title}
                            </h3>
                          </Link>

                          <p className="text-ink/45 mt-3 leading-relaxed text-[15px] line-clamp-3">
                            {blog.description}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-5">
                            <button
                              onClick={() => handleLike(blog._id)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                                isLiked
                                  ? 'bg-accent/10 text-accent border border-accent/20'
                                  : 'text-ink/40 border border-hairline hover:border-ink/20 hover:text-ink/60'
                              }`}
                            >
                              <span className={`text-sm transition-transform duration-300 ${isLiked ? 'scale-110' : ''}`}>
                                {isLiked ? '♥' : '♡'}
                              </span>
                              <span>{(blog.likedBy || []).length || ''}</span>
                            </button>

                            <Link
                              to={`/blog/${blog._id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink/40 border border-hairline hover:border-ink/20 hover:text-ink/60 transition-all duration-300"
                            >
                              <span className="text-sm">✎</span>
                              <span>{(blog.comments || []).length || ''}</span>
                            </Link>

                            <button
                              data-share={blog._id}
                              onClick={() => handleShare(blog._id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-ink/40 border border-hairline hover:border-ink/20 hover:text-ink/60 transition-all duration-300"
                            >
                              <span className="text-sm">↗</span>
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline/60">
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-serif text-sm text-ink/25">
            My<span className="italic text-accent/40">Blog</span>
          </p>
          <p className="text-[11px] uppercase tracking-widest text-ink/15">
            Crafted with care
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;