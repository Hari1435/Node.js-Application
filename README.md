# GraphQL Authentication & Onboarding System

A Node.js application with Apollo GraphQL, TypeScript, Prisma, and MySQL implementing OTP-based authentication and user onboarding.

## 🏗️ Architecture

### Tech Stack
- **Apollo Server**: GraphQL server
- **TypeScript**: Type-safe development
- **Prisma**: ORM for MySQL
- **MySQL**: Database
- **JWT**: Token-based authentication

### Database Schema
- **User**: Single table containing all user data including:
  - Authentication: mobile number, verification status
  - OTP: code, expiration, usage status
  - Profile: name, gender, date of birth, education, location

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Database
1. Create a MySQL database:
```sql
CREATE DATABASE auth_onboarding_db;
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials:
```
DATABASE_URL="mysql://root:password@localhost:3306/auth_onboarding_db"
JWT_SECRET="your-secret-key-here"
PORT=4000
```

**Using MySQL Workbench?** See `MYSQL_WORKBENCH_SETUP.md` for detailed setup guide.

### Step 3: Run Database Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 4: Start Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:4000`

## 📝 API Flow

### Authentication Flow

#### 1. Send OTP
```graphql
mutation SendOTP($mobileNumber: String!) {
  sendOTP(mobileNumber: $mobileNumber) {
    success
    message
  }
}
```
**Variables:**
```json
{
  "mobileNumber": "+1234567890"
}
```

#### 2. Verify OTP
```graphql
mutation VerifyOTP($mobileNumber: String!, $code: String!) {
  verifyOTP(mobileNumber: $mobileNumber, code: $code) {
    success
    message
    token
    user {
      id
      mobileNumber
      isVerified
      name
      gender
    }
  }
}
```
**Variables:**
```json
{
  "mobileNumber": "+1234567890",
  "code": "123456"
}
```

#### 3. Complete Onboarding
```graphql
mutation CompleteOnboarding($token: String!, $input: OnboardingInput!) {
  completeOnboarding(token: $token, input: $input) {
    id
    mobileNumber
    isVerified
    name
    gender
    dateOfBirth
    qualification
    course
    specialization
    latitude
    longitude
  }
}
```
**Variables:**
```json
{
  "token": "your-jwt-token-here",
  "input": {
    "name": "John Doe",
    "gender": "Male",
    "dateOfBirth": "1995-05-15",
    "qualification": "Bachelor's Degree",
    "course": "Computer Science",
    "specialization": "Software Engineering",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

#### 4. Get Current User
```graphql
query GetMyProfile($token: String!) {
  me(token: $token) {
    id
    mobileNumber
    isVerified
    name
    gender
    dateOfBirth
    qualification
    course
    specialization
    latitude
    longitude
  }
}
```
**Variables:**
```json
{
  "token": "your-jwt-token-here"
}
```

## 🔍 Understanding the Code

### Project Structure
```
├── src/
│   ├── graphql/
│   │   ├── schema.ts       # GraphQL type definitions
│   │   └── resolvers.ts    # GraphQL resolvers
│   ├── services/
│   │   ├── auth.service.ts # JWT authentication logic
│   │   ├── otp.service.ts  # OTP generation & verification
│   │   └── user.service.ts # User management
│   ├── lib/
│   │   └── prisma.ts       # Prisma client instance
│   └── index.ts            # Server entry point
├── prisma/
│   └── schema.prisma       # Database schema (single User table)
└── package.json
```

### Key Concepts

1. **Single Table Design**: All user data (auth, OTP, profile) in one User table
2. **OTP Service**: Generates 6-digit codes, stores in User table with expiration (10 min)
3. **Auth Service**: Handles JWT token generation and verification
4. **User Service**: Manages user onboarding by updating User table
5. **GraphQL Resolvers**: Connect GraphQL operations to service functions

## 🧪 Testing with Apollo Studio

1. Open `http://localhost:4000` in your browser
2. Copy queries from `sample-queries.graphql`
3. Use the **Variables** tab to provide input values
4. Follow the authentication flow in order: sendOTP → verifyOTP → completeOnboarding → me

## 📱 Production Considerations

- **SMS Integration**: Replace console.log in `otp.service.ts` with actual SMS service (Twilio, AWS SNS)
- **Rate Limiting**: Add rate limiting for OTP requests
- **Security**: Use strong JWT secrets, implement refresh tokens
- **Validation**: Add more robust input validation
- **Error Handling**: Implement comprehensive error handling

## 🔐 Security Notes

- OTPs expire after 10 minutes
- OTPs can only be used once (stored in User table)
- JWT tokens expire in 30 days
- Mobile numbers are unique per user
- Single table design simplifies data management

## 📚 Next Steps

After completing these APIs, you can:
- Add more user fields to the User table
- Implement profile update mutations
- Add file upload for profile pictures
- Integrate SMS service (Twilio, AWS SNS) for real OTP delivery
- Add rate limiting for OTP requests
- Create additional features based on requirements


