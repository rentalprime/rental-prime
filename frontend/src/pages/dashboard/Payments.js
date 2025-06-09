import React, { useState, useEffect } from 'react';
import { 
  RiSearchLine, 
  RiFilterLine, 
  RiDownloadLine,
  RiEyeLine
} from 'react-icons/ri';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch payments on component mount
  useEffect(() => {
    // Mock data for demonstration
    const mockPayments = [
      {
        _id: '1',
        transactionId: 'TRX-12345',
        user: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        amount: 1999,
        plan: 'Premium Monthly',
        status: 'completed',
        paymentMethod: 'UPI',
        date: '2023-05-15T10:30:00Z'
      },
      {
        _id: '2',
        transactionId: 'TRX-12346',
        user: 'Priya Sharma',
        email: 'priya@example.com',
        amount: 19999,
        plan: 'Premium Yearly',
        status: 'completed',
        paymentMethod: 'Net Banking',
        date: '2023-05-14T14:45:00Z'
      },
      {
        _id: '3',
        transactionId: 'TRX-12347',
        user: 'Vikram Singh',
        email: 'vikram@example.com',
        amount: 1999,
        plan: 'Premium Monthly',
        status: 'failed',
        paymentMethod: 'Credit Card',
        date: '2023-05-13T09:15:00Z'
      },
      {
        _id: '4',
        transactionId: 'TRX-12348',
        user: 'Anita Patel',
        email: 'anita@example.com',
        amount: 999,
        plan: 'Basic Monthly',
        status: 'completed',
        paymentMethod: 'Debit Card',
        date: '2023-05-12T16:20:00Z'
      },
      {
        _id: '5',
        transactionId: 'TRX-12349',
        user: 'Sanjay Gupta',
        email: 'sanjay@example.com',
        amount: 9999,
        plan: 'Basic Yearly',
        status: 'refunded',
        paymentMethod: 'UPI',
        date: '2023-05-10T11:10:00Z'
      }
    ];

    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter payments based on search term and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Date filter logic
    let matchesDate = true;
    const paymentDate = new Date(payment.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastMonthStart = new Date(today);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    
    if (dateFilter === 'today') {
      matchesDate = paymentDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      matchesDate = paymentDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === 'last7days') {
      matchesDate = paymentDate >= lastWeekStart;
    } else if (dateFilter === 'last30days') {
      matchesDate = paymentDate >= lastMonthStart;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format amount with currency (Indian Rupee)
  const formatAmount = (amount) => {
    // Display amount directly in INR
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total revenue from filtered payments
  const totalRevenue = filteredPayments
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
        <button className="btn-outline flex items-center">
          <RiDownloadLine className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatAmount(totalRevenue)}</p>
          <p className="mt-1 text-sm text-gray-500">From {filteredPayments.filter(p => p.status === 'completed').length} successful payments</p>
        </div>
        
        <div className="card-glass">
          <h3 className="text-sm font-medium text-gray-500">Successful Payments</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {filteredPayments.filter(p => p.status === 'completed').length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {Math.round((filteredPayments.filter(p => p.status === 'completed').length / filteredPayments.length) * 100)}% success rate
          </p>
        </div>
        
        <div className="card-glass">
          <h3 className="text-sm font-medium text-gray-500">Failed/Refunded</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {filteredPayments.filter(p => p.status === 'failed' || p.status === 'refunded').length}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {Math.round((filteredPayments.filter(p => p.status === 'failed' || p.status === 'refunded').length / filteredPayments.length) * 100)}% of total
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, user or email..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="w-40">
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="input pl-10 appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          <div className="w-40">
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="input pl-10 appearance-none"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No payments found matching your criteria
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 card-glass">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.user}</div>
                    <div className="text-sm text-gray-500">{payment.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatAmount(payment.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(payment.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      <RiEyeLine className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
