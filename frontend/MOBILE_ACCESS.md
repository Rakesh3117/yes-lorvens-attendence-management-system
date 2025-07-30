# Frontend Mobile Access Configuration

## Overview

The frontend now supports configurable mobile device access that works in conjunction with the backend configuration.

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Mobile Access Configuration
REACT_APP_ACCEPT_MOBILE=false

# Feature Flags
REACT_APP_ENABLE_INVITATION_SYSTEM=true
REACT_APP_ENABLE_EMAIL_NOTIFICATIONS=true
```

### Options

- `REACT_APP_ACCEPT_MOBILE=false` (default): Mobile devices are blocked
- `REACT_APP_ACCEPT_MOBILE=true`: Mobile devices are allowed

## Components

### 1. `MobileAccessGuard` Component

- **Usage**: Wraps the entire app to check mobile access
- **Behavior**: Shows mobile restriction screen if access is blocked
- **Location**: `src/components/common/MobileAccessGuard.jsx`

### 2. `useConfig` Hook

- **Usage**: React hook to access configuration
- **Features**:
  - Fetches config from backend
  - Detects mobile devices
  - Provides mobile access status
- **Location**: `src/hooks/useConfig.js`

### 3. `configService` Service

- **Usage**: Service to manage configuration
- **Features**:
  - Device detection
  - Backend config fetching
  - Mobile access validation
- **Location**: `src/services/configService.js`

## How It Works

### 1. App Initialization

```javascript
// App.jsx
<MobileAccessGuard>
  <Routes>{/* All routes */}</Routes>
</MobileAccessGuard>
```

### 2. Configuration Flow

1. **App loads** → `MobileAccessGuard` initializes
2. **Config fetched** → From backend `/api/config` endpoint
3. **Device detected** → Using User-Agent
4. **Access determined** → Based on device + backend config
5. **UI rendered** → Either app content or restriction screen

### 3. Mobile Detection

Detects these devices:

- Android
- iPhone/iPad/iPod
- BlackBerry
- Windows Mobile
- Opera Mini
- WebOS

## Usage Examples

### Using the Config Hook

```javascript
import { useConfig } from "../hooks/useConfig";

const MyComponent = () => {
  const { isMobile, acceptMobile, shouldBlock, config } = useConfig();

  if (shouldBlock) {
    return <MobileRestrictionScreen />;
  }

  return <MyComponentContent />;
};
```

### Checking Mobile Access

```javascript
import configService from "../services/configService";

// Check if mobile access is allowed
const isAllowed = configService.isMobileAccessAllowed();

// Check if current device is mobile
const isMobile = configService.isCurrentDeviceMobile();

// Check if access should be blocked
const shouldBlock = configService.shouldBlockMobileAccess();
```

## Configuration Page

### Admin Configuration Page

- **Route**: `/admin/configuration`
- **Features**:
  - View current mobile access settings
  - Device information display
  - System configuration overview
  - Refresh configuration button

### Accessing Configuration

1. **Login as admin**
2. **Navigate to**: Admin Portal → Configuration
3. **View settings**: Mobile access, system info, device details

## Mobile Restriction Screens

### 1. Global Mobile Restriction

- **Triggered by**: `MobileAccessGuard` when `shouldBlock` is true
- **Design**: Red gradient background with warning icon
- **Content**: Device info, access status, instructions

### 2. Route-Specific Restriction

- **Triggered by**: `DesktopOnlyRoute` for specific routes
- **Design**: Blue gradient background with desktop icon
- **Content**: Route-specific restriction message

## Testing

### Test Mobile Access

1. **Set environment variable**: `REACT_APP_ACCEPT_MOBILE=true`
2. **Restart frontend**: Changes take effect immediately
3. **Test on mobile**: Should work normally
4. **Test on desktop**: Should work normally

### Test Mobile Restriction

1. **Set environment variable**: `REACT_APP_ACCEPT_MOBILE=false`
2. **Restart frontend**: Changes take effect immediately
3. **Test on mobile**: Should show restriction screen
4. **Test on desktop**: Should work normally

### Test Backend Integration

1. **Set backend variable**: `ACCEPT_MOBILE=true/false`
2. **Restart backend**: Changes take effect immediately
3. **Refresh frontend**: Should reflect backend changes

## Error Handling

### Configuration Errors

- **Backend unavailable**: Uses default configuration
- **Network errors**: Shows error message in config page
- **Invalid config**: Falls back to safe defaults

### Device Detection Errors

- **User-Agent missing**: Treated as desktop
- **Detection failure**: Safe fallback to desktop

## Security Features

- ✅ **Backend-driven configuration**
- ✅ **Device detection validation**
- ✅ **Route-specific restrictions**
- ✅ **Graceful error handling**
- ✅ **Admin configuration page**

## Benefits

1. **Centralized Control** - Backend controls mobile access
2. **Flexible Configuration** - Environment variable control
3. **User-Friendly** - Clear restriction messages
4. **Admin Visibility** - Configuration page for monitoring
5. **Secure Defaults** - Mobile blocked by default
