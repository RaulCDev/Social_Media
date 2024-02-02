'use client';
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconBrandX, IconDotsCircleHorizontal ,IconUser ,IconHome, IconSearch, IconBell, IconMail, IconNotes, IconBookmark, IconUsers } from '@tabler/icons-react'

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
    return (
        <div className="fixed top-0 left-0 ml-10 mt-10 z-50">
          <IconBrandX className='w-8 h-8' />
          <button className='try'>
            <IconHome className='w-8 h-8' />
            <span>Home</span>
          </button>
          <button className='try'>
            <IconSearch className='w-8 h-8' /><span>Search</span>
          </button>
          <button className='try'>
            <IconBell className='w-8 h-8' /><span>Notificaciones</span>
          </button>
          <button className='try'>
            <IconMail className='w-8 h-8' /><span>Mensajes</span>
          </button>
          <button className='try'>
            <IconNotes className='w-8 h-8' /><span>Lists</span>
          </button>
          <button className='try'>
            <IconBookmark className='w-8 h-8' /><span>Guardado</span>
          </button>
          <button className='try'>
            <IconUsers className='w-8 h-8' /><span>Comunidades</span>
          </button>
          <button className='try'>
            <IconBrandX className='w-8 h-8' /><span>Premium</span>
          </button>
          <button className='try'>
            <IconUser className='w-8 h-8' /><span>Perfil</span>
          </button>
          <button className='try'>
            <IconDotsCircleHorizontal className='w-8 h-8' /><span>Mas opciones</span>
          </button>
          <button className='bg-green-500'>
            Post
          </button>
        </div>
    )
  }