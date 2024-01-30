'use client';
import React from "react";

const handleTokenButtonClick = () => {
    // Buscar si existe el archivo
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      console.log('Token encontrado en localStorage:', token);
    } else {
      console.log('No se encontró el token en localStorage');
    }
  }

const TokenButton = () => {
  return (
    <button onClick={handleTokenButtonClick}>Token</button>
  );
};

export default TokenButton;