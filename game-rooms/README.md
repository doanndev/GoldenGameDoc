# Games API Module

## Overview
The Games API module provides functionality for managing game lists and game rooms in a gaming platform. It consists of two main controllers: `GameListsController` for managing game types and `GameRoomsController` for managing game rooms with associated prize structures.

## Features
- **Game Lists Management**: Create, update, delete, and retrieve different types of games
- **Game Rooms Management**: Create, update, delete, and retrieve game rooms with prize distributions
- **Prize Structure Management**: Set up prize distributions with comprehensive validation
- **User Authentication**: JWT-based authentication for protected endpoints
- **Master User Validation**: Only master users can manage game rooms
- **Pagination Support**: Built-in pagination for game rooms listing

## API Endpoints

## API Endpoints

### Game Lists

#### Send code

```http
POST /auth/send-code
```

```json
{
    "email": "truonghai9426@gmail.com"
}
```

#### Register

```http
POST /auth/register
```

```json
{
  "email": "truonghai9426@gmail.com",
  "code": "886362",
  "username": "truonghai",
  "fullname": "Truong Hai",
  "password": "truonghai123!"
}
```
#### Account must master role and approved by admin
#### 0. Login ưith master account
Ví dụ:

```http
POST /auth/login
```

```json
{
  "username": "truonghai",
  "password": "truonghai123!"
}
```

```
url: https://8w7n4n91-8008.asse.devtunnels.ms/api/v1
```

### Game Lists Controller (`/game-lists`)

#### 1. Get All Game Lists
```http
GET /game-rooms/get-game-lists
```

**Description**: Retrieve all active game lists

**Response**:
```json
{
  "message": "Game types fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Slot Machine",
      "symbol": "SLOT"
    },
    {
      "id": 2,
      "name": "Poker",
      "symbol": "POKER"
    }
  ]
}
```

#### 2. Create Game List
```http
POST /game-rooms/create-list-game
```

**Description**: Create a new game list

**Request Body**:
```json
{
  "name": "Slot Machine",
  "symbol": "SLOT"
}
```

**Validation Rules**:
- `name`: String, 3-20 characters, required
- `symbol`: String, required

**Response**:
```json
{
  "message": "Game type created successfully"
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "message": "Game type already exists"
}
```

#### 3. Get Game List by ID
```http
GET /game-rooms/get-game-list/by-id?id=<:id>
```

**Description**: Retrieve a specific game list by ID

**Parameters**:
- `id` (number): Game list ID

**Response**:
```json
{
  "message": "Game type fetched successfully",
  "data": {
    "id": 1,
    "name": "Slot Machine",
    "symbol": "SLOT"
  }
}
```

**Error Response**:
```json
{
  "statusCode": 404,
  "message": "Game type not found"
}
```

### Game Rooms Controller (`/game-rooms`)

#### 1. Create Game Room
```http
POST /game-rooms/create-game-room
```

**Description**: Create a new game room with prize structure

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "game_room": {
    "participation_amount": 10.50,
    "prizes_num": 3
  },
  "game_set_prizes": [
    {
      "rank": 1,
      "percent": 50.00
    },
    {
      "rank": 2,
      "percent": 30.00
    },
    {
      "rank": 3,
      "percent": 20.00
    }
  ],
  "game_type_id": 1
}
```

**Validation Rules**:
- `participation_amount`: Number, 0-100, max 2 decimal places
- `prizes_num`: Number, 1-20
- `rank`: Number, 1-20, must be sequential (1, 2, 3, ...)
- `percent`: Number, 0-100, max 2 decimal places, must decrease with rank
- `game_type_id`: Number, must reference existing game list
- Total percent must equal 100%
- Maximum 20 prizes allowed

**Response**:
```json
{
  "message": "Game room created successfully"
}
```

**Error Responses**:
```json
{
  "statusCode": 400,
  "message": "Game room participation amount must be greater than 0"
}

{
  "statusCode": 400,
  "message": "Game room prizes number must be equal to the number of prizes"
}

