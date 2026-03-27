import { useEffect, useState } from "react";
import useAxiosPublic from "./useAxiosPublic";
import { useQuery } from "@tanstack/react-query";


const useBlogs = () => {
    const axiosPublic = useAxiosPublic();
    const { data: blogs = [] } = useQuery({
        queryKey: ['blogs'],
        queryFn: async () => {
            const res = await axiosPublic.get('/api/blogs')
            return res.data
        }
    })
    return [blogs]
};

export default useBlogs;