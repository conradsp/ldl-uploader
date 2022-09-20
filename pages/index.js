import Head from 'next/head'
import Router from 'next/router'
import { useState, useEffect } from 'react'
import DocumentCategory from '../components/DocumentCategory'
import PatientFinder from '../components/PatientFinder'
import styles from '../styles/Home.module.css'

export default function Home() {

  const [category, setCategory] = useState(0)
  const [patient, setPatient] = useState()
  const [accessToken, setAccessToken] = useState()
  const [image, setImage] = useState([])
  const [extension, setExtension] = useState([])
  const [createObjectURL, setCreateObjectURL] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitDisabled, setSubmitDisabled] = useState(false)

  useEffect(() => {
    getAccessToken()
  }, [])

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader()
  
      reader.onload = () => {
        resolve(reader.result)
      }
  
      reader.onerror = reject
  
      reader.readAsDataURL(file)
    })
  }

  const submitImage = async() => {
    if (!image.length || !patient || !category) {
      alert('Select Patient, Category, and Image')
      return
    }

    setSubmitDisabled(true)
    let successUploads = 0

    await Promise.all(image.map(async(currImage, i) => {
      const body = new URLSearchParams({
        'pid': patient,
        'document_category': category,
        'extension': extension[i].replace(/(.*)\//g, ''),
        'file_type': extension[i]
      })
  
      let contentBuffer = await readFileAsync(currImage)
      const contentBufferParts = contentBuffer.split('base64,')
      body.append('file_data', contentBufferParts[1] != null ? contentBufferParts[1] : contentBufferParts[0])  
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/documents-api?facility=${process.env.NEXT_PUBLIC_FACILITY_ID}`,
        {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + accessToken
          },
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: body
        })
      
      const result = await res.json()
      if (result) {
        successUploads++
      }
    }))
    
    if (successUploads == image.length) {
      setShowSuccess(true)

      setTimeout(() => {
        Router.reload()
      }, 3000)
    }
  }

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files.length) {
      const fileArray = Array.from(event.target.files)
      fileArray.map(currFile => {
        setImage(image => [...image, currFile])
        setExtension(extension => [...extension, currFile.type])
        setCreateObjectURL(createObjectURL => [...createObjectURL, URL.createObjectURL(currFile)])
      })
    }
  }

  const getAccessToken = async() => {
    const body = new URLSearchParams({
      'grant_type': 'password',
      'username': process.env.NEXT_PUBLIC_API_USER,
      'password': process.env.NEXT_PUBLIC_API_PASSWORD
    })
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/oauth/v2/token?facility=${process.env.NEXT_PUBLIC_FACILITY_ID}`
    const res = await fetch(url,
      {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_CLIENT_ID + ":" + process.env.NEXT_PUBLIC_CLIENT_SECRET).toString('base64')
        },
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: body
      })
    
    const data = await res.json()
  
    setAccessToken(data.access_token)
  }

  return (
    <div className='h-screen flex justify-center items-center'>
      <Head>
        <title>Image Uploader</title>
        <meta name="description" content="Image Uploader for Loma de Luz blueEHR EMR" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='flex flex-1 justify-center'>
        <div className='m-4 w-full lg:w-1/2'>
          <div className='my-4 text-4xl font-semibold text-blue-700'>
            LDL Image Uploader
          </div>
          <PatientFinder accessToken={accessToken} setPatient={setPatient} />
          <DocumentCategory accessToken={accessToken} setCategory={setCategory} />
          <div>
            <div className='my-2 border border-gray-400 rounded'>
              <div className='p-2 text-2xl text-gray-600'>Select Image</div>
              { 
                createObjectURL.length ? createObjectURL.map((currObject, i) => {
                  return <embed className='inline mx-2' key={i} type={extension[i]} src={currObject} width="200" height="200"></embed>
                }) : <></>
              }
              <input className='p-2' type="file" name="myImage" multiple={true} onChange={uploadToClient} />
            </div>
          </div>
          <div>
            <button
              className='mt-2 inline p-2 bg-blue-500 rounded text-white'
              type="submit"
              onClick={submitImage}
              disabled={submitDisabled}
            >
              Send to server
            </button>
          </div>
          { submitDisabled && (
            <div className="loader m-2"></div>
          )}
          { showSuccess && (
            <div className='m-2 text-green-500 text-xl'>SUCCESS</div>
          )}
        </div>
      </main>
    </div>
  )
}
