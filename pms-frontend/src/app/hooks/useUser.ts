import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export interface User {
  _id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userloading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('access_token');
    console.log('Token:', token);

    if (token) {
      try {
        const decodedUser = jwtDecode<User>(token);
        setUser(decodedUser);
      } catch (error) {
        console.error('Error decoding access token:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  return { user, userloading };
};

export default useCurrentUser;
