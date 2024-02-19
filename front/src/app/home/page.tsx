import React, { useState } from 'react';
import Link from 'next/link';
import Account_Card from '../components/Account_Card';
import WritePost from '../components/Write-Post';
import PostTipes from '../components/PostTipes';
import LeftSide from '../components/LeftSide';
import RightSide from '../components/RightSide';

export default function Home() {
  return (
    <React.Fragment>
      <div className="flex justify-between">
        <LeftSide  userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Hola"/>
        <div className='midContainer'>
          <PostTipes />
          <WritePost userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Post"/>
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Hola" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Manolo?" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
          <Account_Card userFullName="Manolo" userName="manolo" avatarUrl="https://github.com/RaulCDev.png" content="Mucho Texto Mucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho TextoMucho Texto" />
        </div>
        <RightSide />
      </div>
    </React.Fragment>
  );
}