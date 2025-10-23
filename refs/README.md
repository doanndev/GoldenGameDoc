# Smart Referral API Documentation

This document provides comprehensive documentation for the Smart Referral system APIs.

## Base URL
```
http://localhost:3000/smart-ref
```

## Authentication
All endpoints require JWT authentication using HTTP-only cookies. The JWT token is automatically sent with each request via cookies.

**Important Notes:**
- All endpoints are protected with JWT authentication via HTTP-only cookies
- User-specific endpoints (`my-stats`, `my-commission`) automatically use the authenticated user's ID from the JWT token
- No need to pass user ID as a parameter for user-specific endpoints
- No need to manually include Authorization headers - cookies are handled automatically by the browser

---

## 1. Get User Referral Statistics

### Endpoint
```
GET /smart-ref/my-stats
```

### Description
Retrieves comprehensive referral statistics for the authenticated user, including total referrals, active referrals, earnings, and referrals categorized by level.

### Authentication
This endpoint requires JWT authentication via HTTP-only cookies. The user ID is automatically extracted from the JWT token.

### Parameters
No parameters required. The user ID is obtained from the authenticated JWT token.

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully retrieved referral statistics",
  "data": {
    "user_info": {
      "user_id": 1,
      "username": "john_doe",
      "referral_code": "REF123456",
      "created_at": "2025-01-01T00:00:00.000Z"
    },
    "stats": {
      "total_refs": 15,
      "active_refs": 12,
      "total_earning_mpb": 125.50,
      "refs_by_level": {
        "1": [
          {
            "user_id": 2,
            "username": "jane_smith",
            "referral_code": "REF789012",
            "created_at": "2025-01-02T10:30:00.000Z",
            "status": "active",
            "is_active": true,
            "earnings": {
              "total_mpb": 25.50,
              "available_mpb": 15.30,
              "withdrawn_mpb": 10.20,
              "reward_count": 3
            }
          },
          {
            "user_id": 3,
            "username": "bob_wilson",
            "referral_code": "REF345678",
            "created_at": "2025-01-03T14:20:00.000Z",
            "status": "active",
            "is_active": true,
            "earnings": {
              "total_mpb": 18.75,
              "available_mpb": 8.75,
              "withdrawn_mpb": 10.00,
              "reward_count": 2
            }
          }
        ],
        "2": [
          {
            "user_id": 4,
            "username": "alice_brown",
            "referral_code": "REF901234",
            "created_at": "2025-01-04T09:15:00.000Z",
            "status": "block",
            "is_active": false,
            "earnings": {
              "total_mpb": 12.25,
              "available_mpb": 0.00,
              "withdrawn_mpb": 12.25,
              "reward_count": 1
            }
          }
        ]
      }
    }
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error retrieving referral statistics",
  "data": null
}
```

### Example Usage
```bash
curl -X GET "http://localhost:3000/smart-ref/my-stats" \
  --cookie "jwt=your-jwt-token"
```

---

## 2. Get User Commission Information

### Endpoint
```
GET /smart-ref/my-commission
```

### Description
Retrieves detailed commission information for the authenticated user, including total earnings, available/withdrawn amounts, and breakdown by level.

### Authentication
This endpoint requires JWT authentication via HTTP-only cookies. The user ID is automatically extracted from the JWT token.

### Parameters
No parameters required. The user ID is obtained from the authenticated JWT token.

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully retrieved commission information",
  "data": {
    "user_info": {
      "user_id": 1,
      "username": "john_doe",
      "referral_code": "REF123456"
    },
    "total_stats": {
      "total_usd": 125.50,
      "total_sol": 0.85,
      "total_token": 125.50,
      "available_usd": 75.30,
      "available_sol": 0.51,
      "withdrawn_usd": 50.20,
      "withdrawn_sol": 0.34
    },
    "by_level": [
      {
        "level": 1,
        "total_usd": 75.30,
        "total_sol": 0.51,
        "available_usd": 45.20,
        "available_sol": 0.31,
        "withdrawn_usd": 30.10,
        "withdrawn_sol": 0.20,
        "count": 8
      },
      {
        "level": 2,
        "total_usd": 50.20,
        "total_sol": 0.34,
        "available_usd": 30.10,
        "available_sol": 0.20,
        "withdrawn_usd": 20.10,
        "withdrawn_sol": 0.14,
        "count": 4
      }
    ]
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error retrieving commission information",
  "data": null
}
```

