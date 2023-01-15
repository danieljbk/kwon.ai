import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'

import './Resume.css'

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'standard_fonts/',
}

function Resume() {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
  })

  const [numPages, setNumPages] = useState(null)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  document.title = 'Resume | Joonbeom Kwon'

  return (
    <div className='Example'>
      <div className='Example__container'>
        <div className='Example__container__document'>
          <Document
            file='./assets/Joonbeom_Kwon_Resume.pdf'
            onLoadSuccess={onDocumentLoadSuccess}
            options={options}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      </div>
    </div>
  )
}

export default Resume
