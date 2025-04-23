// src/app/hooks/useAlumniManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchAlumniAPI, 
  addAlumniAPI, 
  updateAlumniAPI, 
  deleteAlumniAPI 
} from './API';
import { 
  Alumni, 
  AlumniFormData, 
  StatusOption 
} from './types';

// Default form data
const DEFAULT_FORM_DATA: AlumniFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: null,
  ph_no: null,
  adm_no: "",
  status: "Unemployed"
};

export const useAlumniManagement = () => {
  // State management
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [formData, setFormData] = useState<AlumniFormData>(DEFAULT_FORM_DATA);
  const [editFormData, setEditFormData] = useState<AlumniFormData>(DEFAULT_FORM_DATA);
  const [currentAlumni, setCurrentAlumni] = useState<Alumni | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Search state
  const [searchContent, setSearchContent] = useState("");

  // Status options for dropdown
  const statusOptions: StatusOption[] = useMemo(() => [
    { value: "Employed", label: "Employed" },
    { value: "Unemployed", label: "Unemployed" }
  ], []);

  // Fetch alumni data
  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchAlumniAPI();
      setAlumni(data);
    } catch (err: unknown) {
      console.error("Error fetching alumni:", (err as Error).message);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

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

  const openEditModal = useCallback((alumni: Alumni) => {
    setCurrentAlumni(alumni);
    setEditFormData({
      first_name: alumni.first_name,
      middle_name: alumni.middle_name || "",
      last_name: alumni.last_name || "",
      email: alumni.email || "",
      ph_no: alumni.ph_no || "",
      adm_no: alumni.adm_no || "",
      status: alumni.status
    });
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((alumni: Alumni) => {
    setCurrentAlumni(alumni);
    setIsDeleteModalOpen(true);
  }, []);

  // CRUD operations
  const handleAdd = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      await addAlumniAPI(formData);
      setIsAddModalOpen(false);
      fetchAlumni();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [formData, fetchAlumni]);

  const handleEdit = useCallback((alumni: Alumni) => {
    openEditModal(alumni);
  }, [openEditModal]);

  const handleUpdate = useCallback(async () => {
    if (!currentAlumni?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await updateAlumniAPI(currentAlumni._id, editFormData);
      setIsEditModalOpen(false);
      fetchAlumni();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentAlumni, editFormData, fetchAlumni]);

  const handleDelete = useCallback(async () => {
    if (!currentAlumni?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await deleteAlumniAPI(currentAlumni._id);
      setIsDeleteModalOpen(false);
      fetchAlumni();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentAlumni, fetchAlumni]);

  return {
    // Data
    alumni,
    formData,
    editFormData,
    currentAlumni,
    error,
    loading,
    searchContent,
    statusOptions,
    
    // Modal states
    openAddModal,
    openEditModal,
    openDeleteModal,
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
    handleAdd,
    handleEdit,
    handleUpdate,
    handleDelete
  };
};