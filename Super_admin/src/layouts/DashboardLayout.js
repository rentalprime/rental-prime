import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiAdminLine, 
  RiPriceTag3Line, 
  RiListCheck, 
  RiMoneyDollarCircleLine, 
  RiSettings4Line, 
  RiNotification3Line, 
  RiCustomerService2Line,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiShieldUserLine,
  RiUserSettingsLine,
  RiLockLine
} from 'react-icons/ri';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);
  
  // Sample notifications data
  const notifications = [
    {
      title: 'New User Registration',
      message: 'Priya Sharma has registered as a new vendor',
      time: '2 hours ago',
      icon: <RiUserLine className="w-4 h-4" />
    },
    {
      title: 'New Listing Added',
      message: 'A new property has been added in Bangalore',
      time: '5 hours ago',
      icon: <RiListCheck className="w-4 h-4" />
    },
    {
      title: 'Payment Received',
      message: 'You received a payment of ₹19,999',
      time: 'Yesterday',
      icon: <RiMoneyDollarCircleLine className="w-4 h-4" />
    },
  ];
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close notifications dropdown when clicking outside
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Notifications"]')) {
        setShowNotifications(false);
      }
      
      // Close profile menu dropdown when clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="User menu"]')) {
        setShowProfileMenu(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Log user information for debugging
  console.log('Current user in DashboardLayout:', user);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Group menu items by section
  const menuSections = [
    {
      // title: 'Main',
      items: [
        { name: 'Dashboard', path: '/', icon: RiDashboardLine },
      ]
    },
    {
      title: 'Portal Management',
      items: [
        { name: 'User Management', path: '/users', icon: RiUserLine, description: 'Portal Users (Customers/Vendors)' },
        { name: 'Categories', path: '/categories', icon: RiPriceTag3Line },
        { name: 'Listings', path: '/listings', icon: RiListCheck },
      ]
    },
    {
      title: 'Billing',
      items: [
        { name: 'Payments', path: '/payments', icon: RiMoneyDollarCircleLine },
        { name: 'Plans', path: '/plans', icon: RiMoneyDollarCircleLine },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Notifications', path: '/notifications', icon: RiNotification3Line },
        { name: 'Support', path: '/support', icon: RiCustomerService2Line },
        { name: 'Settings', path: '/settings', icon: RiSettings4Line },
        { name: 'Admin Management', path: '/admins', icon: RiShieldUserLine, description: 'Manage Backend Admins' },
        { name: 'Role Management', path: '/roles', icon: RiLockLine, description: 'Manage System Roles' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-600 text-white transition-transform duration-300 transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-center h-16 border-b border-primary-700">
          <h1 className="text-xl font-bold">Rental Prima</h1>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="px-4 py-2 overflow-y-auto">
            <div className="space-y-6">
              {menuSections.map((section, sectionIndex) => {
                // Skip sections that require specific roles if user doesn't have access
                // For now, we'll show all sections for demonstration
                const hasSectionAccess = !section.role || (user?.role === section.role || user?.user_type === section.role);
                
                if (!hasSectionAccess) return null;
                
                return (
                  <div key={sectionIndex} className="space-y-2">
                    {/* Section header */}
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider px-3">
                      {section.title}
                    </h3>
                    
                    {/* Section menu items */}
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        // Check item-level access if needed
                        const hasItemAccess = !item.role || (user?.role === item.role || user?.user_type === item.role);
                        
                        if (!hasItemAccess) return null;
                        
                        return (
                          <li key={item.path} className="group">
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-white text-primary-700 shadow-md'
                                    : 'text-white hover:bg-primary-700'
                                }`
                              }
                              onClick={() => setSidebarOpen(false)}
                              title={item.description}
                            >
                              <span className="w-5 h-5 flex items-center justify-center">
                                {React.createElement(item.icon)}
                              </span>
                              <span className="ml-3">{item.name}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-primary-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RiLogoutBoxLine className="w-6 h-6" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
        {/* Top header */}
        <header className="flex items-center h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex justify-start flex-1">
            <button
              onClick={toggleSidebar}
              className="p-1 text-gray-700 rounded-md lg:hidden focus:outline-none"
            >
              {sidebarOpen ? (
                <RiCloseLine className="w-6 h-6" />
              ) : (
                <RiMenuLine className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Right side icons */}
          <div className="flex items-center justify-end space-x-4">
            {/* Notifications dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Notifications"
              >
                <RiNotification3Line className="w-6 h-6" />
              </button>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              
              {/* Notifications dropdown panel */}
              {showNotifications && (
                <div 
                  ref={notificationsRef}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                      <button className="text-xs text-primary-600 hover:text-primary-800">Mark all as read</button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">No new notifications</div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div 
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 bg-primary-100 text-primary-600 p-2 rounded-full">
                              {notification.icon}
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <Link to="/notifications" className="text-xs text-center block text-primary-600 hover:text-primary-800">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full"
                aria-label="User menu"
              >
                <div className="w-8 h-8 overflow-hidden bg-primary-600 rounded-full">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`}
                    alt="User"
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user?.name || 'User'}
                </span>
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div 
                  ref={profileMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
