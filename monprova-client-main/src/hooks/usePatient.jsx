import React from 'react';
import useAxiosSecure from './useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const usePatient = () => {
    const axiosSecure = useAxiosSecure();
    const { data: patients = [] , refetch} = useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            const res = await axiosSecure.get('/api/patients', {
                headers : {
                    authorization: `Bearer ${localStorage.getItem('access-token')}`
                }
            })
            return res.data
        }
    })
    return [patients, refetch]
};

export default usePatient;