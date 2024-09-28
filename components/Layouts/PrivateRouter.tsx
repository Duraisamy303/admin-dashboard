import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const PrivateRouter = (WrappedComponent: any) => {
  return (props: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true); // State to manage loading

    useEffect(() => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        // If no token, redirect to login page
        const baseUrl = `${window.location.origin}/auth/signin`;
        router.replace(baseUrl);
      } else {
        // If token is found, stop loading and allow access to the component
        setLoading(false);
      }
    }, [router]);

    // Show nothing (or a loader) while checking the token
    if (loading) {
      return <div>Loading...</div>; // You can replace this with a spinner or loading indicator
    }

    // Render the wrapped component if token is found
    return <WrappedComponent {...props} />;
  };
};

export default PrivateRouter;
