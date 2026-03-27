import { useEffect, useState } from "react";
import useAxiosSecure from "./useAxiosSecure";
import { useQuery } from "@tanstack/react-query";


const useDoctors = () => {
    const axiosSecure = useAxiosSecure();
    const { data: doctors = [] } = useQuery({
        queryKey: ['doctors'],
        queryFn: async () => {
            const res = await axiosSecure.get('/api/doctors')
            return res.data
        }
    })
    return [doctors]
};

export default useDoctors;