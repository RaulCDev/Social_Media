'use client';
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconBrandLinkedin, IconBrandGithub, IconDots, IconBrandX, IconDotsCircleHorizontal ,IconUser ,IconHome, IconSearch, IconBell, IconMail, IconNotes, IconBookmark, IconUsers } from '@tabler/icons-react'
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

    const buttons = [
      { icon: <IconHome className='w-8 h-8' />, text: 'Home' },
      { icon: <IconSearch className='w-8 h-8' />, text: 'Search' },
      { icon: <IconBell className='w-8 h-8' />, text: 'Notificaciones' },
      { icon: <IconMail className='w-8 h-8' />, text: 'Mensajes' },
      { icon: <IconNotes className='w-8 h-8' />, text: 'Lists' },
      { icon: <IconBookmark className='w-8 h-8' />, text: 'Guardado' },
      { icon: <IconUsers className='w-8 h-8' />, text: 'Comunidades' },
      { icon: <IconBrandX className='w-8 h-8' />, text: 'Premium' },
      { icon: <IconUser className='w-8 h-8' />, text: 'Perfil' },
      { icon: <IconDotsCircleHorizontal className='w-8 h-8' />, text: 'Mas opciones' },
    ];

    return (
        <div className="fixed top-0 left-0 ml-10 mt-10 z-50">
          <div className="icons">
            <IconBrandX className='w-8 h-8' />
            <a href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/" target="_blank" rel="noopener noreferrer">
              <IconBrandGithub className='w-8 h-8' />
            </a>
            <a href="https://github.com/RaulCDev" target="_blank" rel="noopener noreferrer">
              <IconBrandLinkedin className='w-8 h-8' />
            </a>
          </div>
          {/* Botones */}
          {buttons.map((button, index) => (
            <Button key={index} className='try'>
              {button.icon}
              <span>{button.text}</span>
            </Button>
          ))}
          <Button className='bg-green-500'>
            Post
          </Button>
          <Button className="flex gap-x-2">
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