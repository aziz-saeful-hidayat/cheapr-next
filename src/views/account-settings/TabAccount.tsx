// ** React Imports
import { useState, ElementType, ChangeEvent, SyntheticEvent, useContext } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Button, { ButtonProps } from '@mui/material/Button'

// ** Icons Imports
import Close from 'mdi-material-ui/Close'
import { useSession } from 'next-auth/react'
import { ExtendedSession } from 'src/pages/api/auth/[...nextauth]'

import { useFormik } from 'formik'
import * as yup from 'yup'
import { GlobalDataContext } from 'src/@core/context/globalContext'

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  username: yup.string().min(5, 'Username should be of minimum 5 characters length').required('Username is required'),
  first_name: yup.string().required('First Name is required'),
  last_name: yup.string(),
  image: yup.object().nullable()
})

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const reloadSession = () => {
  const event = new Event('visibilitychange')
  document.dispatchEvent(event)
}

const TabAccount = () => {
  const { data: session }: { data: ExtendedSession | null } = useSession()
  const { globalData, saveGlobalData } = useContext(GlobalDataContext)
  // ** State
  const formik = useFormik({
    initialValues: {
      username: session?.username,
      email: session?.email,
      first_name: session?.firstName,
      last_name: session?.lastName,
      image: null
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      saveGlobalData({ ...globalData, isLoading: true, textLoading: 'Saving user data ...' })
      fetch(`https://cheapr.my.id/user/${session?.pk}/`, {
        // note we are going to /1
        method: 'PATCH',
        headers: new Headers({
          Authorization: `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(values)
      })
        .then(response => response.json())
        .then(json => {
          console.log(json)
          reloadSession()
        })
        .finally(() => saveGlobalData({ ...globalData, isLoading: false, textLoading: '' }))
    }
  })

  const [openAlert, setOpenAlert] = useState<boolean>(false)

  const defaultImg: string = session?.image
    ? session?.image
    : session?.imageFromUrl
    ? session?.imageFromUrl
    : '/images/avatars/1.png'
  const [imgSrc, setImgSrc] = useState<string>(defaultImg)

  const onChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => {
        setImgSrc(reader.result as string)
        formik.setFieldValue('image', reader.result).catch(err => console.log(err))
      }
      reader.readAsDataURL(files[0])
    }
  }

  return (
    <CardContent>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={7}>
          {openAlert ? (
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Alert
                severity='warning'
                sx={{ '& a': { fontWeight: 400 } }}
                action={
                  <IconButton size='small' color='inherit' aria-label='close' onClick={() => setOpenAlert(false)}>
                    <Close fontSize='inherit' />
                  </IconButton>
                }
              >
                <AlertTitle>Your email is not confirmed. Please check your inbox.</AlertTitle>
                <Link href='/' onClick={(e: SyntheticEvent) => e.preventDefault()}>
                  Resend Confirmation
                </Link>
              </Alert>
            </Grid>
          ) : null}
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Profile Pic' />
              <Box>
                <ButtonStyled component='label' variant='contained' htmlFor='image'>
                  Upload New Photo
                  <input
                    name='image'
                    accept='image/*'
                    id='image'
                    type='file'
                    hidden
                    onChange={e => {
                      const fileReader = new FileReader()
                      const { files } = e.target as HTMLInputElement
                      if (files && files.length !== 0) {
                        fileReader.onload = () => {
                          if (fileReader.readyState === 2) {
                            console.log(fileReader.result)
                            console.log(files[0])
                            formik.setFieldValue('image', fileReader.result)
                            setImgSrc(fileReader.result as string)
                          }
                        }
                        fileReader.readAsDataURL(files[0])
                      }
                    }}
                    // onChange={onChange}
                  />
                </ButtonStyled>
                <ResetButtonStyled color='error' variant='outlined' onClick={() => setImgSrc(defaultImg)}>
                  Reset
                </ResetButtonStyled>
                <Typography variant='body2' sx={{ marginTop: 5 }}>
                  Allowed PNG or JPEG. Max size of 800K.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id='username'
              name='username'
              label='Username'
              InputLabelProps={{ shrink: true }}
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Email'
              id='email'
              name='email'
              InputLabelProps={{ shrink: true }}
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='First Name'
              id='first_name'
              name='first_name'
              InputLabelProps={{ shrink: true }}
              value={formik.values.first_name}
              onChange={formik.handleChange}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Last Name'
              id='last_name'
              name='last_name'
              InputLabelProps={{ shrink: true }}
              value={formik.values.last_name}
              onChange={formik.handleChange}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
            />
          </Grid>

          {/* <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label='Role' defaultValue='admin'>
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='author'>Author</MenuItem>
                <MenuItem value='editor'>Editor</MenuItem>
                <MenuItem value='maintainer'>Maintainer</MenuItem>
                <MenuItem value='subscriber'>Subscriber</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label='Status' defaultValue='active'>
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default TabAccount
