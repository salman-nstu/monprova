import React from 'react';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useComplaint = () => {
    const axiosPublic = useAxiosPublic();
    const { data: complaints = [], refetch } = useQuery({
        queryKey: ['complaints'],
        queryFn: async () => {
            const res = await axiosPublic.get('/api/complaints')
            return res.data
        }
    })
    return [complaints, refetch]
};

export default useComplaint;