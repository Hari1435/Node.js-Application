# GraphQL Authentication & Onboarding System

A Node.js application with Apollo GraphQL, TypeScript, Prisma, and MySQL implementing OTP-based authentication and user onboarding with proper type safety and clean architecture.

## 🏗️ Architecture

### Tech Stack
- **Apollo Server**: GraphQL server
- **TypeScript**: Type-safe development
- **Prisma**: ORM for MySQL
- **MySQL**: Database
- **JWT**: Token-based authentication

### Database Schema

#### Models
- **User**: Core user data
  - Authentication: mobile number, verification status, user status
  - Profile: name, gender, date of birth, qualification (relation), course, specialization, location
  - Relations: qualification (many-to-one), otps (one-to-many)

- **OTP**: Separate tracking for OTP history
  - Fields: code, expiration, usage status, verification timestamp
  - Relation: user (many-to-one)

- **Qualification**: Dynamic qualification management
  - Fields: name, description, active status
  - Relation: users (one-to-many)

#### Enums
- **Gender**: MALE, FEMALE, OTHER
- **UserStatus**: PENDING_VERIFICATION, VERIFIED, ONBOARDING_INCOMPLETE, ACTIVE, INACTIVE, SUSPENDED

### Key Features
- ✅ Separate OTP model for better tracking and audit trail
- ✅ Qualification as separate model (not enum) for flexibility
- ✅ User status tracking throughout lifecycle
- ✅ Prisma client passed via GraphQL context
- ✅ No "any" types - full type safety
- ✅ Proper error logging with destructuring
- ✅ Organized types folder structure

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
CREATE DATABASE Node_DB;
```

2. Create `.env` file in root directory:
```env
DATABASE_URL="mysql://root:password@localhost:3306/Node_DB"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=4000
```

### Step 3: Run Database Migrations
```bash
npx prisma generate
npx prisma migrate dev
```

### Step 4: Start Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:4000`

## 📝 Complete API Workflow

### Step 0: Setup Qualifications (One-time Admin Task)

Create qualifications that users can select during onboarding:

```graphql
mutation CreateQualification($input: CreateQualificationInput!) {
  createQualification(input: $input) {
    id
    name
    description
  }
}
```

**Variables (run for each qualification):**
```json
{ "input": { "name": "High School", "description": "High School or Secondary Education" } }
{ "input": { "name": "Diploma", "description": "Diploma or Certificate Program" } }
{ "input": { "name": "Bachelor's Degree", "description": "Undergraduate Bachelor's Degree" } }
{ "input": { "name": "Master's Degree", "description": "Postgraduate Master's Degree" } }
{ "input": { "name": "PhD", "description": "Doctoral Degree" } }
{ "input": { "name": "Other", "description": "Other Educational Qualification" } }
```

### Step 1: Get Available Qualifications

```graphql
query GetQualifications {
  qualifications {
    id
    name
    description
    isActive
  }
}
```

**Copy a qualification ID** for use in Step 5.

### Step 2: Send OTP

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
  "mobileNumber": "+919876543210"
}
```

**Check server console** for OTP code (in production, this would be sent via SMS).

### Step 3: Verify OTP & Get Token

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
      status
      name
    }
  }
}
```

**Variables:**
```json
{
  "mobileNumber": "+919876543210",
  "code": "123456"
}
```

**Copy the token** from the response for authenticated requests.

### Step 4: Get Current User Profile (Protected)

```graphql
query GetMe {
  me {
    id
    mobileNumber
    isVerified
    status
    name
    gender
    dateOfBirth
    qualification {
      id
      name
      description
    }
    course
    specialization
    latitude
    longitude
    createdAt
  }
}
```

**HTTP Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

### Step 5: Complete Onboarding (Protected)

```graphql
mutation CompleteOnboarding($input: OnboardingInput!) {
  completeOnboarding(input: $input) {
    id
    mobileNumber
    isVerified
    status
    name
    gender
    dateOfBirth
    qualification {
      id
      name
      description
    }
    course
    specialization
    latitude
    longitude
    createdAt
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
    "qualificationId": "your-qualification-id-from-step-1",
    "course": "Computer Science",
    "specialization": "Artificial Intelligence",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

**HTTP Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

After completion, user status changes from `ONBOARDING_INCOMPLETE` to `ACTIVE`.

## 🔍 Project Structure

```
├── src/
│   ├── graphql/
│   │   ├── schema.ts              # GraphQL type definitions
│   │   └── resolvers/
│   │       ├── index.ts           # Resolver exports
│   │       ├── queries.ts         # Query resolvers (me, qualifications)
│   │       └── mutations.ts       # Mutation resolvers (sendOTP, verifyOTP, etc.)
│   ├── services/
│   │   ├── auth.service.ts        # JWT authentication logic
│   │   ├── otp.service.ts         # OTP generation & verification
│   │   └── user.service.ts        # User management
│   ├── middleware/
│   │   └── auth.middleware.ts     # Authentication middleware
│   ├── types/
│   │   ├── index.ts               # Central type exports
│   │   ├── context.types.ts       # GraphQL context types
│   │   ├── auth.types.ts          # Authentication types
│   │   └── user.types.ts          # User-related types
│   ├── lib/
│   │   └── prisma.ts              # Prisma client instance
│   └── index.ts                   # Server entry point
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── TESTING_GUIDE.md               # Detailed testing guide
├── GRAPHQL_QUERIES_WITH_VARIABLES.md  # All queries with variables
├── MIGRATION_GUIDE.md             # Migration documentation
└── package.json
```

## 🎯 Key Architecture Decisions

### 1. Prisma via Context
All services receive Prisma client as a parameter from GraphQL context:
```typescript
// ✅ Good - Prisma passed via context
static async sendOTP(mobileNumber: string, prisma: PrismaClient) {
  await prisma.user.create({ ... });
}

