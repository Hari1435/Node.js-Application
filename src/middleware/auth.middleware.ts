import { AuthService } from '../services/auth.service';

export interface AuthContext {
  user?: any;
  token?: string;
}

export const authMiddleware = async (req: any): Promise<AuthContext> => {
  const context: AuthContext = {};

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || '';
    
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      context.token = token;

      // Verify token and get user
      const user = await AuthService.getUserFromToken(token);
      context.user = user;
    }
  } catch (error) {
    // Token is invalid or expired, but don't throw error
    // Let resolvers handle authentication requirements
    console.log('Auth middleware: Invalid or expired token');
  }

  return context;
};
