import React, { useState, useEffect } from 'react'
import Post_Card from './PostCard'

type Post_CardProps = {
  id: number
  userFullName: string
  userName: string
  avatarUrl: string
  content: string
}

type Post_CardComponent = React.ComponentType<Post_CardProps>

export default function Post_Cards() {
  const limit = 10 // Número de tarjetas a cargar inicialmente
  const [cards, setCards] = useState<JSX.Element[]>(new Array(limit).fill(null))
  const token = localStorage.getItem('token');

  const fetchCards = async () => {
    const response = await fetch(`http://localhost:5000/cards`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },
  });
    const newCards = await response.json()
    return newCards
  }

  const loadMoreCards = async () => {
    const newCards = await fetchCards()
    const newCardsComponents = newCards.map((cardData: any) => (
        <Post_Card
          key={cardData.id}
          id={cardData.id}
          userFullName={cardData.userFullName}
          userName={cardData.userName}
          avatarUrl={cardData.avatarUrl}
          content={cardData.content}
          likes_amount={cardData.likes}
          views_amount={cardData.views}
          reposts_amount={cardData.reposts}
          comments_amount={cardData.comments}
          isLiked={cardData.isLiked}
        />
    ));
    setCards((prevCards) => [...prevCards, ...newCardsComponents])
  }

  useEffect(() => {
    loadMoreCards()
  }, [])

  return (
    <div>
        {cards.filter(Boolean).map((card) => (
            <React.Fragment key={card.key}>{card}</React.Fragment>
        ))}
        <button onClick={loadMoreCards}>Cargar más tarjetas</button>
    </div>
  )
}
