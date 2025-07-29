"use client"

import { IconCopy, IconApi } from "@tabler/icons-react";

export const ApiDocumentation = ({ triggerToast }: { triggerToast: any }) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    triggerToast.success("Copied to clipboard")
  }

  return (
    <>
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Documentation</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Learn how to use the Orbit public API to access your workspace data
          </p>
        </div>

        <div className="space-y-4">
          {/* Base URL */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="bg-primary/10 p-2 rounded-lg">
                <IconApi className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Base URL</h2>
            </div>
            <div className="p-4">
              <div className="relative">
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                  <code className="text-gray-700 dark:text-gray-300">{baseUrl}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(baseUrl)}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <IconCopy size={16} />
                </button>
              </div>
              {/* Documentation link */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                📚 Looking for usage examples or endpoint details? Check out the{" "}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80"
                >
                  Orbit API Documentation
                </a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

ApiDocumentation.title = "API Documentation"