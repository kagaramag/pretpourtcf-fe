'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Icon } from '@/icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  footer?: ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 200) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isVisible) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-full',
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }


  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center duration-200 ${
        isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[4px]"
        onClick={handleBackdropClick}
      />
      <div
        className={`bg-white absolute ${size === 'full' ? 'top-0 h-full' : 'top-10'} shadow-xl w-full ${sizeClasses[size]} mx-4 transition-all duration-200 ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-12'
        }`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shadow-sm">
            {title && <h2 className="text-base">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-subtle cursor-pointer hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        )}
        <div
          className={`px-6  py-4 overflow-auto
          ${footer !== undefined ? 'max-h-[calc(100vh-280px)]' : 'max-h-[calc(100vh-70px)]'}
          `}
        >
          {children}
        </div>
        {footer && (
          <div className="px-6 py-2 border-t border-border flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  )
}
