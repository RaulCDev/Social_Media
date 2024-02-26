'use client';
import React from 'react';
import { Avatar } from '@nextui-org/react'
import { Input, Card, Button } from '@nextui-org/react';
import { IconDots, IconSearch } from '@tabler/icons-react'

export default function RightSide() {
    const [value, setValue] = React.useState("");

    return (
        <div className="rightSide">
            <div className='searchBar'>
                <Input className="max-w-[340px] bg-black pb-1 pt-1" value={value} placeholder="Buscar" variant="bordered" labelPlacement="outside"
                      startContent={
                        <IconSearch className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }></Input>
            </div>
            <Card className='w-[320px] mt-2 mb-2'>
                <div className='firstRightBox'>
                    <p className='bigTextRight'>Subscribe to Premium</p>
                    <p className='smallTextRight'>Subscribe to unlock new features and if eligible, receive a share of ads revenue.</p>
                    <button className="bg-green-600 rounded-full p-1.5 pl-3 pr-3 font-bold">Subscribe</button>
                </div>
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
                        <h4 className="text-sm font-semibold leading-none text-default-600">Nombre</h4>
                        <h5 className="text-sm tracking-tight text-default-400">@Nombre</h5>
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