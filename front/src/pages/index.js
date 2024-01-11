import { useState } from 'react';

export default function Home() {
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMesagge] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construir el objeto JSON con los datos del formulario
    const data = {
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
        setErrorMesagge(responseData.error);
      } else {
        setMessage(responseData.message);
      }
    } catch (error) {
      console.log('Error al realizar la solicitud a la API:', error);
      setErrorMessage('Error al realizar la solicitud a la API');
      setSuccessMessage('');
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
              onChange={(e) => setName(e.target.value)}
              placeholder='Nombre'
            />
            <input
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Contraseña'
            />
            <button type='submit' className='btn'>Send</button>
            <h1>{message}</h1>
            <h1>{error}</h1>
          </form>
        </div>
      </>
    );
}