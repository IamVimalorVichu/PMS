'use client'
import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner
} from "@heroui/react";
import { useAlumniProfile } from './components/useAlumniProfile';
import ProfileForm from './components/ProfileForm';

const AlumniProfile = () => {
  const {
    profile,
    isEditing,
    loading,
    error,
    formSections,
    handleInputChange,
    handleSelectChange,
    setIsEditing,
    handleSubmit
  } = useAlumniProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Alumni Profile</h2>
          <div className="flex space-x-4">
            {!isEditing ? (
              <Button 
                color='primary' 
                onPress={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  variant="shadow" 
                  color='warning' 
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color='primary'
                  onPress={handleSubmit}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <ProfileForm
            profile={profile}
            formSections={formSections}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default AlumniProfile;