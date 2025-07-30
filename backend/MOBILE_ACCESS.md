# Mobile Access Configuration

## Overview

The backend now supports configurable mobile device access through the `ACCEPT_MOBILE` environment variable.

## Configuration

### Environment Variable

Add this to your `.env` file:

```env
# Mobile Access Configuration
ACCEPT_MOBILE=false  # Set to 'true' to allow mobile access
```

### Options

- `ACCEPT_MOBILE=false` (default): Mobile devices are blocked
- `ACCEPT_MOBILE=true`: Mobile devices are allowed

## Middleware

### 1. `desktopOnly` Middleware

- **Usage**: Applied globally to all routes
- **Behavior**: Blocks mobile devices unless `ACCEPT_MOBILE=true`

### 2. `mobileAccess(allowMobile)` Middleware

- **Usage**: Applied to specific routes
- **Parameters**:
  - `allowMobile=true`: Allow mobile access for this route
  - `allowMobile=false`: Block mobile access for this route
- **Override**: Can override global `ACCEPT_MOBILE` setting

## Route Examples

### Block Mobile (Default)

```javascript
router.use(desktopOnly); // Uses global ACCEPT_MOBILE setting
```

### Allow Mobile for Specific Routes

```javascript
router.get("/invitation/:token", mobileAccess(true), validateInvitation);
router.post("/setup-password/:token", mobileAccess(true), setupPassword);
```

### Force Block Mobile for Specific Routes

```javascript
router.get("/admin-only", mobileAccess(false), adminRoute);
```

## Current Configuration

### Routes that Allow Mobile Access

- `/api/auth/validate-invitation/:token`
- `/api/auth/setup-password/:token`
- `/api/config`

### Routes that Block Mobile Access (unless ACCEPT_MOBILE=true)

- All other routes use the global `desktopOnly` middleware

## Testing

### Check Current Configuration

```bash
GET /api/config
```

Response:

```json
{
  "status": "success",
  "data": {
    "config": {
      "acceptMobile": false,
      "frontendUrl": "http://localhost:3000",
      "environment": "development",
      "features": {
        "invitationSystem": true,
        "emailNotifications": true,
        "mobileAccess": false
      }
    }
  }
}
```

### Test Mobile Access

1. Set `ACCEPT_MOBILE=true` in your `.env` file
2. Restart the server
3. Test API endpoints from a mobile device or with mobile User-Agent

## User-Agent Detection

The system detects mobile devices using this regex pattern:

```
/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
```

## Error Response

When mobile access is blocked:

```json
{
  "error": "Mobile access is not allowed. Please use a desktop or laptop.",
  "code": "MOBILE_ACCESS_BLOCKED"
}
```
