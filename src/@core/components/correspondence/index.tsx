import React, { useEffect, useState } from 'react'
import { type MRT_ColumnDef } from 'material-react-table'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Avatar,
  Paper,
  Typography,
  Grid,
  Switch
} from '@mui/material'

//Date Picker Imports
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import { TextareaAutosize } from '@mui/base/TextareaAutosize'

import { Room, InventoryPayload, SellingOrder, ItemOption, SalesCorrespondence } from 'src/@core/types'

import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'
import dayjs, { Dayjs } from 'dayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import moment from 'moment-timezone'

interface AddItemProps {
  onClose: () => void
  open: boolean
  sales: number | undefined
  session: ExtendedSession
}

const Message = ({ message }: { message: SalesCorrespondence }) => {
  const isLeft = message.left === true

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
        mb: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isLeft ? 'row' : 'row-reverse',
          alignItems: 'center'
        }}
      >
        <Avatar sx={{ bgcolor: isLeft ? 'primary.light' : 'secondary.light' }}>
          {message.sender_name ? message.sender_name.charAt(0).toUpperCase() : isLeft ? 'B' : 'U'}
        </Avatar>
        <Paper
          variant='outlined'
          sx={{
            p: 5,
            ml: isLeft ? 3 : 25,
            mr: isLeft ? 25 : 3,
            backgroundColor: isLeft ? '#BBE2EC' : '#C9D7DD',
            borderRadius: isLeft ? '20px 20px 20px 5px' : '20px 20px 5px 20px'
          }}
        >
          {message.content.split(/\n/).map(e => (
            <Typography variant='body1'>{e}</Typography>
          ))}

          <Typography variant='body2' sx={{ marginTop: 3, fontWeight: 700 }}>
            {message.sender_name} - {moment(message.time_stamp).format('MM/DD/yyyy, h:mm a')}
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export const Correspondence = ({ open, onClose, sales, session }: AddItemProps) => {
  const [input, setInput] = useState('')
  const [sender, setSender] = useState('')

  const [isopen, setOpen] = useState(false)
  const [chats, setChats] = useState<SalesCorrespondence[]>([])
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const handleSend = () => {
    fetch(`https://cheapr.my.id/sales_correspondence/`, {
      method: 'post',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ sales: sales, content: input, sender_name: sender })
    })
      .then(response => response.json())
      .then(json => {})
      .finally(() => setRefresh(r => r + 1))
  }

  const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setInput(event.target.value)
  }

  const handleSenderChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSender(event.target.value)
  }

  useEffect(() => {
    sales &&
      fetch(`https://cheapr.my.id/sales_correspondence/?selling=${sales}`, {
        method: 'get',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        })
      })
        .then(response => response.json())
        .then(json => {
          setChats(json.results)
        })
  }, [refresh, session, sales])
  const closeModal = () => {
    onClose()
    setChats([])
    setInput('')
  }
  return (
    <Dialog open={open} maxWidth={'lg'}>
      <DialogTitle textAlign='center'>Correspondence</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={closeModal}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme => theme.palette.grey[500]
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        {chats?.map(chat => (
          <Message key={chat.pk} message={chat} />
        ))}
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }} disableSpacing={true}>
        <Grid container spacing={2} sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              placeholder='Sender Name'
              variant='outlined'
              value={sender}
              onChange={handleSenderChange}
              multiline
              // rows={2}
              // maxRows={4}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              placeholder='Type a message'
              variant='outlined'
              value={input}
              onChange={handleInputChange}
              multiline
              // rows={2}
              // maxRows={4}
            />
          </Grid>
          <Grid item xs={1}>
            <Button fullWidth color='primary' variant='contained' endIcon={<SendIcon />} onClick={handleSend}>
              Send
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  )
}

export default Correspondence
