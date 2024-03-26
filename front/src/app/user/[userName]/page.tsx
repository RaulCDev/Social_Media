"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Account_Card from '../../components/PostCards/PostCard';
import Post_Cards from '../../components/PostCards/PostCards';
import WritePost from '../../components/Write-Post';
import LeftSide from '../../components/LeftSide';
import RightSide from '../../components/RightSide';
import { IconArrowLeft } from '@tabler/icons-react'


export default function Profile({ params }: { params: { userName: string } }) {
  const [user, setUser] = useState({});
  const token = localStorage.getItem('token');

  return (
    <>
      <div className="flex justify-center">
          <LeftSide userFullName={params.userName} userName={params.userName} avatarUrl=""/>
          <main className='flex'>
            <div className='midContainer'>
                <h1>{params.userName} Profile</h1>
            </div>
            <RightSide />
          </main>
      </div>
    </>
  );
}