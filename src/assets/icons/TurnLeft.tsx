import React from 'react'

const TurnLeftSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path strokeDasharray="24" stroke-dashoffset="24" d="M16 19v-8c0 -0.55 -0.45 -1 -1 -1h-11">
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0" />
      </path>
      <path strokeDasharray="6" stroke-dashoffset="6" d="M4 10l3 -3M4 10l3 3">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.4s"
          dur="0.2s"
          values="6;0"
        />
      </path>
    </g>
  </svg>
)
export default TurnLeftSVG
