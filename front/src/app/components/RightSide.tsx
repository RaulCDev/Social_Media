'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '@nextui-org/react'
import { Input, Card, Button } from '@nextui-org/react';
import { IconDots, IconSearch } from '@tabler/icons-react'
import { useIntersection } from 'react-use';
import useWindowScroll from './hook/useScreenHeight';

export default function RightSide() {
    const rightContentRef = useRef<HTMLDivElement>(null);
    const rightMarginRef = useRef<HTMLDivElement>(null);

    useWindowScroll(rightContentRef, rightMarginRef);

    return (
        <div className="rightSide">
            <div className='searchBar'>
                <Input className="max-w-[340px] bg-black pb-1 pt-1" placeholder="Buscar" variant="bordered" labelPlacement="outside"
                      startContent={
                        <IconSearch className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }></Input>
            </div>
            <div id="marginRight" ref={rightMarginRef}></div>
            <div className='rightContent' ref={rightContentRef} style={{ bottom: '-500px' }}>
                <Card className='w-[350px] mt-3 mb-2'>
                    <div className='rightBoxes'>
                        <p className='bigTextRight'>Subscribe to Premium</p>
                        <p className='smallTextRight'>Subscribe to unlock new features and if eligible, receive a share of ads revenue.</p>
                        <button className="bg-green-600 rounded-full p-1.5 pl-3 pr-3 font-bold">Subscribe</button>
                    </div>
                </Card>
                <Card className='w-[350px] mt-3'>
                    <div className='rightBoxes'>
                        <h1 className='bigTextRight'>Who to follow</h1>
                        <button className="rightProfileUser">
                            <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                            <div className="flex flex-col gap-1 items-start justify-center">
                                <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                                <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                            </div>
                            <Button className="flex gap-x-2 bg-green-500" radius="full" variant="light">Follow</Button>
                        </button>
                        <button className="rightProfileUser">
                            <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                            <div className="flex flex-col gap-1 items-start justify-center">
                                <h4 className="text-small font-semibold leading-none text-default-600">Nombre</h4>
                                <h5 className="text-small tracking-tight text-default-400">@Nombre</h5>
                            </div>
                            <Button className="flex gap-x-2 bg-green-500" radius="full" variant="light">Follow</Button>
                        </button>
                        <button className="rightProfileUser">
                            <Avatar radius="full" size="md" src="https://github.com/RaulCDev.png" />
                            <div className="flex flex-col gap-1 items-start justify-center">
                                <h4 className="text-sm font-semibold leading-none text-default-600">Nombre</h4>
                                <h5 className="text-sm tracking-tight text-default-400">@Nombre</h5>
                            </div>
                            <Button className="flex gap-x-2 bg-green-500" radius="full" variant="light">Follow</Button>
                        </button>
                        <button className="rightProfileUser">Show More</button>
                    </div>
                </Card>
                <Card className='w-[350px] mt-3'>
                    <div className='rightBoxes'>
                        <h1 className='bigTextRight'>Somewhere trends</h1>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                        <button className='w-full'>
                            <div className="rightTrends">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">1 . Football . Trending</h5>
                                    <IconDots className='w-4 h-4 text-green-500' />
                                </div>
                                <div className="flex items-center gap-2"><h1>Granada</h1></div>
                                <div className="flex items-center gap-2"><h5 className="text-small tracking-tight text-default-400">35.4K posts</h5></div>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    )
}