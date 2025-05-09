import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useLocation, useNavigationType } from 'react-router-dom';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

const LoadingBar = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Start the loading bar
    NProgress.start();

    // Simulate a small delay to show the loading bar
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.remove();
    };
  }, [location.pathname]); // Trigger on pathname change

  return null;
};

export default LoadingBar; 