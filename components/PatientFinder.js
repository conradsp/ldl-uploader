import { useState, useEffect } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { MdClose } from 'react-icons/md'

export default function PatientFinder({accessToken, setPatient}) {

  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState()
  const [search, setSearch] = useState()

  const findPatientById = async(e) => {
    e.preventDefault()

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/demographics-api?facility=${process.env.NEXT_PUBLIC_FACILITY_ID}&id=${patientId}`
    const res = await fetch(url,
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
  
    if (data.response?.data?.lname || data.response?.data?.fname) {
      setPatients([`${data.response?.data?.fname} ${data.response?.data?.mname} ${data.response?.data?.lname}`])
      setPatient(patientId)
    } else {
      setPatients(['Invalid Patient ID'])
    }
    
    return
  }

  const searchPatients = async() => {
    console.log(search)

    setPatients(['Steve', 'Emily', 'Isaac'])
    return

    // {{baseURL}}/documents-api?facility={{facility}}&api_action=get_patient_category
    const body = new URLSearchParams({
      'grant_type': 'password',
      'username': 'visitingim',
      'password': 'doctor3'
    })
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
      const catList = data.response?.data?.map((cat) => {
        return { label: cat.cat_name, value: cat.cat_id}
      })
      setCategories(catList)
    }
  }

  return(
    <>
    <input className='pr-10 w-2/3 lg:w-3/4 border border-gray-400 p-2 rounded inline' placeholder='Patient ID' onChange={(e) => setPatientId(e.target.value)} />
    <button className='ml-2 inline p-2 bg-gray-500 rounded text-white' onClick={(e) => findPatientById(e)}>Find Patient</button>
    <div className='flex items-center hidden'>
      <input
        type='text'
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search for patient'
        className='pr-10 w-full border border-gray-400 p-2 rounded'
      />
      <div className='ml-8 flex mr-2'>
        {searchPatients && (
          <span className='my-auto pl-1 border-l bg-white text-3xl text-dial-gray-dark border-dial-gray-dark'>
            <HiOutlineSearch
              onClick={searchPatients}
              className='cursor-pointer'
            />
          </span>
        )}
      </div>
    </div>
    { patients.map((patient, i) => {
      return(
        <div key={i} className='w-full text-xl text-gray-500 p-2 ml-3'>Patient Name: {patient}</div>
      )
      })}
    </>
  )
}
