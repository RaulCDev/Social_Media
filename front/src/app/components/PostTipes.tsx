'use client';
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconSettings } from '@tabler/icons-react'

export default function PostTipes() {
    return (
      <Card className="shadow-none bg-transparent hover:bg-slate-800 transition border-b rounded-none cursor-pointer border-white/20 style={{ position: relative, zIndex: 1 }}">
        <CardBody className="flex justify-between px-3 py-0 text-xs text-white bg-transparent">
            <p>What's happening</p>
        </CardBody>
        <CardFooter className="flex justify-end gap-3">
          <button>
            <IconSettings className='w-4 h-4' />
          </button>
        </CardFooter>
      </Card>
    )
  }