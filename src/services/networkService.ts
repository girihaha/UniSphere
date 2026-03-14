import { api } from '../lib/api';
import type { Connection, ConnectionRequest, DiscoverUser, NetworkNote } from '../types';

export type RelationshipStatus = 'connected' | 'request_sent' | 'you' | 'none';

export type UserProfileResponse = {
  id: string;
  name: string;
  branch: string;
  degree: string;
  year: string;
  avatarUrl?: string;
  bio?: string;
  mutual?: number;
  relationshipStatus?: RelationshipStatus;
  posts?: number;
  clubs?: number;
  connectionsCount?: number;
  instagram?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
};

type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const maybeErr = err as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
      message?: string;
    };

    if (maybeErr.response?.data?.message) return maybeErr.response.data.message;
    if (maybeErr.response?.data?.error) return maybeErr.response.data.error;
    if (maybeErr.message) return maybeErr.message;
  }

  return fallback;
}

export async function getConnections(): Promise<Connection[]> {
  try {
    const response = await api.get<{ data: Connection[] }>('/users/connections');
    return response.data;
  } catch (err) {
    console.error('getConnections failed', err);
    return [];
  }
}

export async function getConnectionRequests(): Promise<ConnectionRequest[]> {
  try {
    const response = await api.get<{ data: ConnectionRequest[] }>('/users/requests');
    return response.data;
  } catch (err) {
    console.error('getConnectionRequests failed', err);
    return [];
  }
}

export async function getDiscoverUsers(): Promise<DiscoverUser[]> {
  try {
    const response = await api.get<{ data: DiscoverUser[] }>('/users/discover');
    return response.data;
  } catch (err) {
    console.error('getDiscoverUsers failed', err);
    return [];
  }
}

export async function acceptConnectionRequest(userId: string): Promise<ActionResult> {
  try {
    await api.post(`/users/${userId}/accept`);
    return {
      success: true,
      message: 'Connection request accepted',
    };
  } catch (err) {
    return {
      success: false,
      error: extractErrorMessage(err, 'Failed to accept request'),
    };
  }
}

export async function rejectConnectionRequest(userId: string): Promise<ActionResult> {
  try {
    await api.post(`/users/${userId}/reject`);
    return {
      success: true,
      message: 'Connection request rejected',
    };
  } catch (err) {
    return {
      success: false,
      error: extractErrorMessage(err, 'Failed to reject request'),
    };
  }
}

export async function sendConnectionRequest(userId: string, message?: string): Promise<ActionResult> {
  try {
    await api.post(`/users/${userId}/connect`, { message });
    return {
      success: true,
      message: 'Connection request sent',
    };
  } catch (err) {
    return {
      success: false,
      error: extractErrorMessage(err, 'Failed to send request'),
    };
  }
}

export async function getNetworkNotes(): Promise<NetworkNote[]> {
  try {
    const response = await api.get<{ data: NetworkNote[] }>('/users/network/notes');
    return response.data;
  } catch (err) {
    console.error('getNetworkNotes failed', err);
    return [];
  }
}

export async function createNetworkNote(text: string): Promise<ActionResult> {
  try {
    await api.post('/users/network/notes', { text });
    return {
      success: true,
      message: 'Note posted successfully',
    };
  } catch (err) {
    return {
      success: false,
      error: extractErrorMessage(err, 'Failed to create note'),
    };
  }
}

export async function getUserProfileById(userId: string): Promise<UserProfileResponse | null> {
  try {
    const response = await api.get<{ data: UserProfileResponse }>(`/users/profile/${userId}`);
    return response.data;
  } catch (err) {
    console.error('getUserProfileById failed', err);
    return null;
  }
}