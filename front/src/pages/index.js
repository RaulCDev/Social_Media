import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const client_id = "c52a2b6341f080de4773";
      const scope = "user:email"; // Agrega el alcance para acceder al correo electrónico del usuario
      const url = "https://github.com/login/oauth/authorize?client_id=" + client_id + "&scope=" + scope;
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construir el objeto JSON con los datos del formulario
    const data = {
      email: email,
      password: password,
    };

    try {
      // Realizar la solicitud a la API para enviar los datos en formato JSON
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Manejar la respuesta de la API según tus necesidades
      const responseData = await response.json();
      if (responseData.succes == true) {
        // Guardar el token en el almacenamiento local
        if (responseData && responseData.access_token) {
          localStorage.setItem('token', responseData.access_token);
          console.log('Token guardado correctamente');
          router.push('/home');
        } else {
          console.log('Error al obtener el token desde la respuesta del servidor');
        }
      } else {
        console.log(responseData.message);
        setMessage('');
      }
    } catch (error) {
      console.log('Error al realizar la solicitud a la API:', error);
      setErrorMessage('Error al realizar la solicitud a la API');
    };
  }
    return (
      <>
        <div className='icons'>
          <a href="https://github.com/RaulCDev">
            <img src="github.svg" alt="logo_github"/>
          </a>
          <a href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/">
            <img src="linkedin.svg" alt="logo_linkedin"/>
          </a>
        </div>
        <p className='title'>x?</p>
        <div className='main_text'>
          <form onSubmit={handleSubmit} className='form'>
            <h1>Log-In</h1>
            <input
              type='text'
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Email'
            />
            <input
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
            />
            <button type='submit' className='btn'>Login</button>
            <button onClick={handleLogin} className='btn'>Log in with Github</button>
            <h1 className='success_message'>{message}</h1>
            <h1 className='error_message'>{error}</h1>
            <Link href="/register" className='btn'>Register</Link>
          </form>
        </div>
      </>
    );
}