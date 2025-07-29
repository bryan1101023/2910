import React, { FC, ReactNode, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  className?: string;
  closeOnOverlayClick?: boolean;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className,
  closeOnOverlayClick = true,
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel
                className={twMerge(
                  "w-full transform overflow-hidden rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 text-left align-middle shadow-2xl border border-white/20 dark:border-gray-700/50 transition-all",
                  sizeClasses[size],
                  className
                )}
              >
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <IconX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                )}

                <div className="mt-2">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal; 