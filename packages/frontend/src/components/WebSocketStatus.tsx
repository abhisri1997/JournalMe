import React, { useState, useEffect } from "react";
import { websocketService } from "../services/websocket";

/**
 * WebSocketStatus - Debug component showing connection status
 * Add this temporarily to your NavigationBar or Header to verify connection
 */
export function WebSocketStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    websocketService.on({
      onConnect: () => {
        console.log("[WebSocketStatus] Connected");
        setIsConnected(true);
        setHasError(false);
      },
      onDisconnect: () => {
        console.log("[WebSocketStatus] Disconnected");
        setIsConnected(false);
      },
      onError: (error) => {
        console.error("[WebSocketStatus] Error:", error);
        setHasError(true);
      },
    });

    // Check initial state
    setIsConnected(websocketService.isConnected());
  }, []);

  if (!isConnected && !hasError) {
    return (
      <div
        style={{
          padding: "4px 8px",
          fontSize: "12px",
          background: "#ff9500",
          color: "white",
          borderRadius: "4px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
        title='WebSocket connecting...'
      >
        <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>⚠️</span>
        Connecting...
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        style={{
          padding: "4px 8px",
          fontSize: "12px",
          background: "#ff3b30",
          color: "white",
          borderRadius: "4px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
        title='WebSocket connection error'
      >
        ❌ Connection Error
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "4px 8px",
        fontSize: "12px",
        background: "#34c759",
        color: "white",
        borderRadius: "4px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
      title='WebSocket connected - real-time notifications active'
    >
      ✅ Live
    </div>
  );
}
