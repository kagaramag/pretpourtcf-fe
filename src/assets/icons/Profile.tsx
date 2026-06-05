import React from 'react'

const Profile = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="6" r="4" fill="currentColor" />
    <ellipse cx="12" cy="17" fill="currentColor" opacity=".5" rx="7" ry="4" />
  </svg>
)
export default Profile