// ❌ Bad - Direct import
import { prisma } from '../lib/prisma';
```

### 2. Type Safety
No `any` types used - everything is properly typed:
```typescript
// ✅ Good
const { message } = error as Error;
async (_: unknown, { input }: { input: OnboardingData }, context: GraphQLContext)

// ❌ Bad
catch (error: any)
async (_: any, { input }: any, context: any)
```

### 3. Error Logging
Proper destructuring for clean logs:
```typescript
// ✅ Good
const { message } = error as Error;
console.error('Failed to send OTP:', { message, mobileNumber });

// ❌ Bad
console.error('Error:', error);
```

### 4. Separate Models
- **OTP Model**: Tracks OTP history, better audit trail
- **Qualification Model**: Dynamic management via API, not hardcoded enum

### 5. User Status Lifecycle
```
PENDING_VERIFICATION → ONBOARDING_INCOMPLETE → ACTIVE
                    ↓
              INACTIVE / SUSPENDED
```

## 🧪 Testing

### Using GraphQL Playground
1. Open `http://localhost:4000` in browser
2. Use queries from `GRAPHQL_QUERIES_WITH_VARIABLES.md`
3. Add variables in the Variables panel
4. For protected routes, add token in HTTP Headers tab

### Using Postman
See `GRAPHQL_QUERIES_WITH_VARIABLES.md` for Postman setup and examples.

### Complete Testing Flow
See `TESTING_GUIDE.md` for:
- Step-by-step testing instructions
- Expected responses
- Error case testing
- Postman collection format

## 🔐 Security Features

- ✅ OTPs expire after 10 minutes
- ✅ OTPs can only be used once (tracked in separate OTP model)
- ✅ JWT tokens expire in 30 days
- ✅ Mobile numbers are unique per user
- ✅ Protected routes require valid JWT token
- ✅ User status tracking for access control
- ✅ Proper error handling without exposing sensitive data

## 📱 Production Considerations

### Must Implement
1. **SMS Integration**: Replace console.log with actual SMS service (Twilio, AWS SNS, etc.)
2. **Rate Limiting**: Prevent OTP spam
3. **Refresh Tokens**: Implement token refresh mechanism
4. **Input Validation**: Add comprehensive validation
5. **Logging**: Use proper logging service (Winston, Pino)

### Security Enhancements
1. Change `JWT_SECRET` to a strong random value
2. Use environment-specific secrets
3. Implement HTTPS in production
4. Add CORS configuration
5. Implement request throttling
6. Add IP-based rate limiting for OTP requests

### Database Optimization
1. Add indexes for frequently queried fields
2. Implement database connection pooling
3. Add database query logging
4. Set up database backups

## 🐛 Common Issues

### "Invalid signature" Error
**Cause**: Using old JWT token generated with different secret.  
**Solution**: Get a new token by verifying OTP again.

### TypeScript Errors in VS Code
**Cause**: TypeScript server using cached Prisma types.  
**Solution**: Reload VS Code window or restart TypeScript server.

### OTP Not Working
**Cause**: OTP expired (10 minutes) or already used.  
**Solution**: Request a new OTP.

## 📚 Additional Documentation

- `TESTING_GUIDE.md` - Complete testing guide with all scenarios
- `GRAPHQL_QUERIES_WITH_VARIABLES.md` - All queries with variable examples
- `MIGRATION_GUIDE.md` - Database migration guide and breaking changes

## 🚀 Next Steps

1. Integrate real SMS service for OTP delivery
2. Add profile update mutations
3. Implement file upload for profile pictures
4. Add admin panel for qualification management
5. Implement user search and filtering
6. Add pagination for list queries
7. Create user deactivation/suspension flows
8. Add email verification as secondary authentication
9. Implement password-based login as alternative
10. Add social login (Google, Facebook, etc.)

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please follow the existing code structure and type safety patterns.
