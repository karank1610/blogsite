const Blog = require('../models/Blog.js');

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType } = req.body;
    const blog = await Blog.create({ title, description, mediaUrl, mediaType });
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, mediaUrl, mediaType },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ message: 'visitorId required' });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (!blog.likedBy) blog.likedBy = [];

    console.log('Incoming visitorId:', visitorId);
    console.log('Current likedBy array:', blog.likedBy);

    const alreadyLiked = blog.likedBy.includes(visitorId);
    console.log('Already liked?', alreadyLiked);

    if (alreadyLiked) {
      blog.likedBy = blog.likedBy.filter((id) => id !== visitorId);
    } else {
      blog.likedBy.push(visitorId);
    }

    await blog.save();
    console.log('Saved likedBy:', blog.likedBy);

    res.json({ likes: blog.likedBy.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ message: 'Name and text required' });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (!blog.comments) blog.comments = [];

    blog.comments.push({ name, text });
    await blog.save();

    res.status(201).json(blog.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
};