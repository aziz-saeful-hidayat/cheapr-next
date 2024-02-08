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
  reload: () => void
}

export const Notes = ({ open, onClose, sales, session, reload }: AddItemProps) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    sales && setLoading(true)
    fetch(`https://cheapr.my.id/sales_items/${sales}/`, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setInput(json.comment ? json.comment : '')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [refresh, session, sales, open])
  const handleSend = () => {
    fetch(`https://cheapr.my.id/sales_items/${sales}/`, {
      method: 'PATCH',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ comment: input })
    })
      .then(response => response.json())
      .then(json => {})
      .finally(() => {
        reload()
        setRefresh(r => r + 1)
      })
  }

  const handleInputChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setInput(event.target.value)
  }

  const closeModal = () => {
    onClose()
    setInput('')
  }
  return (
    <Dialog open={open} maxWidth={'lg'}>
      <DialogTitle textAlign='center'>Notes</DialogTitle>
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
      <DialogContent sx={{ minWidth: 400 }}>
        <TextField
          fullWidth
          placeholder='Notes'
          variant='outlined'
          value={loading ? 'Loading ...' : input}
          onChange={handleInputChange}
          multiline
          rows={10}
          maxRows={40}
        />
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }} disableSpacing={true}>
        <Grid container spacing={2} sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Grid item xs={1}>
            <Button fullWidth color='primary' variant='contained' onClick={handleSend}>
              Save
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  )
}

export default Notes
