import React from 'react';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useAdmin = () => {
    const axiosPublic = useAxiosPublic();
    const { data: admins = [], refetch } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const res = await axiosPublic.get('/api/admins')
            return res.data
        }
    })
    return [admins, refetch]
};

export default useAdmin;