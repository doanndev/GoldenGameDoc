# Admin Module API Documentation

This document provides comprehensive API documentation for the Admin module, including authentication, admin management, role management, and permission management.

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Admin Management APIs](#admin-management-apis)
3. [Role Management APIs](#role-management-apis)
4. [Permission Management APIs](#permission-management-apis)
5. [Error Responses](#error-responses)
6. [Testing Examples](#testing-examples)

---

## Authentication APIs

### 1. Admin Login

**Endpoint:** `POST /admin/auth/login`

**Description:** Authenticate admin user with username and password.

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "123456"
  }' \
  -c cookies.txt
```

---

### 2. Get Current Admin

**Endpoint:** `GET /admin/auth/me`

**Description:** Get current authenticated admin information.


**Response:**
```json
{
  "id": 1,
  "username": "superadmin",
  "email": "superadmin@goldengame.com",
  "fullname": "Super Administrator",
  "avatar": null,
  "phone": null,
  "level": "super_admin",
  "role": {
    "id": 1,
    "name": "Super Admin",
    "description": "Full system access with all permissions"
  },
  "last_login": "2025-01-10T10:30:00.000Z",
  "last_ip": "127.0.0.1",
  "status": "active",
  "two_factor_enabled": false
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/admin/auth/me \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

### 3. Admin Logout

**Endpoint:** `POST /admin/auth/logout`

**Description:** Logout current admin and clear session.

  or Cookie: `admin_access_token`

**Response:**
```json
{
  "message": "Logout successful"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/admin/auth/logout \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

### 4. Refresh Access Token

**Endpoint:** `POST /admin/auth/refresh`

**Description:** Refresh access token using refresh token from cookie.

**Headers:** Cookie: `admin_refresh_token` (automatically sent by browser)

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/admin/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

**Note:** This endpoint automatically sets a new `admin_access_token` cookie. No authentication required as it uses the refresh token.

---

## Admin Management APIs

### 1. Get All Admins

**Endpoint:** `GET /admin/list`

**Description:** Get all admin accounts with basic information. Requires `ADMINS.READ` permission.

 

**Response:**
```json
{
  "admins": [
    {
      "id": 1,
      "username": "admin_user",
      "email": "admin@example.com",
      "fullname": "Admin User",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "+1234567890",
      "level": "admin",
      "role": {
        "id": 1,
        "name": "Administrator",
        "description": "Full access administrator"
      },
      "last_login": "2024-01-15T10:30:00.000Z",
      "last_ip": "192.168.1.100",
      "status": "active",
      "two_factor_enabled": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "hasNext": true,
  "hasPrev": false,
  "document_count": 25,
  "level_stats": {
    "support": 5,
    "moderator": 8,
    "admin": 10,
    "super_admin": 2
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/admin/list \
  -H "Authorization: Bearer <admin_jwt_token>"
```
### 1. Lấy tất cả admins (trang đầu tiên)
```bash
GET /admin/list
```

### 2. Phân trang
```bash
GET /admin/list?page=2&limit=5
```

### 3. Tìm kiếm
```bash
GET /admin/list?search=admin
```

### 4. Lọc theo trạng thái
```bash
GET /admin/list?status=active
```

### 5. Lọc theo level
```bash
GET /admin/list?level=admin
```

### 6. Kết hợp các filter
```bash
GET /admin/list?search=john&status=active&level=moderator&page=1&limit=20
```



---

### 2. Create New Admin

**Endpoint:** `POST /admin/create`

**Description:** Create a new admin account. Requires `ADMINS.CREATE` permission.

 

**Request Body:**
```json
{
  "username": "new_admin",
  "email": "admin@example.com",
  "password": "password123",
  "fullname": "New Admin",
  "level": "admin"
}
```

**Note:** The `level` field determines the admin's role. Valid levels:
- `super_admin` → Super Admin role
- `admin` → Admin role
- `moderator` → Moderator role
- `support` → Support role

**Response:**
```json
{
  "message": "Admin created successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/admin/create \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_admin",
    "email": "admin@example.com",
    "password": "password123",
    "fullname": "New Admin",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "level": "admin"
  }'
```

---

---

### 3. Update Admin

**Endpoint:** `PATCH /admin/:id`

**Description:** Update admin account information. Requires `ADMINS.UPDATE` permission.

 

**Request Body:**
```json
{
  "role_id": "2"
}
```

**Note:** Only `role_id` can be updated. The admin's level will be automatically determined from the new role.

**Response:**
```json
{
  "message": "Admin updated successfully",
  "admin": {
    "id": 1,
    "username": "updated_username",
    "email": "updated@example.com",
    "fullname": "Admin User",
    "avatar": null,
    "phone": null,
    "level": "admin",
    "role": {
      "id": 2,
      "name": "Admin",
      "description": "General admin with most permissions"
    },
    "last_login": "2025-01-10T10:30:00.000Z",
    "last_ip": "127.0.0.1",
    "status": "active",
    "two_factor_enabled": false
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/admin/1 \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": "2"
  }'
```

---

### 4. Delete Admin

**Endpoint:** `DELETE /admin/:id`

**Description:** Delete (deactivate) admin account. Requires `ADMINS.DELETE` permission.

 

**Request Body:**
```json
{
  "reason": "Account no longer needed"
}
```

**Note:** The `reason` field is optional. Admin is deactivated (status = inactive) rather than permanently deleted.

**Response:**
```json
{
  "message": "Admin deactivated successfully",
  "admin_id": 1,
  "action": "delete",
  "timestamp": "2025-01-10T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/admin/1 \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Account no longer needed"
  }'
```

---

## Role Management APIs

### 1. Get All Roles

**Endpoint:** `GET /admin/roles`

**Description:** Get all available roles (permissions details only available in get role by ID). Requires `SYSTEM.VIEW` permission.

 

**Response:**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "description": "Administrator role",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "hasNext": true,
  "hasPrev": false
}
```


### 2. Phân trang
```bash
GET /admin/roles?page=2&limit=5
```

### 3. Tìm kiếm
```bash
GET /admin/roles?search=admin
```

### 4. Lọc theo trạng thái
```bash
GET /admin/roles?status=active
```

### 5. Kết hợp các filter
```bash
GET /admin/roles?search=user&status=active&page=1&limit=20
```


**cURL Example:**
```bash
curl -X GET http://localhost:3000/admin/roles \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

### 2. Get Role by ID

**Endpoint:** `GET /admin/roles/:id`

**Description:** Get specific role with its permissions. Requires `SYSTEM.VIEW` permission.

 

**Response:**
```json
{
  "id": 1,
  "name": "Super Admin",
  "description": "Full system access with all permissions",
  "status": "active",
  "created_at": "2025-01-10T10:30:00.000Z",
  "updated_at": "2025-01-10T10:30:00.000Z",
  "permissions": [
    {
      "id": 1,
      "name": "users.create",
      "resource": "users",
      "action": "create",
      "description": "Create new users",
      "status": "active",
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/admin/roles/1 \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

### 3. Create Custom Role

**Endpoint:** `POST /admin/roles`

**Description:** Create a new custom role with selected permissions. Requires `SYSTEM.MANAGE` permission.

 

**Request Body:**
```json
{
  "name": "Custom Moderator",
  "description": "Custom role for specific moderation tasks",
  "permission_ids": "1,2,3,5,8,12"
}
```

**Response:**
```json
{
  "message": "Role created successfully",
  "role": {
    "id": 5,
    "name": "Custom Moderator",
    "description": "Custom role for specific moderation tasks",
    "status": "active",
    "created_at": "2025-01-10T10:30:00.000Z",
    "updated_at": "2025-01-10T10:30:00.000Z",
    "permissions": [
      {
        "id": 1,
        "name": "users.create",
        "resource": "users",
        "action": "create",
        "description": "Create new users",
        "status": "active",
        "created_at": "2025-01-10T10:30:00.000Z",
        "updated_at": "2025-01-10T10:30:00.000Z"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/admin/roles \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Moderator",
    "description": "Custom role for specific moderation tasks",
    "status": "active",
    "permission_ids": "1,2,3,5,8,12"
  }'
```

---

### 4. Update Role

**Endpoint:** `PATCH /admin/roles/:id`

**Description:** Update existing role and its permissions. Requires `SYSTEM.MANAGE` permission.

 

**Request Body:**
```json
{
  "name": "Updated Moderator",
  "description": "Updated description",
  "permission_ids": "1,2,3,5,8,12,15"
}
```

**Response:**
```json
{
  "message": "Role updated successfully",
  "role": {
    "id": 5,
    "name": "Updated Moderator",
    "description": "Updated description",
    "status": "active",
    "created_at": "2025-01-10T10:30:00.000Z",
    "updated_at": "2025-01-10T10:30:00.000Z",
    "permissions": []
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/admin/roles/5 \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Moderator",
    "description": "Updated description",
    "permission_ids": "1,2,3,5,8,12,15"
  }'
```

---

### 5. Delete Role

**Endpoint:** `DELETE /admin/roles/:id`

**Description:** Delete role. Requires `SYSTEM.MANAGE` permission.

 

**Response:**
```json
{
  "message": "Role deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/admin/roles/5 \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---
---

## Permission Management APIs

### 1. Get All Permissions

**Endpoint:** `GET /admin/permissions`

**Description:** Get all available permissions. Requires `SYSTEM.VIEW` permission.

 

**Query Parameters:**
- `resource` (optional): Filter permissions by resource (e.g., "users", "admins", "transactions")

**Response:**
```json
{
  "permissions": [
    {
      "id": 1,
      "name": "users.create",
      "resource": "users",
      "action": "create",
      "description": "Create new users",
      "status": "active",
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "users.read",
      "resource": "users",
      "action": "read",
      "description": "View user information",
      "status": "active",
      "created_at": "2025-01-10T10:30:00.000Z",
      "updated_at": "2025-01-10T10:30:00.000Z"
    }
  ],
  "total": 2
}
```

**cURL Examples:**
```bash
# Get all permissions
curl -X GET http://localhost:3000/admin/permissions \
  -H "Authorization: Bearer <admin_jwt_token>"

# Get permissions by resource
curl -X GET "http://localhost:3000/admin/permissions?resource=users" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## Error Responses

### Common Error Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

### Example Error Responses

**Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Invalid username or password",
  "error": "Unauthorized"
}
```

**Forbidden (Permission Denied):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden",
  "details": {
    "reason": "Insufficient permissions",
    "required": "create on admins",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

**Conflict:**
```json
{
  "statusCode": 409,
  "message": "Username already exists",
  "error": "Conflict"
}
```

---

## Testing Examples

### Complete Workflow Test

1. **Login as Super Admin:**
```bash
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "123456"}' \
  -c cookies.txt
```

2. **Get All Admins:**
```bash
curl -X GET http://localhost:3000/admin/list \
  -H "Authorization: Bearer <admin_jwt_token>"
```

3. **Get Available Roles:**
```bash
curl -X GET http://localhost:3000/admin/roles/available \
  -H "Authorization: Bearer <admin_jwt_token>"
```

4. **Get All Permissions:**
```bash
curl -X GET http://localhost:3000/admin/permissions \
  -H "Authorization: Bearer <admin_jwt_token>"
```

4. **Create Custom Role:**
```bash
curl -X POST http://localhost:3000/admin/roles \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Role",
    "description": "Custom role description",
    "status": "active",
    "permission_ids": "1,2,3,5"
  }'
```

5. **Create Admin with Custom Role:**
```bash
curl -X POST http://localhost:3000/admin/create \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_admin",
    "email": "test@example.com",
    "password": "password123",
    "fullname": "Test Admin",
    "level": "admin"
  }'
```

6. **Get Current Admin Info:**
```bash
curl -X GET http://localhost:3000/admin/auth/me \
  -H "Authorization: Bearer <admin_jwt_token>"
```

7. **Refresh Access Token:**
```bash
curl -X POST http://localhost:3000/admin/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

8. **Logout:**
```bash
curl -X POST http://localhost:3000/admin/auth/logout \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## Default Super Admin Credentials

After server initialization, you can use these credentials to test:

- **Username:** `superadmin`
- **Email:** `superadmin@goldengame.com`
- **Password:** `1234`

**⚠️ Important:** Change the super admin password after first login for security!

---

## Permission System

The admin module uses a comprehensive permission system based on `resource` and `action`:

### Permission Structure
- **Resources:** `ADMINS`, `USERS`, `TRANSACTIONS`, `WALLETS`, `SYSTEM`, `REPORTS`, etc.
- **Actions:** `CREATE`, `READ`, `UPDATE`, `DELETE`, `MANAGE`, `VIEW`, etc.

### Required Permissions by Endpoint

| Endpoint | Method | Required Permission |
|----------|--------|-------------------|
| `/admin/create` | POST | `ADMINS.CREATE` |
| `/admin/list` | GET | `ADMINS.READ` |
| `/admin/:id` | PATCH | `ADMINS.UPDATE` |
| `/admin/:id` | DELETE | `ADMINS.DELETE` |
| `/admin/roles` | GET | `SYSTEM.VIEW` |
| `/admin/roles/:id` | GET | `SYSTEM.VIEW` |
| `/admin/roles` | POST | `SYSTEM.MANAGE` |
| `/admin/roles/:id` | PATCH | `SYSTEM.MANAGE` |
| `/admin/roles/:id` | DELETE | `SYSTEM.MANAGE` |
| `/admin/permissions` | GET | `SYSTEM.VIEW` |

### Permission Levels
- **Super Admin:** Has all permissions automatically
- **Admin:** Most permissions except super admin specific functions
- **Moderator:** User management and basic permissions
- **Support:** Basic read permissions only

---

## Notes

1. **Authentication:** All endpoints except login require valid JWT token in Authorization header or admin_access_token cookie.

2. **Permissions:** All endpoints now use permission-based access control instead of role-level restrictions.

3. **Validation:** All input data is validated according to DTO specifications.

4. **Logging:** All admin actions are logged for audit purposes.

5. **Email Notifications:** New admin accounts receive email notifications with login credentials.

6. **Role Safety:** Cannot delete roles that are being used by existing admins.

7. **Level-based Admin Creation:** Use `level` field instead of `role_id` when creating new admins.

---

## Postman Collection

You can import this collection into Postman for easier testing:

```json
{
  "info": {
    "name": "Admin Module API",
    "description": "Complete API collection for Admin module testing"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Admin Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"superadmin\",\n  \"password\": \"1234\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/admin/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

Replace `{{baseUrl}}` with your server URL (e.g., `http://localhost:3000`).
