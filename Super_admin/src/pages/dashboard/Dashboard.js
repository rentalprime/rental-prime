import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiUserLine,
  RiListCheck,
  RiMoneyDollarCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiEyeLine,
} from "react-icons/ri";
import userService from "../../services/userService";
import vendorListingService from "../../services/vendorListingService";
import eventBus, { EVENTS } from "../../utils/eventBus";

const recentActivities = [
  {
    id: 1,
    user: "John Doe",
    action: "created a new listing",
    item: "Luxury Apartment in Downtown",
    time: "2 hours ago",
    avatar:
      "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "updated her profile",
    item: "",
    time: "4 hours ago",
    avatar:
      "https://ui-avatars.com/api/?name=Jane+Smith&background=8A0DAB&color=fff",
  },
  {
    id: 3,
    user: "Robert Johnson",
    action: "subscribed to",
    item: "Premium Plan",
    time: "6 hours ago",
    avatar:
      "https://ui-avatars.com/api/?name=Robert+Johnson&background=0DAB3E&color=fff",
  },
  {
    id: 4,
    user: "Emily Davis",
    action: "posted a review for",
    item: "Beach House Rental",
    time: "12 hours ago",
    avatar:
      "https://ui-avatars.com/api/?name=Emily+Davis&background=AB0D0D&color=fff",
  },
  {
    id: 5,
    user: "Michael Wilson",
    action: "requested support for",
    item: "payment issue",
    time: "1 day ago",
    avatar:
      "https://ui-avatars.com/api/?name=Michael+Wilson&background=0D8ABC&color=fff",
  },
];

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    loading: true,
    error: null,
  });

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setDashboardStats((prev) => ({ ...prev, loading: true, error: null }));

      const apiUrl =
        process.env.REACT_APP_API_URL ||
        "https://rental-prime-backend-8ilt.onrender.com";

      // Use Promise.all for parallel requests to improve performance
      const [usersResponse, listingsResponse] = await Promise.all([
        // Fetch users count only (optimized endpoint)
        fetch(`${apiUrl}/api/users/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        // Fetch vendor listings count only (optimized endpoint)
        fetch(`${apiUrl}/api/listings/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      let totalUsers = 0;
      let totalListings = 0;

      // Process users count response
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.count || 0;
      } else {
        console.error("Failed to fetch users count:", usersResponse.status);
        const errorData = await usersResponse.json().catch(() => ({}));
        console.error("Users count error details:", errorData);
      }

      // Process listings count response
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        totalListings = listingsData.count || 0;
      } else {
        console.error(
          "Failed to fetch listings count:",
          listingsResponse.status
        );
        const errorData = await listingsResponse.json().catch(() => ({}));
        console.error("Listings count error details:", errorData);
      }

      setDashboardStats({
        totalUsers,
        totalListings,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setDashboardStats((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard statistics",
      }));
    }
  };

  // Fetch data on component mount and set up event listeners
  useEffect(() => {
    fetchDashboardStats();

    // Listen for listing events to refresh dashboard
    const unsubscribeListingCreated = eventBus.on(
      EVENTS.LISTING_CREATED,
      () => {
        fetchDashboardStats();
      }
    );

    const unsubscribeListingUpdated = eventBus.on(
      EVENTS.LISTING_UPDATED,
      () => {
        fetchDashboardStats();
      }
    );

    const unsubscribeListingDeleted = eventBus.on(
      EVENTS.LISTING_DELETED,
      () => {
        fetchDashboardStats();
      }
    );

    const unsubscribeDashboardRefresh = eventBus.on(
      EVENTS.DASHBOARD_REFRESH,
      () => {
        fetchDashboardStats();
      }
    );

    // Cleanup event listeners on unmount
    return () => {
      unsubscribeListingCreated();
      unsubscribeListingUpdated();
      unsubscribeListingDeleted();
      unsubscribeDashboardRefresh();
    };
  }, []);

  // Create stats array with real data
  const stats = [
    {
      id: 1,
      title: "Total Users",
      value: dashboardStats.loading
        ? "Loading..."
        : dashboardStats.totalUsers.toLocaleString(),
      change: "+12.5%", // Keep static for now as we don't have historical data
      isPositive: true,
      icon: <RiUserLine className="w-6 h-6" />,
      color: "primary",
      link: "/users",
    },
    {
      id: 2,
      title: "Total Listings",
      value: dashboardStats.loading
        ? "Loading..."
        : dashboardStats.totalListings.toLocaleString(),
      change: "+8.2%", // Keep static for now as we don't have historical data
      isPositive: true,
      icon: <RiListCheck className="w-6 h-6" />,
      color: "secondary",
      link: "/listings",
    },
    {
      id: 3,
      title: "Monthly Revenue",
      value: "₹32,580", // Keep static as this requires payment data analysis
      change: "-2.4%",
      isPositive: false,
      icon: <RiMoneyDollarCircleLine className="w-6 h-6" />,
      color: "accent",
      link: "/payments",
    },
    {
      id: 4,
      title: "Total Views",
      value: "245,647", // Keep static as this requires analytics data
      change: "+18.7%",
      isPositive: true,
      icon: <RiEyeLine className="w-6 h-6" />,
      color: "primary",
      link: "/analytics",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div>
          <button className="btn-primary" onClick={fetchDashboardStats}>
            {dashboardStats.loading ? "Loading..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {dashboardStats.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {dashboardStats.error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.id}
            to={stat.link}
            className="card-glass hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800">
                  {stat.value}
                </h3>
                <div
                  className={`flex items-center mt-2 ${
                    stat.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.isPositive ? (
                    <RiArrowUpLine className="w-4 h-4 mr-1" />
                  ) : (
                    <RiArrowDownLine className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">{stat.change}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-500`}
              >
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card-neumorph">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Overview
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Revenue Chart Placeholder</p>
            {/* In a real application, you would use react-chartjs-2 or another charting library here */}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="card-neumorph">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            User Growth
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">User Growth Chart Placeholder</p>
            {/* In a real application, you would use react-chartjs-2 or another charting library here */}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card-glass">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Activities
          </h2>
          <Link
            to="/activities"
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src={activity.avatar}
                alt={activity.user}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                  {activity.item && (
                    <span className="font-medium"> {activity.item}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
