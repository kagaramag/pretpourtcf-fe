export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className="rounded-lg bg-gradient-to-b from-gray-200/20 via-white/40 via-50% to-gray-200/20 p-[1px]">
      <div className={`flex flex-col bg-gray-900 p-4 sm:p-6 rounded-lg h-full ${className ?? ""}`}>
        {children}
      </div>
    </div>
  )
}
