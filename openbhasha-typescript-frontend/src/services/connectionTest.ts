import { apiClient } from './apiClient';

export class ConnectionTest {
  // Test basic connection to backend
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('http://localhost:5000/', { 
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `Backend connected: ${data.message || 'Server is running'}`
        };
      } else {
        return {
          success: false,
          message: `Backend responded with status: ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  // Test authentication endpoints
  static async testAuthEndpoints(): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];
    let allSuccess = true;

    // Test login endpoint (will fail but should return proper error)
    try {
      const loginResponse = await apiClient.login({
        email: 'test@test.com',
        password: 'wrongpassword'
      });
      results.push({
        endpoint: 'POST /api/auth/login',
        success: !loginResponse.success, // We expect this to fail
        message: loginResponse.error || 'Login endpoint responding correctly'
      });
    } catch (error: any) {
      results.push({
        endpoint: 'POST /api/auth/login',
        success: false,
        message: `Login test failed: ${error.message}`
      });
      allSuccess = false;
    }

    // Test register endpoint structure (without actually registering)
    try {
      const registerResponse = await apiClient.register({
        name: 'Test User',
        email: 'already-exists@test.com', // Use email that should already exist
        password: 'testpass123',
        role: 'student'
      } as any);
      
      results.push({
        endpoint: 'POST /api/auth/register',
        success: !registerResponse.success, // We expect this to fail for existing email
        message: registerResponse.error || 'Register endpoint responding correctly'
      });
    } catch (error: any) {
      results.push({
        endpoint: 'POST /api/auth/register',
        success: false,
        message: `Register test failed: ${error.message}`
      });
      allSuccess = false;
    }

    return { success: allSuccess, results };
  }

  // Test if user is authenticated
  static async testAuthentication(): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const isAuth = apiClient.isAuthenticated();
      const storedUser = apiClient.getStoredUser();

      if (isAuth && storedUser) {
        // Try to verify token
        const verifyResponse = await apiClient.verifyToken();
        if (verifyResponse.success) {
          return {
            success: true,
            message: 'User is authenticated and token is valid',
            user: storedUser
          };
        } else {
          return {
            success: false,
            message: 'User data exists but token is invalid'
          };
        }
      } else {
        return {
          success: true,
          message: 'No user authentication data found (not logged in)'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Authentication test failed: ${error.message}`
      };
    }
  }

  // Run comprehensive connection test
  static async runFullTest(): Promise<{
    connection: { success: boolean; message: string };
    auth: { success: boolean; results: any[] };
    authentication: { success: boolean; message: string; user?: any };
  }> {
    console.log('🧪 Starting frontend-backend connection test...');

    const connection = await this.testConnection();
    console.log('🔗 Connection test:', connection);

    const auth = await this.testAuthEndpoints();
    console.log('🔐 Auth endpoints test:', auth);

    const authentication = await this.testAuthentication();
    console.log('👤 Authentication test:', authentication);

    return {
      connection,
      auth,
      authentication
    };
  }
}

export default ConnectionTest;