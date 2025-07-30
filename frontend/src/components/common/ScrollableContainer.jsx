import React from 'react';

const ScrollableContainer = ({
  children,
  className = '',
  variant = 'default', // 'default', 'thin', 'primary'
  maxHeight,
  style = {},
  ...props
}) => {
  const getScrollbarClasses = () => {
    switch (variant) {
      case 'thin':
        return 'scrollbar-thin';
      case 'primary':
        return 'scrollbar-primary';
      default:
        return '';
    }
  };

  const containerStyle = {
    maxHeight,
    overflowY: 'auto',
    overflowX: 'hidden',
    ...style,
  };

  return (
    <div
      className={`${getScrollbarClasses()} ${className}`}
      style={containerStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default ScrollableContainer; 