{
  "statusCode": 403,
  "message": "User is not master"
}
```

#### 2. Get Game Rooms
```http
GET /game-rooms/get-game-rooms
```

**Description**: Retrieve game rooms with pagination and filtering

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `room_id` (number, optional): Filter by game room id
- `host_id` (number, optional): Filter by game room owner id

**Response**:
```json
{
  "message": "Game rooms fetched successfully",
  "data": [
    {
      "gr_id": 1,
      "gr_name": "GOLDEN_SLOT_001",
      "gr_symbol": "GOLD",
      "gr_participation_amount": 10.50,
      "gr_prizes_num": 3,
      "gr_status": "inactive",
      "game_set_prizes": [
        {
          "gsp_rank": 1,
          "gsp_percent": 50.00
        },
        {
          "gsp_rank": 2,
          "gsp_percent": 30.00
        },
        {
          "gsp_rank": 3,
          "gsp_percent": 20.00
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 3. Get Game Room by ID
```http
GET /game-rooms/get-game-room-by-id?id=<:id>
```

**Description**: Retrieve a specific game room by ID

**Authentication**: Required (JWT)

**Parameters**:
- `id` (number): Game room ID

**Response**:
```json
{
  "message": "Game room fetched successfully",
  "data": [
    {
      "gr_id": 1,
      "gr_name": "GOLDEN_SLOT_001",
      "gr_symbol": "GOLD",
      "gr_participation_amount": 10.50,
      "gr_prizes_num": 3,
      "gr_status": "inactive",
      "game_set_prizes": [
        {
          "gsp_rank": 1,
          "gsp_percent": 50.00
        },
        {
          "gsp_rank": 2,
          "gsp_percent": 30.00
        },
        {
          "gsp_rank": 3,
          "gsp_percent": 20.00
        }
      ]
    }
  ]
}
```

**Error Response**:
```json
{
  "statusCode": 404,
  "message": "Game room not found"
}
```

#### 4. Update Game Room
```http
PATCH /game-rooms/update-game-room?id=<:id>
```

**Description**: Update an existing game room and its prize structure

**Authentication**: Required (JWT)

**Parameters**:
- `id` (number): Game room ID

**Request Body**:
```json
{
  "game_room": {
    "name": "Updated Game Room",
    "symbol": "UPD",
    "participation_amount": 15.00,
    "prizes_num": 3
  },
  "game_set_prizes": [
    {
      "rank": 1,
      "percent": 50.00
    },
    {
      "rank": 2,
      "percent": 30.00
    },
    {
      "rank": 3,
      "percent": 20.00
    }
  ]
}
```

**Validation Rules**:
- Same validation as create game room
- **Prize Replacement**: If `game_set_prizes` is provided, ALL existing prizes will be deleted and replaced with new ones
- **Transaction Safety**: Prize deletion and creation happens in a single transaction
- Number of prizes must match `prizes_num`
- Total percentage must equal 100%

**Response**:
```json
{
  "message": "Game room updated successfully"
}
```

**Error Responses**:
```json
{
  "statusCode": 400,
  "message": "Game room prizes number must be equal to the number of prizes"
}

{
  "statusCode": 403,
  "message": "User is not master"
}
```

#### 5. Delete Game Room
```http
DELETE /game-rooms/delete-game-room?id=<:id>
```

**Description**: Soft delete a game room (sets status to DELETE)

**Authentication**: Required (JWT)

**Parameters**:
- `id` (number): Game room ID

**Response**:
```json
{
  "message": "Game room deleted successfully"
}
```

**Error Responses**:
```json
{
  "statusCode": 404,
  "message": "Game room not found"
}

{
  "statusCode": 403,
  "message": "User is not master"
}
```

## Data Models

### GameRoomStatus Enum
```typescript
enum GameRoomStatus {
  WAIT = 'wait',
  RUN = 'run',
  INACTIVE = 'inactive',
  DELETE = 'delete'
}
```

### GameListStatus Enum
```typescript
enum GameListStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
```

## Business Rules

### Prize Structure Validation
1. **Rank Sequence**: Ranks must be sequential starting from 1 (1, 2, 3, ...)
2. **Percent Order**: Percent must decrease with rank (rank 1 has highest percent)
3. **Total Percent**: Sum of all percentages must equal exactly 100%
4. **Maximum Prizes**: Maximum 20 prizes allowed per game room
5. **Percent Range**: Each prize percent must be between 0-100%
6. **Prize Count Match**: Number of prizes must match `prizes_num` field

### User Permissions
- Only users with `is_master: true` can create, update, or delete game rooms
- All game room operations require JWT authentication
- Game list operations are public (no authentication required)

### Update Logic
- **Complete Prize Replacement**: When updating a game room with `game_set_prizes`, the system performs a complete replacement:
  1. Deletes ALL existing prizes for the game room
  2. Creates new prizes from the provided data
  3. Uses database transactions to ensure data consistency
- **Optional Prize Update**: If `game_set_prizes` is not provided in the update request, only the basic game room information is updated
- **Transaction Safety**: All prize operations are wrapped in database transactions to prevent partial updates

### Game Room Naming
- Game room names are auto-generated using format: `{DEFAULT_SYMBOL}_{GAME_TYPE_SYMBOL}_{SEQUENCE}`
- Example: `GOLD_SLOT_001`, `GOLD_POKER_002`

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Rank must be sequential starting from 1, but got rank 3 at position 2",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "User is not master",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Game room not found",
  "error": "Not Found"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Default symbol not found",
  "error": "Internal Server Error"
}
```

## Configuration

### Environment Variables
- `DEFAULT_SYMBOL_GAME_ROOM`: Default symbol for game room naming (default: "GOLD")

## Usage Examples

### Creating a Game List
```javascript
const response = await fetch('/game-lists', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Slot Machine",
    symbol: "SLOT"
  })
});
```

### Creating a Game Room with Prizes
```javascript
const response = await fetch('/game-rooms/create-game-room', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    game_room: {
      participation_amount: 25.00,
      prizes_num: 3
    },
    game_set_prizes: [
      { rank: 1, percent: 60.00 },
      { rank: 2, percent: 25.00 },
      { rank: 3, percent: 15.00 }
    ],
    game_type_id: 1
  })
});
```

### Updating Game Room Prizes
```javascript
const response = await fetch('/game-rooms/update-game-room?id=1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    game_room: {
      name: "Updated Room",
      symbol: "UPD",
      participation_amount: 30.00,
      prizes_num: 3
    },
    game_set_prizes: [
      { rank: 1, percent: 50.00 },
      { rank: 2, percent: 30.00 },
      { rank: 3, percent: 20.00 }
    ]
  })
});
```

### Getting Game Rooms with Pagination
```javascript
const response = await fetch('/game-rooms/get-game-rooms?page=1&limit=10&host_id=123', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

## Notes
- Game room deletion is soft delete (status set to DELETE)
- **Prize updates are complete replacement**: When updating prizes, all existing prizes are deleted and replaced with new ones
- All monetary values support up to 2 decimal places
- Game room names are automatically generated and unique
- The system validates prize structure integrity on every operation
- Prize operations use database transactions to ensure data consistency
- Game lists are managed separately from game rooms for better organization
- Both controllers share the same DTO definitions for consistency
