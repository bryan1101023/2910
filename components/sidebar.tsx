import { useState, useEffect } from "react"
import type { NextPage } from "next"
import { loginState, workspacestate } from "@/state"
import { themeState } from "../state/theme"
import { useRecoilState } from "recoil"
import { Menu, Listbox, Dialog } from "@headlessui/react"
import { useRouter } from "next/router"
import {
  IconHome,
  IconWall,
  IconClipboardList,
  IconSpeakerphone,
  IconUsers,
  IconSettings,
  IconChevronDown,
  IconFileText,
  IconCheck,
  IconBuildingCommunity,
  IconChevronLeft,
  IconMenu2,
  IconSun,
  IconMoon,
  IconX,
  IconLogout,
  IconUser,
  IconBrandGithub,
} from "@tabler/icons-react"
import axios from "axios"
import clsx from "clsx"
import Parser from "rss-parser"
import ReactMarkdown from "react-markdown";
import packageJson from "../package.json";

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

const Sidebar: NextPage<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const [login, setLogin] = useRecoilState(loginState)
  const [workspace, setWorkspace] = useRecoilState(workspacestate)
  const [theme, setTheme] = useRecoilState(themeState)
  const [showCopyright, setShowCopyright] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelog, setChangelog] = useState<{ title: string, link: string, pubDate: string, content: string }[]>([]);
  const [docsEnabled, setDocsEnabled] = useState(false);
  const [alliesEnabled, setAlliesEnabled] = useState(false);
  const [sessionsEnabled, setSessionsEnabled] = useState(false);
  const router = useRouter()

  // Add body class to prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isMobileMenuOpen])

  const pages = [
    { name: "Home", href: "/workspace/[id]", icon: IconHome },
    { name: "Wall", href: "/workspace/[id]/wall", icon: IconWall },
    {
      name: "Activity",
      href: "/workspace/[id]/activity",
      icon: IconClipboardList,
      accessible: workspace.yourPermission.includes("view_entire_groups_activity"),
    },
    ...(alliesEnabled ? [{
      name: "Allies",
      href: "/workspace/[id]/allies",
      icon: IconBuildingCommunity,
      accessible: true,
    }] : []),
    ...(sessionsEnabled ? [{
      name: "Sessions",
      href: "/workspace/[id]/sessions",
      icon: IconSpeakerphone,
      accessible: workspace.yourPermission.includes("manage_sessions"),
    }] : []),
    {
      name: "Staff",
      href: "/workspace/[id]/views",
      icon: IconUsers,
      accessible: workspace.yourPermission.includes("view_members"),
    },
    ...(docsEnabled ? [{
      name: "Docs",
      href: "/workspace/[id]/docs",
      icon: IconFileText,
      accessible: workspace.yourPermission.includes("manage_docs"),
    }] : []),
    {
      name: "Settings",
      href: "/workspace/[id]/settings",
      icon: IconSettings,
      accessible: workspace.yourPermission.includes("admin"),
    },
  ]

  const gotopage = (page: string) => {
    router.push(page.replace("[id]", workspace.groupId.toString()))
    setIsMobileMenuOpen(false)
  }

  const logout = async () => {
    await axios.post("/api/auth/logout")
    setLogin({
      userId: 1,
      username: "",
      displayname: "",
      canMakeWorkspace: false,
      thumbnail: "",
      workspaces: [],
      isOwner: false,
    })
    router.push("/login")
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme)
    }
  }

  useEffect(() => {
    if (showChangelog && changelog.length === 0) {
      fetch('/api/changelog')
        .then(res => res.json())
        .then(items => setChangelog(items));
    }
  }, [showChangelog, changelog.length]);

  useEffect(() => {
    fetch(`/api/workspace/${workspace.groupId}/settings/general/guides`)
      .then(res => res.json())
      .then(data => {
        let enabled = false;
        let val = data.value ?? data;
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {
            val = {};
          }
        }
        enabled =
          typeof val === "object" && val !== null && "enabled" in val
            ? (val as { enabled?: boolean }).enabled ?? false
            : false;
        setDocsEnabled(enabled);
      })
      .catch(() => setDocsEnabled(false));
  }, [workspace.groupId]);

  useEffect(() => {
    fetch(`/api/workspace/${workspace.groupId}/settings/general/ally`)
      .then(res => res.json())
      .then(data => {
        let enabled = false;
        let val = data.value ?? data;
        if (typeof val === "string") {
          try { val = JSON.parse(val); } catch { val = {}; }
        }
        enabled =
          typeof val === "object" && val !== null && "enabled" in val
            ? (val as { enabled?: boolean }).enabled ?? false
            : false;
        setAlliesEnabled(enabled);
      })
      .catch(() => setAlliesEnabled(false));
  }, [workspace.groupId]);

  useEffect(() => {
    fetch(`/api/workspace/${workspace.groupId}/settings/general/sessions`)
      .then(res => res.json())
      .then(data => {
        let enabled = false;
        let val = data.value ?? data;
        if (typeof val === "string") {
          try { val = JSON.parse(val); } catch { val = {}; }
        }
        enabled =
          typeof val === "object" && val !== null && "enabled" in val
            ? (val as { enabled?: boolean }).enabled ?? false
            : false;
        setSessionsEnabled(enabled);
      })
      .catch(() => setSessionsEnabled(false));
  }, [workspace.groupId]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[999999] p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200"
      >
        <IconMenu2 className="w-5 h-5 text-gray-700 dark:text-white" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99998] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed lg:static top-0 left-0 h-screen w-full lg:w-auto z-[99999] transition-all duration-300 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <aside
          className={clsx(
            "h-screen flex flex-col shadow-2xl transition-all duration-300 ease-out",
            "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50",
            isCollapsed ? "w-16" : "w-72",
          )}
        >
          <div className="h-full flex flex-col p-4 overflow-y-auto">
            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="grid place-content-center p-2 mb-6 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105"
            >
              <IconChevronLeft
                className={clsx(
                  "w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300",
                  isCollapsed && "rotate-180",
                )}
              />
            </button>

            {/* Workspace selector */}
            <div className="relative mb-6">
              <Listbox
                value={workspace.groupId}
                onChange={(id) => {
                  const selected = login.workspaces?.find((ws) => ws.groupId === id)
                  if (selected) {
                    setWorkspace({
                      ...workspace,
                      groupId: selected.groupId,
                      groupName: selected.groupName,
                      groupThumbnail: selected.groupThumbnail,
                    })
                    router.push(`/workspace/${selected.groupId}`)
                  }
                }}
              >
                <Listbox.Button
                  className={clsx(
                    "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200",
                    isCollapsed && "justify-center",
                  )}
                >
                  <div className="w-10 h-10 flex-shrink-0">
                    <img
                      src={workspace.groupThumbnail || "/favicon-32x32.png"}
                      alt=""
                      className="w-full h-full rounded-xl object-cover ring-2 ring-white/20 dark:ring-gray-700/50"
                    />
                  </div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold truncate dark:text-white">{workspace.groupName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Switch workspace</p>
                      </div>
                      <IconChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    </>
                  )}
                </Listbox.Button>
                <div className={clsx("absolute top-0 z-50 w-72 mt-16", isCollapsed ? "left-full ml-2" : "left-0")}>
                  <Listbox.Options className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 max-h-64 overflow-auto">
                    {login?.workspaces?.map((ws) => (
                      <Listbox.Option
                        key={ws.groupId}
                        value={ws.groupId}
                        className={({ active }) =>
                          clsx("flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200", 
                            active && "bg-orbit/10 dark:bg-orbit/20"
                          )
                        }
                      >
                        <img
                          src={ws.groupThumbnail || "/placeholder.svg"}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover ring-2 ring-white/20 dark:ring-gray-700/50"
                        />
                        <span className="flex-1 truncate text-sm dark:text-white">{ws.groupName}</span>
                        {workspace.groupId === ws.groupId && <IconCheck className="w-5 h-5 text-orbit" />}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {pages.map(
                (page) =>
                  (page.accessible === undefined || page.accessible) && (
                    <button
                      key={page.name}
                      onClick={() => gotopage(page.href)}
                                                  className={clsx(
                              "w-full gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                              router.asPath === page.href.replace("[id]", workspace.groupId.toString())
                                ? "bg-orbit/20 text-orbit font-semibold shadow-lg"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white",
                              isCollapsed ? "grid place-content-center" : "flex items-center",
                            )}
                    >
                      <page.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                      {!isCollapsed && <span>{page.name}</span>}
                    </button>
                  ),
              )}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto space-y-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className={clsx(
                  "w-full p-3 rounded-xl flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group",
                  isCollapsed ? "justify-center" : "justify-start",
                )}
              >
                {theme === "dark" ? (
                  <IconSun className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <IconMoon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                )}
                {!isCollapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              </button>

              {/* User menu */}
              <Menu as="div" className="relative">
                <Menu.Button
                  className={clsx(
                    "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group",
                    isCollapsed && "justify-center",
                  )}
                >
                  <img
                    src={login?.thumbnail || "/placeholder.svg"}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20 dark:ring-gray-700/50"
                  />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold dark:text-white truncate">{login?.displayname}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage account</p>
                      </div>
                      <IconChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </>
                  )}
                </Menu.Button>
                <Menu.Items className="absolute bottom-16 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50 py-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push(`/workspace/${workspace.groupId}/profile/${login.userId}`)}
                        className={clsx(
                          "w-full text-left px-4 py-3 text-sm dark:text-white flex items-center gap-2 transition-colors duration-200",
                          active ? "bg-gray-100/50 dark:bg-gray-800/50" : "",
                        )}
                      >
                        <IconUser className="w-4 h-4" />
                        View Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={clsx(
                          "w-full text-left px-4 py-3 text-sm text-red-500 flex items-center gap-2 transition-colors duration-200",
                          active ? "bg-red-50 dark:bg-red-900/20" : "",
                        )}
                      >
                        <IconLogout className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>

              {/* Footer info */}
              {!isCollapsed && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                  <button 
                    onClick={() => setShowCopyright(true)} 
                    className="text-left text-xs text-gray-500 hover:text-orbit transition-colors duration-200"
                  >
                    © Copyright Notices
                  </button>

                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>v{packageJson.version}</span>
                    <button 
                      onClick={() => setShowChangelog(true)} 
                      className="hover:text-orbit transition-colors duration-200"
                    >
                      Changelog
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Copyright Dialog */}
          <Dialog
            open={showCopyright}
            onClose={() => setShowCopyright(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                    Copyright Notices
                  </Dialog.Title>
                  <button
                    onClick={() => setShowCopyright(false)}
                    className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <IconX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Orbit features, enhancements, and modifications:
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      				Copyright © 2025 Kusai Kitchen. All rights reserved.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Original Tovy features and code:
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Copyright © 2022 Tovy. All rights reserved.
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          {/* Changelog Dialog */}
          <Dialog
            open={showChangelog}
            onClose={() => setShowChangelog(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-lg rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                    Changelog
                  </Dialog.Title>
                  <button
                    onClick={() => setShowChangelog(false)}
                    className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <IconX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {changelog.length === 0 && <p className="text-sm text-gray-500">Loading...</p>}
                  {changelog.map((entry, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
                      <a href={entry.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-orbit hover:underline">
                        {entry.title}
                      </a>
                      <div className="text-xs text-gray-400 mt-1">{entry.pubDate}</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        <ReactMarkdown>{entry.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </aside>
      </div>
    </>
  )
}

export default Sidebar
