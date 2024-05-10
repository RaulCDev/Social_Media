"use client";
import { usePathname, useSearchParams, useRouter} from 'next/navigation';
import { useEffect, useState } from 'react';
import { PacmanLoader } from "react-spinners";

const GithubLogin = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      fetch('http://127.0.0.1:5000/github_callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
      })
      .then(response => response.json())
      .then(data => {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        router.push('/home');
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }, [pathname, searchParams]);

  return (
    <div>
      <PacmanLoader color="#36d7b7" />
    </div>
  );
};

export default GithubLogin;