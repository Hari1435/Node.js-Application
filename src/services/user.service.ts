import { prisma } from '../lib/prisma';
import { Gender, Qualification } from '@prisma/client';

interface OnboardingData {
  name: string;
  gender: Gender;
  dateOfBirth: string;
  qualification: Qualification;
  course: string;
  specialization: string;
  latitude: number;
  longitude: number;
}

export class UserService {
  // Complete user onboarding
  static async completeOnboarding(userId: string, data: OnboardingData) {
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
        qualification: data.qualification,
        course: data.course,
        specialization: data.specialization,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    return user;
  }

  // Get user by ID
  static async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
