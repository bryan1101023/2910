import React, { useState } from "react";
import { FC } from '@/types/settingsComponent'
import { useRecoilState } from "recoil";
import { workspacestate } from "@/state";
import { IconPencil, IconCheck, IconX, IconAlertTriangle, IconStar, IconShieldCheck, IconClipboardList } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import moment from "moment";

interface Props {
	userBook: any[];
	onRefetch?: () => void;
}

const Book: FC<Props> = ({ userBook, onRefetch }) => {
	const router = useRouter();
	const { id } = router.query;
	const [workspace, setWorkspace] = useRecoilState(workspacestate);
	const [text, setText] = useState("");
	const [type, setType] = useState("note");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const addNote = async () => {
		if (!text) {
			toast.error("Please enter a note");
			return;
		}

		setIsSubmitting(true);
		try {
			await axios.post(`/api/workspace/${id}/userbook/${router.query.uid}/new`, {
				notes: text,
				type: type
			});

			setText("");
			toast.success("Note added successfully");
			router.reload();
		} catch (error) {
			console.error("Error adding note:", error);
			toast.error("Failed to add note");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getIcon = (type: string) => {
		switch (type) {
			case "note":
				return <IconPencil className="w-5 h-5 text-gray-500" />;
			case "warning":
				return <IconAlertTriangle className="w-5 h-5 text-yellow-500" />;
			case "promotion":
				return <IconStar className="w-5 h-5 text-primary" />;
			case "demotion":
				return <IconX className="w-5 h-5 text-red-500" />;
			case "suspension":
				return <IconX className="w-5 h-5 text-red-500" />;
			case "termination":
				return <IconX className="w-5 h-5 text-red-500" />;
			default:
				return <IconPencil className="w-5 h-5 text-gray-500" />;
		}
	};

	return (
		<div className="space-y-8">
			{/* Add New Note Card */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="p-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-orbit/10 rounded-lg flex items-center justify-center">
							<IconPencil className="w-5 h-5 text-orbit" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Entry</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">Create a new logbook entry</p>
						</div>
					</div>
					
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Entry Type
								</label>
								<select
									id="type"
									value={type}
									onChange={(e) => setType(e.target.value)}
									className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orbit focus:ring-orbit transition-colors">
									<option value="note">Note</option>
									<option value="warning">Warning</option>
									<option value="promotion">Promotion</option>
									<option value="demotion">Demotion</option>
									<option value="suspension">Suspension</option>
									<option value="termination">Termination</option>
								</select>
							</div>
							<div className="flex items-end">
								<button
									onClick={addNote}
									disabled={isSubmitting}
									className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orbit hover:bg-orbit/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orbit transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? (
										<>
											<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Adding...
										</>
									) : (
										"Add Entry"
									)}
								</button>
							</div>
						</div>
						<div>
							<label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Entry Details
							</label>
							<textarea
								id="note"
								rows={4}
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="Enter the details of this entry..."
								className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-orbit focus:ring-orbit transition-colors"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Timeline */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="p-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-orbit/10 rounded-lg flex items-center justify-center">
							<IconClipboardList className="w-5 h-5 text-orbit" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Logbook History</h2>
							<p className="text-sm text-gray-500 dark:text-gray-400">{userBook.length} entries total</p>
						</div>
					</div>
					
					{userBook.length === 0 ? (
						<div className="text-center py-12">
							<div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 max-w-md mx-auto">
								<div className="mx-auto w-16 h-16 bg-orbit/10 rounded-full flex items-center justify-center mb-4">
									<IconClipboardList className="w-8 h-8 text-orbit" />
								</div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Entries Yet</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This user's logbook is empty. Add the first entry above.</p>
							</div>
						</div>
					) : (
						<div className="relative">
							{/* Timeline Line */}
							<div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
							
							<div className="space-y-6">
								{userBook.map((entry: any, index: number) => (
									<div key={entry.id} className="relative flex gap-4">
										{/* Timeline Dot */}
										<div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-4 border-gray-200 dark:border-gray-600 flex items-center justify-center z-10">
											{getIcon(entry.type)}
										</div>
										
										{/* Entry Content */}
										<div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-center gap-2">
													<span className={`px-3 py-1 text-xs font-medium rounded-full ${
														entry.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
														entry.type === 'promotion' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
														entry.type === 'demotion' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
														entry.type === 'suspension' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
														entry.type === 'termination' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
														'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
													}`}>
														{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
													</span>
												</div>
												<time className="text-xs text-gray-500 dark:text-gray-400">
													{moment(entry.createdAt).format("MMM DD, YYYY")}
												</time>
											</div>
											
											<p className="text-sm text-gray-900 dark:text-white mb-3 leading-relaxed">
												{entry.reason}
											</p>
											
											<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
												<span>Logged by</span>
												<span className="font-medium text-gray-700 dark:text-gray-300">
													{entry.admin?.username || "Unknown"}
												</span>
												<span>•</span>
												<span>{moment(entry.createdAt).fromNow()}</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Book;