### Example Usage
```bash
curl -X GET "http://localhost:3000/smart-ref/my-commission" \
  --cookie "jwt=your-jwt-token"
```

---

## 3. Get Level Commission Settings

### Endpoint
```
GET /smart-ref/level-settings
```

### Description
Retrieves all active level commission settings, including commission percentages for each level.

### Authentication
This endpoint requires JWT authentication via HTTP-only cookies.

### Parameters
No parameters required.

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully retrieved level commission settings",
  "data": {
    "summary": {
      "total_levels": 7,
      "max_level": 7,
      "average_percentage": 2.14
    },
    "levels": [
      {
        "id": 1,
        "level": 1,
        "percentage": 5.00,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "level": 2,
        "percentage": 3.00,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 3,
        "level": 3,
        "percentage": 2.00,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 4,
        "level": 4,
        "percentage": 1.50,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 5,
        "level": 5,
        "percentage": 1.00,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 6,
        "level": 6,
        "percentage": 0.75,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      },
      {
        "id": 7,
        "level": 7,
        "percentage": 0.50,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Error Response (404 Not Found)
```json
{
  "success": false,
  "message": "No level commission settings found",
  "data": null
}
```

#### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error retrieving level commission settings",
  "data": null
}
```

### Example Usage
```bash
curl -X GET "http://localhost:3000/smart-ref/level-settings" \
  --cookie "jwt=your-jwt-token"
```

---

## Data Models

### User Information
```typescript
interface UserInfo {
  user_id: number;
  username: string;
  referral_code: string;
  created_at: string; // ISO 8601 format
}
```

### Referral Statistics
```typescript
interface ReferralStats {
  total_refs: number;
  active_refs: number;
  total_earning_mpb: number;
  refs_by_level: {
    [level: string]: ReferralUser[];
  };
}

interface ReferralUser {
  user_id: number;
  username: string;
  referral_code: string;
  created_at: string; // ISO 8601 format
  status: string;
  is_active: boolean;
  earnings: {
    total_mpb: number;
    available_mpb: number;
    withdrawn_mpb: number;
    reward_count: number;
  };
}
```

### Commission Statistics
```typescript
interface CommissionStats {
  total_usd: number;
  total_sol: number;
  total_token: number;
  available_usd: number;
  available_sol: number;
  withdrawn_usd: number;
  withdrawn_sol: number;
}

interface LevelCommission {
  level: number;
  total_usd: number;
  total_sol: number;
  available_usd: number;
  available_sol: number;
  withdrawn_usd: number;
  withdrawn_sol: number;
  count: number;
}

```

### Level Settings
```typescript
interface LevelSettingsSummary {
  total_levels: number;
  max_level: number;
  average_percentage: number;
}

interface LevelSetting {
  id: number;
  level: number;
  percentage: number;
  is_active: boolean;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}
```

---

## Error Handling

All APIs follow a consistent error response format:

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  data: null;
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized - Missing or invalid JWT token in HTTP-only cookie |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

All endpoints are subject to rate limiting. Please refer to the main API documentation for current rate limits.

---

## Notes

1. **Decimal Precision**: All monetary values are rounded to 5 decimal places for consistency.
2. **Date Format**: All dates are returned in ISO 8601 format (UTC).
3. **Level Limits**: The system supports up to 7 referral levels as configured.
4. **Active Referrals**: Active referrals are defined as users with status not equal to 'block'. Blocked users are excluded from active referral counts.
5. **Commission Calculation**: Commissions are calculated based on trading volume and level percentages as configured in the system.
6. **Currency**: The `getUserRefStats` API returns earnings in MBP (token_reward) instead of USD for better token-based tracking.
7. **Earnings Breakdown**: Each referral includes detailed earnings information showing total, available, and withdrawn MBP amounts along with reward count.
8. **Referral Codes**: All referral codes are exactly 8 characters long, containing only letters and numbers (alphanumeric).
9. **Authentication**: JWT tokens are stored in HTTP-only cookies for enhanced security, preventing XSS attacks.

---

## Support

For technical support or questions about these APIs, please contact the development team or refer to the main project documentation.
