import { useState, useEffect } from 'react'
import Select from 'react-select'

export default function DocumentCategory({accessToken, setCategory}) {

  const [categories, setCategories] = useState()

  const getCategoryList = async(accessToken) => {
    if (!accessToken)
      return

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/documents-api?facility=${process.env.NEXT_PUBLIC_FACILITY_ID}&api_action=get_patient_category`,
      {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      })
    
    const data = await res.json()
  
    if (data) {
      const regExp = /\d{6}_\d{4}-/
      const validCategories = data.response?.data?.filter(cat => 
        (cat.cat_name != 'Encounter Files' && !regExp.test(cat.cat_name))
      )
      const catList = validCategories?.map((cat) => {
        return { label: cat.cat_name, value: cat.cat_id}
      })
      // Move Operation Notes to the top
      const opNotes = 'Reportes Operativas'
      catList?.some((cat, idx) => 
        cat.label == opNotes && 
        catList.unshift( 
          // remove the found item, in-place by index with splice, 
          catList.splice(idx,1)[0] 
        ) 
      )
      setCategories(catList)
    }
  }

  useEffect(() => {
    getCategoryList(accessToken)
  }, [accessToken])

  return(
    <Select instanceId='document-category'
      className='w-full pt-4' options={categories} placeholder='Select Category' onChange={(val) => setCategory(val.value)}
    />


  )
}
