"use client";
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {Button} from '@nextui-org/button';
import {Input} from "@nextui-org/react";
import { IconBrandLinkedin, IconBrandGithub, IconBrandX } from '@tabler/icons-react'

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
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

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      if (responseData.succes === true) {
        setIsEmailValid(false);
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
        setIsEmailValid(true);
        setErrorMessage('No existe esa cuenta');
      }
    } catch (error) {
      console.log('Error al realizar la solicitud a la API:', error);
      setIsEmailValid(true);
      setErrorMessage('Error al realizar la solicitud a la API');
    }
  };

  return (
  <>
  <div className='bigLoginContainer'>
    <div className='main_text'>
      <div className="loginIcons">
        <button className="iconButton">
          <IconBrandX className='myLinks' />
        </button>
        <button className="iconButton">
          <a href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/" target="_blank" rel="noopener noreferrer">
            <IconBrandLinkedin className='myLinks' />
          </a>
        </button>
        <button className="iconButton">
          <a href="https://github.com/RaulCDev" target="_blank" rel="noopener noreferrer">
            <IconBrandGithub className='myLinks' />
          </a>
        </button>
      </div>
      <Button onClick={handleLogin} className="text-xl">LogIn with <IconBrandGithub/></Button>
    </div>
  </div>
  </>
);
};

export default Home;