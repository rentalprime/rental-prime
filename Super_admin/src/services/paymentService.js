import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

class PaymentService extends BaseService {
  constructor() {
    super('payments');
  }

  // Get payments with filters
  async getPayments(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filters if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
      }
      
      if (filters.search) {
        query = query.or(`transaction_id.ilike.%${filters.search}%,user.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      
      // Date filter
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payments with filters:', error);
      throw error;
    }
  }
  
  // Get payment statistics
  async getPaymentStats() {
    try {
      // Get total revenue
      const { data: totalRevenue, error: revenueError } = await supabase
        .from(this.tableName)
        .select('amount')
        .eq('status', 'completed');
      
      if (revenueError) throw revenueError;
      
      // Get payment counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from(this.tableName)
        .select('status, count')
        .group('status');
      
      if (statusError) throw statusError;
      
      // Calculate total revenue
      const revenue = totalRevenue.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        totalRevenue: revenue,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      throw error;
    }
  }
}

export default new PaymentService();
