import { ReactNode, useState, useMemo } from 'react'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T, index?: number) => ReactNode
  accessor?: (item: T) => any
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  headerRender?: () => ReactNode
  visibleOn?: ('sm' | 'md' | 'lg')[]
}

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  keyExtractor: (item: T, index: number) => string | number
  onRowClick?: (item: T) => void
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  emptyComponent?: ReactNode
  className?: string
  containerClassName?: string
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  stickyHeader?: boolean
  columnBorders?: boolean
  hideHeader?: boolean
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void
  defaultSortColumn?: string
  defaultSortDirection?: 'asc' | 'desc'
  rowColor?: (item: T, index: number) => string
}

interface SortState {
  column: string | null
  direction: 'asc' | 'desc'
}

export function Table<T>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyMessage = 'No data available',
  keyExtractor,
  onRowClick,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = '',
  striped = false,
  hoverable = true,
  compact = false,
  stickyHeader = false,
  columnBorders = false,
  hideHeader = false,
  onSort,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  rowColor,
}: TableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({
    column: defaultSortColumn || null,
    direction: defaultSortDirection,
  })

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column?.sortable) return

    const newDirection =
      sortState.column === columnKey && sortState.direction === 'asc' ? 'desc' : 'asc'

    setSortState({ column: columnKey, direction: newDirection })

    if (onSort) {
      onSort(columnKey, newDirection)
    }
  }

  const sortedData = useMemo(() => {
    if (onSort || !sortState.column) return data

    const column = columns.find((col) => col.key === sortState.column)
    if (!column) return data

    return [...data].sort((a, b) => {
      const aValue = column.accessor ? column.accessor(a) : (a as any)[column.key]
      const bValue = column.accessor ? column.accessor(b) : (b as any)[column.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return sortState.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortState, columns, onSort])

  const getCellValue = (item: T, column: Column<T>, index?: number): ReactNode => {
    if (column.render) {
      return column.render(item, index)
    }

    if (column.accessor) {
      return column.accessor(item)
    }

    const value = (item as any)[column.key]
    return value !== null && value !== undefined ? String(value) : '-'
  }

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  const getVisibilityClass = (visibleOn?: ('sm' | 'md' | 'lg')[]) => {
    // If visibleOn is not provided, show on all screen sizes (default behavior)
    if (!visibleOn || visibleOn.length === 0) return ''

    const classes: string[] = []

    // Start with hidden on all screens
    classes.push('hidden')

    // Show on specified screen sizes
    if (visibleOn.includes('sm')) {
      classes.push('sm:table-cell')
    }
    if (visibleOn.includes('md')) {
      classes.push('md:table-cell')
    }
    if (visibleOn.includes('lg')) {
      classes.push('lg:table-cell')
    }

    return classes.join(' ')
  }

  const paddingClass = compact ? 'px-1.5 py-2 text-sm' : 'px-2 py-3'
  const cellPaddingClass = compact ? 'px-1.5 py-2' : 'px-2 py-3'

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-subtle`}>Loading...</div>
      </div>
    )
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>
    }
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-red-600`}>Error: {error}</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    if (emptyComponent) {
      return <>{emptyComponent}</>
    }
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-subtle`}>
          <EmptyState title={emptyMessage} description="" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <table
        className={`w-full bg-white table-fixed divide-y divide-gray-300/30 border border-gray-300/30 ${className}`}
      >
        {!hideHeader && (
          <thead
            className={`${stickyHeader ? 'bg-gray-50/30 text-gray-300' : ''} border-b border-gray-300/30 hidden md:table-header-group`}
          >
            <tr
              className={
                columnBorders
                  ? `divide-x `
                  : ''
              }
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${paddingClass}
                    ${getAlignmentClass(column.align)}
                    ${getVisibilityClass(column.visibleOn)}
                    ${column.width || ''}
                    text-sm font-normal uppercase transition-colors
                    ${column.sortable ? `cursor-pointer hover:bg-gray-100/50 transition-colors select-none` : 'transition-colors'}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'}`}
                  >
                    {column.headerRender ? column.headerRender() : column.header}
                    {column.sortable && (
                      <span className="inline-flex flex-col ml-1">
                        <svg
                          className={`w-3 h-3 ${
                            sortState.column === column.key && sortState.direction === 'asc'
                              ? `text-gray-900`
                              : `text-subtle`
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 3l7 7H3l7-7z" />
                        </svg>
                        <svg
                          className={`w-3 h-3 -mt-2 ${
                            sortState.column === column.key && sortState.direction === 'desc'
                              ? `text-gray-900`
                              : `text-subtle`
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 17l-7-7h14l-7 7z" />
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className={`divide-y divide-divide`}>
          {sortedData.map((item, index) => {
            const customRowColor = rowColor ? rowColor(item, index) : ''
            return (
              <tr
                key={keyExtractor(item, index)}
                className={`
              ${columnBorders ? `divide-x divide-border` : ''}
              ${compact ? 'text-[10px]' : 'text-sm'}
              ${customRowColor || (striped && index % 2 === 1 ? `bg-gray-200/40` : '')}
                ${hoverable ? 'hover:bg-gray-50/90 transition-colors' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
                block mb-4 border border-border md:table-row md:mb-0 md:border-0
              `}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.header}
                    className={`
                    ${cellPaddingClass}
                    ${getAlignmentClass(column.align)}
                    ${getVisibilityClass(column.visibleOn)}
                    ${column.width || ''}
                    whitespace-nowrap
                    block md:table-cell
                    before:content-[attr(data-label)] before:font-semibold before:mr-2 before:inline-block before:min-w-[120px]
                    md:before:content-none
                  `}
                  >
                    {getCellValue(item, column, index)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
