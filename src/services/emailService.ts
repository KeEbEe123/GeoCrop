// Email service client for Yield Mentor platform
interface UserData {
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'seller';
  location: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  data?: {
    messageId: string;
    to: string;
  };
}

class EmailServiceClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001';
    this.apiKey = import.meta.env.VITE_EMAIL_API_KEY || 'ym-email-service-2024-secure-key';
  }

  private async makeRequest(endpoint: string, data: any): Promise<EmailResponse> {
    try {
      const url = `${this.baseUrl}/api/email${endpoint}`;
      console.log('📧 Making request to:', url);
      console.log('📧 Request data:', data);
      console.log('📧 API Key:', this.apiKey);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(data),
      });

      console.log('📧 Response status:', response.status);
      console.log('📧 Response ok:', response.ok);

      const result = await response.json();
      console.log('📧 Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Email service request failed');
      }

      return result;
    } catch (error) {
      console.error('📧 Email service error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userData: UserData): Promise<EmailResponse> {
    try {
      console.log('📧 Attempting to send welcome email to:', userData.email);
      console.log('📧 Email service URL:', this.baseUrl);
      const result = await this.makeRequest('/send-welcome', userData);
      console.log('📧 Welcome email result:', result);
      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error to prevent registration failure
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send welcome email'
      };
    }
  }

  async sendOrderStatusEmail(orderData: {
    buyerName: string;
    buyerEmail: string;
    orderId: string;
    itemName: string;
    quantity: number;
    status: string;
    sellerName: string;
    trackingId?: string;
    expectedDelivery?: string;
    totalAmount: number;
  }): Promise<EmailResponse> {
    try {
      console.log('📧 Attempting to send order status email to:', orderData.buyerEmail);
      const result = await this.makeRequest('/send-order-status', orderData);
      console.log('📧 Order status email result:', result);
      return result;
    } catch (error) {
      console.error('Failed to send order status email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send order status email'
      };
    }
  }

  async sendNewOrderEmail(orderData: {
    sellerName: string;
    sellerEmail: string;
    orderId: string;
    itemName: string;
    quantity: number;
    buyerName: string;
    buyerLocation: string;
    totalAmount: number;
    orderDate: string;
    expectedDelivery?: string;
    shippingAddress?: any;
    paymentMethod?: string;
    paymentStatus?: string;
  }): Promise<EmailResponse> {
    try {
      console.log('📧 Attempting to send new order email to:', orderData.sellerEmail);
      const result = await this.makeRequest('/send-new-order', orderData);
      console.log('📧 New order email result:', result);
      return result;
    } catch (error) {
      console.error('Failed to send new order email:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send new order email'
      };
    }
  }

  async sendCustomEmail(emailData: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<EmailResponse> {
    return await this.makeRequest('/send-email', emailData);
  }

  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/health`);
      return await response.json();
    } catch (error) {
      console.error('Email service health check failed:', error);
      return { success: false, message: 'Service unavailable' };
    }
  }

  async sendTestEmail(email: string): Promise<EmailResponse> {
    return await this.makeRequest('/test', { email });
  }
}

export const emailServiceClient = new EmailServiceClient();
export type { UserData, EmailResponse };