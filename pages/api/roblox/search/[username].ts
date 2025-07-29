import type { NextApiRequest, NextApiResponse } from 'next'
import noblox from 'noblox.js';

type Data = {
	success: boolean
	error?: string,
	users?: any
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })

	try {
		const username = String(req.query.username);
		
		if (!username || username.length < 3) {
			return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
		}

		// Search for users using Roblox API
		const users = await noblox.getIdFromUsername(username);
		
		if (!users) {
			return res.status(200).json({ success: true, users: [] });
		}

		// Get user details
		const userDetails = await noblox.getPlayerInfo(users);
		const thumbnail = await noblox.getPlayerThumbnail(users, "420x420", "png", false, "headshot");

		const userInfo = {
			username: userDetails.username,
			userId: users,
			thumbnail: thumbnail[0]?.imageUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${users}&size=420x420&format=png`
		};

		return res.status(200).json({ 
			success: true, 
			users: [userInfo]
		});
	} catch (error) {
		console.error('Roblox search error:', error);
		return res.status(500).json({ success: false, error: "Failed to search Roblox users" });
	}
} 