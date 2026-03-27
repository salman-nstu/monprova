import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';

const usePayout = (doctorId = null) => {
    const axiosSecure = useAxiosSecure();
    
    const { data: payouts = [], isLoading, refetch } = useQuery({
        queryKey: ['payouts', doctorId],
        queryFn: async () => {
            const url = doctorId ? `/api/payouts?doctorId=${doctorId}` : '/api/payouts';
            const res = await axiosSecure.get(url);
            return res.data;
        }
    });
    
    return { payouts, isLoading, refetch };
};

export default usePayout;
