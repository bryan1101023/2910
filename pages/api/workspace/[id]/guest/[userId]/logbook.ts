import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/database';
import { withPermissionCheck } from '@/utils/permissionsManager';

export default withPermissionCheck(handler, 'manage_activity');

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const workspaceId = parseInt(req.query.id as string);
  const guestUserId = BigInt(req.query.userId as string);

  if (!workspaceId || !guestUserId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (!req.session.userid) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  switch (method) {
    case 'GET':
      try {
        const logbookEntries = await prisma.guestLogbookEntry.findMany({
          where: {
            guestUserId: guestUserId,
            workspaceGroupId: workspaceId,
          },
          include: {
            admin: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json({ 
          logbookEntries: logbookEntries.map(entry => ({
            ...entry,
            guestUserId: entry.guestUserId.toString(),
            adminId: entry.adminId.toString()
          }))
        });
      } catch (error) {
        console.error('Error fetching guest logbook entries:', error);
        return res.status(500).json({ error: 'Failed to fetch logbook entries' });
      }

    case 'POST':
      try {
        const { type, reason } = req.body;
        const adminId = BigInt(req.session.userid);

        if (!type || !reason) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const logbookEntry = await prisma.guestLogbookEntry.create({
          data: {
            guestUserId: guestUserId,
            type: type,
            reason: reason,
            adminId: adminId,
            workspaceGroupId: workspaceId,
          },
          include: {
            admin: {
              select: {
                username: true,
              },
            },
          },
        });

        return res.status(201).json({ 
          logbookEntry: {
            ...logbookEntry,
            guestUserId: logbookEntry.guestUserId.toString(),
            adminId: logbookEntry.adminId.toString()
          }
        });
      } catch (error) {
        console.error('Error creating guest logbook entry:', error);
        return res.status(500).json({ error: 'Failed to create logbook entry' });
      }

    case 'DELETE':
      try {
        const { entryId } = req.body;

        if (!entryId) {
          return res.status(400).json({ error: 'Missing entry ID' });
        }

        await prisma.guestLogbookEntry.delete({
          where: {
            id: entryId,
          },
        });

        return res.status(200).json({ message: 'Logbook entry deleted successfully' });
      } catch (error) {
        console.error('Error deleting guest logbook entry:', error);
        return res.status(500).json({ error: 'Failed to delete logbook entry' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
} 