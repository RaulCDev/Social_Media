import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [username, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMessage] = useState('');


  const handleTokenButtonClick = () => {
    // Buscar si existe el archivo
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      console.log('Token encontrado en localStorage:', token);
    } else {
      console.log('No se encontró el token en localStorage');
    }
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
        <p>Hola buenas</p>
        <button onClick={handleTokenButtonClick}>Token</button>
      </div>
    </>
  );
}