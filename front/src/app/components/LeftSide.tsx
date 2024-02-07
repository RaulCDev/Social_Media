'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
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
      { icon: <IconHome className='w-8 h-8' />, text: 'Home' },
      { icon: <IconSearch className='w-8 h-8' />, text: 'Search' },
      { icon: <IconBell className='w-8 h-8' />, text: 'Notificaciones' },
      { icon: <IconMail className='w-8 h-8' />, text: 'Mensajes' },
      { icon: <IconNotes className='w-8 h-8' />, text: 'Lists' },
      { icon: <IconBrandX className='w-8 h-8' />, text: 'Premium' },
      { icon: <IconUser className='w-8 h-8' />, text: 'Perfil' },
    ];

    const altButtons = [
      { icon: <IconBookmark className='w-8 h-8' />, text: 'Guardado' },
      { icon: <IconUsers className='w-8 h-8' />, text: 'Comunidades' },
      { icon: <IconCashBanknote className='w-8 h-8' />, text: 'Monetizacion' },
      { icon: <IconVip className='w-8 h-8' />, text: 'Premium' },
      { icon: <IconExternalLink  className='w-8 h-8' />, text: 'Anuncios' },
      { icon: <IconSettings className='w-8 h-8' />, text: 'Configuracion' },
    ]

    return (
        <div className="fixed top-0 left-3 ml-3 mt-3 z-10">
          <div className="icons">
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
            <Button key={index} className='try' radius="full" variant="light">
              {button.icon}
              <span>{button.text}</span>
            </Button>
          ))}
          {/* Botón de "Más opciones" */}
          <Button onClick={handleDropdown} className='try' radius="full" variant="light">
            <IconDotsCircleHorizontal className='w-8 h-8' />
            <span>Mas opciones</span>
          </Button>
          {/* Contenido del dropdown */}
          {/* Dropdown */}
          {dropdownOpen && (
            <div className="dropdown" id="dropdown">
              <div className="dropdown-content">
                {altButtons.map((button, index) => (
                  <Button key={index} className='try' radius="full" variant="light">
                    {button.icon}
                    <span>{button.text}</span>
                  </Button>
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