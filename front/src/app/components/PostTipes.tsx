'use client';
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconSettings } from '@tabler/icons-react'

export default function PostTipes() {
    return (
      <Card className="postTipes">
        <div  className="flex">
          <button className='hover:bg-slate-400 flex-grow'>For you</button>
          <button className='hover:bg-slate-400 flex-grow' >Following</button>
          <div className='w-12 h-12 flex items-center justify-center'>
            <button className='rounded-full hover:bg-slate-400 p-1'>
              <IconSettings className='w-5 h-5' />
            </button>
          </div>
        </div>
      </Card>
    )
  }