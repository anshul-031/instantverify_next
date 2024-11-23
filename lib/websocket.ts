import { Server as HTTPServer } from "http";
import WebSocket from "ws";
import { parse } from "url";
import { verify, JwtPayload } from "jsonwebtoken";

interface CustomWebSocket extends WebSocket {
  userId?: string;
  verificationId?: string;
}

interface CustomJwtPayload extends JwtPayload {
  sub?: string;
}

let wss: WebSocket.Server;

export function initializeWebSocket(server: HTTPServer) {
  wss = new WebSocket.Server({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    const { pathname, query } = parse(request.url!, true);

    if (pathname === "/api/ws/verification") {
      try {
        // Verify JWT token from query
        const token = query.token as string;
        const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as CustomJwtPayload;
        
        if (!decoded.sub) {
          throw new Error("Invalid token: missing sub claim");
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          (ws as CustomWebSocket).userId = decoded.sub;
          wss.emit("connection", ws, request);
        });
      } catch (error) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      }
    }
  });

  wss.on("connection", (ws: CustomWebSocket) => {
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
    const customClient = client as CustomWebSocket;
    if (customClient.userId === userId) {
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

function handleWebSocketMessage(ws: CustomWebSocket, message: any) {
  switch (message.type) {
    case "subscribe_verification":
      ws.verificationId = message.verificationId;
      break;
    // Add more message handlers as needed
  }
}