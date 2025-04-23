'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input } from '@heroui/react';
import { useRouter } from 'next/navigation';  
import { Drive } from './components/useDriveManagement';


export default function Drives() {
  const router = useRouter();
  const [addingDrive, setAddingDrive] = useState(false);
  const [editingDrive, setEditingDrive] = useState(false);
  const [deletingDrive, setDeletingDrive] = useState(false);
  const [drives, setDrives] = useState([]);
  const [error, setError] = useState("");

useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drive/get`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Server returned with an error: ${response.status}`);
      }
      const data = await response.json();
      setDrives(data);
      console.log(data);
    } catch (err: any) {
      console.error("Error fetching Drivess:", err.message);
      setError(err.message);
    }
  };


  return (
    <div className="p-1">

                    <div className="flex flex-row justify-end mr-4 mt-2">
          <Button
            className="hover:bg-primary"
            size="lg"
            color="secondary"
            onPress={() => router.push("/faculty/drives/create")}
          >
            Create Drive
          </Button>
       </div>
                       <h1 className="text-3xl text-center font-semibold mt-2 mb-6">Available Drives</h1>
                       {drives.map((drive, index) => (
  <div className="w-full gap-2 mt-4" key={index}>
    <Card 
      isPressable 
      className="w-5/6 mb-3 ml-4 p-4 border h-[90px] hover:h-[130px] shadow-sm hover:shadow-lg hover:bg-primary hover:text-white"
      onPress={() => router.push(`/faculty/drives/edit?id=${(drive as Drive)._id}`)}
    >
      <div className="flex flex-col text-left">
        <p className="font-medium">{(drive as Drive).title}</p>
        <p className="text-sm mt-1">{(drive as Drive).location}</p>
      </div>
    </Card>
  </div>
))}
            
      </div>
  );
}

