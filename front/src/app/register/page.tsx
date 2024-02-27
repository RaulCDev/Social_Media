"use client";
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {Button} from '@nextui-org/button';
import {Input} from "@nextui-org/react";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setErrorMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const router = useRouter();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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
    <React.Fragment>
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
          <h1>Register</h1>
          <Input
            type="email"
            label="Email"
            onChange={handleEmailChange}
            isInvalid={isEmailValid}
            errorMessage={error}
          />
          <Input
            type='password'
            label="Password"
            onChange={handlePasswordChange}
            isInvalid={isEmailValid}
            errorMessage={error}
          />
          <Button type='submit' className="max-w-xs">Register</Button>
        </form>
      </div>
    </React.Fragment>
  );
}