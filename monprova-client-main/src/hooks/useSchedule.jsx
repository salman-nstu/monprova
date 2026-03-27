import React from 'react';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const useSchedule = () => {
    const axiosSecure = useAxiosSecure();
    const { data: schedules = [], refetch } = useQuery({
        queryKey: ['schedules'],
        queryFn: async () => {
            const res = await axiosSecure.get('/api/schedules')
            return res.data
        }
    })
    return [schedules, refetch];
};

export default useSchedule;