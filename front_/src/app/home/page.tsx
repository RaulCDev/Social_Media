import React, { useState } from 'react';
import Link from 'next/link';
import TokenButton from '../components/Token_button';

export default function Home() {
  return (
    <React.Fragment>
      <div className='icons'>
        <a href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/">
          <img src="linkedin.svg" alt="logo_linkedin"/>
        </a>
        <a href="https://github.com/RaulCDev">
          <img src="github.svg" alt="logo_github"/>
        </a>
        <img src="./user.svg" className='icons'/>
      </div>
      <p className='title'>x?</p>
      <div className='main_text'>
        <p>Hola buenas</p>
        <TokenButton />
      </div>
    </React.Fragment>
  );
}