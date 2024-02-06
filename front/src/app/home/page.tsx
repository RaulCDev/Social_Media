import React, { useState } from 'react';
import Link from 'next/link';
import Account_Card from '../components/Account_Card';
import WritePost from '../components/Write-Post';
import PostTipes from '../components/PostTipes';
import Icons from '../components/Icons';
import LeftSide from '../components/LeftSide';

export default function Home() {
  return (
    <React.Fragment>
      <div className="content-center flex min-h-screen flex-col items-center justify-between style={{ display: inline }}">
        <LeftSide  userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Hola"/>
        <div className='max-w-[600px] w-full mx-auto border-l border-r border-white/20 min-h-screen'>
          <PostTipes />
          <WritePost userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Post"/>
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Hola" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Manolo?" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
        </div>
      </div>
    </React.Fragment>
  );
}