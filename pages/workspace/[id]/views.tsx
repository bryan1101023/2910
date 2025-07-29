import workspace from "@/layouts/workspace";
import { pageWithLayout } from "@/layoutTypes";
import { loginState } from "@/state";
import { Fragment, useEffect, useState, useCallback } from "react";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getThumbnail } from "@/utils/userinfoEngine";
import { useRecoilState } from "recoil";
import noblox from "noblox.js";
import Input from "@/components/input";
import { v4 as uuidv4 } from 'uuid';
import prisma from "@/utils/database"
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	SortingState,
	getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { FormProvider, useForm } from "react-hook-form";
import Button from "@/components/button";
import { inactivityNotice, Session, user, userBook, wallPost } from "@prisma/client";
import Checkbox from "@/components/checkbox";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { IconArrowLeft, IconFilter, IconPlus, IconSearch, IconUsers, IconX, IconUser } from "@tabler/icons-react";

type User = {
	info: {
		userId: string
		username: string | null
		picture: string | null
	}
	book: userBook[]
	wallPosts: wallPost[]
	inactivityNotices: inactivityNotice[]
	sessions: Session[]
	rankID: number
	minutes: number
	idleMinutes: number
	hostedSessions: any,
	messages: number
	registered: boolean;
}

type SearchResult = {
	username: string;
	thumbnail: string;
	isGuest?: boolean;
	userId?: number;
}

export const getServerSideProps = withPermissionCheckSsr(async ({ params }: GetServerSidePropsContext) => {
	const allUsers = await prisma.user.findMany({
		where: {
			roles: {
				some: {
					workspaceGroupId: parseInt(params?.id as string)
				}
			}
		},
		include: {
			book: true,
			wallPosts: true,
			inactivityNotices: true,
			sessions: true,
			ranks: true,
			roles: true
		}
	});
	const allActivity = await prisma.activitySession.findMany({
		where: {
			workspaceGroupId: parseInt(params?.id as string)
		},
		include: {
			user: {
				include: {
					writtenBooks: true,
					wallPosts: true,
					inactivityNotices: true,
					sessions: true,
					ranks: true
				}
		}
	}
	});

	const allHostedSessions = await prisma.session.findMany({
		where: {
			ended: {
				not: null
			}
		}
	});

	const computedUsers: any[] = []
	const ranks = await noblox.getRoles(parseInt(params?.id as string));

	for (const user of allUsers) {
		const ms: number[] = [];
		allActivity.filter(x => BigInt(x.userId) == user.userid && !x.active).forEach((session) => {
			ms.push(session.endTime?.getTime() as number - session.startTime.getTime());
		});

		const hostedSessions = allHostedSessions.filter(x => x.ownerId == user.userid);

		computedUsers.push({
			info: {
				userId: user.userid,
				username: user.username,
				picture: `/api/workspace/${params?.id}/avatar/${user.userid}`
			},
			book: user.book,
			wallPosts: user.wallPosts,
			inactivityNotices: user.inactivityNotices,
			sessions: user.sessions,
			rankID: user.ranks.find(x => x.workspaceGroupId == parseInt(params?.id as string))?.rankId || 0,
			minutes: ms.reduce((a, b) => a + b, 0) / 60000,
			idleMinutes: 0,
			hostedSessions: hostedSessions,
			messages: 0,
			registered: user.registered
		});
	}

	return {
		props: {
			usersInGroup: JSON.parse(JSON.stringify(computedUsers, (key, value) => 
				typeof value === 'bigint' ? value.toString() : value
			)),
			ranks: ranks
		}
	}
});

type pageProps = {
	usersInGroup: User[];
	ranks: {
		id: number;
		rank: number;
		name: string;
	}[]
}

