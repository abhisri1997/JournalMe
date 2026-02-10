# Testing on Mobile/Network Devices

## Setup for Network Access

### 1. Start the backend

```bash
cd packages/backend
npm run dev
```

Look for the **Network IP** in the console output:

```
Backend running on port 4000
Local: http://localhost:4000
Network IP: http://192.168.0.154:4000  ← Use this!
WebSocket (Network): ws://192.168.0.154:4000
```

### 2. Start the frontend

```bash
cd packages/frontend
npm run dev
```

Look for the **Network** URL:

```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.0.154:3000/  ← Use this on your phone!
```

### 3. Access from your phone/tablet

Open Safari/Chrome on your phone and go to:

```
http://192.168.0.154:3000
```

(Replace with your actual IP address from step 2)

## What's Automatically Configured

✅ **Frontend** - Vite proxy automatically forwards `/api/*` requests to backend  
✅ **WebSocket** - Automatically detects your IP and connects to `http://[YOUR_IP]:4000`  
✅ **CORS** - Backend allows all origins in development mode  
✅ **Network Interface** - Backend listens on `0.0.0.0` (all interfaces)

## Troubleshooting

### Issue: "Cannot connect" from phone

**Solution:** Make sure your phone and computer are on the **same WiFi network**

### Issue: WebSocket connection fails

**Check backend logs** - should see:

```
[WebSocketManager] Auth attempt: { hasAuthToken: true, socketId: '...' }
[WebSocketManager] Auth successful for user: ...
```

**Check browser console** - should see:

```
[WebSocketService] Backend URL: http://192.168.0.154:4000
[WebSocketService] Connecting to WebSocket server
[NotificationContext] WebSocket connected!
```

### Issue: API calls work but WebSocket doesn't

**Solution:** Make sure backend is restarted with the latest CORS changes

### Issue: Different IP addresses

If your IP changes (e.g., reconnecting to WiFi), restart both servers to pick up the new IP.

## Testing Real-Time Notifications

1. **Desktop Browser**: Open http://192.168.0.154:3000, login as User A
2. **Phone Browser**: Open http://192.168.0.154:3000, login as User B
3. User A: Follow User B
4. User B's phone: Should see notification **instantly** 🎉

## Security Note

This setup is for **development only**. In production:

- Use proper domain names
- Enable HTTPS/WSS
- Configure specific CORS origins
- Use environment variables for configuration
