import prisma from "@/utils/database"
import axios from 'axios';

export async function validateApiKey(apiKey: string, workspaceId: string) {
  if (!apiKey || !apiKey.startsWith("orbit_")) {
    return null
  }

  const key = await prisma.apiKey.findUnique({
    where: {
      key: apiKey,
    },
  })

  if (!key) {
    return null
  }

  // Check if key is expired
  if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsed: new Date() },
  })

  return key
}

export interface UserData {
  userId: number;
  username: string;
  displayname: string;
  thumbnail: string;
  canMakeWorkspace: boolean;
  workspaces: Array<{
    groupId: number;
    groupThumbnail: string;
    groupName: string;
  }>;
  isOwner: boolean;
}

export async function refreshUserData(): Promise<UserData | null> {
  try {
    const response = await axios.get('/api/@me');
    if (response.data.success && response.data.user) {
      return {
        userId: response.data.user.userId,
        username: response.data.user.username || '',
        displayname: response.data.user.displayname || '',
        thumbnail: response.data.user.thumbnail || '/default-avatar.jpg',
        canMakeWorkspace: response.data.user.canMakeWorkspace || false,
        workspaces: response.data.workspaces || [],
        isOwner: response.data.user.canMakeWorkspace || false
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    return null;
  }
}

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: UserData | null;
  error?: string;
}> {
  try {
    const response = await axios.get('/api/@me');
    if (response.data.success && response.data.user) {
      return {
        isAuthenticated: true,
        user: {
          userId: response.data.user.userId,
          username: response.data.user.username || '',
          displayname: response.data.user.displayname || '',
          thumbnail: response.data.user.thumbnail || '/default-avatar.jpg',
          canMakeWorkspace: response.data.user.canMakeWorkspace || false,
          workspaces: response.data.workspaces || [],
          isOwner: response.data.user.canMakeWorkspace || false
        }
      };
    }
    return { isAuthenticated: false, user: null };
  } catch (error: any) {
    if (error.response?.data?.error === 'Not logged in') {
      return { isAuthenticated: false, user: null, error: 'Not logged in' };
    }
    if (error.response?.data?.error === 'Workspace not setup') {
      return { isAuthenticated: false, user: null, error: 'Workspace not setup' };
    }
    return { isAuthenticated: false, user: null, error: 'Network error' };
  }
}
