import BaseService from "./baseService";
import apiClient from "../utils/apiClient";

class SupportService extends BaseService {
  constructor() {
    super("support_tickets");
  }

  // Get tickets with filters
  async getTickets(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Apply filters if provided
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters.priority && filters.priority !== "all") {
        params.append("priority", filters.priority);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      const response = await apiClient.get(
        `${this.baseUrl}?${params.toString()}`
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error fetching support tickets with filters:", error);
      throw error;
    }
  }

  // Add reply to a ticket
  async addReply(ticketId, replyData) {
    try {
      const response = await apiClient.post(`/api/support_replies`, {
        ticket_id: ticketId,
        ...replyData,
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error("Error adding reply to ticket:", error);
      throw error;
    }
  }

  // Update ticket status
  async updateStatus(ticketId, status, priority = null) {
    try {
      const updates = { status };
      if (priority) updates.priority = priority;

      const response = await apiClient.put(
        `${this.baseUrl}/${ticketId}`,
        updates
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      throw error;
    }
  }
}

export default new SupportService();
