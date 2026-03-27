const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const axios = require('axios');
const FormData = require('form-data');

router.get('/blogs', async (req, res) => {
    const blogCollection = getDB().collection("blogs");
    const result = await blogCollection.find().toArray();
    res.send(result);
});

router.post('/upload-image', async (req, res) => {
      try {
        const { image } = req.body;

        if (!image) {
          return res.status(400).json({ success: false, message: 'Image data is required' });
        }

        const apiKey = process.env.VITE_IMAGE_HOSTING_API_KEY || process.env.IMGBB_API_KEY;

        if (!apiKey) {
          console.error('API Key is not set in environment variables');
          return res.status(500).json({ success: false, message: 'Server configuration error: API key not found' });
        }

        const base64Data = image.includes(',') ? image.split(',')[1] : image;

        const form = new FormData();
        form.append('image', Buffer.from(base64Data, 'base64'), { filename: 'blog-thumbnail.jpg' });
        form.append('key', apiKey);

        const response = await axios.post('https://api.imgbb.com/1/upload', form, {
          headers: form.getHeaders(),
          timeout: 30000
        });

        if (response.data.success) {
          return res.status(200).json({
            success: true,
            imageUrl: response.data.data.display_url
          });
        } else {
          throw new Error('ImageBB API returned success=false');
        }
      } catch (error) {
        console.error('Image upload error:', error.response?.data || error.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
});

router.post('/blogs', async (req, res) => {
    const blogCollection = getDB().collection("blogs");
    try {
        const blogData = req.body;

        if (!blogData.title || !blogData.author || !blogData.slug || !blogData.content || !blogData.thumbnail) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingBlog = await blogCollection.findOne({ slug: blogData.slug });
        if (existingBlog) {
            return res.status(400).json({ success: false, message: 'Blog with this slug already exists' });
        }

        const newBlog = {
            ...blogData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await blogCollection.insertOne(newBlog);

        return res.status(201).json({
            success: true,
            message: 'Blog uploaded successfully',
            blogId: result.insertedId
        });
    } catch (error) {
        console.error('Blog upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload blog',
            error: error.message
        });
    }
});

module.exports = router;
