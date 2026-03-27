import React from 'react';
import PageCover from '../shared/PageCover';
import useBlogs from '../../hooks/useBlogs';
import BlogCard from '../../components/cards/BlogCard';

const BlogList = () => {
    const [blogs] = useBlogs()
    return (
        <div>
            <PageCover coverTitle="আমাদের ব্লগসমুহ" coverSubtitle="আপনার মানসিক স্বাস্থ্য সম্পর্কিত ব্লগ পড়ুন" coverImg="https://i.ibb.co.com/CsbSwPgp/thought-catalog-505eect-W54k-unsplash.jpg"></PageCover>
            <div className="grid grid-cols-3 gap-12 mx-auto px-0 mt-16">
                {
                    blogs.map(blog => <BlogCard key={blog.id} blog={blog}></BlogCard>)
                }
            </div>
        </div>
    );
};

export default BlogList;
