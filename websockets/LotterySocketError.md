# Lottery Socket Error Documentation

This document provides a comprehensive list of all error events and messages that can be emitted by the Lottery WebSocket Gateway.

## Error Event Types

### 1. `error` Event
The main error event that can be emitted for various failure scenarios.

#### Event Structure
```typescript
{
  message: string;
  timestamp?: string;
}
```

### 2. `prizeAlreadyViewed` Event
Special error event for when a prize has already been marked as viewed by another user.

#### Event Structure
```typescript
{
  sessionId: number;
  winningNumber: number;
  message: string;
  timestamp: string;
}
```

## Error Messages by Event Handler

### 1. `joinSession` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId | `"Session ID is required"` |
| User not authenticated | `"Authentication required. Please refresh and login again."` |
| User not authorized to join session | `"You are not authorized to join this session. Please check your session access."` |
| General join session error | `"Failed to join session"` or custom error message |

### 2. `startSession` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId | `"Session ID is required"` |
| Session already being started | `"Session is already being started. Please wait..."` |
| Service start session failure | Custom message from `result.message` |
| General start session error | `"Failed to start session"` or custom error message |

### 3. `getNumbers` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId | `"Session ID is required"` |
| User not authenticated | `"Authentication required. Please refresh and login again."` |
| General get numbers error | `"Failed to get numbers info"` or custom error message |

### 4. `getSelectedNumbers` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId | `"Session ID is required"` |
| General get selected numbers error | `"Failed to get selected numbers"` or custom error message |

### 5. `getViewedPrizes` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId | `"Session ID is required"` |
| User not authenticated | `"Authentication required. Please refresh and login again."` |
| User not authorized to view prizes (403) | `"You are not authorized to view prizes in this session"` |
| General get prizes error | `"Failed to get prizes"` or custom error message |

### 6. `getPrize` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId | `"Session ID is required"` |
| User not authenticated | `"Authentication required. Please refresh and login again."` |
| User not authorized to view prizes (403) | `"You are not authorized to view prizes in this session"` |
| General get prizes error | `"Failed to get prizes"` or custom error message |

### 7. `selectNumber` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId or ticketNumber | `"Session ID and ticket number are required"` |
| User not authenticated | `"Authentication required. Please refresh and login again."` |
| User already selecting a number | `"You are already selecting a number. Please wait for the current selection to complete."` |
| User not authorized to select numbers | `"You are not authorized to select numbers in this session. Please join the game first."` |
| User already selected a number | `"You have already selected a number. Each user can only select one number per session."` |
| Service select number failure | Custom message from `result.message` |
| General select number error | `"Failed to select number"` or custom error message |

### 8. `markPrizeAsViewed` Event

| Error Condition | Error Message |
|----------------|---------------|
| Missing sessionId or winningNumber | `"Session ID and winning number are required"` |
| User not authenticated | `"Authentication required. Please refresh and login again."` |
| Prize already viewed by another user (409) | Emits `prizeAlreadyViewed` event with message: `"Prize has already been marked as viewed by another user"` |
| User not authorized to view prizes (403) | `"You are not authorized to view prizes in this session"` |
| Service mark prize failure | Custom message from `result.message` |
| General mark prize error | `"Failed to mark prize as viewed"` or custom error message |

## HTTP Status Code Mapping

The gateway handles specific HTTP status codes and emits appropriate error messages:

| Status Code | Error Event | Error Message |
|-------------|-------------|---------------|
| 403 (FORBIDDEN) | `error` | `"You are not authorized to view prizes in this session"` |
| 409 (CONFLICT) | `prizeAlreadyViewed` | `"Prize has already been marked as viewed by another user"` |

## Error Handling Best Practices

### Client-Side Error Handling

1. **Listen for `error` events** for general error handling
2. **Listen for `prizeAlreadyViewed` events** for specific prize viewing conflicts
3. **Check error messages** to provide appropriate user feedback
4. **Handle authentication errors** by redirecting to login or refreshing the page
5. **Handle authorization errors** by showing appropriate access denied messages

### Example Client Error Handling

```javascript
// General error handling
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  // Show error message to user
  showErrorMessage(error.message);
});

// Prize already viewed handling
socket.on('prizeAlreadyViewed', (data) => {
  console.warn('Prize already viewed:', data.message);
  // Show specific message for prize conflict
  showWarningMessage(data.message);
});
```

## Common Error Scenarios

### Authentication Errors
- **Cause**: User not logged in or invalid/expired JWT token
- **Solution**: Redirect user to login page or refresh authentication

### Authorization Errors
- **Cause**: User doesn't have permission to perform the action
- **Solution**: Check user permissions or session access

### Validation Errors
- **Cause**: Missing required parameters or invalid data
- **Solution**: Validate input before sending requests

### Business Logic Errors
- **Cause**: Game rules violations (e.g., selecting multiple numbers, viewing prizes without permission)
- **Solution**: Follow game rules and proper flow

### System Errors
- **Cause**: Database errors, service failures, or unexpected exceptions
- **Solution**: Retry operation or contact support

## Error Event Timing

- **Immediate errors**: Validation and authentication errors are emitted immediately
- **Service errors**: Business logic errors are emitted after service calls
- **Async errors**: Some errors may be emitted asynchronously during background operations

## Debugging Tips

1. **Check server logs** for detailed error information
2. **Verify authentication** by checking JWT token validity
3. **Check session state** to ensure proper session flow
4. **Validate parameters** before making requests
5. **Monitor network connectivity** for connection issues
