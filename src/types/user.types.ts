import { Gender } from '@prisma/client';

export interface OnboardingData {
  name: string;
  gender: Gender;
  dateOfBirth: string;
  qualificationId: string;
  course: string;
  specialization: string;
  latitude: number;
  longitude: number;
}
