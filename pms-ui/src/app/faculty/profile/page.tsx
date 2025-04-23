'use client'
import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem
} from "@heroui/react";
import { useFacultyProfile } from './components/useFacultyProfile';

const Profile = () => {
  const {
    profile,
    isEditing,
    isLoading,
    handleInputChange,
    handleSelectChange,
    setIsEditing,
    updateProfile
  } = useFacultyProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Faculty Profile</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-2">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700">Middle Name</label>
              <Input
                id="middle_name"
                name="middle_name"
                value={profile.middle_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
              <Input
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="alt_email" className="block text-sm font-medium text-gray-700">Alternative Email</label>
              <Input
                id="alt_email"
                name="alt_email"
                type="email"
                value={profile.alt_email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ph_no" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                id="ph_no"
                name="ph_no"
                value={profile.ph_no}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="alt_ph" className="block text-sm font-medium text-gray-700">Alternative Phone</label>
              <Input
                id="alt_ph"
                name="alt_ph"
                value={profile.alt_ph}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            {/* Personal Details */}
            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <Select
                id="gender"
                name="gender"
                selectedKeys={[profile.gender]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleSelectChange('gender', e.target.value)
                }
                disabled={!isEditing}
              >
                <SelectItem textValue='' key="Male">Male</SelectItem>
                <SelectItem key="Female">Female</SelectItem>
                <SelectItem key="Other">Other</SelectItem>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program</label>
              <Select
                id="program"
                name="program"
                selectedKeys={[profile.program]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleSelectChange('program', e.target.value)
                }
                disabled={!isEditing}
              >
                <SelectItem key="MCA">MCA</SelectItem>
                <SelectItem key="MBA">MBA</SelectItem>
                <SelectItem key="BCA">BCA</SelectItem>
                <SelectItem key="BBA">BBA</SelectItem>
              </Select>
            </div>

            {/* Address Information */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <Input
                id="address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <Input
                id="city"
                name="city"
                value={profile.city}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
              <Input
                id="district"
                name="district"
                value={profile.district}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <Input
                id="state"
                name="state"
                value={profile.state}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            {!isEditing ? (
              <Button color='primary' onPress={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="shadow" color='warning' onPress={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button color='primary' onPress={updateProfile}>
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;