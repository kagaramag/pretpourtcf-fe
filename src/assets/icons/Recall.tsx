import React from 'react'

const RecallSVG = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeWidth="2"
      d="M5.75 7H14a6 6 0 0 1 0 12H6.5M8 10.5L4.5 7L8 3.5"
    />
  </svg>
)
export default RecallSVG
