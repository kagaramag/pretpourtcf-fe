import React from 'react'

const ArrowRightSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path strokeDasharray="16" strokeDashoffset="16" d="M5 12h13.5">
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0" />
      </path>
      <path strokeDasharray="10" strokeDashoffset="10" d="M19 12l-5 5M19 12l-5 -5">
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
export default ArrowRightSVG
