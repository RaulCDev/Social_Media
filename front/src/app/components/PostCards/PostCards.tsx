import React, { useState, useEffect } from 'react'
import Post_Card from './PostCard'

type Post_CardProps = {
  key: string
  userFullName: string
  userName: string
  avatarUrl: string
  content: string
}

type Post_Card = React.ComponentType<Post_CardProps>

export default function Post_Cards() {
  const limit = 10 // Número de tarjetas a cargar inicialmente
  const [cards, setCards] = useState<JSX.Element[]>(new Array(limit).fill(null))

  const fetchCards = async () => {
    const response = await fetch(`http://localhost:5000/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    const newCards = await response.json()
    return newCards
  }

  const loadMoreCards = async () => {
    const newCards = await fetchCards()
    const newCardsComponents = newCards.map((cardData: any) => (
        <Post_Card
        key={cardData.id}
        userFullName={cardData.userFullName}
        userName={cardData.userName}
        avatarUrl={cardData.avatarUrl}
        content={cardData.content}
      />
    ));
    setCards((prevCards) => [...prevCards, ...newCardsComponents])
  }

  useEffect(() => {
    loadMoreCards()
  }, [])

  return (
    <div>
        {cards.filter(Boolean).map((card, index) => (
            <React.Fragment key={index}>{card}</React.Fragment>
        ))}
        <button onClick={loadMoreCards}>Cargar más tarjetas</button>
    </div>
  )
}