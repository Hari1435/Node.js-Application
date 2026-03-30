import { OTPService } from '../services/otp.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { prisma } from '../lib/prisma';

export const resolvers = {
  Query: {
    // Get current user profile
    me: async (_: any, { token }: { token: string }) => {
      try {
        const user = await AuthService.getUserFromToken(token);
        return user;
      } catch (error) {
        throw new Error('Authentication failed');
      }
    },
  },

  Mutation: {
    // Step 1: Send OTP to mobile number
    sendOTP: async (_: any, { mobileNumber }: { mobileNumber: string }) => {
      try {
        // Validate mobile number format (basic validation)
        if (!/^\+?[1-9]\d{9,14}$/.test(mobileNumber)) {
          return {
            success: false,
            message: 'Invalid mobile number format',
          };
        }

        await OTPService.sendOTP(mobileNumber);

        return {
          success: true,
          message: 'OTP sent successfully',
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to send OTP',
        };
      }
    },

    // Step 2: Verify OTP and return token
    verifyOTP: async (
      _: any,
      { mobileNumber, code }: { mobileNumber: string; code: string }
    ) => {
      try {
        const isValid = await OTPService.verifyOTP(mobileNumber, code);

        if (!isValid) {
          return {
            success: false,
            message: 'Invalid or expired OTP',
          };
        }

        // Get user
        const user = await prisma.user.findUnique({
          where: { mobileNumber },
        });

        if (!user) {
          return {
            success: false,
            message: 'User not found',
          };
        }

        // Generate token
        const token = AuthService.generateToken(user.id);

        return {
          success: true,
          message: 'OTP verified successfully',
          token,
          user,
        };
      } catch (error) {
        return {
          success: false,
          message: 'Verification failed',
        };
      }
    },

    // Step 3: Complete onboarding
    completeOnboarding: async (
      _: any,
      { token, input }: { token: string; input: any }
    ) => {
      try {
        // Verify token and get user
        const decoded = AuthService.verifyToken(token);
        if (!decoded) {
          throw new Error('Invalid token');
        }

        // Complete onboarding
        const user = await UserService.completeOnboarding(decoded.userId, input);

        return user;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to complete onboarding');
      }
    },
  },

  User: {
    createdAt: (parent: any) => parent.createdAt.toISOString(),
    dateOfBirth: (parent: any) => parent.dateOfBirth ? parent.dateOfBirth.toISOString() : null,
  },
};
