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
    <>
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
          <Avatar sx={{ bgcolor: isLeft ? 'primary.main' : 'secondary.main' }}>{isLeft ? 'B' : 'U'}</Avatar>
          <Paper
            variant='outlined'
            sx={{
              p: 2,
              ml: isLeft ? 1 : 0,
              mr: isLeft ? 0 : 1,
              backgroundColor: isLeft ? 'primary.light' : 'secondary.light',
              borderRadius: isLeft ? '20px 20px 20px 5px' : '20px 20px 5px 20px'
            }}
          >
            <Typography variant='body1'>{message.content}</Typography>
          </Paper>
        </Box>
      </Box>
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
          <Typography sx={{ fontSize: 10 }}>{moment(message.time_stamp).format('MM/DD/yyyy HH:MM:SS')}</Typography>
        </Box>
      </Box>
    </>
  )
}

export const Correspondence = ({ open, onClose, sales, session }: AddItemProps) => {
  const [input, setInput] = useState('')
  const [timestamp, setTimestamp] = useState<null | string>('')
  const [left, setLeft] = useState(false)
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
      body: JSON.stringify({ sales: sales, time_stamp: timestamp, content: input, left: left })
    })
      .then(response => response.json())
      .then(json => {})
      .finally(() => setRefresh(r => r + 1))
  }

  const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setInput(event.target.value)
  }

  useEffect(() => {
    fetch(`https://cheapr.my.id/sales_correspondence/?sales=${sales}`, {
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
  }, [refresh, session])
  return (
    <Dialog open={open}>
      <DialogTitle textAlign='center'>Add Item</DialogTitle>
      <IconButton
        aria-label='close'
        onClick={onClose}
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
        <Typography>{moment(timestamp).toISOString()}</Typography>

        {chats.map(chat => (
          <Message key={chat.pk} message={chat} />
        ))}
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <DateTimePicker label='Timestamp' value={timestamp} onChange={newValue => setTimestamp(newValue)} />
            </Grid>
            <Grid item xs={4}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Typography>Buyer</Typography>
                <Switch checked={!left} onChange={() => setLeft(!left)} />
                <Typography>Us</Typography>
              </Stack>
            </Grid>
            <Grid item xs={10}>
              <TextField
                fullWidth
                placeholder='Type a message'
                variant='outlined'
                value={input}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={2}>
              <Button fullWidth color='primary' variant='contained' endIcon={<SendIcon />} onClick={handleSend}>
                Send
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default Correspondence
