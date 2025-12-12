/**
 * T079: 100ms Integration
 * Video calling using 100ms SDK
 */

import { createId } from '@paralleldrive/cuid2';
import jwt from 'jsonwebtoken';

const HMS_APP_ACCESS_KEY = process.env.HMS_APP_ACCESS_KEY || '';
const HMS_APP_SECRET = process.env.HMS_APP_SECRET || '';
const HMS_TEMPLATE_ID = process.env.HMS_TEMPLATE_ID || '';

export interface RoomConfig {
  name: string;
  description?: string;
  templateId?: string;
  region?: 'in' | 'us' | 'eu' | 'auto';
}

export interface RoomToken {
  token: string;
  roomId: string;
  userId: string;
  role: 'host' | 'guest';
  expiresAt: Date;
}

export interface Room {
  id: string;
  name: string;
  enabled: boolean;
  createdAt: Date;
}

class HMSClient {
  private apiBase = 'https://api.100ms.live/v2';
  private managementToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Generate management token for API calls
   */
  private async getManagementToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.managementToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.managementToken;
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      access_key: HMS_APP_ACCESS_KEY,
      type: 'management',
      version: 2,
      iat: now,
      exp: now + 86400, // 24 hours
      jti: createId(),
    };

    this.managementToken = jwt.sign(payload, HMS_APP_SECRET, { algorithm: 'HS256' });
    this.tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000); // 23 hours

    return this.managementToken;
  }

  /**
   * Generate auth token for a user to join a room
   */
  async generateAuthToken(
    roomId: string,
    userId: string,
    role: 'host' | 'guest'
  ): Promise<RoomToken> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour

    const payload = {
      access_key: HMS_APP_ACCESS_KEY,
      room_id: roomId,
      user_id: userId,
      role: role,
      type: 'app',
      version: 2,
      iat: now,
      exp: exp,
      jti: createId(),
    };

    const token = jwt.sign(payload, HMS_APP_SECRET, { algorithm: 'HS256' });

    return {
      token,
      roomId,
      userId,
      role,
      expiresAt: new Date(exp * 1000),
    };
  }

  /**
   * Create a new room
   */
  async createRoom(config: RoomConfig): Promise<Room> {
    // If no HMS credentials, return mock room
    if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
      console.warn('[HMS] No credentials configured, using mock room');
      return {
        id: `mock_room_${createId()}`,
        name: config.name,
        enabled: true,
        createdAt: new Date(),
      };
    }

    const token = await this.getManagementToken();

    const response = await fetch(`${this.apiBase}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name,
        description: config.description || 'Medical consultation',
        template_id: config.templateId || HMS_TEMPLATE_ID,
        region: config.region || 'auto',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[HMS] Create room error:', error);
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    const data = await response.json() as { id: string; name: string; enabled: boolean; created_at: string };

    return {
      id: data.id,
      name: data.name,
      enabled: data.enabled,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Get room details
   */
  async getRoom(roomId: string): Promise<Room | null> {
    if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
      return {
        id: roomId,
        name: 'Mock Room',
        enabled: true,
        createdAt: new Date(),
      };
    }

    const token = await this.getManagementToken();

    const response = await fetch(`${this.apiBase}/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to get room: ${response.statusText}`);
    }

    const data = await response.json() as { id: string; name: string; enabled: boolean; created_at: string };

    return {
      id: data.id,
      name: data.name,
      enabled: data.enabled,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Disable a room (end session)
   */
  async disableRoom(roomId: string): Promise<boolean> {
    if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
      return true;
    }

    const token = await this.getManagementToken();

    const response = await fetch(`${this.apiBase}/rooms/${roomId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled: false }),
    });

    return response.ok;
  }

  /**
   * Get active sessions for a room
   */
  async getActiveSessions(roomId: string): Promise<Array<{
    id: string;
    roomId: string;
    active: boolean;
    createdAt: Date;
  }>> {
    if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
      return [];
    }

    const token = await this.getManagementToken();

    const response = await fetch(`${this.apiBase}/sessions?room_id=${roomId}&active=true`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get sessions: ${response.statusText}`);
    }

    const data = await response.json() as { data: Array<{ id: string; room_id: string; active: boolean; created_at: string }> };

    return data.data.map((session) => ({
      id: session.id,
      roomId: session.room_id,
      active: session.active,
      createdAt: new Date(session.created_at),
    }));
  }

  /**
   * End all active sessions in a room
   */
  async endAllSessions(roomId: string): Promise<void> {
    if (!HMS_APP_ACCESS_KEY || !HMS_APP_SECRET) {
      return;
    }

    const sessions = await this.getActiveSessions(roomId);

    for (const session of sessions) {
      if (session.active) {
        // 100ms auto-ends sessions when room is disabled
        // Or you can use webhooks to handle session end
      }
    }

    await this.disableRoom(roomId);
  }

  /**
   * Create a consultation room with tokens for both participants
   */
  async createConsultationRoom(
    appointmentId: string,
    doctorId: string,
    patientId: string
  ): Promise<{
    room: Room;
    doctorToken: RoomToken;
    patientToken: RoomToken;
  }> {
    const room = await this.createRoom({
      name: `consultation_${appointmentId}`,
      description: `Medical consultation for appointment ${appointmentId}`,
    });

    const [doctorToken, patientToken] = await Promise.all([
      this.generateAuthToken(room.id, doctorId, 'host'),
      this.generateAuthToken(room.id, patientId, 'guest'),
    ]);

    return {
      room,
      doctorToken,
      patientToken,
    };
  }

  /**
   * Check if HMS is configured
   */
  isConfigured(): boolean {
    return !!(HMS_APP_ACCESS_KEY && HMS_APP_SECRET);
  }
}

export const hmsClient = new HMSClient();
export default hmsClient;
