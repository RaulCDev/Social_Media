import React from 'react'
import { useEffect } from 'react'
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconHeart, IconMessageCircle, IconRepeat } from '@tabler/icons-react'
import PostButtons from './Buttons/buttons'

type Post_CardProps = {
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

const Post_Card: React.FC<Post_CardProps> = ({ id, userFullName, userName, avatarUrl, content, views_amount, likes_amount, comments_amount, isLiked}) => {
  return (
    <Card className="flex items-center shadow-none bg-transparent hover:bg-slate-800 transition border-b rounded-none cursor-pointer border-white/20">
      <CardHeader className="cardHeader">
        <div className="flex gap-x-2">
          <Link href={`/${userName}`}>
            <Avatar radius="full" size="md" src={avatarUrl} />
          </Link>
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600">{userFullName}</h4>
            <h5 className="text-small tracking-tight text-default-400">@{userName}</h5>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0 text-xs text-white bg-transparent">
        <p>
          {content}
        </p>
      </CardBody>
      <CardFooter className="gap-3">
        <PostButtons id={id} views_amount={views_amount} likes_amount={likes_amount} comments_amount={comments_amount} is_liked={isLiked}/>
      </CardFooter>
    </Card>
  )
}

export default Post_Card