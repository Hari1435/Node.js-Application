import { OTPService } from '../../services/otp.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { prisma } from '../../lib/prisma';
import { GraphQLError } from 'graphql';

export const mutations = {
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
    { input }: { input: any },
    context: any
  ) => {
    try {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Complete onboarding
      const user = await UserService.completeOnboarding(context.user.id, input);

      return user;
    } catch (error: any) {
      throw new GraphQLError(error.message || 'Failed to complete onboarding', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  },
};
