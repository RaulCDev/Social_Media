import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [email, setEmail] = useState('');
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setErrorMessage('Passwords do not match');
      setMessage('');
      return;
    }

    // Construir el objeto JSON con los datos del formulario
    const data = {
      email: email,
      username: username,
      password: password,
    };

    try {
      // Realizar la solicitud a la API para enviar los datos en formato JSON
      const response = await fetch('http://localhost:5000/register', {
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
        // Redirigir a 'home' después de un cierto tiempo (por ejemplo, 2 segundos)
        router.push('/home');
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
            <input
              type='text'
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Email'
            />
            <input
              type='text'
              onChange={(e) => setName(e.target.value)}
              placeholder='Name'
            />
            <input
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
            />
            <input
              type='password'
              onChange={(e) => setPassword2(e.target.value)}
              placeholder='Confirm Password'
            />
            <button type='submit' className='btn'>Send</button>
            <h1 className='success_message'>{message}</h1>
            <h1 className='error_message'>{error}</h1>
          </form>
        </div>
      </>
    );
}