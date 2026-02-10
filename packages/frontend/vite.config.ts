import { defineConfig } from "vite";
import os from "os";
import fs from "fs";
import path from "path";

// Get local network IP address
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (iface) {
      for (const addr of iface) {
        // Skip internal and non-IPv4 addresses
        if (addr.family === "IPv4" && !addr.internal) {
          return addr.address;
        }
      }
    }
  }
  return "localhost";
}

const localIP = getLocalNetworkIP();

// Check if HTTPS certificates exist
const certPath = path.resolve(__dirname, "../../certs/cert.pem");
const keyPath = path.resolve(__dirname, "../../certs/key.pem");
const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

// Use HTTPS for frontend if certificates exist, but backend always uses HTTP
// (Vite proxy will handle the HTTPS frontend -> HTTP backend translation)
// Always use localhost for the proxy target (Vite runs on the same machine)
const backendTarget = `http://localhost:4000`;

const serverConfig: any = {
  proxy: {
    "/api": {
      target: backendTarget,
      changeOrigin: true,
      secure: false, // Accept self-signed certificates
    },
    "/uploads": {
      target: backendTarget,
      changeOrigin: true,
      ws: true,
      secure: false,
    },
    // Proxy Socket.io requests
    "/socket.io": {
      target: backendTarget,
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      secure: false, // Accept self-signed certificates
    },
  },
};

// Add HTTPS if certificates exist
if (useHttps) {
  serverConfig.https = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
}

export default defineConfig(async () => {
  const { default: react } = await import("@vitejs/plugin-react");
  const { default: tailwindcss } = await import("@tailwindcss/vite");
  return {
    plugins: [react(), tailwindcss()],
    server: serverConfig,
  };
});
