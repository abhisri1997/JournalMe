# Debugger Testing Guide

## Step 1: Start the backend with debugger

Run the debug mode:

```bash
cd packages/backend
npm run dev:debug
```

You should see:

```
Debugger listening on ws://127.0.0.1:9229/...
Backend running on port 4000
```

## Password Reset Email Testing Guide

Since the app uses **Ethereal Email** in development (no real SMTP credentials), here's how to view test emails:

### Step 1: Trigger forgot-password endpoint

```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@local"}'
```

### Step 2: Check the backend console

Look at the terminal where you started `npm run dev:debug`. You should see output like:

```
✓ Password reset email sent!
Message ID: <xxx@ethereal.email>

📧 Preview email at: https://ethereal.email/message/...
```

### Step 3: Click the preview link

Click the URL shown in the console to view the test email in Ethereal's web interface.

### Alternative: View all test emails

If you need to see all sent emails, look for the **Ethereal Test Account** info logged when the server starts:

```
========== ETHEREAL TEST ACCOUNT ==========
User: your-test-user@ethereal.email
Pass: your-password
Web Interface: https://ethereal.email/
==========================================
```

Log in to the Ethereal web interface with these credentials to see all test emails sent.

---

In a new tab, visit:

```
chrome://inspect
```

You should see the node process listed. Click "inspect" to open the debugger.

## Step 3: Get an Auth Token

First, get a JWT token by logging in with the dummy credentials:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@local",
    "password": "password"
  }'
```

You'll get a response like:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "email": "test@local"
  }
}
```

Copy the `token` value.

## Step 4: Make a Request to the Protected Route

Use the token from Step 3 in this curl command (replace TOKEN with actual token):

```bash
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

## Step 5: Check the Debugger

When you make the curl request in Step 4:

- The debugger in Chrome DevTools should **PAUSE** at the `debugger;` line in the `/me` route
- You should see the execution stopped in the `user.ts` file at line 8
- You can inspect variables, step through code, etc.

## If Debugger Still Doesn't Stop

The issue might be:

1. **Node Inspector not connected** - Make sure the Chrome DevTools inspector is open and showing the paused icon
2. **debugger statement ignored** - Some transpilers ignore debugger statements. Check that `ts-node-dev` is configured correctly
3. **Port binding issue** - Check if port 9229 is already in use

Run this to check:

```bash
lsof -i :9229
```

If the port is occupied, kill the process:

```bash
kill -9 <PID>
```

Then restart with `npm run dev:debug`.
