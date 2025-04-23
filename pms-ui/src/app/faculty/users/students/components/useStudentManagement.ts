// src/hooks/useStudentManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Using toast for feedback
import { getStudents, addStudent, updateStudent, deleteStudent } from './API'; // Importing API functions
import { Student, StudentInputData } from './types'; // Importing types

// Define the shape of the state managed by the hook
interface StudentManagementState {
    students: Student[];
    isLoading: boolean;
    error: string | null;
    isAddModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    currentStudent: Student | null; // Student being edited or deleted
    formData: StudentInputData; // For the add form
    editFormData: StudentInputData; // For the edit form
    searchTerm: string;
}

// Initial state values
const initialFormData: StudentInputData = {
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    ph_no: "",
    program: "MCA",
    status: "Active",
    state: "Kerala",
};

/**
 * Custom hook to manage student data, state, and interactions.
 * Handles fetching, adding, updating, deleting students, and managing modal/form states.
 */
export const useStudentManagement = () => {
    const [state, setState] = useState<StudentManagementState>({
        students: [],
        isLoading: false,
        error: null,
        isAddModalOpen: false,
        isEditModalOpen: false,
        isDeleteModalOpen: false,
        currentStudent: null,
        formData: initialFormData,
        editFormData: initialFormData,
        searchTerm: "",
    });

    // --- Data Fetching ---
    const fetchStudentsData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const fetchedStudents = await getStudents();
            setState(prev => ({ ...prev, students: fetchedStudents, isLoading: false }));
        } catch (err) {
            console.error("Error fetching students:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch students.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error fetching students: ${errorMessage}`, {
                position: 'bottom-left',
            });
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchStudentsData();
    }, [fetchStudentsData]);

    // --- Modal Handling ---
    const handleOpenAddModal = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAddModalOpen: true,
            formData: initialFormData, // Reset form
            error: null,
        }));
    }, []);

    const handleOpenEditModal = useCallback((student: Student) => {
        setState(prev => ({
            ...prev,
            isEditModalOpen: true,
            currentStudent: student,
            editFormData: { // Populate edit form
                first_name: student.first_name,
                middle_name: student.middle_name || "",
                last_name: student.last_name || "",
                dob: student.dob,
                address: student.address || "",
                city: student.city || "",
                state: student.state || "Kerala",
                district: student.district || "",
                adm_no: student.adm_no || "",
                reg_no: student.reg_no || "",
                gender: student.gender,
                email: student.email,
                alt_email: student.alt_email,
                ph_no: student.ph_no || "",
                alt_ph: student.alt_ph || "",
                join_date: student.join_date,
                end_date: student.end_date,
                program: student.program || "MCA",
                status: student.status || "Active",
            },
            error: null,
        }));
    }, []);

    const handleOpenDeleteModal = useCallback((student: Student) => {
        setState(prev => ({
            ...prev,
            isDeleteModalOpen: true,
            currentStudent: student,
            error: null,
        }));
    }, []);

    const handleCloseModals = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAddModalOpen: false,
            isEditModalOpen: false,
            isDeleteModalOpen: false,
            currentStudent: null,
            error: null, // Clear error when closing modal
        }));
    }, []);

    // --- Form Handling ---
    const handleFormChange = useCallback((field: keyof StudentInputData, value: any) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value },
            error: (field === 'first_name' || field === 'email') ? null : prev.error
        }));
    }, []);

    const handleEditFormChange = useCallback((field: keyof StudentInputData, value: any) => {
        setState(prev => ({
            ...prev,
            editFormData: { ...prev.editFormData, [field]: value },
            error: (field === 'first_name' || field === 'email') ? null : prev.error
        }));
    }, []);

    // --- Search Handling ---
    const handleSearchChange = useCallback((value: string) => {
        setState(prev => ({ ...prev, searchTerm: value }));
    }, []);

    // --- CRUD Operations ---
    // Add new student with validation
    const submitNewStudent = useCallback(async () => {
        // Form validation for required fields
        if (!state.formData.first_name.trim()) {
            setState(prev => ({ ...prev, error: "First Name is required" }));
            return;
        }
        
        if (!state.formData.email.trim()) {
            setState(prev => ({ ...prev, error: "Email is required" }));
            return;
        }
        
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await addStudent(state.formData);
            toast.success("Student added successfully!", {
                position: 'bottom-left',
            });
            handleCloseModals();
            await fetchStudentsData(); // Refresh data
        } catch (err) {
            console.error("Error adding student:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to add student.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error adding student: ${errorMessage}`, {
                position: 'bottom-left',
            });
        }
    }, [state.formData, fetchStudentsData, handleCloseModals]);

    // Update student with validation
    const submitUpdatedStudent = useCallback(async () => {
        // Form validation for required fields
        if (!state.editFormData.first_name.trim()) {
            setState(prev => ({ ...prev, error: "First Name is required" }));
            return;
        }
        
        if (!state.editFormData.email.trim()) {
            setState(prev => ({ ...prev, error: "Email is required" }));
            return;
        }
        
        if (!state.currentStudent?._id) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await updateStudent(state.currentStudent._id, state.editFormData);
            toast.success("Student updated successfully!", {
                position: 'bottom-left',
            });
            handleCloseModals();
            await fetchStudentsData(); // Refresh data
        } catch (err) {
            console.error("Error updating student:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to update student.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error updating student: ${errorMessage}`, {
                position: 'bottom-left',
            });
        }
    }, [state.currentStudent, state.editFormData, fetchStudentsData, handleCloseModals]);

    // Delete student
    const confirmDeletion = useCallback(async () => {
        if (!state.currentStudent?._id) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await deleteStudent(state.currentStudent._id);
            toast.success("Student deleted successfully!", {
                position: 'bottom-left',
            });
            handleCloseModals();
            await fetchStudentsData(); // Refresh data
        } catch (err) {
            console.error("Error deleting student:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete student.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error deleting student: ${errorMessage}`, {
                position: 'bottom-left',
            });
        }
    }, [state.currentStudent, fetchStudentsData, handleCloseModals]);

    // Expose state and actions
    return {
        ...state, // Spread all state properties
        // Actions/Handlers
        fetchStudentsData,
        handleOpenAddModal,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleCloseModals,
        handleFormChange,
        handleEditFormChange,
        handleSearchChange,
        submitNewStudent,
        submitUpdatedStudent,
        confirmDeletion,
    };
};