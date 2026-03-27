import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";


const useQuestion = () => {
   const axiosSecure = useAxiosSecure();
   const {data: questions=[], refetch} = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
        const res = await axiosSecure.get('/api/questions')
        return res.data
    }
   })
   return [questions, refetch]
};

export default useQuestion;