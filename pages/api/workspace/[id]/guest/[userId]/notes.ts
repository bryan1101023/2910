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
        const notes = await prisma.guestNote.findMany({
          where: {
            guestUserId: guestUserId,
            workspaceGroupId: workspaceId,
          },
          include: {
            author: {
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
          notes: notes.map(note => ({
            ...note,
            guestUserId: note.guestUserId.toString(),
            authorId: note.authorId.toString()
          }))
        });
      } catch (error) {
        console.error('Error fetching guest notes:', error);
        return res.status(500).json({ error: 'Failed to fetch notes' });
      }

    case 'POST':
      try {
        const { content } = req.body;
        const authorId = BigInt(req.session.userid);

        if (!content) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const note = await prisma.guestNote.create({
          data: {
            guestUserId: guestUserId,
            content: content,
            authorId: authorId,
            workspaceGroupId: workspaceId,
          },
          include: {
            author: {
              select: {
                username: true,
              },
            },
          },
        });

        return res.status(201).json({ 
          note: {
            ...note,
            guestUserId: note.guestUserId.toString(),
            authorId: note.authorId.toString()
          }
        });
      } catch (error) {
        console.error('Error creating guest note:', error);
        return res.status(500).json({ error: 'Failed to create note' });
      }

    case 'DELETE':
      try {
        const { noteId } = req.body;

        if (!noteId) {
          return res.status(400).json({ error: 'Missing note ID' });
        }

        await prisma.guestNote.delete({
          where: {
            id: noteId,
          },
        });

        return res.status(200).json({ message: 'Note deleted successfully' });
      } catch (error) {
        console.error('Error deleting guest note:', error);
        return res.status(500).json({ error: 'Failed to delete note' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
} 