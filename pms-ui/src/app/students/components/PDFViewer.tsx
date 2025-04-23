import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spinner } from "@heroui/react"
import 'react-pdf/dist/Page/AnnotationLayer.css';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

const PDFViewer = ({ fileUrl, fileName }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-viewer">
      <h3 className="text-sm font-medium mb-2">{fileName}</h3>
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>
          <Spinner size="sm" 
          variant='gradient'
          color='secondary'
          label='Loading PDF...'
          />
        </div>}
        error={<div>Error loading PDF!</div>}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      <div className="mt-2 text-center text-sm">
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <button
            disabled={pageNumber >= (numPages || 0)}
            onClick={() => setPageNumber(pageNumber + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
