export const typeDefs = `#graphql
  type User {
    id: ID!
    mobileNumber: String!
    isVerified: Boolean!
    name: String
    gender: String
    dateOfBirth: String
    qualification: String
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
    gender: String!
    dateOfBirth: String!
    qualification: String!
    course: String!
    specialization: String!
    latitude: Float!
    longitude: Float!
  }

  type Query {
    me(token: String!): User
  }

  type Mutation {
    # Step 1: Send OTP to mobile number
    sendOTP(mobileNumber: String!): AuthResponse!
    
    # Step 2: Verify OTP and create/login user
    verifyOTP(mobileNumber: String!, code: String!): VerifyOTPResponse!
    
    # Step 3: Complete onboarding
    completeOnboarding(token: String!, input: OnboardingInput!): User!
  }
`;
