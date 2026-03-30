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
  - Profile: name, gender (enum), date of birth, qualification (enum), course, specialization, location
- **Enums**:
  - Gender: MALE, FEMALE, OTHER
  - Qualification: HIGH_SCHOOL, DIPLOMA, BACHELORS, MASTERS, PHD, OTHER

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
mutation CompleteOnboarding($input: OnboardingInput!) {
  completeOnboarding(input: $input) {
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
  "input": {
    "name": "John Doe",
    "gender": "MALE",
    "dateOfBirth": "1995-05-15",
    "qualification": "BACHELORS",
    "course": "Computer Science",
    "specialization": "Software Engineering",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```
**HTTP Headers:**
```json
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

#### 4. Get Current User
```graphql
query GetMyProfile {
  me {
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
**HTTP Headers:**
```json
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

## 🔍 Understanding the Code

### Project Structure
```
├── src/
│   ├── graphql/
│   │   ├── schema.ts              # GraphQL type definitions
│   │   └── resolvers/
│   │       ├── index.ts           # Resolver exports (imports only)
│   │       ├── queries.ts         # Query resolvers
│   │       └── mutations.ts       # Mutation resolvers
│   ├── services/
│   │   ├── auth.service.ts        # JWT authentication logic
│   │   ├── otp.service.ts         # OTP generation & verification
│   │   └── user.service.ts        # User management
│   ├── middleware/
│   │   └── auth.middleware.ts     # Authentication middleware
│   ├── lib/
│   │   └── prisma.ts              # Prisma client instance
│   └── index.ts                   # Server entry point
├── prisma/
│   └── schema.prisma              # Database schema (User table + enums)
└── package.json
```

### Key Concepts

1. **Single Table Design**: All user data (auth, OTP, profile) in one User table
2. **Enum Types**: Gender and Qualification use database enums for data consistency
3. **OTP Service**: Generates 6-digit codes, stores in User table with expiration (10 min)
4. **Auth Middleware**: Extracts JWT token from Authorization header and adds user to context
5. **Split Resolvers**: Queries and mutations are in separate files for better organization
6. **Context-based Auth**: Protected routes use context.user instead of token parameters

## 🧪 Testing with Apollo Studio

1. Open `http://localhost:4000` in your browser
2. Copy queries from `sample-queries.graphql`
3. Use the **Variables** tab to provide input values
4. For authenticated requests (completeOnboarding, me), add token in **HTTP Headers** tab:
   ```json
   { "Authorization": "Bearer YOUR_TOKEN_HERE" }
   ```
5. Follow the authentication flow in order: sendOTP → verifyOTP → completeOnboarding → me
6. Use enum values: Gender (MALE, FEMALE, OTHER), Qualification (HIGH_SCHOOL, DIPLOMA, BACHELORS, MASTERS, PHD, OTHER)

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
- Authentication via middleware (Bearer token in Authorization header)
- Protected routes require valid JWT token in context
- Enum types ensure data consistency for gender and qualification

## 📚 Next Steps

After completing these APIs, you can:
- Add more user fields to the User table
- Implement profile update mutations
- Add file upload for profile pictures
- Integrate SMS service (Twilio, AWS SNS) for real OTP delivery
- Add rate limiting for OTP requests
- Create additional features based on requirements


