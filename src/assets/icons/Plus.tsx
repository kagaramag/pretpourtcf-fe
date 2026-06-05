import React from 'react'

const PlusSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g
      fill="none"
      stroke="currentColor"
      strokeDasharray="16"
      strokeDashoffset="16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M5 12h14">
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="16;0" />
      </path>
      <path d="M12 5v14">
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          begin="0.4s"
          dur="0.4s"
          values="16;0"
        />
      </path>
    </g>
  </svg>
)
export default PlusSVG
