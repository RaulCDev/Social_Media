"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Account_Card from '../components/PostCards/PostCard';
import WritePost from '../components/Write-Post';
import PostTipes from '../components/PostTipes';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';
import Account_Cards from '../components/PostCards/PostCards';

export default function Home() {
  return (
    <>
      <div className="flex justify-center">
          <LeftSide  userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Hola"/>
          <main className='flex'>
            <div className='midContainer'>
              <PostTipes />
              <WritePost userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Post"/>
              <Account_Cards/>
            </div>
            <RightSide />
          </main>
      </div>
    </>
  );
}