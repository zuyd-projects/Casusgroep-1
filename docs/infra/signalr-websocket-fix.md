# SignalR WebSocket Proxy Fix

## Problem
SignalR was working locally but failing when running through the nginx proxy in the Docker environment. This was due to missing WebSocket support in the nginx configuration.

## Changes Made

### 1. Updated nginx configuration (`proxy/nginx.conf.template`)
- Added WebSocket upgrade mapping for proper connection handling
- Added specific WebSocket headers for SignalR hub endpoint
- Added optimizations for long-running connections
- Disabled proxy buffering for real-time communication

### 2. Enhanced JWT Authentication (`backend/ERPNumber1/ERPNumber1/Program.cs`)
- Added support for JWT token authentication via query string for WebSocket connections
- Added specific handler for SignalR hub authentication
- Fixed null reference warning for JWT signing key

## Key Configuration Details

### Nginx WebSocket Support
```nginx
# WebSocket upgrade mapping
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

# SignalR-specific location block
location /simulationHub/ {
  # Standard proxy headers
  proxy_pass http://$backend_host;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  
  # WebSocket support
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $connection_upgrade;
  proxy_cache_bypass $http_upgrade;
  proxy_read_timeout 86400;
  proxy_send_timeout 86400;
  proxy_connect_timeout 60s;
  
  # SignalR optimizations
  proxy_buffering off;
  proxy_redirect off;
}
```

### JWT for WebSocket Authentication
```csharp
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        
        if (!string.IsNullOrEmpty(accessToken) &&
            path.StartsWithSegments("/simulationHub"))
        {
            context.Token = accessToken;
        }
        return Task.CompletedTask;
    }
};
```

## Testing the Fix

1. **Rebuild the containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache proxy api
   docker-compose up
   ```

2. **Test SignalR connection:**
   - Open browser developer tools (Network tab)
   - Look for WebSocket connections to `/simulationHub`
   - Connection should show as "101 Switching Protocols"

3. **Test real-time functionality:**
   - Start a simulation from the frontend
   - Multiple browser tabs should receive real-time updates
   - Check console logs for SignalR connection messages

## Expected Behavior

- ✅ SignalR should successfully establish WebSocket connection through nginx proxy
- ✅ Real-time simulation updates should work across all connected clients
- ✅ Connection should gracefully fallback to Server-Sent Events or Long Polling if WebSocket fails
- ✅ JWT authentication should work for WebSocket connections

## Troubleshooting

If SignalR still doesn't work:

1. **Check nginx logs:**
   ```bash
   docker logs nginx_proxy
   ```

2. **Check backend logs:**
   ```bash
   docker logs backend_app
   ```

3. **Verify browser console:**
   - Look for SignalR connection errors
   - Check for 401 authentication errors
   - Monitor network traffic for failed WebSocket upgrades

4. **Test direct backend connection:**
   - Temporarily connect frontend directly to backend (port 8080)
   - If it works directly but not through proxy, the issue is nginx-related
