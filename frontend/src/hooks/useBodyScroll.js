import { useEffect } from 'react';

/**
 * Hook to prevent body scroll when modal is open
 * @param {boolean} isOpen - Whether the modal is open
 * @param {string} className - Optional CSS class to add to body when modal is open
 */
export const useBodyScroll = (isOpen, className = 'modal-open') => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.classList.add(className);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      document.body.classList.remove(className);
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove(className);
    };
  }, [isOpen, className]);
};

export default useBodyScroll; 