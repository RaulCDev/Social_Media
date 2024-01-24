import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useState } from 'react';

const GithubLogin = () => {
  const router = useRouter();
  const [token, setToken] = useState('');

  useEffect(() => {
    const code = router.query.code;

    if (code) {
      // Realizar la solicitud al backend con el código
      fetch('http://127.0.0.1:5000/github_callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code })
      })
      .then(response => response.json())
      .then(data => {
        setToken(data.token)
        // Almacenar el token JWT en el localStorage
        localStorage.setItem('token', data.token);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }, [router.query.code]);

  return (
    <div>
      <p>{token}</p>
    </div>
  );
};

export default GithubLogin;