import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RiNotification3Line,
  RiCheckLine,
  RiDeleteBinLine,
  RiFilterLine,
  RiSearchLine,
  RiSettings3Line
} from 'react-icons/ri';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newUserSignup: true,
    newListing: true,
    newPayment: true,
    systemAlerts: true
  });

  // Fetch notifications on component mount
  useEffect(() => {
    // Mock data for demonstration
    const mockNotifications = [
      {
        _id: '1',
        title: 'New User Registration',
        message: 'John Doe has registered as a new user.',
        type: 'user',
        read: false,
        createdAt: '2023-05-15T10:30:00Z'
      },
      {
        _id: '2',
        title: 'New Listing Added',
        message: 'A new property "Modern Apartment in Downtown" has been listed.',
        type: 'listing',
        read: false,
        createdAt: '2023-05-14T14:45:00Z'
      },
      {
        _id: '3',
        title: 'Payment Received',
        message: 'Payment of $29.99 received from Jane Smith for Premium subscription.',
        type: 'payment',
        read: true,
        createdAt: '2023-05-13T09:15:00Z'
      },
      {
        _id: '4',
        title: 'System Update',
        message: 'The system will undergo maintenance on May 20, 2023 at 2:00 AM UTC.',
        type: 'system',
        read: false,
        createdAt: '2023-05-12T16:20:00Z'
      },
      {
        _id: '5',
        title: 'New Support Ticket',
        message: 'Michael Wilson has opened a new support ticket regarding payment issues.',
        type: 'support',
        read: true,
        createdAt: '2023-05-10T11:10:00Z'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification => 
      notification._id === notificationId 
        ? { ...notification, read: true } 
        : notification
    );
    
    setNotifications(updatedNotifications);
    toast.success('Notification marked as read');
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(notification => 
      notification._id !== notificationId
    );
    
    setNotifications(updatedNotifications);
    toast.success('Notification deleted');
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => 
      ({ ...notification, read: true })
    );
    
    setNotifications(updatedNotifications);
    toast.success('All notifications marked as read');
  };

  // Delete all read notifications
  const deleteAllRead = () => {
    const updatedNotifications = notifications.filter(notification => 
      !notification.read
    );
    
    setNotifications(updatedNotifications);
    toast.success('All read notifications deleted');
  };

  // Handle notification settings change
  const handleSettingsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  // Save notification settings
  const saveSettings = () => {
    // In a real application, this would send to the API
    toast.success('Notification settings saved');
    setShowSettings(false);
  };

  // Filter notifications based on search term and type filter
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user':
        return <div className="bg-blue-100 p-2 rounded-full text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'listing':
        return <div className="bg-green-100 p-2 rounded-full text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'payment':
        return <div className="bg-purple-100 p-2 rounded-full text-purple-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'system':
        return <div className="bg-red-100 p-2 rounded-full text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'support':
        return <div className="bg-yellow-100 p-2 rounded-full text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
          </svg>
        </div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full text-gray-500">
          <RiNotification3Line className="h-5 w-5" />
        </div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex space-x-2">
          <button 
            className="btn-outline flex items-center"
            onClick={() => setShowSettings(!showSettings)}
          >
            <RiSettings3Line className="mr-2" />
            Settings
          </button>
          <button 
            className="btn-outline flex items-center"
            onClick={markAllAsRead}
          >
            <RiCheckLine className="mr-2" />
            Mark All Read
          </button>
          <button 
            className="btn-outline flex items-center"
            onClick={deleteAllRead}
          >
            <RiDeleteBinLine className="mr-2" />
            Clear Read
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <div className="card-glass">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                name="pushNotifications"
                checked={notificationSettings.pushNotifications}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                Push Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newUserSignup"
                name="newUserSignup"
                checked={notificationSettings.newUserSignup}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="newUserSignup" className="ml-2 block text-sm text-gray-700">
                New User Signups
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newListing"
                name="newListing"
                checked={notificationSettings.newListing}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="newListing" className="ml-2 block text-sm text-gray-700">
                New Listings
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newPayment"
                name="newPayment"
                checked={notificationSettings.newPayment}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="newPayment" className="ml-2 block text-sm text-gray-700">
                Payment Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="systemAlerts"
                name="systemAlerts"
                checked={notificationSettings.systemAlerts}
                onChange={handleSettingsChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-700">
                System Alerts
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="btn-outline mr-2"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              className="btn-primary"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-64">
          <div className="relative">
            <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="input pl-10 appearance-none"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="user">User</option>
              <option value="listing">Listing</option>
              <option value="payment">Payment</option>
              <option value="system">System</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications found matching your criteria
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`card-glass hover:shadow-lg transition-shadow duration-300 ${
                notification.read ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                      >
                        <RiCheckLine className="mr-1" />
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <RiDeleteBinLine className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
