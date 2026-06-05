import React from 'react'

const ArrowLeftSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path strokeDasharray="16" strokeDashoffset="16" d="M19 12h-13.5">
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0" />
      </path>
      <path strokeDasharray="10" strokeDashoffset="10" d="M5 12l5 5M5 12l5 -5">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.2s"
          dur="0.2s"
          values="10;0"
        />
      </path>
    </g>
  </svg>
)
export default ArrowLeftSVG
