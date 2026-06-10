import React from 'react'

const NotebookSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M2 6h4m-4 4h4m-4 4h4m-4 4h4" />
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M12 2v20m-4-16h2m-2 4h2m-2 4h2m-2 4h2" />
    </g>
  </svg>
)
export default NotebookSVG
