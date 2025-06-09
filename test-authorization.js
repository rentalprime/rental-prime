/**
 * Authorization System Test Script
 * Tests the standardized authorization middleware
 */

const express = require('express');
const request = require('supertest');

// Mock Supabase for testing
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
};

// Mock the supabase config
jest.mock('./backend/config/supabase', () => mockSupabase);

const { 
  protect, 
  authorize, 
  authorizeAdmin, 
  authorizeSuperAdmin,
  checkPermission 
} = require('./backend/middlewares/auth');

describe('Authorization Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Test routes
    app.get('/public', (req, res) => res.json({ message: 'public' }));
    app.get('/protected', protect, (req, res) => res.json({ message: 'protected' }));
    app.get('/admin', protect, authorizeAdmin, (req, res) => res.json({ message: 'admin' }));
    app.get('/super-admin', protect, authorizeSuperAdmin, (req, res) => res.json({ message: 'super-admin' }));
    app.get('/vendor-only', protect, authorize('vendor'), (req, res) => res.json({ message: 'vendor' }));
    app.get('/permission-test', protect, checkPermission('users', 'create'), (req, res) => res.json({ message: 'permission' }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    test('should allow access to public routes', async () => {
      const response = await request(app).get('/public');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('public');
    });
  });

  describe('Authentication Tests', () => {
    test('should reject requests without token', async () => {
      const response = await request(app).get('/protected');
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should reject requests with invalid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should allow access with valid token and user data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_type: 'admin',
        roles: {
          name: 'admin',
          permissions: { all: true }
        }
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('protected');
    });
  });

  describe('Authorization Tests', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      });
    });

    test('should allow admin access to admin routes', async () => {
      const mockUser = {
        id: 'user-123',
        user_type: 'admin',
        roles: { name: 'admin' }
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/admin')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
    });

    test('should deny customer access to admin routes', async () => {
      const mockUser = {
        id: 'user-123',
        user_type: 'customer',
        roles: { name: 'customer' }
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/admin')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(403);
    });

    test('should allow super admin access to super admin routes', async () => {
      const mockUser = {
        id: 'user-123',
        user_type: 'super_admin',
        roles: { name: 'super_admin' }
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/super-admin')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
    });

    test('should check specific user types', async () => {
      const mockUser = {
        id: 'user-123',
        user_type: 'vendor',
        roles: { name: 'vendor' }
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/vendor-only')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
    });

    test('should check specific permissions', async () => {
      const mockUser = {
        id: 'user-123',
        user_type: 'admin',
        roles: { 
          name: 'admin',
          permissions: {
            users: { create: true, read: true }
          }
        }
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      });

      const response = await request(app)
        .get('/permission-test')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
    });
  });
});

console.log('Authorization test script created. Run with: npm test test-authorization.js');
