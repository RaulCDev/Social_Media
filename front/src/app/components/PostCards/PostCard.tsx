import React from 'react'
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import PostButtons from './Buttons/buttons'

export type PostCardData = {
  id: number
  userFullName: string
  userName: string
  avatarUrl: string
  content: string
  likes_amount: number
  views_amount: number
  comments_amount: number
  isLiked: boolean
}

const Post_Card: React.FC<PostCardData> = ({ id, userFullName, userName, content, views_amount, likes_amount, comments_amount, isLiked}) => {
  return (
    <Link href={`/${userName}/${id}`}>
        <Card className="flex items-center shadow-none bg-transparent hover:bg-slate-800 transition border-b rounded-none cursor-pointer border-white/20">
          <CardHeader className="cardHeader">
            <div className="flex gap-x-2">
              <Link href={`/${userName}`}>
                <Avatar className="postAvatar" radius="full" src={`https://github.com/${userName}.png`} />
              </Link>
              <div className="flex flex-col gap-1 items-start justify-center">
                <h4 className="postAuthorName text-default-600">{userFullName}</h4>
                <h5 className="postAuthorHandle text-default-400">@{userName}</h5>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-3 py-0 text-white bg-transparent">
            <p className="postContent">
              {content}
            </p>
          </CardBody>
          <CardFooter className="gap-3">
            <PostButtons id={id} views_amount={views_amount} likes_amount={likes_amount} comments_amount={comments_amount} is_liked={isLiked} userName={userName}/>
          </CardFooter>
        </Card>
    </Link>
  )
}

export default Post_Card
