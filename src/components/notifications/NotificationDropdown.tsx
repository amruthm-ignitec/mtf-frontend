import React from 'react';
import { Bell, Clock, AlertCircle, CheckCircle, XCircle, Brain, Settings, UserCheck } from 'lucide-react';

interface Notification {
  id: string;
  type: 'new_donor' | 'review_required' | 'approval' | 'rejection' | 'ai_alert' | 'system_update' | 'task_assigned';
  message: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_donor',
    message: 'New donor case assigned: #1234',
    timestamp: '5 min ago',
    priority: 'high'
  },
  {
    id: '2',
    type: 'review_required',
    message: 'MS Tissue analysis requires review',
    timestamp: '10 min ago',
    priority: 'high'
  },
  {
    id: '3',
    type: 'approval',
    message: 'Dr. Smith approved tissue analysis',
    timestamp: '1 hour ago'
  },
  {
    id: '4',
    type: 'ai_alert',
    message: 'AI detected potential quality issue in CV tissue',
    timestamp: '2 hours ago',
    priority: 'medium'
  },
  {
    id: '5',
    type: 'task_assigned',
    message: 'You have been assigned to review case #5678',
    timestamp: '3 hours ago'
  },
  {
    id: '6',
    type: 'system_update',
    message: 'System maintenance scheduled for tonight',
    timestamp: '1 day ago',
    priority: 'low'
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_donor':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'review_required':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'approval':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'rejection':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'ai_alert':
      return <Brain className="w-4 h-4 text-purple-500" />;
    case 'system_update':
      return <Settings className="w-4 h-4 text-gray-500" />;
    case 'task_assigned':
      return <UserCheck className="w-4 h-4 text-indigo-500" />;
  }
};

export default function NotificationDropdown() {
  return (
    <div className="w-80 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
      <div className="px-4 py-2 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-medium text-gray-900">Notifications</h3>
          <span className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
            Mark all as read
          </span>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.map((notification) => (
          <div
            key={notification.id}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs text-gray-900">{notification.message}</p>
                <p className="text-[11px] text-gray-500">{notification.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t">
        <button className="text-xs text-center w-full text-blue-600 hover:text-blue-800">
          View all notifications
        </button>
      </div>
    </div>
  );
} 