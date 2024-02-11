'use client';
import React from 'react';
import { Avatar } from '@nextui-org/react'
import { Input, Card, Button } from '@nextui-org/react';
import { IconDots } from '@tabler/icons-react'

export default function RightSide() {
    const [value, setValue] = React.useState("");

    return (
        <div className="fixed top-0 right-0 mr-3 mt-3 z-10">
            <Input className="max-w-[340px]" value={value} placeholder="Buscar" variant="bordered" labelPlacement="outside"></Input>
            <Card className='w-[340px]'>
                <h1>Subscribe to Premium</h1>
                <p>Subscribe to unlock new features and if eligible, receive a share of ads revenue.</p>
                <Button className="flex gap-x-2" radius="full" variant="light">Subscribe</Button>
            </Card>
            <Card className='w-[340px]'>
                <Button className="flex gap-x-2" radius="full" variant="light">
                    <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                    <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                    <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                    </div>
                    <Button className="flex gap-x-2 bg-amber-500" radius="full" variant="light">Follow</Button>
                </Button>
                <Button className="flex gap-x-2" radius="full" variant="light">
                    <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                    <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                    <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                    </div>
                    <Button className="flex gap-x-2 bg-amber-500" radius="full" variant="light">Follow</Button>
                </Button>
                <Button className="flex gap-x-2" radius="full" variant="light">
                    <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                    <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                    <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                    </div>
                    <Button className="flex gap-x-2 bg-amber-500" radius="full" variant="light">Follow</Button>
                </Button>
            </Card>
            <Card>
                <h1>Somewhere trends</h1>
                <Button>
                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                    <h1>Granada</h1>
                    <h5 className="text-small tracking-tight text-default-400">35.4K posts</h5>
                    <IconDots className='w-8 h-8' />
                </Button>
            </Card>
        </div>
    )
}