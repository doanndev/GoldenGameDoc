# Game Rooms API Module

## Overview
The Game Rooms API module provides functionality for managing game rooms and game lists in a gaming platform. It allows users to create, update, delete, and retrieve game rooms with associated prize structures.

## Features
- **Game Lists Management**: Create and manage different types of games
- **Game Rooms Management**: Create, update, delete, and retrieve game rooms
- **Prize Structure Management**: Set up prize distributions with validation
- **User Authentication**: JWT-based authentication for protected endpoints
- **Master User Validation**: Only master users can manage game rooms

## API Endpoints

### Game Lists

### url

```
url: https://8w7n4n91-8008.asse.devtunnels.ms
```

#### 0. Login ưith master account

```json
{
  "username": "truonghai",
  "password": "truonghai123!"
}
```

#### 1. Get All Game Lists
```http
GET /game-rooms/get-game-lists
```

**Description**: Retrieve all available game lists

**Response**:
```json
{
  "message": "Game lists retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Slot Machine",
      "symbol": "SLOT"
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
  "gl_name": "Slot Machine",
  "gl_symbol": "SLOT"
}
```

**Validation Rules**:
- `gl_name`: String, 3-20 characters, alphanumeric with dots and underscores only
- `gl_symbol`: String, required

**Response**:
```json
{
  "message": "Game list created successfully"
}
```

#### 3. Get Game List by ID
```http
GET /game-rooms/get-game-list/by-id/?id=<:id>
```

**Description**: Retrieve a specific game list by ID

**Parameters**:
- `id` (number): Game list ID

**Response**:
```json
{
  "message": "Game list retrieved successfully",
  "data": {
    "id": 1,
    "name": "Slot Machine",
    "symbol": "SLOT"
  }
}
```

### Game Rooms

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
    "gr_participation_amount": 10.50,
    "gr_prizes_num": 3
  },
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
```

**Validation Rules**:
- `gr_participation_amount`: Number, 0-100, max 2 decimal places
- `gr_prizes_num`: Number, 1-20
- `gsp_rank`: Number, 1-20, must be sequential (1, 2, 3, ...)
- `gsp_percent`: Number, 0-100, max 2 decimal places, must decrease with rank
- Total percent must equal 100%
- Maximum 20 prizes allowed

**Response**:
```json 
status 200
{
    "message": "Game room created successfully"
}

status 400

{
    "statusCode": 400,
    "message": "Game room participation amount must be greater than 0"
}

{
    "statusCode": 400,
    "message": "Game room participation amount and prizes number are required"
}

{
    "statusCode": 400,
    "message": "Game room prizes number must be equal to the number of prizes"
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
  "message": "Game room not found",
  "error": "Not Found"
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
    "gr_name": "Updated Game Room",
    "gr_symbol": "UPD",
    "gr_participation_amount": 15.00,
    "gr_prizes_num": 3
  },
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
```

**Validation Rules**:
- Same validation as create game room
- **Prize Replacement**: If `game_set_prizes` is provided, ALL existing prizes will be deleted and replaced with new ones
- **Transaction Safety**: Prize deletion and creation happens in a single transaction
- Number of prizes must match `gr_prizes_num`
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
6. **Prize Count Match**: Number of prizes must match `gr_prizes_num` field

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
- `DEFAULT_SYMBOL_GAME_ROOM`: Default symbol for game room naming (required)

## Usage Examples

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
      gr_game_type_id: 1,
      gr_participation_amount: 25.00,
      gr_prizes_num: 3
    },
    game_set_prizes: [
      { gsp_rank: 1, gsp_percent: 60.00 },
      { gsp_rank: 2, gsp_percent: 25.00 },
      { gsp_rank: 3, gsp_percent: 15.00 }
    ]
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
      gr_name: "Updated Room",
      gr_symbol: "UPD",
      gr_participation_amount: 30.00,
      gr_prizes_num: 3
    },
    game_set_prizes: [
      { gsp_rank: 1, gsp_percent: 50.00 },
      { gsp_rank: 2, gsp_percent: 30.00 },
      { gsp_rank: 3, gsp_percent: 20.00 }
    ]
  })
});
```

## Notes
- Game room deletion is soft delete (status set to DELETE)
- **Prize updates are complete replacement**: When updating prizes, all existing prizes are deleted and replaced with new ones
- All monetary values support up to 2 decimal places
- Game room names are automatically generated and unique
- The system validates prize structure integrity on every operation
- Prize operations use database transactions to ensure data consistency
