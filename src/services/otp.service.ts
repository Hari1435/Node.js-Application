import { PrismaClient, UserStatus } from '@prisma/client';

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP (in production, integrate with SMS service like Twilio)
  static async sendOTP(mobileNumber: string, prisma: PrismaClient): Promise<string> {
    const code = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    const user = await prisma.user.upsert({
      where: { mobileNumber },
      update: {},
      create: {
        mobileNumber,
        isVerified: false,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });

    // Create OTP record
    await prisma.oTP.create({
      data: {
        code,
        expiresAt,
        isUsed: false,
        user: {
          connect: { id: user.id },
        },
      },
    });

    // In production: Send SMS here
    console.log(`📱 OTP for ${mobileNumber}: ${code}`);
    
    return code;
  }

  // Verify OTP
  static async verifyOTP(mobileNumber: string, code: string, prisma: PrismaClient): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return false;
    }

    // Find valid OTP
    const otp = await prisma.oTP.findFirst({
      where: {
        user: {
          id: user.id,
        },
        code,
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      return false;
    }

    // Mark OTP as used and user as verified
    await prisma.$transaction([
      prisma.oTP.update({
        where: { id: otp.id },
        data: {
          isUsed: true,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          status: user.name ? UserStatus.ACTIVE : UserStatus.ONBOARDING_INCOMPLETE,
        },
      }),
    ]);

    return true;
  }
}
