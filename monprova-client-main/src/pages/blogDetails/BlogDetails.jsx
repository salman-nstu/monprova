import React from "react";
import { useParams, Link } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import useBlogs from "../../hooks/useBlogs";
import BackButton from "../../components/BackButton";

// blog data


const BlogDetails = () => {
    const [blogs] = useBlogs();
    const { blogId } = useParams();
    const { user } = useContext(AuthContext);

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center min-h-[400px]">

    //             <p className="text-center mt-10 text-lg text-gray-600"> Loading blog details...</p>
    //         </div>
    //     );
    // }
    const blog = blogs.find(blog => blog._id === blogId);

    if (!blog) {
        return (
            <div className="bg-[#EFF7FE] p-4">
                <div className="min-h-[850px] p-16 bg-white rounded-md ">
                    <p className="text-gray-500 text-lg">কোনো ব্লগ পাওয়া যায়নি।</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#EFF7FE] p-4">

            <div className="min-h-[850px] p-8 bg-white rounded-md mx-auto">
                <div className="my-4">
                  <BackButton destination ={user ? "/dashboardPatient/resources" : "/"}></BackButton>
                   
                </div>
                <div className="mb-8 ">
                    <img src={blog.thumbnail || ""} alt="" className="h-[480px] w-full object-cover rounded-md" />
                </div>
                <h1 className="text-3xl font-bold mb-6 text-blue-500 text-left">{blog.title}</h1>
                <div className="badge badge-error text-white bg-tertiary-color my-0">{blog.category}</div>
                <p className="font-semibold text-lg mb-4 text-left">Author: {blog.author}</p>
                
                <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-6 text-left">
                    {blog.content}
                </div>
            </div>
        </div>
    );
};

export default BlogDetails;