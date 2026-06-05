import React, { useState, useEffect } from 'react'
import { Icon, IconName } from '@/icons'

export interface Tab {
  id: string
  label: string
  icon?: IconName
  count?: number
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  icon?: IconName
  onTabChange?: (tabId: string) => void
  actions?: React.ReactNode
  className?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  showSeparator?: boolean
  orientation?: 'x' | 'y'
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  className = '',
  variant = 'default',
  size = 'md',
  showSeparator = true,
  orientation = 'x',
  actions,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState(
    controlledActiveTab || (tabs && tabs.length > 0 ? tabs[0]?.id : '')
  )

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab

  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setLocalActiveTab(controlledActiveTab)
    }
  }, [controlledActiveTab])

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab?.disabled) return

    if (controlledActiveTab === undefined) {
      setLocalActiveTab(tabId)
    }

    onTabChange?.(tabId)
  }

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'lg:text-sm text-xs lg:px-4 px-1.5 lg:py-2 py-1',
    lg: 'lg:text-base text-md lg:px-6 px-3 py-1',
  }

  const getTabClasses = (tab: Tab) => {
    const isActive = activeTab === tab.id
    const baseClasses = `inline-flex items-center gap-1 font-medium transition-all duration-200 ${sizeClasses[size]}`

    if (tab.disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`
    }

    switch (variant) {
      case 'pills':
        return `${baseClasses} ${orientation === 'y' ? 'rounded-lg w-full' : 'rounded-full'} ${
          isActive ? 'bg-white text-black' : 'text-gray-600'
        } cursor-pointer`

      case 'underline': {
        const underlineBorder = orientation === 'y' ? 'border-l-2' : 'border-b-2'
        const widthClass = orientation === 'y' ? 'w-full' : ''
        return `${baseClasses} ${widthClass} ${underlineBorder} ${
          isActive
            ? 'border-primary text-primary-600'
            : 'border-transparent text-gray-600 hover:border-border'
        } cursor-pointer`
      }
      default: { // 'default'
        const defaultBorder = orientation === 'y' ? 'border-l-2' : 'border-b-2'
        const defaultRounding = orientation === 'y' ? '' : 'rounded-t-lg'
        const widthClass = orientation === 'y' ? 'w-full' : ''
        return `${baseClasses} ${widthClass} ${defaultRounding} ${defaultBorder} ${
          isActive
            ? 'border-primary text-primary bg-white '
            : 'border-transparent text-gray-600 hover:border-gray-200'
        } cursor-pointer`
      }
    }
  }

  const containerClasses = () => {
    const directionClass = orientation === 'y' ? 'flex-col' : 'flex-row'
    const gapClass = orientation === 'y' ? 'gap-1' : variant === 'pills' ? 'gap-1' : 'gap-2'

    switch (variant) {
      case 'pills':
        return `inline-flex ${directionClass} ${gapClass} p-0 ${orientation === 'x' ? 'rounded-full' : 'rounded-lg'}`
      case 'underline':
        return `flex ${directionClass} ${gapClass}`
      default:
        return `flex ${directionClass} gap-1`
    }
  }

  const borderClasses = () => {
    if (variant === 'pills') {
      return ''
    }

    if (orientation === 'y') {
      return 'border-r border-border'
    }

    return 'border-b border-border '
  }

  const getSeparatorSize = () => {
    const sizes = {
      sm: 4,
      md: 5,
      lg: 6,
    }
    const sizeValue = sizes[size] || 5

    if (orientation === 'y') {
      return `h-px w-${sizeValue}`
    }
    return `h-${sizeValue} w-px`
  }

  return (
    <div className={`flex items-center ${orientation === 'y' ? 'flex-row' : 'lg:flex-row md:flex-row flex-col'} gap-2 ${orientation === 'x' ? borderClasses() : ''}`}>
      <div className={`${containerClasses()} ${orientation === 'y' ? 'flex-shrink-0' : 'lg:flex-1 w-full'} ${className}`}>
        {tabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => handleTabClick(tab.id)}
              className={getTabClasses(tab)}
              disabled={tab.disabled}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.icon && <span className='hidden lg:block'><Icon name={tab.icon} size={16} /></span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center lg:px-2 px-1 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? variant === 'pills'
                        ? 'bg-white/20 text-white '
                        : 'bg-primary-100 text-primary-700 '
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
            {showSeparator && orientation === 'x' && index < tabs.length - 1 && variant !== 'pills' && (
              <div
                className={`self-center  ${getSeparatorSize()} bg-gray-200`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div>{actions && <div className="lg:px-2 lg:flex w-full items-center gap-2">{actions}</div>}</div>
    </div>
  )
}

export interface TabPanelProps {
  id: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, activeTab, children, className = '' }) => {
  if (activeTab !== id) return null

  return (
    <div id={`tabpanel-${id}`} role="tabpanel" aria-labelledby={id} className={className}>
      {children}
    </div>
  )
}
