## Testing the Real-Time Notification System

### Quick Test Guide

1. **Start both servers:**

   ```bash
   # Terminal 1 - Backend
   cd packages/backend && npm run dev

   # Terminal 2 - Frontend
   cd packages/frontend && npm run dev
   ```

2. **Open browser console** (F12 or Cmd+Option+I) and look for:

   ```
   [WebSocketService] Backend URL: http://localhost:4000
   [WebSocketService] Connecting to WebSocket server
   [NotificationContext] WebSocket connected!
   ```

3. **Test real-time notifications:**
   - Open JournalMe in **two different browsers** (or one normal + one incognito)
   - Login as User A in Browser 1
   - Login as User B in Browser 2
   - User A: Go to Community, find User B, click Follow
   - User B: Should see notification bell update **instantly** (no page refresh needed)

### Debugging Checklist

**Frontend not connecting?**

- Check browser console for `[WebSocketService]` logs
- Verify token exists: `localStorage.getItem('jm_token')`
- Check CORS errors in Network tab

**Backend not receiving connections?**

- Look for `[WebSocketManager] Auth attempt` in backend logs
- Verify JWT_SECRET matches between frontend token and backend

**Notifications not appearing?**

- Check `[EventBus] Publishing event` in backend logs
- Verify user is connected: backend should show "User {id} connected"
- Check notification was created in database

### Expected Flow

```
User A taps "Follow"
→ POST /api/follows/request
→ EventBus publishes follow.request.created
→ NotificationEventHandler creates DB notification
→ WebSocketEventHandler pushes to User B (if online)
→ User B sees instant notification bell update 🔔
```

### Common Issues

1. **"User not connected"** - Frontend WebSocket didn't connect

   - Solution: Check token, CORS, backend URL

2. **No events published** - Routes not emitting events

   - Solution: Check [EventBus] logs in backend

3. **Events published but no notification** - Handler not running

   - Solution: Check handler initialization in index.ts

4. **Connection drops immediately** - Auth failed
   - Solution: Check JWT_SECRET and token format
