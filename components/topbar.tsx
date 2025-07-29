import type { NextPage } from "next";
import { loginState } from "../state";
import { useRecoilState } from "recoil";
import { Menu, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { IconLogout, IconChevronDown, IconFileText } from "@tabler/icons-react";
import axios from "axios";
import { Fragment, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const Topbar: NextPage = () => {
	const [login, setLogin] = useRecoilState(loginState);
	const [showChangelog, setShowChangelog] = useState(false);
	const router = useRouter();

	async function logout() {
		await axios.post("/api/auth/logout");
		setLogin({
			userId: 1,
			username: '',
			displayname: '',
			canMakeWorkspace: false,
			thumbnail: '',
			workspaces: [],
			isOwner: false
		});
		router.push('/login');
	}

	return (
		<>
			<header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-3">
								<div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
							</div>
							<ThemeToggle />
						</div>

						<Menu as="div" className="relative">
							<Menu.Button className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group">
								<img
									src={login?.thumbnail}
									className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-600 ring-2 ring-white/20 dark:ring-gray-700/50 transition-transform duration-200 group-hover:scale-105"
									alt={`${login?.displayname}'s avatar`}
								/>
								<span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
									{login?.displayname}
								</span>
								<IconChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
							</Menu.Button>

							<Transition
								as={Fragment}
								enter="transition ease-out duration-200"
								enterFrom="transform opacity-0 scale-95"
								enterTo="transform opacity-100 scale-100"
								leave="transition ease-in duration-150"
								leaveFrom="transform opacity-100 scale-100"
								leaveTo="transform opacity-0 scale-95"
							>
								<Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-white/20 dark:ring-gray-700/50 focus:outline-none border border-white/20 dark:border-gray-700/50 backdrop-blur-xl">
									<div className="p-4">
										{/* User info */}
										<div className="px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 mb-3">
											<div className="flex items-center space-x-3">
												<img
													src={login?.thumbnail}
													className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-600 ring-2 ring-white/20 dark:ring-gray-700/50"
													alt={`${login?.displayname}'s avatar`}
												/>
												<div>
													<div className="text-sm font-semibold text-gray-900 dark:text-white">
														{login?.displayname}
													</div>
													<div className="text-xs text-gray-500 dark:text-gray-400">
														@{login?.username}
													</div>
												</div>
											</div>
										</div>

										<div className="space-y-1">
											<Menu.Item>
												{({ active }) => (
													<button
														onClick={() => setShowChangelog(true)}
														className={`${
															active ? 'bg-gray-100 dark:bg-gray-700' : ''
														} group flex w-full items-center rounded-lg px-3 py-3 text-sm transition-all duration-200`}
													>
														<IconFileText className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-orbit transition-colors duration-200" />
														<span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">Changelog</span>
													</button>
												)}
											</Menu.Item>

											<div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

											<Menu.Item>
												{({ active }) => (
													<button
														onClick={logout}
														className={`${
															active ? 'bg-red-50 dark:bg-red-900/20' : ''
														} group flex w-full items-center rounded-lg px-3 py-3 text-sm transition-all duration-200`}
													>
														<IconLogout className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
														<span className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200">Sign out</span>
													</button>
												)}
											</Menu.Item>
										</div>
									</div>
								</Menu.Items>
							</Transition>
						</Menu>
					</div>
				</div>
			</header>

			{/* Changelog Modal */}
			{showChangelog && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Changelog
							</h3>
							<button
								onClick={() => setShowChangelog(false)}
								className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
							>
								<IconChevronDown className="w-5 h-5 text-gray-500 rotate-45" />
							</button>
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							<p>Changelog functionality coming soon...</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Topbar;
