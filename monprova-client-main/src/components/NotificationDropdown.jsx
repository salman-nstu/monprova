import React from 'react';
import { FaBell, FaCheckCircle, FaTrash, FaTimes } from 'react-icons/fa';
import useNotifications from "../hooks/useNotifications";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
        return '📅';
      case 'appointment_reminder':
        return '⏰';
      case 'appointment_completed':
        return '✅';
      case 'prescription':
        return '💊';
      case 'help_reply':
        return '💬';
      case 'payout':
        return '💰';
      case 'session_link':
        return '🔗';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'এইমাত্র';
    if (diffInMins < 60) return `${diffInMins} মিনিট আগে`;
    if (diffInHours < 24) return `${diffInHours} ঘন্টা আগে`;
    if (diffInDays < 7) return `${diffInDays} দিন আগে`;
    return date.toLocaleDateString('bn-BD');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <FaBell className="text-xl" />
            <h3 className="font-bold text-lg">বিজ্ঞপ্তি</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 font-semibold"
            >
              <FaCheckCircle /> সব পড়া হয়েছে চিহ্নিত করুন
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaBell className="text-5xl mx-auto mb-3 text-gray-300" />
              <p className="text-lg">কোন বিজ্ঞপ্তি নেই</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="পড়া হয়েছে চিহ্নিত করুন"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="মুছে ফেলুন"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
