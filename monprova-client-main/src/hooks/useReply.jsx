import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";


const useReply = () => {
   const axiosSecure = useAxiosSecure();
   const {data: replies=[], refetch} = useQuery({
    queryKey: ['replies'],
    queryFn: async () => {
        const res = await axiosSecure.get('/api/replies')
        return res.data
    }
   })
   return [replies, refetch]
};

export default useReply;