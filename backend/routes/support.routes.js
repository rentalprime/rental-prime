const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// Mock controller functions
const getTickets = (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        _id: '1',
        subject: 'Payment Issue',
        description: 'I was charged twice for my subscription',
        status: 'open',
        priority: 'high',
        user: {
          _id: '101',
          name: 'John Doe',
          email: 'john@example.com'
        },
        replies: [
          {
            _id: '1001',
            message: 'We are looking into this issue',
            user: {
              _id: 'admin1',
              name: 'Admin User',
              role: 'admin'
            },
            createdAt: '2023-05-11T11:30:00Z'
          }
        ],
        createdAt: '2023-05-10T10:30:00Z'
      },
      {
        _id: '2',
        subject: 'Listing Not Showing',
        description: 'My listing is not appearing in search results',
        status: 'pending',
        priority: 'medium',
        user: {
          _id: '102',
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        replies: [],
        createdAt: '2023-05-09T14:45:00Z'
      },
      {
        _id: '3',
        subject: 'Account Access',
        description: 'I cannot access my account after password reset',
        status: 'closed',
        priority: 'high',
        user: {
          _id: '103',
          name: 'Robert Johnson',
          email: 'robert@example.com'
        },
        replies: [
          {
            _id: '1002',
            message: 'Please try resetting your password again',
            user: {
              _id: 'admin1',
              name: 'Admin User',
              role: 'admin'
            },
            createdAt: '2023-05-08T10:15:00Z'
          },
          {
            _id: '1003',
            message: 'Thank you, it worked!',
            user: {
              _id: '103',
              name: 'Robert Johnson',
              role: 'user'
            },
            createdAt: '2023-05-08T11:30:00Z'
          }
        ],
        createdAt: '2023-05-08T09:15:00Z'
      }
    ]
  });
};

const getTicket = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      subject: 'Payment Issue',
      description: 'I was charged twice for my subscription',
      status: 'open',
      priority: 'high',
      user: {
        _id: '101',
        name: 'John Doe',
        email: 'john@example.com'
      },
      replies: [
        {
          _id: '1001',
          message: 'We are looking into this issue',
          user: {
            _id: 'admin1',
            name: 'Admin User',
            role: 'admin'
          },
          createdAt: '2023-05-11T11:30:00Z'
        }
      ],
      createdAt: '2023-05-10T10:30:00Z'
    }
  });
};

const addReply = (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      _id: req.params.id,
      subject: 'Payment Issue',
      description: 'I was charged twice for my subscription',
      status: 'open',
      priority: 'high',
      user: {
        _id: '101',
        name: 'John Doe',
        email: 'john@example.com'
      },
      replies: [
        {
          _id: '1001',
          message: 'We are looking into this issue',
          user: {
            _id: 'admin1',
            name: 'Admin User',
            role: 'admin'
          },
          createdAt: '2023-05-11T11:30:00Z'
        },
        {
          _id: Date.now().toString(),
          message: req.body.message,
          user: {
            _id: req.user.id,
            name: req.user.name,
            role: req.user.role
          },
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: '2023-05-10T10:30:00Z'
    }
  });
};

const updateTicketStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      _id: req.params.id,
      subject: 'Payment Issue',
      description: 'I was charged twice for my subscription',
      status: req.body.status,
      priority: req.body.priority || 'high',
      user: {
        _id: '101',
        name: 'John Doe',
        email: 'john@example.com'
      },
      replies: [
        {
          _id: '1001',
          message: 'We are looking into this issue',
          user: {
            _id: 'admin1',
            name: 'Admin User',
            role: 'admin'
          },
          createdAt: '2023-05-11T11:30:00Z'
        }
      ],
      createdAt: '2023-05-10T10:30:00Z'
    }
  });
};

// Routes
router.route('/')
  .get(protect, authorize('admin', 'superadmin'), getTickets);

router.route('/:id')
  .get(protect, authorize('admin', 'superadmin'), getTicket)
  .put(protect, authorize('admin', 'superadmin'), updateTicketStatus);

router.route('/:id/reply')
  .post(protect, authorize('admin', 'superadmin'), addReply);

module.exports = router;
