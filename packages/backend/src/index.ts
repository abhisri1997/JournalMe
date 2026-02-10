import express from "express";
import { createServer } from "http";
import { createServer as createHttpsServer } from "https";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import cors from "cors";
import os from "os";
import journalRouter from "./routes/journal";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import followRouter from "./routes/follow";
import notificationRouter from "./routes/notification";
import { authenticate } from "./middleware/auth";
import { initializeWebSocketManager } from "./services/WebSocketManager";
import { NotificationEventHandler } from "./events/handlers/NotificationEventHandler";
import { WebSocketEventHandler } from "./events/handlers/WebSocketEventHandler";
import { PushNotificationEventHandler } from "./events/handlers/PushNotificationEventHandler";

const app = express();

// Check for HTTPS certificates
const certPath = resolve(__dirname, "../../certs/cert.pem");
const keyPath = resolve(__dirname, "../../certs/key.pem");
const useHttps = existsSync(certPath) && existsSync(keyPath);

// Create server (HTTP or HTTPS based on cert availability)
const httpServer = useHttps
  ? createHttpsServer(
      {
        cert: readFileSync(certPath),
        key: readFileSync(keyPath),
      },
      app
    )
  : createServer(app);

if (useHttps) {
  console.log("[Server] HTTPS enabled - certificates found");
} else {
  console.log("[Server] HTTP mode - no certificates found");
}

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// auth routes (login)
app.use("/api/auth", authRouter);
// user profile routes
app.use("/api/users", userRouter);
// follow/friends routes
app.use("/api/follows", followRouter);
// notification routes
app.use("/api/notifications", authenticate, notificationRouter);
// protect journal routes
app.use("/api/journals", authenticate, journalRouter);
// serve uploaded audio files
import serverStatic from "./serverStatic";
app.use("/", serverStatic);

// Initialize WebSocket server
initializeWebSocketManager(httpServer);
console.log("[Server] WebSocket server initialized");

// Initialize event handlers
NotificationEventHandler.initialize();
WebSocketEventHandler.initialize();
PushNotificationEventHandler.initialize();
console.log("[Server] Event handlers initialized");

const PORT = parseInt(process.env.PORT || "4000", 10);
httpServer.listen(PORT, "0.0.0.0", () => {
  const protocol = useHttps ? "https" : "http";
  const wsProtocol = useHttps ? "wss" : "ws";

  console.log(`Backend running on port ${PORT} (${protocol.toUpperCase()})`);
  console.log(`Local: ${protocol}://localhost:${PORT}`);
  console.log(`WebSocket: ${wsProtocol}://localhost:${PORT}`);

  // Show network IP for mobile/other device access
  const networkInterfaces = os.networkInterfaces();
  for (const name of Object.keys(networkInterfaces)) {
    const iface = networkInterfaces[name];
    if (iface) {
      for (const addr of iface) {
        if (addr.family === "IPv4" && !addr.internal) {
          console.log(`Network IP: ${protocol}://${addr.address}:${PORT}`);
          console.log(
            `WebSocket (Network): ${wsProtocol}://${addr.address}:${PORT}`
          );
        }
      }
    }
  }
});
