import React from 'react'
import { Card, CardHeader, CardBody, Avatar, CardFooter } from '@nextui-org/react'
import Link from 'next/link'
import { IconHeart, IconMessageCircle, IconRepeat } from '@tabler/icons-react'
import PostButtons from './Buttons/buttons'

type Account_CardProps = {
  key: string
  userFullName: string
  userName: string
  avatarUrl: string
  content: string
}

const Account_Card: React.FC<Account_CardProps> = ({ userFullName, userName, avatarUrl, content }) => {
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
        <PostButtons />
      </CardFooter>
    </Card>
  )
}

export default Account_Card