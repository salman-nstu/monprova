import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';

const useNotifications = () => {
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading, refetch } = useQuery({
        queryKey: ['notifications', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/api/notifications/${user.email}`)
            return res.data;
        },
        enabled: !!user?.email,
        refetchInterval: 30000,
    });

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notificationsUnreadCount', user?.email],
        queryFn: async () => {
            if (!user?.email) return 0;
            const res = await axiosSecure.get(`/api/notifications/${user.email}/unread-count`);
            return res.data.count;
        },
        enabled: !!user?.email,
        refetchInterval: 30000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId) => {
            return await axiosSecure.patch(`/api/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notificationsUnreadCount']);
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            return await axiosSecure.patch(`/api/notifications/${user.email}/read-all`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notificationsUnreadCount']);
        },
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: async (notificationId) => {
            return await axiosSecure.delete(`/api/notifications/${notificationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notificationsUnreadCount']);
        },
    });

    const createNotificationMutation = useMutation({
        mutationFn: async (notificationData) => {
            return await axiosSecure.post('/api/notifications', notificationData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notificationsUnreadCount']);
        },
    });

    return {
        notifications,
        unreadCount,
        isLoading,
        refetch,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        deleteNotification: deleteNotificationMutation.mutate,
        createNotification: createNotificationMutation.mutate,
    };
};

export default useNotifications;