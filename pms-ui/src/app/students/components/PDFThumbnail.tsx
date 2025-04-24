import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spinner } from '@heroui/react';
import { BsFillFileEarmarkPdfFill } from 'react-icons/bs';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFThumbnailProps {
  fileUrl: string;
  onClick: () => void;
  className?: string;
}

export default function PDFThumbnail({ fileUrl, onClick }: PDFThumbnailProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  console.log("fileUrl", fileUrl);

  return (
    <div 
      className="h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden"
      onClick={onClick}
    >
      {loading && (
        <Spinner color="primary" size="sm" />
      )}
      <Document
        file={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${fileUrl}`}
        onLoadSuccess={() => setLoading(false)}
        onLoadError={(error) => {
          setError(error);
          setLoading(false);
        }}
        loading={null}
      >
        <Page
          pageNumber={1}
          width={256}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      {error && <BsFillFileEarmarkPdfFill className="h-12 w-12 text-gray-400" />}
    </div>
  );
}