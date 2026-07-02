const express = require('express');
const router = express.Router();
const protect = require('../middleware/authmiddleware.js');
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
} = require('../controllers/blogcontroller.js');

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/:id/like', toggleLike);
router.post('/:id/comment', addComment);

router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;