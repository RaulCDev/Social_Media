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
    const [trends, setTrends] = useState([]);
    const [usersToFollow, setUsersToFollow] = useState([]);
    const token = localStorage.getItem('token');

    useWindowScroll(rightContentRef, rightMarginRef);

    useEffect(() => {
        const fetchTrendsData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/trends`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();
                setTrends(data);
            } catch (error) {
                console.error('Error fetching trends data:', error);
            }
        };

        const fetchUsersToFollowData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/users_recomendation`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                const data = await response.json();
                setUsersToFollow(data);
            } catch (error) {
                console.error('Error fetching users to follow data:', error);
            }
        };

        fetchTrendsData();
        fetchUsersToFollowData();
    }, []);


    return (
        <div className="rightSide">
            <div className='searchBar'>
                <Input className="max-w-[350px] bg-black pb-1 pt-1" placeholder="Buscar" variant="bordered" labelPlacement="outside"
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
                        <div className='pl-4 pb-2'>
                            <button className="bg-green-600 rounded-full p-1.5 pl-3 pr-3 font-bold hover:bg-green-700 active:bg-green-800">Subscribe</button>
                        </div>
                    </div>
                </Card>
                <Card className='w-[350px] mt-3'>
                    <div className='rightBoxes'>
                        <h1 className='bigTextRight pl-4'>Who to follow</h1>
                        {usersToFollow.map((user, index) => (
                            <div key={index} className='trendContainer'>
                                <button className="rightProfileUser">
                                    <Avatar radius="full" size="md" src={user.src} />
                                    <div className="flex flex-col gap-1 items-start justify-center">
                                        <h4 className="text-small font-semibold leading-none text-default-600">{user.name}</h4>
                                        <h5 className="text-small tracking-tight text-default-400">{user.username}</h5>
                                    </div>
                                    <button className="followButton">Follow</button>
                                </button>
                            </div>
                        ))}
                        <div className='trendContainer'>
                            <button className="rightProfileUser">Show More</button>
                        </div>
                    </div>
                </Card>
                <Card className='w-[350px] mt-3'>
                    <div className='rightBoxes w-full'>
                        <h1 className='bigTextRight pl-4'>Somewhere trends</h1>
                        {trends.map(item => (
                        <div key={item.number} className='trendContainer'>
                            <button className='w-full'>
                                <div className="rightTrends">
                                    <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">
                                        {item.number} · {item.category && `${item.category} ·`} Trending
                                    </h5>
                                    <button className='threeDots rounded-full'>
                                        <IconDots className='w-4 h-4 text-default-400' />
                                    </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <h1>{item.name}</h1>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <h5 className="text-small tracking-tight text-default-400">
                                        {item.posts} posts
                                    </h5>
                                    </div>
                                </div>
                            </button>
                        </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}