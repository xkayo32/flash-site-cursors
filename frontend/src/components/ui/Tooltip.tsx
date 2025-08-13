"use client"

import * as React from "react"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>

const Tooltip: React.FC<TooltipProps> = ({ children, content, className = "" }) => {
  const [isVisible, setIsVisible] = React.useState(false)
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-xl border bg-gray-900 dark:bg-gray-100 text-white dark:text-black text-sm font-medium pointer-events-none opacity-100 transition-opacity duration-200 ${className}`.trim()}>
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 -mt-1 z-[9999]"></div>
        </div>
      )}
    </div>
  )
}

const TooltipTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => <>{children}</>

const TooltipContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children }) => <>{children}</>

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }