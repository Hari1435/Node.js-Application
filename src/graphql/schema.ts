export const typeDefs = `#graphql
  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum UserStatus {
    PENDING_VERIFICATION
    VERIFIED
    ONBOARDING_INCOMPLETE
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  type Qualification {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
  }

  type User {
    id: ID!
    mobileNumber: String!
    isVerified: Boolean!
    status: UserStatus!
    name: String
    gender: Gender
    dateOfBirth: String
    qualification: Qualification
    course: String
    specialization: String
    latitude: Float
    longitude: Float
    createdAt: String!
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    userId: String
  }

  type VerifyOTPResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  input OnboardingInput {
    name: String!
    gender: Gender!
    dateOfBirth: String!
    qualificationId: String!
    course: String!
    specialization: String!
    latitude: Float!
    longitude: Float!
  }

  input CreateQualificationInput {
    name: String!
    description: String
  }

  type Query {
    me: User
    qualifications: [Qualification!]!
  }

  type Mutation {
    # Step 1: Send OTP to mobile number
    sendOTP(mobileNumber: String!): AuthResponse!
    
    # Step 2: Verify OTP and create/login user
    verifyOTP(mobileNumber: String!, code: String!): VerifyOTPResponse!
    
    # Step 3: Complete onboarding
    completeOnboarding(input: OnboardingInput!): User!
    
    # Admin: Create qualification
    createQualification(input: CreateQualificationInput!): Qualification!
  }
`;
