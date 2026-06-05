import React from 'react'

const DustbinSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M8 9h8v10H8z" opacity=".3" />
    <path
      fill="currentColor"
      d="m15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM8 9h8v10H8z"
    />
  </svg>
)
export default DustbinSVG
