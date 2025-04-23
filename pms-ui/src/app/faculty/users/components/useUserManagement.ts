// users/components/useUserManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, 
  UserFormData,
  OptionType
} from './types';
import {
  fetchUsersAPI,
  addUserAPI,
  updateUserAPI,
  deleteUserAPI
} from './API';

// Default form data
const DEFAULT_FORM_DATA: UserFormData = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  ph_no: "",
  role: ""
};

export const useUserManagement = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [editFormData, setEditFormData] = useState<UserFormData>(DEFAULT_FORM_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Search state
  const [searchContent, setSearchContent] = useState("");

  // Options for dropdowns
  const roleOptions: OptionType[] = useMemo(() => [
    { value: "admin", label: "Admin" },
    { value: "faculty", label: "Faculty" },
    { value: "student", label: "Student" },
    { value: "alumni", label: "Alumni" }
  ], []);

  const genderOptions: OptionType[] = useMemo(() => [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ], []);

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await fetchUsersAPI();
      setUsers(data);
    } catch (err: unknown) {
      console.error("Error fetching users:", (err as Error).message);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const openEditModal = useCallback((user: User) => {
    setCurrentUser(user);
    setEditFormData({
      first_name: user.first_name,
      middle_name: "",
      last_name: user.last_name || "",
      email: user.email || "",
      ph_no: user.ph_no,
      role: user.role
    });
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((user: User) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  // CRUD operations
  const handleAdd = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      await addUserAPI(formData);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
      console.error("Error adding user:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [formData, fetchUsers]);

  const handleEdit = useCallback((user: User) => {
    openEditModal(user);
  }, [openEditModal]);

  const handleUpdate = useCallback(async () => {
    if (!currentUser?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await updateUserAPI(currentUser._id, editFormData);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
      console.error("Error updating user:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, editFormData, fetchUsers]);

  const handleDelete = useCallback(async () => {
    if (!currentUser?._id) return;
    
    setLoading(true);
    setError("");
    
    try {
      await deleteUserAPI(currentUser._id);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setError((err as Error).message);
      console.error("Error deleting user:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchUsers]);

  return {
    // Data
    users,
    formData,
    editFormData,
    currentUser,
    error,
    loading,
    searchContent,
    roleOptions,
    genderOptions,
    
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
    handleEdit,
    handleUpdate,
    handleDelete,
    openDeleteModal
  };
};