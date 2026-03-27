import React from 'react';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const usePrescription = () => {
    const axiosSecure = useAxiosSecure();
    const { data: prescriptions = [], refetch } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: async () => {
            const res = await axiosSecure.get('/api/prescriptions')
            return res.data
        }
    })
    return [prescriptions, refetch]
};

export default usePrescription;