const Views: pageWithLayout<pageProps> = ({ usersInGroup, ranks }) => {
  const [login, setLogin] = useRecoilState(loginState);
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [users, setUsers] = useState(usersInGroup);
  const [isLoading, setIsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [colFilters, setColFilters] = useState<{
		id: string
		column: string
		filter: string
		value: string
	}[]>([]);

	const columnHelper = createColumnHelper<User>();

	const updateUsers = async (query: string) => {

	}

	// Debounced search function
	const debouncedSearch = useCallback(
		(async (query: string) => {
			if (!query.trim()) {
				setSearchOpen(false);
				setSearchResults([]);
				return;
			}

			setIsSearching(true);
			setSearchOpen(true);

			try {
				// First search workspace members
				const workspaceResponse = await axios.get(`/api/workspace/${router.query.id}/staff/search/${query}`);
				const workspaceUsers = workspaceResponse.data.users.map((user: any) => ({
					...user,
					isGuest: false
				}));

				// Then search any Roblox user (for guest functionality)
				try {
					const robloxResponse = await axios.get(`/api/roblox/search/${query}`);
					const robloxUsers = robloxResponse.data.users
						.filter((robloxUser: any) => 
							!workspaceUsers.some((wsUser: any) => wsUser.username === robloxUser.username)
						)
						.map((user: any) => ({
							username: user.username,
							thumbnail: user.thumbnail,
							isGuest: true,
							userId: user.userId
						}));

					setSearchResults([...workspaceUsers, ...robloxUsers]);
				} catch (robloxError) {
					// If Roblox search fails, just show workspace users
					setSearchResults(workspaceUsers);
				}
			} catch (error) {
				console.error('Search error:', error);
				setSearchResults([]);
			} finally {
				setIsSearching(false);
			}
		}),
		[router.query.id]
	);

	// Debounce effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			debouncedSearch(searchQuery);
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, debouncedSearch]);

	const columns = [
		{
			id: "select",
			header: ({ table }: any) => (
				<Checkbox
					{...{
						checked: table.getIsAllRowsSelected(),
						indeterminate: table.getIsSomeRowsSelected(),
						onChange: table.getToggleAllRowsSelectedHandler(),
					}}
				/>
			),
			cell: ({ row }: any) => (
				<Checkbox
					{...{
						checked: row.getIsSelected(),
						indeterminate: row.getIsSomeSelected(),
						onChange: row.getToggleSelectedHandler(),
					}}
				/>
			)
		},
		{
			id: "user",
			header: 'User',
			cell: (props: any) => {
				const user = props.row.original;
				return (
					<div className="flex flex-row cursor-pointer" onClick={() => router.push(`/workspace/${router.query.id}/profile/${user.info.userId}`)}>
						<img
							src={user.info.picture!}
							className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
							alt={`${user.info.username}'s avatar`}
						/>
						<div className="leading-5 my-auto px-2">
							<p className="font-semibold dark:text-white">
								{user.info.username}
							</p>
							<p className="text-pink-500 text-xs font-medium">
								{ranks.find(x => x.rank == user.rankID)?.name || "Guest"}
							</p>
						</div>
					</div>
				);
			}
		},
		columnHelper.accessor("sessions", {
			header: 'Sessions claimed',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("hostedSessions", {
			header: 'Sessions hosted',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("book", {
			header: 'Warnings',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue().filter(x => x.type == "warning").length}</p>
				);
			}
		}),
		columnHelper.accessor("wallPosts", {
			header: 'Wall Posts',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("rankID", {
			header: 'Rank',
			cell: (row) => {
				return (
					<p className="dark:text-white">{ranks.find(x => x.rank == row.getValue())?.name || "N/A"}</p>
				);
			}
		}),
		columnHelper.accessor("inactivityNotices", {
			header: 'Inactivity Notices',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue().length}</p>
				);
			}
		}),
		columnHelper.accessor("minutes", {
			header: 'Minutes',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue()}</p>
				);
			}
		}),
		columnHelper.accessor("idleMinutes", {
			header: 'Idle minutes',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue()}</p>
				);
			}
		}),
		columnHelper.accessor("messages", {
			header: 'Messages',
			cell: (row) => {
				return (
					<p className="dark:text-white">{row.getValue()}</p>
				);
			}
		}),
		columnHelper.accessor("registered", {
			header: 'Registered',
			cell: (row) => {
				return (
					<p>{row.getValue() ? "✅" : "❌"}</p>
				);
			}
		}),
	];

	const [columnVisibility, setColumnVisibility] = useState({
		inactivityNotices: false,
		idleMinutes: false,
		registered: false
	});

	const table = useReactTable({
		columns,
		data: users,
		state: {
			sorting,
			rowSelection,
			// @ts-ignore
			columnVisibility,
		},
		// @ts-ignore
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const newfilter = () => {
		setColFilters([...colFilters, { id: uuidv4(), column: 'username', filter: 'equal', value: '' }])
	};
	const removeFilter = (id: string) => {
		setColFilters(colFilters.filter((filter) => filter.id !== id));
	}
	const updateFilter = (id: string, column: string, filter: string, value: string) => {
		const OBJ = Object.assign(([] as typeof colFilters), colFilters);
		const index = OBJ.findIndex((filter) => filter.id === id);
		OBJ[index] = { id, column, filter, value };
		setColFilters(OBJ);
	};

	useEffect(() => {
		const filteredUsers = usersInGroup.filter((user) => {
			let valid = true;
			colFilters.forEach((filter) => {
				if (filter.column === 'username') {
					if (!filter.value) return;
					if (filter.filter === 'equal') {
						if (user.info.username !== filter.value) {
							valid = false;
						}
					} else if (filter.filter === 'notEqual') {
						if (user.info.username === filter.value) {
							valid = false;
						}
					}
				}
			});
			return valid;
		});
		setUsers(filteredUsers);
	}, [colFilters, usersInGroup]);

	const massAction = () => {
		const selectedRows = table.getSelectedRowModel().flatRows;
		const selectedUsers = selectedRows.map((row) => row.original);

		if (type === "promotion") {
			selectedUsers.forEach((user) => {
				axios.post(`/api/workspace/${router.query.id}/settings/activity/setRole`, {
					userId: parseInt(user.info.userId),
					rankId: ranks[ranks.length - 2].id
				});
			});
			toast.success(`Promoted ${selectedUsers.length} users`);
		} else if (type === "warning") {
			selectedUsers.forEach((user) => {
				axios.post(`/api/workspace/${router.query.id}/userbook/${user.info.userId}/new`, {
					type: "warning",
					message: message
				});
			});
			toast.success(`Warned ${selectedUsers.length} users`);
		} else if (type === "suspension") {
			selectedUsers.forEach((user) => {
				axios.post(`/api/workspace/${router.query.id}/userbook/${user.info.userId}/new`, {
					type: "suspension",
					message: message
				});
			});
			toast.success(`Suspended ${selectedUsers.length} users`);
		} else if (type === "fire") {
			selectedUsers.forEach((user) => {
				axios.post(`/api/workspace/${router.query.id}/userbook/${user.info.userId}/new`, {
					type: "fire",
					message: message
				});
			});
			toast.success(`Fired ${selectedUsers.length} users`);
		} else if (type === "add") {
			selectedUsers.forEach((user) => {
				axios.post(`/api/workspace/${router.query.id}/activity/add`, {
					userId: parseInt(user.info.userId),
					minutes: minutes
				});
			});
			toast.success(`Added ${minutes} minutes to ${selectedUsers.length} users`);
		}
		setIsOpen(false);
		setMessage("");
		setMinutes(0);
		setType("");
		table.toggleAllRowsSelected(false);
	};

	const handleSearchSelect = async (result: SearchResult) => {
		setSearchQuery(result.username);
		setSearchOpen(false);
		
		if (result.isGuest) {
			// For guest users, navigate to a special guest profile page
			router.push(`/workspace/${router.query.id}/profile/guest/${result.userId}`);
		} else {
			// For workspace members, use existing filter
			setColFilters([{ id: uuidv4(), column: 'username', filter: 'equal', value: result.username }]);
		}
	};

	const getSelectionName = (columnId: string) => {
		if (columnId == "sessions") { 
			return "Sessions claimed"
		} else if (columnId == "hostedSessions") {
			return 'Hosted sessions'
		} else if (columnId == "book") {
			return "Warnings"
		} else if (columnId == "wallPosts") {
			return "Wall Posts"
		} else if (columnId == "rankID") {
			return "Rank"
		} else if (columnId == "inactivityNotices") {
			return "Inactivity notices"
		} else if (columnId == "minutes") {
			return "Minutes"
		} else if (columnId == "idleMinutes") {
			return "Idle minutes"
		} else if (columnId == "messages") {
			return "Messages"
		} else if (columnId == "registered") {
			return "Registered"
		}
 	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Toaster position="bottom-center" />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Header */}
				<div className="flex items-center gap-3 mb-6">
					<div>
						<h1 className="text-xl font-medium text-gray-900 dark:text-white">Staff Management</h1>
						<p className="text-sm text-gray-500">View and manage your staff members</p>
					</div>
				</div>

				{/* Actions Bar */}
				<div className="mb-4">
					<div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
						<div className="flex flex-wrap gap-2">
							<Popover className="relative">
								{({ open }) => (
									<>
										<Popover.Button
											className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white dark:text-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
												open ? 'bg-gray-50 dark:bg-gray-800 ring-2 ring-primary' : ''
											}`}
										>
											<IconFilter className="w-4 h-4 mr-1.5" />
											Filters
										</Popover.Button>

										<Transition
											as={Fragment}
											enter="transition ease-out duration-200"
											enterFrom="opacity-0 translate-y-1"
											enterTo="opacity-100 translate-y-0"
											leave="transition ease-in duration-150"
											leaveFrom="opacity-100 translate-y-0"
											leaveTo="opacity-0 translate-y-1"
										>
											<Popover.Panel className="absolute left-0 z-10 mt-2 w-72 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-3">
												<div className="space-y-3">
													<button
														onClick={newfilter}
														className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
													>
														<IconPlus className="w-4 h-4 mr-1.5" />
														Add Filter
													</button>

													{colFilters.map((filter) => (
														<div key={filter.id} className="p-2 border border-gray-200 rounded-lg dark:text-white">
															<Filter
																ranks={ranks}
																updateFilter={(col, op, value) => updateFilter(filter.id, col, op, value)}
																deleteFilter={() => removeFilter(filter.id)}
																data={filter}
															/>
														</div>
													))}
												</div>
											</Popover.Panel>
										</Transition>
									</>
								)}
							</Popover>

							<Popover className="relative">
								{({ open }) => (
									<>
										<Popover.Button
											className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
												open ? 'bg-gray-50 dark:bg-gray-800 ring-2 ring-primary' : ''
											}`}
										>
											<IconUsers className="w-4 h-4 mr-1.5" />
											Columns
										</Popover.Button>

										<Transition
											as={Fragment}
											enter="transition ease-out duration-200"
											enterFrom="opacity-0 translate-y-1"
											enterTo="opacity-100 translate-y-0"
											leave="transition ease-in duration-150"
											leaveFrom="opacity-100 translate-y-0"
											leaveTo="opacity-0 translate-y-1"
										>
											<Popover.Panel className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-3">
												<div className="space-y-2">
													{table.getAllLeafColumns().map((column: any) => {
														if (column.id !== "select" && column.id !== "info") {
															return (
																<label key={column.id} className="flex items-center space-x-2">
																	<Checkbox
																		checked={column.getIsVisible()}
																		onChange={column.getToggleVisibilityHandler()}
																	/>
																	<span className="text-sm text-gray-700 dark:text-gray-200">{getSelectionName(column.id)}</span>
																</label>
															)
														}
													})}
												</div>
											</Popover.Panel>
										</Transition>
									</>
								)}
							</Popover>
						</div>

						{/* Modern Search */}
						<div className="relative w-full md:w-80">
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search username..."
								leftIcon={<IconSearch className="w-4 h-4" />}
								loading={isSearching}
								fullWidth
							/>

							{searchOpen && searchResults.length > 0 && (
								<div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
									<div className="py-2">
										{searchResults.map((result, index) => (
											<button
												key={`${result.username}-${index}`}
												onClick={() => handleSearchSelect(result)}
												className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors duration-200"
											>
												<img
													src={result.thumbnail}
													alt={result.username}
													className="w-8 h-8 rounded-lg object-cover ring-2 ring-white/20 dark:ring-gray-700/50"
												/>
												<div className="flex-1">
													<div className="flex items-center space-x-2">
														<span className="text-sm font-medium text-gray-900 dark:text-white">
															{result.username}
														</span>
														{result.isGuest && (
															<span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
																Guest
															</span>
														)}
													</div>
													{result.isGuest && (
														<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
															Click to view as guest
														</p>
													)}
												</div>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Mass Actions */}
					{table.getSelectedRowModel().flatRows.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							<button
								onClick={() => { setType("promotion"); setIsOpen(true) }}
								className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								Mass promote {table.getSelectedRowModel().flatRows.length} users
							</button>
							<button
								onClick={() => { setType("warning"); setIsOpen(true) }}
								className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
							>
								Mass warn {table.getSelectedRowModel().flatRows.length} users
							</button>
							<button
								onClick={() => { setType("suspension"); setIsOpen(true) }}
								className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								Mass suspend {table.getSelectedRowModel().flatRows.length} users
							</button>
							<button
								onClick={() => { setType("fire"); setIsOpen(true) }}
								className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								Mass fire {table.getSelectedRowModel().flatRows.length} users
							</button>
							<button
								onClick={() => { setType("add"); setIsOpen(true) }}
								className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
							>
								Add minutes to {table.getSelectedRowModel().flatRows.length} users
							</button>
						</div>
					)}
				</div>

				{/* Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-800">
								<tr>
									{table.getHeaderGroups().map((headerGroup) => (
										headerGroup.headers.map((header) => (
											<th
												key={header.id}
												scope="col"
												className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
												onClick={header.column.getToggleSortingHandler()}
											>
												{header.isPlaceholder ? null : (
													<div className="flex items-center space-x-1">
														<span className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors duration-200">
															{flexRender(header.column.columnDef.header, header.getContext())}
														</span>
													</div>
												)}
											</th>
										))
									))}
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="bg-white dark:bg-gray-800 px-3 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-4">
						<div className="flex-1 flex justify-center">
							<div className="flex gap-1">
								<button
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
									className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
								>
									Previous
								</button>
								<span className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md">
									Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
								</span>
								<button
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
									className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mass Action Dialog */}
			<Transition appear show={isOpen} as={Fragment}>
				<Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-5 text-left align-middle shadow-xl transition-all">
									<Dialog.Title as="div" className="flex items-center justify-between mb-3">
										<h3 className="text-lg font-medium text-gray-900 dark:text-white">
											Mass {type} {type === "add" ? "minutes" : ""}
										</h3>
										<button
											onClick={() => setIsOpen(false)}
											className="text-gray-400 hover:text-gray-500"
										>
											<IconX className="w-5 h-5" />
										</button>
									</Dialog.Title>

									<FormProvider {...useForm({
										defaultValues: {
											value: type === "add" ? minutes.toString() : message
										}
									})}>
										<div className="mt-3">
											<Input
												type={type === "add" ? "number" : "text"}
												placeholder={type === "add" ? "Minutes" : "Message"}
												value={type === "add" ? minutes.toString() : message}
												name="value"
												id="value"
												onBlur={async () => true}
												onChange={async (e) => {
													if (type === "add") {
														setMinutes(parseInt(e.target.value) || 0);
													} else {
														setMessage(e.target.value);
													}
													return true;
												}}
											/>
										</div>
									</FormProvider>

									<div className="mt-5 flex justify-end gap-2">
										<button
											type="button"
											className="inline-flex justify-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-colors duration-200"
											onClick={() => setIsOpen(false)}
										>
											Cancel
										</button>
										<button
											type="button"
											className="inline-flex justify-center px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md transition-colors duration-200"
											onClick={massAction}
										>
											Confirm
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</div>
	);
};

function getRandomBg(userid: string | number) {
	const colors = [
		'bg-red-500',
		'bg-blue-500',
		'bg-green-500',
		'bg-yellow-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-indigo-500',
		'bg-gray-500'
	];
	return colors[parseInt(userid.toString()) % colors.length];
}

const Filter: React.FC<{
	data: {
		column: string;
		filter: string;
		value: string;
	};
	updateFilter: (column: string, op: string, value: string) => void;
	deleteFilter: () => void;
	ranks: {
		id: number;
		name: string;
		rank: number;
	}[];
}> = ({ updateFilter, deleteFilter, data, ranks }) => {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<select
					value={data.column}
					onChange={(e) => updateFilter(e.target.value, data.filter, data.value)}
					className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
				>
					<option value="username">Username</option>
					<option value="rank">Rank</option>
				</select>
				<button
					onClick={deleteFilter}
					className="text-red-500 hover:text-red-700"
				>
					<IconX className="w-4 h-4" />
				</button>
			</div>
			<div className="flex items-center space-x-2">
				<select
					value={data.filter}
					onChange={(e) => updateFilter(data.column, e.target.value, data.value)}
					className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
				>
					<option value="equal">Equal</option>
					<option value="notEqual">Not Equal</option>
					<option value="contains">Contains</option>
				</select>
				{data.column === 'rank' ? (
					<select
						value={data.value}
						onChange={(e) => updateFilter(data.column, data.filter, e.target.value)}
						className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
					>
						{ranks.map((rank) => (
							<option key={rank.id} value={rank.name}>
								{rank.name}
							</option>
						))}
					</select>
				) : (
					<input
						type="text"
						value={data.value}
						onChange={(e) => updateFilter(data.column, data.filter, e.target.value)}
						className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						placeholder="Value"
					/>
				)}
			</div>
		</div>
	);
};

Views.layout = workspace;

export default Views;