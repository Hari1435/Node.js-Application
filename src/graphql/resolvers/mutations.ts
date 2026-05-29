import { OTPService } from '../../services/otp.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { GraphQLError } from 'graphql';
import { GraphQLContext, OnboardingData } from '../../types';

interface CreateQualificationInput {
  name: string;
  description?: string;
}

export const mutations = {
  // Step 1: Send OTP to mobile number
  sendOTP: async (_: unknown, { mobileNumber }: { mobileNumber: string }, context: GraphQLContext) => {
    try {
      // Validate mobile number format (basic validation)
      if (!/^\+?[1-9]\d{9,14}$/.test(mobileNumber)) {
        return {
          success: false,
          message: 'Invalid mobile number format',
        };
      }

      await OTPService.sendOTP(mobileNumber, context.prisma);

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (error) {
      const { message } = error as Error;
      console.error('Failed to send OTP:', { message, mobileNumber });
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  },

  // Step 2: Verify OTP and return token
  verifyOTP: async (
    _: unknown,
    { mobileNumber, code }: { mobileNumber: string; code: string },
    context: GraphQLContext
  ) => {
    try {
      const isValid = await OTPService.verifyOTP(mobileNumber, code, context.prisma);

      if (!isValid) {
        return {
          success: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Get user
      const user = await context.prisma.user.findUnique({
        where: { mobileNumber },
        include: {
          qualification: true,
        },
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
      const { message } = error as Error;
      console.error('OTP verification failed:', { message, mobileNumber });
      return {
        success: false,
        message: 'Verification failed',
      };
    }
  },

  // Step 3: Complete onboarding
  completeOnboarding: async (
    _: unknown,
    { input }: { input: OnboardingData },
    context: GraphQLContext
  ) => {
    try {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Complete onboarding
      const user = await UserService.completeOnboarding(context.user.id, input, context.prisma);

      return user;
    } catch (error) {
      const { message } = error as Error;
      console.error('Onboarding failed:', { message, userId: context.user?.id });
      throw new GraphQLError(message || 'Failed to complete onboarding', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  },

  // Admin: Create qualification
  createQualification: async (
    _: unknown,
    { input }: { input: CreateQualificationInput },
    context: GraphQLContext
  ) => {
    try {
      // Check if qualification with same name already exists
      const existing = await context.prisma.qualification.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new GraphQLError('Qualification with this name already exists', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Create new qualification
      const qualification = await context.prisma.qualification.create({
        data: {
          name: input.name,
          description: input.description || null,
          isActive: true,
        },
      });

      return qualification;
    } catch (error) {
      const { message } = error as Error;
      console.error('Failed to create qualification:', { message, input });
      throw new GraphQLError(message || 'Failed to create qualification', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }
  },
};
