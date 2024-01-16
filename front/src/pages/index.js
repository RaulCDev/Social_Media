import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construir el objeto JSON con los datos del formulario
    const data = {
      username: username,
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
      if (responseData.success == true) {
        setMessage(responseData.message);
        setErrorMessage('');
      } else {
        setErrorMessage(responseData.message);
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
            <h1>Log-In actualiza 23456</h1>
            <input
              type='text'
              onChange={(e) => setName(e.target.value)}
              placeholder='Nombre'
            />
            <input
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Contraseña'
            />
            <button type='submit' className='btn'>Login</button>
            <h1 className='success_message'>{message}</h1>
            <h1 className='error_message'>{error}</h1>
            <Link href="/register" className='btn'>Register</Link>
          </form>
        </div>
      </>
    );
}