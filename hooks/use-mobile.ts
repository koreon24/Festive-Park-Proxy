"use client"

import * as React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      // Check for mobile device using multiple methods
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const hasTouchScreen = navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 1024

      // Consider it mobile if it's a mobile device OR has touch + small screen
      setIsMobile(isMobileDevice || (hasTouchScreen && isSmallScreen))
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}
