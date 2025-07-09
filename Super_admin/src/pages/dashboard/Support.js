import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RiCustomerService2Line,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiMailSendLine,
  RiCheckLine,
  RiTimeLine
} from 'react-icons/ri';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch tickets on component mount
  useEffect(() => {
    // Mock data for demonstration
    const mockTickets = [
      {
        _id: '1',
        subject: 'Payment Issue',
        message: 'I was charged twice for my subscription. Please help resolve this issue.',
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        status: 'open',
        priority: 'high',
        createdAt: '2023-05-15T10:30:00Z',
        replies: [
          {
            _id: '101',
            message: 'Thank you for reporting this issue. We are looking into it and will get back to you shortly.',
            sender: 'admin',
            senderName: 'Support Team',
            createdAt: '2023-05-15T11:15:00Z'
          }
        ]
      },
      {
        _id: '2',
        subject: 'Listing Not Appearing',
        message: 'I created a new listing but it\'s not showing up on the search results.',
        user: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2023-05-14T14:45:00Z',
        replies: []
      },
      {
        _id: '3',
        subject: 'Account Access Problem',
        message: 'I can\'t log in to my account. I\'ve tried resetting my password but I\'m not receiving the reset email.',
        user: {
          name: 'Robert Johnson',
          email: 'robert@example.com'
        },
        status: 'closed',
        priority: 'high',
        createdAt: '2023-05-13T09:15:00Z',
        replies: [
          {
            _id: '102',
            message: 'We\'ve sent a new password reset link to your email. Please check your spam folder if you don\'t see it.',
            sender: 'admin',
            senderName: 'Support Team',
            createdAt: '2023-05-13T10:20:00Z'
          },
          {
            _id: '103',
            message: 'Thank you, I found the email in my spam folder and was able to reset my password.',
            sender: 'user',
            senderName: 'Robert Johnson',
            createdAt: '2023-05-13T11:05:00Z'
          },
          {
            _id: '104',
            message: 'Great! Glad we could help. Please let us know if you have any other issues.',
            sender: 'admin',
            senderName: 'Support Team',
            createdAt: '2023-05-13T11:30:00Z'
          }
        ]
      },
      {
        _id: '4',
        subject: 'Feature Request',
        message: 'It would be great if we could have a calendar view for property availability.',
        user: {
          name: 'Emily Davis',
          email: 'emily@example.com'
        },
        status: 'open',
        priority: 'low',
        createdAt: '2023-05-12T16:20:00Z',
        replies: []
      },
      {
        _id: '5',
        subject: 'Billing Question',
        message: 'I need to update my billing information. How can I do this?',
        user: {
          name: 'Michael Wilson',
          email: 'michael@example.com'
        },
        status: 'closed',
        priority: 'medium',
        createdAt: '2023-05-10T11:10:00Z',
        replies: [
          {
            _id: '105',
            message: 'You can update your billing information in your account settings under the "Billing" tab.',
            sender: 'admin',
            senderName: 'Support Team',
            createdAt: '2023-05-10T12:00:00Z'
          },
          {
            _id: '106',
            message: 'Thank you, I was able to update my information.',
            sender: 'user',
            senderName: 'Michael Wilson',
            createdAt: '2023-05-10T13:25:00Z'
          }
        ]
      }
    ];

    setTimeout(() => {
      setTickets(mockTickets);
      setLoading(false);
    }, 1000);
  }, []);

  // Open ticket details modal
  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  // Handle reply submission
  const handleReply = () => {
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    const newReply = {
      _id: Date.now().toString(),
      message: replyText,
      sender: 'admin',
      senderName: 'Support Team',
      createdAt: new Date().toISOString()
    };

    const updatedTickets = tickets.map(ticket => 
      ticket._id === selectedTicket._id 
        ? { 
            ...ticket, 
            replies: [...ticket.replies, newReply],
            status: ticket.status === 'open' ? 'in_progress' : ticket.status
          } 
        : ticket
    );

    setTickets(updatedTickets);
    setReplyText('');
    toast.success('Reply sent successfully');

    // Update the selected ticket to show the new reply
    const updatedTicket = updatedTickets.find(ticket => ticket._id === selectedTicket._id);
    setSelectedTicket(updatedTicket);
  };

  // Close ticket
  const closeTicket = (ticketId) => {
    const updatedTickets = tickets.map(ticket => 
      ticket._id === ticketId 
        ? { ...ticket, status: 'closed' } 
        : ticket
    );

    setTickets(updatedTickets);
    
    // If the ticket is currently selected, update it
    if (selectedTicket && selectedTicket._id === ticketId) {
      const updatedTicket = updatedTickets.find(ticket => ticket._id === ticketId);
      setSelectedTicket(updatedTicket);
    }
    
    toast.success('Ticket closed successfully');
  };

  // Reopen ticket
  const reopenTicket = (ticketId) => {
    const updatedTickets = tickets.map(ticket => 
      ticket._id === ticketId 
        ? { ...ticket, status: 'open' } 
        : ticket
    );

    setTickets(updatedTickets);
    
    // If the ticket is currently selected, update it
    if (selectedTicket && selectedTicket._id === ticketId) {
      const updatedTicket = updatedTickets.find(ticket => ticket._id === ticketId);
      setSelectedTicket(updatedTicket);
    }
    
    toast.success('Ticket reopened successfully');
  };

  // Filter tickets based on search term and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="w-40">
            <div className="relative">
              <RiFilterLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="input pl-10 appearance-none"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No support tickets found matching your criteria
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 card-glass">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Reply
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ticket.user.name}</div>
                    <div className="text-sm text-gray-500">{ticket.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.replies.length > 0 
                      ? formatDate(ticket.replies[ticket.replies.length - 1].createdAt)
                      : 'No replies yet'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openTicketModal(ticket)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      View
                    </button>
                    {ticket.status !== 'closed' ? (
                      <button
                        onClick={() => closeTicket(ticket._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => reopenTicket(ticket._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <RiCustomerService2Line className="mr-2" />
                      Ticket: {selectedTicket.subject}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedTicket.status)}`}>
                        {selectedTicket.status === 'in_progress' ? 'In Progress' : selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                        {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)} Priority
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <RiTimeLine className="mr-1" />
                        {formatDate(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <RiCloseLine className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                        {selectedTicket.user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedTicket.user.name}</div>
                      <div className="text-gray-500 text-sm">{selectedTicket.user.email}</div>
                      <div className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</div>
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                {selectedTicket.replies.length > 0 && (
                  <div className="space-y-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Conversation</h4>
                    {selectedTicket.replies.map((reply) => (
                      <div 
                        key={reply._id} 
                        className={`p-4 rounded-lg ${
                          reply.sender === 'admin' 
                            ? 'bg-primary-50 ml-8' 
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              reply.sender === 'admin' 
                                ? 'bg-primary-100 text-primary-600' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {reply.senderName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-gray-900">{reply.senderName}</div>
                              <div className="text-xs text-gray-500">{formatDate(reply.createdAt)}</div>
                            </div>
                            <div className="mt-1 text-gray-700 whitespace-pre-wrap">{reply.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {selectedTicket.status !== 'closed' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reply</h4>
                    <textarea
                      className="input w-full"
                      rows="4"
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    ></textarea>
                    <div className="mt-4 flex justify-between">
                      <div>
                        {selectedTicket.status !== 'closed' && (
                          <button
                            onClick={() => closeTicket(selectedTicket._id)}
                            className="btn-outline flex items-center"
                          >
                            <RiCheckLine className="mr-2" />
                            Close Ticket
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleReply}
                        className="btn-primary flex items-center"
                      >
                        <RiMailSendLine className="mr-2" />
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Reopen Button for Closed Tickets */}
                {selectedTicket.status === 'closed' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => reopenTicket(selectedTicket._id)}
                      className="btn-outline flex items-center"
                    >
                      Reopen Ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
