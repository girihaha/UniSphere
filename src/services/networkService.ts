import { Connection, ConnectionRequest, NetworkNote } from '../types';
import { api } from '../lib/api';
import {
  connections as mockConnections,
  connectionRequests as mockRequests,
  networkNotes as mockNotes,
} from '../data/network';

export async function getConnections(): Promise<Connection[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: Connection[] }>('/network/connections');
      return response.data;
    } catch (err) {
      console.error('getConnections failed, falling back to mock data', err);
    }
  }

  return mockConnections;
}

export async function getConnectionRequests(): Promise<ConnectionRequest[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: ConnectionRequest[] }>('/network/requests');
      return response.data;
    } catch (err) {
      console.error('getConnectionRequests failed, falling back to mock data', err);
    }
  }

  return mockRequests;
}

export async function getNetworkNotes(): Promise<NetworkNote[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.get<{ data: NetworkNote[] }>('/network/notes');
      return response.data;
    } catch (err) {
      console.error('getNetworkNotes failed, falling back to mock data', err);
    }
  }

  return mockNotes;
}

export async function acceptConnectionRequest(
  requestId: number
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/network/requests/${requestId}/accept`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept request';
      return { error: message };
    }
  }

  return {};
}

export async function declineConnectionRequest(
  requestId: number
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post(`/network/requests/${requestId}/decline`);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decline request';
      return { error: message };
    }
  }

  return {};
}

export async function sendConnectionRequest(
  userId: string,
  message?: string
): Promise<{ error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      await api.post('/network/requests', { userId, message });
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send request';
      return { error: message };
    }
  }

  return {};
}

export async function createNetworkNote(
  text: string
): Promise<{ note?: NetworkNote; error?: string }> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (API_BASE_URL) {
    try {
      const response = await api.post<{ data: NetworkNote }>('/network/notes', { text });
      return { note: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note';
      return { error: message };
    }
  }

  const mockNote: NetworkNote = {
    id: Date.now(),
    authorId: 0,
    authorName: 'You',
    authorBranch: 'CSE',
    text,
    time: 'Just now',
  };
  return { note: mockNote };
}
