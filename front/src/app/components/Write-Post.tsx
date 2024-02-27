'use client';
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconGif, IconPhoto, IconMoodSmile } from '@tabler/icons-react'

export default function WritePost ({
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
      <Card className="shadow-none bg-transparent hover:bg-slate-800 transition border-b rounded-none cursor-pointer border-white/20">
        <CardHeader className="cardHeader justify-between  flex items-center">
          <div className="flex gap-x-2">
            <Link href={`/${userName}`}>
              <Avatar radius="full" size="md" src={avatarUrl} />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="flex justify-between px-3 py-0 text-xs text-white bg-transparent">
            <p>What's happening</p>
        </CardBody>
        <CardFooter className="flex justify-end gap-3">
          <button>
            <IconPhoto className='w-4 h-4 text-green-500' />
          </button>
          <button>
            <IconGif className='w-4 h-4 text-green-500' />
          </button>
          <button>
            <IconMoodSmile className='w-4 h-4 text-green-500' />
          </button>
        </CardFooter>
      </Card>
    )
  }