'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/icons'

export interface SelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  searchPlaceholder?: string
}

export const Select: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOptions(filtered)
    setHighlightedIndex(-1)
  }, [searchTerm, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      setHighlightedIndex(-1)
    }
  }, [isOpen])

  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [highlightedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const sortedOptions = [...filteredOptions].sort((a: SelectOption, b: SelectOption) => {
      const aNum = Number(b.value)
      const bNum = Number(a.value)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }
      return 0
    })

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < sortedOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && sortedOptions[highlightedIndex]) {
          handleSelect(sortedOptions[highlightedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        break
    }
  }

  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isOpen])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full max-w-full flex items-center justify-between rounded-md px-3.5 py-2
          border border-border text-sm
          text-left
          hover:border-gray-400 focus:outline-none focus:border-primary-500
          ${disabled ? ' bg-gray-100/30 border-gray-200 cursor-not-allowed' : 'cursor-pointer bg-white '}
          ${selectedOption ? 'text-gray-800' : 'text-subtle'}
        `}
      >
        <div className="block truncate text-xs">
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <Icon
          name="caretDown"
          size={20}
          className={`text-gray-200 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-9999 bg-white border border-border shadow-lg"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            <div className="p-2 border-b border-border ">
              <div className="relative">
                <Icon
                  name="search"
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-subtle"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-border bg-white text-gray-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto z-50">
              {filteredOptions.length > 0 ? (
                <ul className="py-1">
                  {filteredOptions
                    .sort((a: SelectOption, b: SelectOption) => {
                      const aNum = Number(b.value)
                      const bNum = Number(a.value)
                      if (!isNaN(aNum) && !isNaN(bNum)) {
                        return aNum - bNum
                      }
                      return 0
                    })
                    .map((option, index) => (
                      <li key={option.value}>
                        <button
                          ref={(el) => { optionRefs.current[index] = el }}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`
                        w-full text-left px-2 py-1.5 text-xs
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                        ${value === option.value ? 'bg-primary-50 text-primary-700' : highlightedIndex === index ? 'bg-gray-100 text-gray-900' : 'text-gray-900'}
                      `}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="py-6 text-center text-xs text-subtle">
                  No data found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
