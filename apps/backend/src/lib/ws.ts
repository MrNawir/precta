/**
 * T085: WebSocket Setup
 * Real-time communication for call status, notifications, etc.
 */

import { Elysia } from 'elysia';
import { auth } from './auth';

// Connected clients map: userId -> Set of WebSocket connections
const clients = new Map<string, Set<WebSocket>>();

// Room subscriptions: roomId -> Set of userIds
const rooms = new Map<string, Set<string>>();

export interface WSMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

export interface CallStatusUpdate {
  appointmentId: string;
  status: 'waiting' | 'doctor_joined' | 'patient_joined' | 'in_progress' | 'ended';
  participantId?: string;
  participantRole?: 'doctor' | 'patient';
}

export interface NotificationMessage {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Send message to specific user
 */
export function sendToUser(userId: string, message: WSMessage): void {
  const userConnections = clients.get(userId);
  if (!userConnections) return;

  const data = JSON.stringify(message);
  userConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
}

/**
 * Send message to all users in a room
 */
export function sendToRoom(roomId: string, message: WSMessage): void {
  const roomUsers = rooms.get(roomId);
  if (!roomUsers) return;

  roomUsers.forEach((userId) => {
    sendToUser(userId, message);
  });
}

/**
 * Broadcast call status update
 */
export function broadcastCallStatus(update: CallStatusUpdate): void {
  const message: WSMessage = {
    type: 'call_status',
    payload: update,
    timestamp: Date.now(),
  };

  sendToRoom(`call:${update.appointmentId}`, message);
}

/**
 * Send notification to user
 */
export function sendNotification(userId: string, notification: NotificationMessage): void {
  const message: WSMessage = {
    type: 'notification',
    payload: notification,
    timestamp: Date.now(),
  };

  sendToUser(userId, message);
}

/**
 * Subscribe user to a room
 */
export function subscribeToRoom(userId: string, roomId: string): void {
  let roomUsers = rooms.get(roomId);
  if (!roomUsers) {
    roomUsers = new Set();
    rooms.set(roomId, roomUsers);
  }
  roomUsers.add(userId);
}

/**
 * Unsubscribe user from a room
 */
export function unsubscribeFromRoom(userId: string, roomId: string): void {
  const roomUsers = rooms.get(roomId);
  if (roomUsers) {
    roomUsers.delete(userId);
    if (roomUsers.size === 0) {
      rooms.delete(roomId);
    }
  }
}

/**
 * Add client connection
 */
function addClient(userId: string, ws: WebSocket): void {
  let userConnections = clients.get(userId);
  if (!userConnections) {
    userConnections = new Set();
    clients.set(userId, userConnections);
  }
  userConnections.add(ws);
  
  console.log(`[WS] Client connected: ${userId} (${userConnections.size} connections)`);
}

/**
 * Remove client connection
 */
function removeClient(userId: string, ws: WebSocket): void {
  const userConnections = clients.get(userId);
  if (userConnections) {
    userConnections.delete(ws);
    if (userConnections.size === 0) {
      clients.delete(userId);
    }
    console.log(`[WS] Client disconnected: ${userId}`);
  }

  // Remove from all rooms
  rooms.forEach((users, roomId) => {
    if (users.has(userId)) {
      users.delete(userId);
      if (users.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
}

/**
 * WebSocket plugin for Elysia
 */
export const wsPlugin = new Elysia({ name: 'websocket' })
  .ws('/ws', {
    // Authentication via query param or header
    async open(ws) {
      const url = new URL(ws.data.request.url);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.send(JSON.stringify({ type: 'error', payload: 'Authentication required' }));
        ws.close();
        return;
      }

      try {
        // Verify token with Better Auth
        const session = await auth.api.getSession({
          headers: new Headers({ Authorization: `Bearer ${token}` }),
        });

        if (!session?.user) {
          ws.send(JSON.stringify({ type: 'error', payload: 'Invalid token' }));
          ws.close();
          return;
        }

        // Store user ID on the connection
        (ws.data as any).userId = session.user.id;
        addClient(session.user.id, ws.raw as unknown as WebSocket);

        // Send connection success
        ws.send(JSON.stringify({
          type: 'connected',
          payload: { userId: session.user.id },
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error('[WS] Auth error:', error);
        ws.send(JSON.stringify({ type: 'error', payload: 'Authentication failed' }));
        ws.close();
      }
    },

    message(ws, message) {
      const userId = (ws.data as any).userId;
      if (!userId) return;

      try {
        const data = typeof message === 'string' ? JSON.parse(message) : message;

        switch (data.type) {
          case 'subscribe':
            // Subscribe to a room (e.g., call:appointmentId)
            if (data.room) {
              subscribeToRoom(userId, data.room);
              ws.send(JSON.stringify({
                type: 'subscribed',
                payload: { room: data.room },
                timestamp: Date.now(),
              }));
            }
            break;

          case 'unsubscribe':
            // Unsubscribe from a room
            if (data.room) {
              unsubscribeFromRoom(userId, data.room);
              ws.send(JSON.stringify({
                type: 'unsubscribed',
                payload: { room: data.room },
                timestamp: Date.now(),
              }));
            }
            break;

          case 'ping':
            // Heartbeat
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
            }));
            break;

          default:
            console.log(`[WS] Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error('[WS] Message handling error:', error);
      }
    },

    close(ws) {
      const userId = (ws.data as any).userId;
      if (userId) {
        removeClient(userId, ws.raw as unknown as WebSocket);
      }
    },
  });

/**
 * Get connection stats
 */
export function getConnectionStats(): {
  totalClients: number;
  totalConnections: number;
  totalRooms: number;
} {
  let totalConnections = 0;
  clients.forEach((connections) => {
    totalConnections += connections.size;
  });

  return {
    totalClients: clients.size,
    totalConnections,
    totalRooms: rooms.size,
  };
}

export default wsPlugin;
