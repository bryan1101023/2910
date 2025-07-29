import NodeCache from "node-cache";
import * as noblox from 'noblox.js'
import { getRobloxUsername, getRobloxThumbnail, getRobloxDisplayName } from "@/utils/roblox";

const usernames = new NodeCache();
const displaynames = new NodeCache();

export async function getUsername(userId: number | bigint) {
	const cachedUsername = usernames.get(Number(userId));
	if (cachedUsername) {
		return cachedUsername as string;
	} else {
		try {
			const username = await getRobloxUsername(Number(userId));
			usernames.set(Number(userId), username);
			return username as string;
		} catch (error) {
			console.error(`Failed to get username for ${userId}, using fallback`);
			// Return a fallback username
			return `User${userId}`;
		}
	}
}

export async function getThumbnail(userId: number | bigint): Promise<string> {
  try {
    const thumbnail = await getRobloxThumbnail(Number(userId));
    return thumbnail || `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&size=420x420&format=png`;
  } catch (error) {
    console.error(`Failed to get thumbnail for ${userId}, using fallback`);
    // Return a fallback thumbnail URL
    return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&size=420x420&format=png`;
  }
}

export async function getDisplayName(userId: number | bigint): Promise<string> {
	const cachedDisplayName = displaynames.get(Number(userId));
	if (cachedDisplayName) {
		return cachedDisplayName as string;
	} else {
		try {
			const displayName = await getRobloxDisplayName(Number(userId));
			displaynames.set(Number(userId), displayName);
			return displayName as string;
		} catch (error) {
			console.error(`Failed to get display name for ${userId}, using fallback`);
			// Try to get username as fallback
			try {
				const username = await getUsername(userId);
				return username;
			} catch {
				return `User${userId}`;
			}
		}
	}
}

export { getRobloxUsername };