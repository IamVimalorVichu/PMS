// faculty/components/useFacultyManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Faculty, 
  FacultyFormData, 
  OptionType 
} from './types';
import {
  fetchFacultyAPI,
  addFacultyAPI,
  updateFacultyAPI,
  deleteFacultyAPI
} from './API';

// Default form data
const DEFAULT_FORM_DATA: FacultyFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  ph_no: "",
  program: "MCA",
  status: "Active"
};

export const useFacultyManagement = () => {
  // State management
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [formData, setFormData] = useState<FacultyFormData>(DEFAULT_FORM_DATA);
  const [editFormData, setEditFormData] = useState<FacultyFormData>(DEFAULT_FORM_DATA);
  const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Search state
  const [searchContent, setSearchContent] = useState("");

  // Options for dropdowns
  const programOptions: OptionType[] = useMemo(() => [
    { value: "MCA", label: "MCA" },
    { value: "MBA", label: "MBA" },
    { value: "BCA", label: "BCA" },
    { value: "BBA", label: "BBA" }
  ], []);

  const statusOptions: OptionType[] = useMemo(() => [
    { value: "Active", label: "Active" },
    { value: "Resigned", label: "Resigned" }
  ], []);

  // Fetch faculty data
  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchFacultyAPI();
      setFaculty(data);
    } catch (err: unknown) {
      console.error("Error fetching faculty:", (err as Error).message);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Form handlers
  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleEditFormChange = useCallback((field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Modal handlers
  const openAddModal = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((faculty: Faculty) => {
    setCurrentFaculty(faculty);
    setEditFormData({
      first_name: faculty.first_name,
      middle_name: faculty.middle_name || "",
      last_name: faculty.last_name,
      email: faculty.email,
      ph_no: faculty.ph_no || "",
      program: faculty.program,
      status: faculty.status
    });
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((faculty: Faculty) => {
    setCurrentFaculty(faculty);
    setIsDeleteModalOpen(true);
  }, []);

  // CRUD operations
  const handleAdd = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      await addFacultyAPI(formData);
      setIsAddModalOpen(false);
      fetchFaculty();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [formData, fetchFaculty]);

  const handleEdit = useCallback((faculty: Faculty) => {
    openEditModal(faculty);
  }, [openEditModal]);

  const handleUpdate = useCallback(async () => {
    if (!currentFaculty?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await updateFacultyAPI(currentFaculty._id, editFormData);
      setIsEditModalOpen(false);
      fetchFaculty();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentFaculty, editFormData, fetchFaculty]);

  const handleDelete = useCallback(async () => {
    if (!currentFaculty?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await deleteFacultyAPI(currentFaculty._id);
      setIsDeleteModalOpen(false);
      fetchFaculty();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentFaculty, fetchFaculty]);

  return {
    // Data
    faculty,
    formData,
    editFormData,
    currentFaculty,
    error,
    loading,
    searchContent,
    programOptions,
    statusOptions,
    
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    
    // Setters
    setSearchContent,
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    
    // Handlers
    handleFormChange,
    handleEditFormChange,
    openAddModal,
    handleAdd,
    openEditModal,
    handleEdit,
    handleUpdate,
    openDeleteModal,
    handleDelete
  };
};