/**
 * Table Separation Test Script
 * Tests the dual-table authentication system
 */

const express = require('express');
const request = require('supertest');

// Mock Supabase for testing
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn()
};

// Mock the supabase config
jest.mock('./backend/config/supabase', () => mockSupabase);

const { protect, authorizeAdmin, authorizeSuperAdmin } = require('./backend/middlewares/auth');

describe('Table Separation Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Test routes
    app.get('/admin-only', protect, authorizeAdmin, (req, res) => 
      res.json({ message: 'admin access', userTable: req.userTable }));
    app.get('/super-admin-only', protect, authorizeSuperAdmin, (req, res) => 
      res.json({ message: 'super admin access', userTable: req.userTable }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Users Table Authentication', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null
      });
    });

    test('should authenticate admin user from admin_users table', async () => {
      const mockAdminUser = {
        id: 'admin-123',
        email: 'admin@test.com',
        user_type: 'admin',
        roles: { name: 'admin', permissions: { all: true } }
      };

      // Mock admin_users table query (successful)
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'admin_users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockAdminUser,
                  error: null
                })
              })
            })
          };
        }
        // Should not reach users table
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' }
              })
            })
          })
        };
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer valid-admin-token');
      
      expect(response.status).toBe(200);
      expect(response.body.userTable).toBe('admin_users');
      expect(response.body.message).toBe('admin access');
    });

    test('should allow super admin access to admin routes', async () => {
      const mockSuperAdminUser = {
        id: 'super-admin-123',
        email: 'superadmin@test.com',
        user_type: 'super_admin',
        roles: { name: 'super_admin', permissions: { all: true } }
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'admin_users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockSuperAdminUser,
                  error: null
                })
              })
            })
          };
        }
      });

      const response = await request(app)
        .get('/super-admin-only')
        .set('Authorization', 'Bearer valid-super-admin-token');
      
      expect(response.status).toBe(200);
      expect(response.body.userTable).toBe('admin_users');
    });
  });

  describe('Users Table Authentication', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'vendor-123' } },
        error: null
      });
    });

    test('should authenticate vendor from users table but deny admin access', async () => {
      const mockVendorUser = {
        id: 'vendor-123',
        email: 'vendor@test.com',
        user_type: 'vendor',
        roles: { name: 'vendor', permissions: { listings: { create: true } } }
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'admin_users') {
          // Not found in admin_users
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' }
                })
              })
            })
          };
        } else if (table === 'users') {
          // Found in users table
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockVendorUser,
                  error: null
                })
              })
            })
          };
        }
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer valid-vendor-token');
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin privileges required');
    });

    test('should authenticate customer from users table but deny admin access', async () => {
      const mockCustomerUser = {
        id: 'customer-123',
        email: 'customer@test.com',
        user_type: 'customer',
        roles: { name: 'customer', permissions: { listings: { read: true } } }
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'admin_users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' }
                })
              })
            })
          };
        } else if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockCustomerUser,
                  error: null
                })
              })
            })
          };
        }
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer valid-customer-token');
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Table Priority', () => {
    test('should check admin_users table first, then users table', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-123' } },
        error: null
      });

      const mockUser = {
        id: 'test-123',
        email: 'test@test.com',
        user_type: 'customer',
        roles: { name: 'customer' }
      };

      let adminTableCalled = false;
      let usersTableCalled = false;

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'admin_users') {
          adminTableCalled = true;
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' }
                })
              })
            })
          };
        } else if (table === 'users') {
          usersTableCalled = true;
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockUser,
                  error: null
                })
              })
            })
          };
        }
      });

      await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer test-token');
      
      expect(adminTableCalled).toBe(true);
      expect(usersTableCalled).toBe(true);
    });
  });
});

console.log('Table separation test script created. Run with: npm test test-table-separation.js');
