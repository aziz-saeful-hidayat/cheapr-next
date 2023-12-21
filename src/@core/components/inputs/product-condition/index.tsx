import React, { useState, useEffect } from 'react'
import { Box, MenuItem, TextField } from '@mui/material'
import { ProductCondition } from 'src/@core/types'
import CreateNewProductConditionModal from './create-product-type'
import { Add } from '@mui/icons-material'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Checkbox from '@mui/material/Checkbox'

interface PickProductConditionProps {
  values: any
  setValues: (values: any) => void
  session: any
}

const PickProductCondition = ({ values, setValues, session }: PickProductConditionProps) => {
  const [pConditionData, setPConditionData] = useState<ProductCondition[]>([])
  useEffect(() => {
    const fetchURL = new URL('/product_condition/?ordering=id', 'https://cheapr.my.id')
    fetch(fetchURL.href, {
      method: 'get',
      headers: new Headers({
        Authorization: `Bearer ${session?.accessToken}`,
        'Content-Type': 'application/json'
      })
    })
      .then(response => response.json())
      .then(json => {
        setPConditionData(json.results)
      })
  }, [session])
  const [createProductConditionModalOpen, setCreateProductConditionModalOpen] = useState(false)
  const handleUpdate = (condition: string, status: boolean) => {
    if (status) {
      setValues((data: any) => ({ ...data, condition: data.condition.push(condition) }))
    } else {
      setValues((data: any) => ({ ...data, condition: data.condition.filter((e: any) => e !== condition) }))
    }
  }
  console.log(values)
  return (
    <>
      <FormControl sx={{ m: 3 }} component='fieldset' variant='standard'>
        <FormLabel component='legend'>Condition</FormLabel>
        <FormGroup>
          {pConditionData?.map(condition => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.condition?.filter((el: any) => el === condition.name)}
                  onChange={() =>
                    handleUpdate(condition.name, !values.condition?.filter((el: any) => el === condition.name))
                  }
                  name={condition.name}
                />
              }
              label={condition.name}
            />
          ))}
        </FormGroup>

        {/* <FormHelperText>Be careful</FormHelperText> */}
      </FormControl>
      <CreateNewProductConditionModal
        session={session}
        open={createProductConditionModalOpen}
        onClose={() => setCreateProductConditionModalOpen(false)}
      />
    </>
  )
}

export default PickProductCondition
