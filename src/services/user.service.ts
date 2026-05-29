import { PrismaClient, User, UserStatus } from '@prisma/client';
import { OnboardingData } from '../types';

export class UserService {
  // Complete user onboarding
  static async completeOnboarding(userId: string, data: OnboardingData, prisma: PrismaClient): Promise<User> {
    // Check if user already completed onboarding
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.name) {
      throw new Error('User has already completed onboarding');
    }

    // Update user with profile data
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        qualificationId: data.qualificationId,
        course: data.course,
        specialization: data.specialization,
        latitude: data.latitude,
        longitude: data.longitude,
        status: UserStatus.ACTIVE,
      },
      include: {
        qualification: true,
      },
    });

    return user;
  }

  // Get user by ID
  static async getUserById(userId: string, prisma: PrismaClient): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        qualification: true,
      },
    });
  }
}
