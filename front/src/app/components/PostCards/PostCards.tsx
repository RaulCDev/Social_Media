import React, { useState, useEffect } from "react";
import Post_Card from "./PostCard";
import { apiFetch } from "@/lib/api-client";

type Post_CardProps = {
  id: number;
  userFullName: string;
  userName: string;
  avatarUrl: string;
  content: string;
};

export default function Post_Cards() {
  const limit = 10;
  const [cards, setCards] = useState<JSX.Element[]>(
    new Array(limit).fill(null)
  );
  const fetchCards = async () => {
    return apiFetch<any[]>("/cards", {
      method: "POST",
    });
  };

  const loadMoreCards = async () => {
    const newCards = await fetchCards();
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
        comments_amount={cardData.comments}
        isLiked={cardData.isLiked}
      />
    ));
    setCards((prevCards) => [...prevCards, ...newCardsComponents]);
  };

  useEffect(() => {
    loadMoreCards();
  }, []);

  return (
    <div>
      {cards.filter(Boolean).map((card) => (
        <React.Fragment key={card.key}>{card}</React.Fragment>
      ))}
      <button onClick={loadMoreCards}>Cargar más tarjetas</button>
    </div>
  );
}
