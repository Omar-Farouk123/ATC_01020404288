import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useLocation } from 'react-router-dom';
import './LoadingBar.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

const LoadingBar = () => {
  const location = useLocation();

  useEffect(() => {
    // Start the loading bar
    NProgress.start();

    // Set white color for specific pages
    const whitePages = ['/admin', '/events', '/admin/users', '/booked-events'];
    const isWhitePage = whitePages.some(page => location.pathname.startsWith(page));
    
    const bar = document.querySelector('#nprogress .bar');
    if (bar) {
      if (isWhitePage) {
        bar.style.background = '#ffffff';
        bar.style.boxShadow = 'none';
      } else {
        bar.style.background = '#4f46e5';
        bar.style.boxShadow = '0 0 30px #4f46e5, 0 0 5px #4f46e5';
      }
    }

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