import React, { useEffect, useState } from 'react';

export const DesktopOnlyRoute = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      
      // Temporarily allow all devices for testing
      setIsDesktop(true);
      
      // Original logic (commented out for testing):
      // setIsDesktop(!isMobileDevice && !isSmallScreen);
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-6">💻</div>
          <h1 className="text-2xl font-bold mb-4">Desktop Access Only</h1>
          <p className="text-lg mb-4">
            This attendance management system is designed exclusively for desktop and laptop computers. 
            Mobile access is not supported for security and functionality reasons.
          </p>
          <p className="text-sm opacity-80">
            Please access this system from a desktop or laptop computer.
          </p>
        </div>
      </div>
    );
  }

  return children;
}; 