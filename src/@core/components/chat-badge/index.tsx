import * as React from 'react'
import Badge from '@mui/material/Badge'
import MailIcon from '@mui/icons-material/Mail'

export const ChatBadge = ({ count }: { count: number }) => {
  return (
    <Badge badgeContent={count} color='primary'>
      <MailIcon color='action' />
    </Badge>
  )
}

export default ChatBadge
