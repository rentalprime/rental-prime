import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

class PlanService extends BaseService {
  constructor() {
    super('plans');
  }

  // Get plans with filters
  async getPlans(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filters if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.interval && filters.interval !== 'all') {
        query = query.eq('interval', filters.interval);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plans with filters:', error);
      throw error;
    }
  }
  
  // Get plan statistics
  async getPlanStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('name, subscribers')
        .eq('status', 'active');
      
      if (error) throw error;
      
      return {
        planSubscriptions: data.reduce((acc, plan) => {
          acc[plan.name] = plan.subscribers;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error fetching plan statistics:', error);
      throw error;
    }
  }
}

export default new PlanService();
