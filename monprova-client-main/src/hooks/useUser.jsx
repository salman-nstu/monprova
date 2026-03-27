import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useAxiosPublic from "./useAxiosPublic";


const useUser = () => {
   const axiosPublic = useAxiosPublic();
   const {data: users=[]} = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
        const res = await axiosPublic.get('/api/users')
        return res.data
    }
   })
   return [users]
};

export default useUser;