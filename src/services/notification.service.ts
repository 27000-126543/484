import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ClientConnection {
  ws: WebSocket;
  roles: string[];
  userId?: string;
}

const clients: Map<WebSocket, ClientConnection> = new Map();

let wss: WebSocketServer;

export function initNotificationService(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws/notifications' });

  wss.on('connection', (ws) => {
    const client: ClientConnection = { ws, roles: [] };
    clients.set(ws, client);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'subscribe' && msg.roles) {
          client.roles = msg.roles;
          client.userId = msg.userId;
        }
      } catch {}
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: 'connected', message: 'Notification service connected' }));
  });

  console.log('[NotificationService] WebSocket server initialized on /ws/notifications');
}

export function broadcastNotification(notification: {
  type: string;
  title: string;
  message: string;
  targetRoles: string[];
  payload?: Record<string, unknown>;
}) {
  const data = JSON.stringify({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    payload: notification.payload || {},
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.ws.readyState !== WebSocket.OPEN) return;
    const hasMatchingRole = notification.targetRoles.some((role) =>
      client.roles.includes(role)
    );
    if (hasMatchingRole) {
      client.ws.send(data);
    }
  });
}

export function getConnectedClientsCount(): number {
  return clients.size;
}

export function getClientsByRole(role: string): ClientConnection[] {
  const result: ClientConnection[] = [];
  clients.forEach((client) => {
    if (client.roles.includes(role)) {
      result.push(client);
    }
  });
  return result;
}
