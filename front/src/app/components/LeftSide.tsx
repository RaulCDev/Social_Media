'use client';
import { useState, useEffect } from 'react';
import { Avatar } from '@nextui-org/react'
import { IconSettings ,IconExternalLink ,IconVip ,IconCashBanknote ,IconBrandLinkedin, IconBrandGithub, IconDots, IconBrandX, IconDotsCircleHorizontal ,IconUser ,IconHome, IconSearch, IconBell, IconMail, IconNotes, IconBookmark, IconUsers } from '@tabler/icons-react'
import {Button} from '@nextui-org/button';

export default function LeftSide ({
    userFullName,
    userName,
    avatarUrl,
    content
  }: {
    userFullName: string
    userName: string
    avatarUrl: string
    content: string
  }) {

    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
      // Lógica para cerrar el dropdown al hacer clic fuera de él
      const handleClickOutside = (event: MouseEvent) => {
        // Verificación de si el clic fue fuera del dropdown y si está abierto
        if (dropdownOpen) {
          // Cerrar el dropdown
          setDropdownOpen(false);
        }
      };

      // Agregar event listener al montar el componente
      document.addEventListener('mousedown', handleClickOutside);

      // Limpiar el event listener al desmontar el componente
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [dropdownOpen]); // Se ejecutará cada vez que dropdownOpen cambie de valor

    const handleDropdown = () => {
      // Cambiar el estado de dropdownOpen al hacer clic en el botón
      setDropdownOpen(!dropdownOpen);
    };


    const buttons = [
      { icon: <IconHome className='w-8 h-8 leftButtonssvg' />, text: 'Home' },
      { icon: <IconSearch className='w-8 h-8 leftButtonssvg' />, text: 'Search' },
      { icon: <IconBell className='w-8 h-8 leftButtonssvg' />, text: 'Notificaciones' },
      { icon: <IconMail className='w-8 h-8 leftButtonssvg' />, text: 'Mensajes' },
      { icon: <IconNotes className='w-8 h-8 leftButtonssvg' />, text: 'Lists' },
      { icon: <IconBrandX className='w-8 h-8 leftButtonssvg' />, text: 'Premium' },
      { icon: <IconUser className='w-8 h-8 leftButtonssvg' />, text: 'Perfil' },
    ];

    const altButtons = [
      { icon: <IconBookmark className='w-8 h-8 leftButtonssvg' />, text: 'Guardado' },
      { icon: <IconUsers className='w-8 h-8 leftButtonssvg' />, text: 'Comunidades' },
      { icon: <IconCashBanknote className='w-8 h-8 leftButtonssvg' />, text: 'Monetizacion' },
      { icon: <IconVip className='w-8 h-8 leftButtonssvg' />, text: 'Premium' },
      { icon: <IconExternalLink  className='w-8 h-8 leftButtonssvg' />, text: 'Anuncios' },
      { icon: <IconSettings className='w-8 h-8 leftButtonssvg' />, text: 'Configuracion' },
    ]

    return (
        <div className="leftSide">
          <div className="flex">
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
          {/* Botones */}
          {buttons.map((button, index) => (
            <button key={index} className='leftButtons rounded-full'>
              {button.icon}
              <span className="buttontext">{button.text}</span>
            </button>
          ))}
          {/* Botón de "Más opciones" */}
          <button onClick={handleDropdown} className='leftButtons rounded-full'>
            <IconDotsCircleHorizontal className='leftButtonssvg' />
            <span className="buttontext">Mas opciones</span>
          </button>
          {/* Fondo transparente */}
          {dropdownOpen && <div className="overlay" />}
          {/* Dropdown */}
          {dropdownOpen && (
            <div className="dropdown" id="dropdown">
              <div className="dropdown-content">
                {altButtons.map((button, index) => (
                  <button key={index} className='leftButtons rounded-full'>
                    {button.icon}
                    <span className="buttontext">{button.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button className='bg-green-500' radius="full">
            Post
          </Button>
          <Button className="flex gap-x-2" radius="full" variant="light">
            <Avatar radius="full" size="md" src={avatarUrl} />
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600">{userFullName}</h4>
              <h5 className="text-small tracking-tight text-default-400">@{userName}</h5>
            </div>
            <IconDots className='w-8 h-8' />
          </Button>
        </div>
    )
  }