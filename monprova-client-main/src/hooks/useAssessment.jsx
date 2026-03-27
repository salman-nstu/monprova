import React from 'react';
import useAxiosSecure from './useAxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from './useAuth';

const useAssessment = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch all assessments for current patient
    const { data: assessments = [], isLoading } = useQuery({
        queryKey: ['assessments', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/api/assessments?email=${user.email}`);
            return res.data?.data || [];
        },
        enabled: !!user?.email
    });

    // Fetch assessment history (last 30 days)
    const { data: assessmentHistory = [] } = useQuery({
        queryKey: ['assessmentHistory', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/api/assessments/history/30days?email=${user.email}`);
            return res.data?.data || [];
        },
        enabled: !!user?.email
    });

    // Create new assessment
    const createAssessmentMutation = useMutation({
        mutationFn: async (assessmentData) => {
            const res = await axiosSecure.post('/api/assessments', assessmentData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments', user?.email] });
            queryClient.invalidateQueries({ queryKey: ['assessmentHistory', user?.email] });
        }
    });

    // Get assessment by ID
    const getAssessmentById = async (assessmentId) => {
        const res = await axiosSecure.get(`/api/assessments/${assessmentId}`);
        return res.data?.data;
    };

    // Update assessment
    const updateAssessmentMutation = useMutation({
        mutationFn: async ({ assessmentId, data }) => {
            const res = await axiosSecure.put(`/api/assessments/${assessmentId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments', user?.email] });
            queryClient.invalidateQueries({ queryKey: ['assessmentHistory', user?.email] });
        }
    });

    // Delete assessment
    const deleteAssessmentMutation = useMutation({
        mutationFn: async (assessmentId) => {
            const res = await axiosSecure.delete(`/api/assessments/${assessmentId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments', user?.email] });
            queryClient.invalidateQueries({ queryKey: ['assessmentHistory', user?.email] });
        }
    });

    return {
        assessments,
        assessmentHistory,
        isLoading,
        createAssessment: createAssessmentMutation.mutateAsync,
        getAssessmentById,
        updateAssessment: updateAssessmentMutation.mutateAsync,
        deleteAssessment: deleteAssessmentMutation.mutateAsync,
        isCreating: createAssessmentMutation.isPending,
        isUpdating: updateAssessmentMutation.isPending,
        isDeleting: deleteAssessmentMutation.isPending
    };
};

export default useAssessment;
