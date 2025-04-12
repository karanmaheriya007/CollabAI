import React, { useEffect, useState } from 'react';
import { Alert, Slide } from '@mui/material';

const AlertMessage = ({ severity, message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  return (
    <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
      <div className="fixed top-4 transform -translate-x-1/2 z-50 w-full max-w-md">
        <Alert
          variant="filled"
          severity={severity}
          sx={{ boxShadow: 3 }}
        >
          {message}
        </Alert>
      </div>
    </Slide>
  );
};

export default AlertMessage;