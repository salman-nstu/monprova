import React, { useState, useEffect } from 'react';
import { FaUpload, FaEye, FaTrash, FaEdit, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const AdminResources = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [uploadType, setUploadType] = useState(null);
    const [viewType, setViewType] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        thumbnail: null,
        thumbnailUrl: '',
        slug: '',
        content: '',
        category: '',
        videoLink: ''
    });

    const IMGBB_API_KEY = '714b4ad18d0cf4ce255329888f21797d';

    // Notification helper function
    const showNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(notif => notif.id !== id));
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Fetch blogs and videos when view section is opened
    useEffect(() => {
        if (activeSection === 'view' && viewType) {
            fetchResources();
        }
    }, [activeSection, viewType]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            if (viewType === 'blog') {
                const response = await fetch('https://monprova-server.vercel.app/api/blogs');
                const data = await response.json();
                setBlogs(data);
            } else if (viewType === 'video') {
                const response = await fetch('https://monprova-server.vercel.app/api/videos');
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            showNotification('রিসোর্স লোড করতে ত্রুটি হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('এই ব্লগ মুছতে চান?')) {
            return;
        }

        try {
            const response = await fetch(`https://monprova-server.vercel.app/api/blogs/${blogId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showNotification('ব্লগ সফলভাবে মুছা হয়েছে', 'success');
                setBlogs(blogs.filter(blog => blog._id !== blogId));
            } else {
                showNotification('ব্লগ মুছতে ব্যর্থ হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            showNotification('মুছতে ত্রুটি হয়েছে', 'error');
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm('এই ভিডিও মুছতে চান?')) {
            return;
        }

        try {
            const response = await fetch(`https://monprova-server.vercel.app/api/videos/${videoId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showNotification('ভিডিও সফলভাবে মুছা হয়েছে', 'success');
                setVideos(videos.filter(video => video._id !== videoId));
            } else {
                showNotification('ভিডিও মুছতে ব্যর্থ হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            showNotification('মুছতে ত্রুটি হয়েছে', 'error');
        }
    };

    const handleEditBlog = (blog) => {
        setIsEditing(true);
        setEditingId(blog._id);
        setFormData({
            title: blog.title,
            author: blog.author,
            thumbnail: null,
            thumbnailUrl: blog.thumbnail,
            slug: blog.slug,
            content: blog.content,
            category: blog.category,
            videoLink: ''
        });
        setActiveSection('upload');
        setUploadType('blog');
        setViewType(null);
    };

    const handleEditVideo = (video) => {
        setIsEditing(true);
        setEditingId(video._id);
        setFormData({
            title: video.title,
            author: '',
            thumbnail: null,
            thumbnailUrl: '',
            slug: '',
            content: '',
            category: video.category,
            videoLink: video.videoLink
        });
        setActiveSection('upload');
        setUploadType('video');
        setViewType(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                thumbnail: file
            }));
        }
    };

    const uploadToImageBB = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const base64String = e.target.result;

                    console.log('Uploading image to backend...');

                    // Send to backend endpoint
                    const response = await fetch('https://monprova-server.vercel.app/api/upload-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            image: base64String
                        })
                    });

                    const data = await response.json();

                    console.log('Backend response:', data);

                    if (data.success) {
                        console.log('Image uploaded successfully:', data.imageUrl);
                        resolve(data.imageUrl);
                    } else {
                        console.error('ImageBB error:', data.message);
                        showNotification(`থাম্বনেইল আপলোড ব্যর্থ: ${data.message}`, 'error');
                        reject(new Error(data.message));
                    }
                } catch (error) {
                    console.error('Error uploading to ImageBB:', error);
                    showNotification('থাম্বনেইল আপলোড ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।', 'error');
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error('File read error:', error);
                showNotification('ফাইল পড়তে ত্রুটি হয়েছে', 'error');
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.category || !formData.videoLink) {
            showNotification('অনুগ্রহ করে সমস্ত ফিল্ড পূরণ করুন', 'error');
            return;
        }

        // Validate video URL
        try {
            new URL(formData.videoLink);
        } catch (error) {
            showNotification('অনুগ্রহ করে একটি বৈধ URL প্রদান করুন', 'error');
            return;
        }

        setIsUploading(true);

        try {
            const videoData = {
                title: formData.title,
                category: formData.category,
                videoLink: formData.videoLink
            };

            // Determine API endpoint and method based on edit mode
            const url = isEditing 
                ? `https://monprova-server.vercel.app/api/videos/${editingId}`
                : 'https://monprova-server.vercel.app/api/videos';
            
            const method = isEditing ? 'PUT' : 'POST';

            // Save video data to MongoDB
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(videoData)
            });

            const result = await response.json();

            if (result.success) {
                showNotification(isEditing ? 'ভিডিও সফলভাবে আপডেট হয়েছে!' : 'ভিডিও সফলভাবে আপলোড হয়েছে!', 'success');

                setFormData({
                    title: '',
                    author: '',
                    thumbnail: null,
                    thumbnailUrl: '',
                    slug: '',
                    content: '',
                    category: '',
                    videoLink: ''
                });
                setUploadType(null);
                setIsEditing(false);
                setEditingId(null);
            } else {
                showNotification(`ভিডিও সংরক্ষণ ব্যর্থ: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting video:', error);
            showNotification('ভিডিও আপলোড করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Allow skipping thumbnail upload if editing and thumbnail already exists
        if (!formData.thumbnail && !isEditing) {
            showNotification('অনুগ্রহ করে একটি থাম্বনেইল নির্বাচন করুন', 'error');
            return;
        }

        setIsUploading(true);

        try {
            let thumbnailUrl = formData.thumbnailUrl;
            
            // Upload new thumbnail only if a new file is selected
            if (formData.thumbnail) {
                thumbnailUrl = await uploadToImageBB(formData.thumbnail);
            }

            const blogData = {
                title: formData.title,
                author: formData.author,
                thumbnail: thumbnailUrl,
                slug: formData.slug,
                content: formData.content,
                category: formData.category
            };

            // Determine API endpoint and method based on edit mode
            const url = isEditing 
                ? `https://monprova-server.vercel.app/api/blogs/${editingId}`
                : 'https://monprova-server.vercel.app/api/blogs';
            
            const method = isEditing ? 'PUT' : 'POST';

            // Save blog data to MongoDB
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blogData)
            });

            const result = await response.json();

            if (result.success) {
                showNotification(isEditing ? 'ব্লগ সফলভাবে আপডেট হয়েছে!' : 'ব্লগ সফলভাবে আপলোড হয়েছে!', 'success');

                setFormData({
                    title: '',
                    author: '',
                    thumbnail: null,
                    thumbnailUrl: '',
                    slug: '',
                    content: '',
                    category: '',
                    videoLink: ''
                });
                setUploadType(null);
                setIsEditing(false);
                setEditingId(null);
            } else {
                showNotification(`ব্লগ সংরক্ষণ ব্যর্থ: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting blog:', error);
            showNotification('ব্লগ আপলোড করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">রিসোর্স ম্যানেজমেন্ট</h1>

                {activeSection === null && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Upload Resource Button */}
                        <button
                            onClick={() => setActiveSection('upload')}
                            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                        >
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-full group-hover:from-blue-600 group-hover:to-indigo-700 transition-all">
                                    <FaUpload className="text-4xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">রিসোর্স আপলোড</h2>
                                <p className="text-gray-600 text-center">নতুন ব্লগ বা ভিডিও আপলোড করুন</p>
                            </div>
                        </button>

                        {/* View Previous Resources Button */}
                        <button
                            onClick={() => setActiveSection('view')}
                            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                        >
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-full group-hover:from-green-600 group-hover:to-teal-700 transition-all">
                                    <FaEye className="text-4xl" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">পূর্ববর্তী রিসোর্স দেখুন</h2>
                                <p className="text-gray-600 text-center">আগের ব্লগ এবং ভিডিও দেখুন</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Upload Resource Section */}
                {activeSection === 'upload' && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <button
                            onClick={() => {
                                setActiveSection(null);
                                setUploadType(null);
                                setIsEditing(false);
                                setEditingId(null);
                                setFormData({
                                    title: '',
                                    author: '',
                                    thumbnail: null,
                                    thumbnailUrl: '',
                                    slug: '',
                                    content: '',
                                    category: '',
                                    videoLink: ''
                                });
                            }}
                            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                        >
                            ← ফিরে যান
                        </button>

                        {uploadType === null && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">আপলোড করুন</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Upload Blog Button */}
                                    <button
                                        onClick={() => setUploadType('blog')}
                                        className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-indigo-700 transition"
                                    >
                                        <div className="text-4xl mb-3">📝</div>
                                        <h3 className="text-xl font-bold">ব্লগ আপলোড</h3>
                                        <p className="text-sm mt-2">নতুন ব্লগ পোস্ট যোগ করুন</p>
                                    </button>

                                    {/* Upload Video Button */}
                                    <button
                                        onClick={() => setUploadType('video')}
                                        className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-pink-700 transition"
                                    >
                                        <div className="text-4xl mb-3">🎥</div>
                                        <h3 className="text-xl font-bold">ভিডিও আপলোড</h3>
                                        <p className="text-sm mt-2">নতুন ভিডিও যোগ করুন</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Blog Upload Form */}
                        {uploadType === 'blog' && (
                            <div>
                                <button
                                    onClick={() => {
                                        setUploadType(null);
                                        setIsEditing(false);
                                        setEditingId(null);
                                        setFormData({
                                            title: '',
                                            author: '',
                                            thumbnail: null,
                                            thumbnailUrl: '',
                                            slug: '',
                                            content: '',
                                            category: '',
                                            videoLink: ''
                                        });
                                    }}
                                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm"
                                >
                                    ← আপলোড পৃষ্ঠায় ফিরুন
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    {isEditing ? 'ব্লগ সম্পাদনা করুন' : 'ব্লগ আপলোড করুন'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Blog Title */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">ব্লগ শিরোনাম *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="ব্লগ শিরোনাম লিখুন"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Author Name */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">লেখকের নাম *</label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleInputChange}
                                            placeholder="লেখকের নাম লিখুন"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Thumbnail */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">থাম্বনেইল (ImageBB-তে আপলোড হবে) {!isEditing && '*'}</label>
                                        <input
                                            type="file"
                                            name="thumbnail"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required={!isEditing}
                                            disabled={isUploading}
                                        />
                                        {formData.thumbnail && (
                                            <p className="text-sm text-green-600 mt-2">✓ নতুন থাম্বনেইল নির্বাচিত: {formData.thumbnail.name}</p>
                                        )}
                                        {isEditing && formData.thumbnailUrl && !formData.thumbnail && (
                                            <div className="mt-3">
                                                <p className="text-sm text-blue-600 mb-2">বর্তমান থাম্বনেইল:</p>
                                                <img src={formData.thumbnailUrl} alt="Current thumbnail" className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">{isEditing ? 'নতুন থাম্বনেইল আপলোড করতে চাইলে নির্বাচন করুন (ঐচ্ছিক)' : 'ImageBB-তে আপলোড করা হবে'}</p>
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">স্লাগ *</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            placeholder="blog-slug-example"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">URL-বান্ধব স্লাগ (শুধুমাত্র ছোট অক্ষর এবং হাইফেন)</p>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">ক্যাটাগরি *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                            <option value="স্বাস্থ্য">স্বাস্থ্য</option>
                                            <option value="মানসিক স্বাস্থ্য">মানসিক স্বাস্থ্য</option>
                                            <option value="পুষ্টি">পুষ্টি</option>

                                            <option value="অন্যান্য">অন্যান্য</option>
                                        </select>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">বিষয়বস্তু *</label>
                                        <textarea
                                            name="content"
                                            value={formData.content}
                                            onChange={handleInputChange}
                                            placeholder="ব্লগের বিষয়বস্তু লিখুন"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            rows="10"
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'আপলোড হচ্ছে...' : (isEditing ? 'ব্লগ আপডেট করুন' : 'ব্লগ আপলোড করুন')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Video Upload Form */}
                        {uploadType === 'video' && (
                            <div>
                                <button
                                    onClick={() => {
                                        setUploadType(null);
                                        setIsEditing(false);
                                        setEditingId(null);
                                        setFormData({
                                            title: '',
                                            author: '',
                                            thumbnail: null,
                                            thumbnailUrl: '',
                                            slug: '',
                                            content: '',
                                            category: '',
                                            videoLink: ''
                                        });
                                    }}
                                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm"
                                >
                                    ← আপলোড পৃষ্ঠায় ফিরুন
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    {isEditing ? 'ভিডিও সম্পাদনা করুন' : 'ভিডিও আপলোড করুন'}
                                </h2>
                                <form onSubmit={handleVideoSubmit} className="space-y-6">
                                    {/* Video Title */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">ভিডিও শিরোনাম *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="ভিডিও শিরোনাম লিখুন"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Video Category */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">ক্যাটাগরি *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                            <option value="স্বাস্থ্য">স্বাস্থ্য</option>
                                            <option value="মানসিক স্বাস্থ্য">মানসিক স্বাস্থ্য</option>
                                            <option value="পুষ্টি">পুষ্টি</option>
                                            <option value="অন্যান্য">অন্যান্য</option>
                                        </select>
                                    </div>

                                    {/* Video Link */}
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">ভিডিও লিঙ্ক (YouTube/Vimeo) *</label>
                                        <input
                                            type="url"
                                            name="videoLink"
                                            value={formData.videoLink}
                                            onChange={handleInputChange}
                                            placeholder="https://youtube.com/watch?v=... অথবা ভিডিও URL"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                        <p className="text-sm text-gray-500 mt-1">YouTube বা অন্য ভিডিও প্ল্যাটফর্মের সম্পূর্ণ URL যোগ করুন</p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'আপলোড হচ্ছে...' : (isEditing ? 'ভিডিও আপডেট করুন' : 'ভিডিও আপলোড করুন')}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* View Resources Section */}
                {activeSection === 'view' && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <button
                            onClick={() => {
                                setActiveSection(null);
                                setViewType(null);
                            }}
                            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                        >
                            ← ফিরে যান
                        </button>

                        {viewType === null && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">পূর্ববর্তী রিসোর্স দেখুন</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* View Blogs Button */}
                                    <button
                                        onClick={() => setViewType('blog')}
                                        className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-indigo-700 transition"
                                    >
                                        <div className="text-4xl mb-3">📝</div>
                                        <h3 className="text-xl font-bold">ব্লগ দেখুন</h3>
                                        <p className="text-sm mt-2">সমস্ত ব্লগ তালিকা</p>
                                    </button>

                                    {/* View Videos Button */}
                                    <button
                                        onClick={() => setViewType('video')}
                                        className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-pink-700 transition"
                                    >
                                        <div className="text-4xl mb-3">🎥</div>
                                        <h3 className="text-xl font-bold">ভিডিও দেখুন</h3>
                                        <p className="text-sm mt-2">সমস্ত ভিডিও তালিকা</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* View Blogs */}
                        {viewType === 'blog' && (
                            <div>
                                <button
                                    onClick={() => setViewType(null)}
                                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm"
                                >
                                    ← ফিরুন
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">সমস্ত ব্লগ ({blogs.length})</h2>
                                
                                {loading ? (
                                    <div className="text-center py-6 text-gray-600">লোড হচ্ছে...</div>
                                ) : blogs.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 px-4 py-2 text-left">শিরোনাম</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">লেখক</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">ক্যাটাগরি</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-center">পদক্ষেপ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {blogs.map((blog) => (
                                                    <tr key={blog._id} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 px-4 py-3">{blog.title}</td>
                                                        <td className="border border-gray-300 px-4 py-3">{blog.author}</td>
                                                        <td className="border border-gray-300 px-4 py-3">{blog.category}</td>
                                                        <td className="border border-gray-300 px-4 py-3 text-center">
                                                            <button 
                                                                onClick={() => handleEditBlog(blog)}
                                                                className="text-blue-600 hover:text-blue-800 mr-3" 
                                                                title="সম্পাদনা"
                                                            >
                                                                <FaEdit className="inline-block" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteBlog(blog._id)}
                                                                className="text-red-600 hover:text-red-800" 
                                                                title="মুছুন"
                                                            >
                                                                <FaTrash className="inline-block" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-600">কোন ব্লগ পাওয়া যায়নি</div>
                                )}
                            </div>
                        )}

                        {/* View Videos */}
                        {viewType === 'video' && (
                            <div>
                                <button
                                    onClick={() => setViewType(null)}
                                    className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm"
                                >
                                    ← ফিরুন
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">সমস্ত ভিডিও ({videos.length})</h2>
                                
                                {loading ? (
                                    <div className="text-center py-6 text-gray-600">লোড হচ্ছে...</div>
                                ) : videos.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 px-4 py-2 text-left">শিরোনাম</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">ক্যাটাগরি</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-left">ভিডিও লিঙ্ক</th>
                                                    <th className="border border-gray-300 px-4 py-2 text-center">পদক্ষেপ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {videos.map((video) => (
                                                    <tr key={video._id} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 px-4 py-3">{video.title}</td>
                                                        <td className="border border-gray-300 px-4 py-3">{video.category}</td>
                                                        <td className="border border-gray-300 px-4 py-3">
                                                            <a 
                                                                href={video.videoLink} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline truncate block w-48"
                                                                title={video.videoLink}
                                                            >
                                                                {video.videoLink.substring(0, 40)}...
                                                            </a>
                                                        </td>
                                                        <td className="border border-gray-300 px-4 py-3 text-center">
                                                            <button 
                                                                onClick={() => handleEditVideo(video)}
                                                                className="text-blue-600 hover:text-blue-800 mr-3" 
                                                                title="সম্পাদনা"
                                                            >
                                                                <FaEdit className="inline-block" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteVideo(video._id)}
                                                                className="text-red-600 hover:text-red-800" 
                                                                title="মুছুন"
                                                            >
                                                                <FaTrash className="inline-block" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-600">কোন ভিডিও পাওয়া যায়নি</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Notification Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`flex items-center gap-3 min-w-[320px] max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
                            notification.type === 'success'
                                ? 'bg-green-50 border-l-4 border-green-500'
                                : 'bg-red-50 border-l-4 border-red-500'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            {notification.type === 'success' ? (
                                <FaCheckCircle className="text-green-500 text-2xl" />
                            ) : (
                                <FaExclamationCircle className="text-red-500 text-2xl" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-opacity-20 transition-colors ${
                                notification.type === 'success'
                                    ? 'text-green-600 hover:bg-green-600'
                                    : 'text-red-600 hover:bg-red-600'
                            }`}
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminResources;
