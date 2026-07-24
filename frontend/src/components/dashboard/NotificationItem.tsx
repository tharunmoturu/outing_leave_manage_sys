import React from 'react';
import { CheckCircle2, XCircle, Bell } from 'lucide-react';

export interface Notification {
  _id: string;
  studentId: string;
  outingId: string;
  type: 'APPROVED' | 'REJECTED' | string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays}d ago`;
  };

  const getIcon = () => {
    if (notification.type === 'APPROVED') {
      return <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={18} />;
    }
    if (notification.type === 'REJECTED') {
      return <XCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />;
    }
    return <Bell className="text-blue-500 mt-1 flex-shrink-0" size={18} />;
  };

  return (
    <div className={`p-4 border-b border-gray-100 flex gap-3 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className={`text-[14px] font-bold truncate pr-2 ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </h4>
          <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className={`text-[13px] line-clamp-2 ${!notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
          {notification.message}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
      )}
    </div>
  );
};
