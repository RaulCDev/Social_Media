'use client';
import React from 'react';
import { Avatar } from '@nextui-org/react'
import { Input, Card, Button } from '@nextui-org/react';
import { IconDots, IconSearch } from '@tabler/icons-react'

export default function RightSide() {
    const [value, setValue] = React.useState("");

    return (
        <div className="fixed top-0 right-0 mr-3 mt-3 z-10">
            <div>
                <Input className="max-w-[340px]" value={value} placeholder="Buscar" variant="bordered" labelPlacement="outside"
                      startContent={
                        <IconSearch className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }></Input>
            </div>
            <Card className='w-[320px] p-4'>
                <p className='font-bold font-light'>Subscribe to Premium</p>
                <p className='font-light text-xs'>Subscribe to unlock new features and if eligible, receive a share of ads revenue.</p>
                <button className="leftButtons min-w-min min-h-min bg-green-600 rounded-full">Follow</button>
            </Card>
            <Card className='w-[340px]'>
                <h1>Who to follow</h1>
                <Button className="flex gap-x-2" variant="light">
                    <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                        <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                    </div>
                    <Button className="flex gap-x-2 bg-green-500" radius="full" variant="light">Follow</Button>
                </Button>
                <Button className="flex gap-x-2" variant="light">
                    <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                        <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                    </div>
                    <Button className="flex gap-x-2 bg-green-500" radius="full" variant="light">Follow</Button>
                </Button>
                <Button className="flex gap-x-2" variant="light">
                    <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                        <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                    </div>
                    <Button className="flex gap-x-2 bg-green-500" radius="full" variant="light">Follow</Button>
                </Button>
                <Button>Show More</Button>
            </Card>
            <Card>
                <h1>Somewhere trends</h1>
                <button>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                            <IconDots className='w-4 h-4 text-green-500' />
                        </div>
                        <div className="flex items-center gap-2"><h1>Granada</h1></div>
                        <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                    </div>
                </button>
                <button>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                            <IconDots className='w-4 h-4 text-green-500' />
                        </div>
                        <div className="flex items-center gap-2"><h1>Granada</h1></div>
                        <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                    </div>
                </button>
                <button>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                            <IconDots className='w-4 h-4 text-green-500' />
                        </div>
                        <div className="flex items-center gap-2"><h1>Granada</h1></div>
                        <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                    </div>
                </button>
                <button>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                            <IconDots className='w-4 h-4 text-green-500' />
                        </div>
                        <div className="flex items-center gap-2"><h1>Granada</h1></div>
                        <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                    </div>
                </button>
                <button>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                            <IconDots className='w-4 h-4 text-green-500' />
                        </div>
                        <div className="flex items-center gap-2"><h1>Granada</h1></div>
                        <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                    </div>
                </button>
                <button>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                            <IconDots className='w-4 h-4 text-green-500' />
                        </div>
                        <div className="flex items-center gap-2"><h1>Granada</h1></div>
                        <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                    </div>
                </button>
            </Card>
        </div>
    )
}