import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import noblox from "noblox.js";
import { IconUser, IconBook, IconMessage, IconPlus, IconX, IconEdit, IconTrash } from "@tabler/icons-react";
import Button from "@/components/button";
import Input from "@/components/input";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import moment from "moment";

type GuestUser = {
	userId: number;
	username: string;
	thumbnail: string;
	displayName?: string;
}

type LogbookEntry = {
	id: string;
	type: string;
	reason: string;
	adminId: number;
	createdAt: string;
	adminName?: string;
}

type GuestNote = {
	id: string;
	content: string;
	authorId: number;
	createdAt: string;
	authorName?: string;
}

export const getServerSideProps = async ({ params }: GetServerSidePropsContext) => {
	try {
		const userId = parseInt(params?.userId as string);
		
		if (!userId) {
			return {
				notFound: true
			};
		}

		// Get user info from Roblox
		const userInfo = await noblox.getPlayerInfo(userId);
		const thumbnail = await noblox.getPlayerThumbnail(userId, "420x420", "png", false, "headshot");

		const guestUser: GuestUser = {
			userId: userId,
			username: userInfo.username,
			thumbnail: thumbnail[0]?.imageUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&size=420x420&format=png`,
			displayName: userInfo.displayName
		};

		return {
			props: {
				guestUser: JSON.parse(JSON.stringify(guestUser))
			}
		};
	} catch (error) {
		console.error('Error fetching guest user:', error);
		return {
			notFound: true
		};
	}
};

type pageProps = {
	guestUser: GuestUser;
}

const GuestProfile: pageWithLayout<pageProps> = ({ guestUser }) => {
	const [login, setLogin] = useRecoilState(loginState);
	const router = useRouter();
	const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
	const [notes, setNotes] = useState<GuestNote[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showNewLogbook, setShowNewLogbook] = useState(false);
	const [showNewNote, setShowNewNote] = useState(false);
	const [newLogbookType, setNewLogbookType] = useState("warning");
	const [newLogbookReason, setNewLogbookReason] = useState("");
	const [newNoteContent, setNewNoteContent] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

	useEffect(() => {
		loadGuestData();
	}, []);

	const loadGuestData = async () => {
		try {
			const [logbookResponse, notesResponse] = await Promise.all([
				axios.get(`/api/workspace/${router.query.id}/guest/${guestUser.userId}/logbook`),
				axios.get(`/api/workspace/${router.query.id}/guest/${guestUser.userId}/notes`)
			]);

			// Transform the data to include adminName and authorName
			const transformedLogbookEntries = (logbookResponse.data.logbookEntries || []).map((entry: any) => ({
				...entry,
				adminName: entry.admin?.username || 'Unknown'
			}));

			const transformedNotes = (notesResponse.data.notes || []).map((note: any) => ({
				...note,
				authorName: note.author?.username || 'Unknown'
			}));

			setLogbookEntries(transformedLogbookEntries);
			setNotes(transformedNotes);
		} catch (error) {
			console.error('Error loading guest data:', error);
			toast.error('Failed to load guest data');
		} finally {
			setIsLoading(false);
		}
	};

	const handleNewLogbook = async () => {
		if (!newLogbookReason.trim()) {
			toast.error("Please provide a reason");
			return;
		}

		try {
			const response = await axios.post(`/api/workspace/${router.query.id}/guest/${guestUser.userId}/logbook`, {
				type: newLogbookType,
				reason: newLogbookReason
			});

			// Transform the new entry to include adminName
			const newEntry = {
				...response.data.logbookEntry,
				adminName: response.data.logbookEntry.admin?.username || 'Unknown'
			};

			setLogbookEntries([newEntry, ...logbookEntries]);
			setNewLogbookReason("");
			setNewLogbookType("warning");
			setShowNewLogbook(false);
			toast.success("Logbook entry added successfully");
		} catch (error) {
			toast.error("Failed to add logbook entry");
		}
	};

	const handleNewNote = async () => {
		if (!newNoteContent.trim()) {
			toast.error("Please provide content for your note");
			return;
		}

		try {
			const response = await axios.post(`/api/workspace/${router.query.id}/guest/${guestUser.userId}/notes`, {
				content: newNoteContent
			});

			// Transform the new note to include authorName
			const newNote = {
				...response.data.note,
				authorName: response.data.note.author?.username || 'Unknown'
			};

			setNotes([newNote, ...notes]);
			setNewNoteContent("");
			setShowNewNote(false);
			toast.success("Note created successfully");
		} catch (error) {
			toast.error("Failed to create note");
		}
	};

	const handleDeleteLogbookEntry = async (entryId: string) => {
		try {
			await axios.delete(`/api/workspace/${router.query.id}/guest/${guestUser.userId}/logbook`, {
				data: { entryId }
			});

			setLogbookEntries(logbookEntries.filter(entry => entry.id !== entryId));
			setShowDeleteConfirm(null);
			toast.success("Logbook entry deleted successfully");
		} catch (error) {
			toast.error("Failed to delete logbook entry");
		}
	};

	const handleDeleteNote = async (noteId: string) => {
		try {
			await axios.delete(`/api/workspace/${router.query.id}/guest/${guestUser.userId}/notes`, {
				data: { noteId }
			});

			setNotes(notes.filter(note => note.id !== noteId));
			setShowDeleteConfirm(null);
			toast.success("Note deleted successfully");
		} catch (error) {
			toast.error("Failed to delete note");
		}
	};

	const getLogbookTypeColor = (type: string) => {
		switch (type) {
			case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "suspension": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
			case "fire": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			case "promotion": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orbit"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Toaster position="bottom-center" />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-4">
						<button
							onClick={() => router.back()}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
						>
							<IconX className="w-5 h-5" />
						</button>
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								Guest Profile
							</h1>
							<p className="text-sm text-gray-500">
								Viewing {guestUser.username} as a guest
							</p>
						</div>
					</div>
				</div>

				{/* Profile Card */}
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
					<div className="flex items-center gap-6">
						<img
							src={guestUser.thumbnail}
							alt={guestUser.username}
							className="w-24 h-24 rounded-xl object-cover ring-4 ring-white/20 dark:ring-gray-700/50"
						/>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
								{guestUser.displayName || guestUser.username}
							</h2>
							<p className="text-gray-500 dark:text-gray-400">
								@{guestUser.username}
							</p>
							<div className="flex items-center gap-2 mt-2">
								<span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
									Guest
								</span>
								<span className="px-3 py-1 text-xs font-medium bg-orbit/10 text-orbit rounded-full">
									User ID: {guestUser.userId}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Logbook */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
						<div className="p-6 border-b border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<IconBook className="w-6 h-6 text-orbit" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Logbook
									</h3>
								</div>
								<Button
									onClick={() => setShowNewLogbook(true)}
									size="sm"
								>
									<div className="flex items-center gap-2">
										<IconPlus className="w-4 h-4" />
										Add Entry
									</div>
								</Button>
							</div>
						</div>
						<div className="p-6">
							{logbookEntries.length === 0 ? (
								<div className="text-center py-8">
									<IconBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500 dark:text-gray-400">
										No logbook entries yet
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{logbookEntries.map((entry) => (
										<div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
											<div className="flex items-center justify-between mb-2">
												<span className={`px-2 py-1 text-xs font-medium rounded-full ${getLogbookTypeColor(entry.type)}`}>
													{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
												</span>
												<div className="flex items-center gap-2">
												<span className="text-xs text-gray-500 dark:text-gray-400">
													{moment(entry.createdAt).fromNow()}
												</span>
													<button
														onClick={() => setShowDeleteConfirm(entry.id)}
														className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
														title="Delete logbook entry"
													>
														<IconTrash className="w-4 h-4" />
													</button>
												</div>
											</div>
											<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
												{entry.reason}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												By: {entry.adminName}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Notes */}
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
						<div className="p-6 border-b border-gray-200 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<IconMessage className="w-6 h-6 text-orbit" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Notes
									</h3>
								</div>
								<Button
									onClick={() => setShowNewNote(true)}
									size="sm"
								>
									<div className="flex items-center gap-2">
										<IconPlus className="w-4 h-4" />
										New Note
									</div>
								</Button>
							</div>
						</div>
						<div className="p-6">
							{notes.length === 0 ? (
								<div className="text-center py-8">
									<IconMessage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500 dark:text-gray-400">
										No notes yet
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{notes.map((note) => (
										<div key={note.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-gray-900 dark:text-white">
													{note.authorName}
												</span>
												<div className="flex items-center gap-2">
												<span className="text-xs text-gray-500 dark:text-gray-400">
														{moment(note.createdAt).fromNow()}
												</span>
													<button
														onClick={() => setShowDeleteConfirm(note.id)}
														className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
														title="Delete note"
													>
														<IconTrash className="w-4 h-4" />
													</button>
												</div>
											</div>
											<p className="text-sm text-gray-700 dark:text-gray-300">
												{note.content}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* New Logbook Modal */}
			{showNewLogbook && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Add Logbook Entry
							</h3>
							<button
								onClick={() => setShowNewLogbook(false)}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
							>
								<IconX className="w-5 h-5 text-gray-500" />
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Type
								</label>
								<select
									value={newLogbookType}
									onChange={(e) => setNewLogbookType(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orbit focus:border-transparent"
								>
									<option value="warning">Warning</option>
									<option value="suspension">Suspension</option>
									<option value="fire">Fire</option>
									<option value="promotion">Promotion</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Reason
								</label>
								<textarea
									value={newLogbookReason}
									onChange={(e) => setNewLogbookReason(e.target.value)}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orbit focus:border-transparent"
									placeholder="Enter reason for this entry..."
								/>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<Button
								variant="outline"
								onClick={() => setShowNewLogbook(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleNewLogbook}
							>
								Add Entry
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* New Note Modal */}
			{showNewNote && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Create Note
							</h3>
							<button
								onClick={() => setShowNewNote(false)}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
							>
								<IconX className="w-5 h-5 text-gray-500" />
							</button>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Content
							</label>
							<textarea
								value={newNoteContent}
								onChange={(e) => setNewNoteContent(e.target.value)}
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orbit focus:border-transparent"
								placeholder="What's on your mind?"
							/>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<Button
								variant="outline"
								onClick={() => setShowNewNote(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleNewNote}
							>
								Create Note
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Confirm Deletion
							</h3>
							<button
								onClick={() => setShowDeleteConfirm(null)}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
							>
								<IconX className="w-5 h-5 text-gray-500" />
							</button>
						</div>
						<div className="mb-6">
							<p className="text-gray-700 dark:text-gray-300">
								Are you sure you want to delete this item? This action cannot be undone.
							</p>
						</div>
						<div className="flex justify-end gap-3">
							<Button
								variant="outline"
								onClick={() => setShowDeleteConfirm(null)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									const entry = logbookEntries.find(e => e.id === showDeleteConfirm);
									if (entry) {
										handleDeleteLogbookEntry(showDeleteConfirm);
									} else {
										handleDeleteNote(showDeleteConfirm);
									}
								}}
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

GuestProfile.layout = workspace;

export default GuestProfile; 