import React from 'react';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useDoctor = () => {
    const axiosPublic = useAxiosPublic();
    const { data: doctors = [], refetch } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            const res = await axiosPublic.get('/api/doctors')
            return res.data
        }
    })
    return [doctors, refetch]
};

export default useDoctor;