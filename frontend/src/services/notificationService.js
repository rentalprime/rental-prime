import BaseService from './baseService';
import supabase from '../utils/supabaseClient';

class NotificationService extends BaseService {
  constructor() {
    super('notifications');
  }

  // Get notifications with filters
  async getNotifications(filters = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filters if provided
      if (filters.read === true || filters.read === false) {
        query = query.eq('read', filters.read);
      }
      
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notifications with filters:', error);
      throw error;
    }
  }
  
  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ read: true })
        .eq('id', notificationId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ read: true })
        .eq('read', false)
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  // Get unread notification count
  async getUnreadCount() {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      
      if (error) throw error;
      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }
}

export default new NotificationService();
