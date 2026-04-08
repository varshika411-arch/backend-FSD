import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { useApp } from '../../contexts/AppContext';
import { Badge } from '../ui/badge';
export function Notifications() {
  const {
    notifications,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification
  } = useApp();
  const getTypeColor = type => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  const getTypeIcon = type => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };
  const handleMarkAsRead = id => {
    markNotificationAsRead(id);
  };
  const handleDelete = id => {
    deleteNotification(id);
    toast.success('Notification deleted');
  };
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  return <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h3>
            <p className="text-gray-600">
              Stay updated with your achievements and events
              {unreadCount > 0 && <Badge className="ml-2 bg-red-100 text-red-800">
                  {unreadCount} new
                </Badge>}
            </p>
          </div>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>}
        </div>

        {notifications.length === 0 ? <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Notifications</h4>
            <p className="text-gray-500">You're all caught up!</p>
          </div> : <div className="space-y-3">
            {notifications.map(notification => <div key={notification.id} className={`border rounded-lg p-4 transition-all ${getTypeColor(notification.type)} ${!notification.read ? 'shadow-md border-l-4' : 'opacity-75'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.read && <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0">
                        {!notification.read && <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)} className="h-8 w-8 p-0" title="Mark as read">
                            <Check className="h-4 w-4" />
                          </Button>}
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)} className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Notification Types</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span><strong>Info:</strong> General updates and information</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span><strong>Success:</strong> Achievement approvals and completions</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span><strong>Warning:</strong> Items requiring attention</span>
          </div>
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span><strong>Error:</strong> Important alerts and rejections</span>
          </div>
        </div>
      </div>
    </div>;
}
