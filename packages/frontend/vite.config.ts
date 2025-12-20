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
const backendTarget = `http://${localIP}:4000`;

// Check if HTTPS certificates exist
const certPath = path.resolve(__dirname, "../../certs/cert.pem");
const keyPath = path.resolve(__dirname, "../../certs/key.pem");
const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

const serverConfig: any = {
  proxy: {
    "/api": {
      target: backendTarget,
      changeOrigin: true,
    },
    "/uploads": {
      target: backendTarget,
      changeOrigin: true,
      ws: true,
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

export default defineConfig({
  server: serverConfig,
});
