// components/PersonalDetails.tsx
import { useState } from 'react';
import { Button, Card, Divider, Input } from '@heroui/react';
import { format } from 'date-fns';
import { MdEdit } from 'react-icons/md';
import { PersonalDetailsProps } from '@/app/students/components/types';

export default function PersonalDetails({ 
  student, 
  studentForm, 
  handleStudentFormChange, 
  handleEditStudent 
}: PersonalDetailsProps) {
  const [editName, setEditName] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  return (
    <Card className="p-8 bg-white rounded-xl shadow-sm space-y-8" shadow="none">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              {editName ? (
                <Button 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  variant="light"
                  onPress={() => setEditName(false)}
                >
                  Cancel
                </Button>
              ) : (
                <Button 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  variant="light"
                  startContent={<MdEdit className="w-4 h-4" />}
                  onPress={() => setEditName(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <p className="text-gray-800 font-medium mb-2">
              {`${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`}
            </p>
            
            {editName && (
              <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-lg">
                <Input 
                  type="text" 
                  variant="bordered"
                  label="First Name"
                  value={studentForm.first_name} 
                  onChange={(e) => handleStudentFormChange('first_name', e.target.value)}
                />
                <Input 
                  type="text" 
                  variant="underlined"
                  value={studentForm.middle_name}
                  placeholder="Middle Name" 
                  onChange={(e) => handleStudentFormChange('middle_name', e.target.value)}
                />
                <Input 
                  type="text"
                  variant="underlined"
                  value={studentForm.last_name}
                  placeholder="Last Name"
                  onChange={(e) => handleStudentFormChange('last_name', e.target.value)}
                />
                <Button 
                  size="sm" 
                  color="primary" 
                  variant="light" 
                  onPress={() => {
                    setEditName(false);
                    handleEditStudent(student);
                  }}
                >
                  Save
                </Button>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>
            <p>{student.dob ? format(new Date(student.dob), 'PP') : 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Gender</label>
            <p>{student.gender || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <Divider />

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-600 block mb-2">Email</label>
              <p className="text-gray-800">{student.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Secondary: {student.alt_email || "Not set"}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-medium text-gray-600 block mb-2">Phone</label>
              <p className="text-gray-800">{student.ph_no}</p>
              <p className="text-sm text-gray-500 mt-1">
                Secondary: {student.alt_ph || "Not set"}
              </p>
            </div>
          </div>

          <div className="relative bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-gray-600">Residence</label>
              {editAddress ? (
                <Button
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  variant="light"
                  onPress={() => setEditAddress(false)}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                  variant="light"
                  startContent={<MdEdit className="w-4 h-4" />}
                  onPress={() => setEditAddress(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <div className="space-y-1">
              <p>Address: {student.address}</p>
              <p>City: {student.city}</p>
              <p>District: {student.district}</p>
              <p>State: {student.state}</p>
            </div>
            
            {editAddress && (
              <div className="space-y-2 mt-2">
                <Input 
                  variant="underlined"
                  type="text"
                  value={studentForm.address}
                  placeholder="Address"
                  onChange={(e) => handleStudentFormChange('address', e.target.value)}
                />
                <Input 
                  type="text"
                  variant="underlined"
                  value={studentForm.city}
                  placeholder="City"
                  onChange={(e) => handleStudentFormChange('city', e.target.value)}
                />
                <Input 
                  type="text"
                  variant="underlined"
                  value={studentForm.district}
                  placeholder="District" 
                  onChange={(e) => handleStudentFormChange('district', e.target.value)}
                />
                <Input 
                  type="text"
                  variant="underlined"
                  value={studentForm.state}
                  placeholder="State"
                  onChange={(e) => handleStudentFormChange('state', e.target.value)}
                />
                <Button 
                  size="sm"
                  color="primary"
                  variant="light"
                  onPress={() => {
                    setEditAddress(false);
                    handleEditStudent(student);
                  }}
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}