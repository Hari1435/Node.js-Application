import { prisma } from '../lib/prisma';

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP (in production, integrate with SMS service like Twilio)
  static async sendOTP(mobileNumber: string): Promise<string> {
    const code = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user and update OTP
    const user = await prisma.user.upsert({
      where: { mobileNumber },
      update: {
        otpCode: code,
        otpExpiresAt: expiresAt,
        otpIsUsed: false,
      },
      create: {
        mobileNumber,
        isVerified: false,
        otpCode: code,
        otpExpiresAt: expiresAt,
        otpIsUsed: false,
      },
    });

    // In production: Send SMS here
    console.log(`📱 OTP for ${mobileNumber}: ${code}`);
    
    return code;
  }

  // Verify OTP
  static async verifyOTP(mobileNumber: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return false;
    }

    // Check if OTP matches, not used, and not expired
    if (
      user.otpCode !== code ||
      user.otpIsUsed ||
      user.otpExpiresAt < new Date()
    ) {
      return false;
    }

    // Mark OTP as used and user as verified
    await prisma.user.update({
      where: { mobileNumber },
      data: {
        otpIsUsed: true,
        isVerified: true,
      },
    });

    return true;
  }
}
