# Smart Referral API Documentation

This document provides comprehensive documentation for the Smart Referral system APIs.

## Base URL
```
http://localhost:3000/smart-ref
```

## Authentication
All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Important Notes:**
- All endpoints are protected with JWT authentication
- User-specific endpoints (`my-stats`, `my-commission`) automatically use the authenticated user's ID from the JWT token
- No need to pass user ID as a parameter for user-specific endpoints

---

## 1. Get User Referral Statistics

### Endpoint
```
GET /smart-ref/my-stats
```

### Description
Retrieves comprehensive referral statistics for the authenticated user, including total referrals, active referrals, earnings, and referrals categorized by level.

### Authentication
This endpoint requires JWT authentication. The user ID is automatically extracted from the JWT token.

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
      "total_earning": 125.50,
      "refs_by_level": {
        "1": [
          {
            "user_id": 2,
            "username": "jane_smith",
            "referral_code": "REF789012",
            "created_at": "2025-01-02T10:30:00.000Z"
          },
          {
            "user_id": 3,
            "username": "bob_wilson",
            "referral_code": "REF345678",
            "created_at": "2025-01-03T14:20:00.000Z"
          }
        ],
        "2": [
          {
            "user_id": 4,
            "username": "alice_brown",
            "referral_code": "REF901234",
            "created_at": "2025-01-04T09:15:00.000Z"
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
  -H "Authorization: Bearer your-jwt-token"
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
This endpoint requires JWT authentication. The user ID is automatically extracted from the JWT token.

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
    ],
    "recent_rewards": [
      {
        "id": 101,
        "level": 1,
        "from_user": "jane_smith",
        "from_referral_code": "REF789012",
        "usd_value": 12.50,
        "sol_value": 0.08,
        "withdraw_status": false,
        "withdraw_id": null,
        "created_at": "2025-01-15T10:30:00.000Z"
      },
      {
        "id": 102,
        "level": 2,
        "from_user": "bob_wilson",
        "from_referral_code": "REF345678",
        "usd_value": 8.75,
        "sol_value": 0.06,
        "withdraw_status": true,
        "withdraw_id": 201,
        "created_at": "2025-01-14T15:45:00.000Z"
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
  -H "Authorization: Bearer your-jwt-token"
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
This endpoint requires JWT authentication.

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
  -H "Authorization: Bearer your-jwt-token"
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
  total_earning: number;
  refs_by_level: {
    [level: string]: ReferralUser[];
  };
}

interface ReferralUser {
  user_id: number;
  username: string;
  referral_code: string;
  created_at: string; // ISO 8601 format
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

interface RecentReward {
  id: number;
  level: number;
  from_user: string;
  from_referral_code: string;
  usd_value: number;
  sol_value: number;
  withdraw_status: boolean;
  withdraw_id: number | null;
  created_at: string; // ISO 8601 format
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
| 401 | Unauthorized - Missing or invalid JWT token |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

All endpoints are subject to rate limiting. Please refer to the main API documentation for current rate limits.

---

## Notes

1. **Decimal Precision**: All monetary values are rounded to 5 decimal places for consistency.
2. **Date Format**: All dates are returned in ISO 8601 format (UTC).
3. **Level Limits**: The system supports up to 7 referral levels as configured.
4. **Active Referrals**: Currently, all referrals are considered active. Future versions may include activity-based filtering.
5. **Commission Calculation**: Commissions are calculated based on trading volume and level percentages as configured in the system.

---

## Support

For technical support or questions about these APIs, please contact the development team or refer to the main project documentation.
