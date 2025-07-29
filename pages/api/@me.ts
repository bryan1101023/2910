// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchworkspace, getConfig, setConfig } from '@/utils/configEngine'
import prisma from '@/utils/database';
import { withSessionRoute } from '@/lib/withSession'
import { getUsername, getThumbnail, getDisplayName } from '@/utils/userinfoEngine'
import { getRegistry } from '@/utils/registryManager';
import * as noblox from 'noblox.js'

type User = {
	userId: number
	username: string
	canMakeWorkspace: boolean
	displayname: string
	thumbnail: string
	registered: boolean
	birthdayDay?: number | null
	birthdayMonth?: number | null
}

type Data = {
	success: boolean
	error?: string
	user?: User
	workspaces?: { 
		groupId: number
		groupthumbnail: string
		groupname: string
	}[]
}

export default withSessionRoute(handler);

export async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })
	if (!await prisma.workspace.count()) return res.status(400).json({ success: false, error: 'Workspace not setup' })
	if (!req.session.userid) return res.status(401).json({ success: false, error: 'Not logged in' });
	
	try {
		const dbuser = await prisma.user.findUnique({
			where: {
				userid: req.session.userid
			}
		});

		// Fetch user data with fallbacks
		const [username, displayname, thumbnail] = await Promise.allSettled([
			getUsername(req.session.userid),
			getDisplayName(req.session.userid),
			getThumbnail(req.session.userid)
		]);

		const user: User = {
			userId: req.session.userid,
			username: username.status === 'fulfilled' ? username.value : 'Unknown User',
			displayname: displayname.status === 'fulfilled' ? displayname.value : 'Unknown User',
			canMakeWorkspace: dbuser?.isOwner || false,
			thumbnail: thumbnail.status === 'fulfilled' ? thumbnail.value : '/default-avatar.jpg',
			registered: dbuser?.registered || false,
			birthdayDay: dbuser?.birthdayDay ?? null,
			birthdayMonth: dbuser?.birthdayMonth ?? null,
		}

		// Fetch workspaces
		const tovyuser = await prisma.user.findUnique({
			where: {
				userid: req.session.userid
			},
			include: {
				roles: true
			}
		})

		let roles: any[] = [];
		if (tovyuser?.roles.length) {
			for (const role of tovyuser.roles) {
				try {
					const [groupThumbnail, groupInfo] = await Promise.allSettled([
						noblox.getLogo(role.workspaceGroupId),
						noblox.getGroup(role.workspaceGroupId)
					]);

					roles.push({
						groupId: role.workspaceGroupId,
						groupThumbnail: groupThumbnail.status === 'fulfilled' ? groupThumbnail.value : '',
						groupName: groupInfo.status === 'fulfilled' ? groupInfo.value.name : 'Unknown Group',
					})
				} catch (error) {
					console.error(`Error fetching group ${role.workspaceGroupId}:`, error);
					// Still include the role even if group info fails
					roles.push({
						groupId: role.workspaceGroupId,
						groupThumbnail: '',
						groupName: 'Unknown Group',
					})
				}
			}
		};

		// Update user data in database
		await prisma.user.update({
			where: {
				userid: req.session.userid
			},
			data: {
				picture: user.thumbnail,
				username: user.username,
				registered: true
			}
		});

		res.status(200).json({ success: true, user, workspaces: roles })
	} catch (error) {
		console.error('Error in @me handler:', error);
		res.status(500).json({ success: false, error: 'Internal server error' });
	}
}
