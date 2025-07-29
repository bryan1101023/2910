import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionSsr } from '@/lib/withSession';
import prisma from '@/utils/database';

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { id, uid } = req.query;
		const { color } = req.body;

		// Validate color
		const validColors = ['kusai', 'blue', 'green', 'purple', 'pink'];
		if (!validColors.includes(color)) {
			return res.status(400).json({ error: 'Invalid color' });
		}

	

		return res.status(200).json({ success: true, color });
	} catch (error) {
		console.error('Error updating banner color:', error);
		return res.status(500).json({ error: 'Failed to update banner color' });
	}
}

export default handler; 