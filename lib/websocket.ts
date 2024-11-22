import { Server as HTTPServer } from "http";
import { Server as WebSocketServer } from "ws";
import { parse } from "url";
import { verify } from "jsonwebtoken";

let wss: WebSocketServer;

export function initializeWebSocket(server: HTTPServer) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    const { pathname, query } = parse(request.url!, true);

    if (pathname === "/api/ws/verification") {
      try {
        // Verify JWT token from query
        const token = query.token as string;
        const decoded = verify(token, process.env.NEXTAUTH_SECRET!);
        
        wss.handleUpgrade(request, socket, head, (ws) => {
          ws.userId = decoded.sub;
          wss.emit("connection", ws, request);
        });
      } catch (error) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
    }
  });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleWebSocketMessage(ws, data);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
  });
}

export function notifyVerificationProgress(
  userId: string,
  verificationId: string,
  data: any
) {
  wss?.clients?.forEach((client) => {
    if (client.userId === userId) {
      client.send(
        JSON.stringify({
          type: "verification_progress",
          verificationId,
          data,
        })
      );
    }
  });
}

function handleWebSocketMessage(ws: any, message: any) {
  switch (message.type) {
    case "subscribe_verification":
      ws.verificationId = message.verificationId;
      break;
    // Add more message handlers as needed
  }
}