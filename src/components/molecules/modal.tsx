import { ReactNode } from "react";
import { Close } from "@/icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-black/20 backdrop-blur h-screen w-screen top-0 left-0 absolute -z-10" />
      <div
        className={`bg-white p-6 ${maxWidth} w-full lg:max-h-[90vh] h-screen overflow-y-auto lg:m-4 absolute lg:top-6 top-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="bg-white cursor-pointer p-4 rounded-full text-gray-500 hover:text-gray-700 text-2xl font-bold absolute top-2 right-2"
        >
          <Close className="h-5 w-5 flex-shrink-0 mt-0.5" />
        </button>
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">{title}</h2>
          </div>
        )}
        {!title && (
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
