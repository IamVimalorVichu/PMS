// src/hooks/useCompanyManagement.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify'; // Using toast for feedback
import { getCompaniesAPI, addCompanyAPI, updateCompanyAPI, deleteCompanyAPI } from './API'; // Importing API functions
import { Company, CompanyInputData } from './types'; // Importing types
// Define the shape of the state managed by the hook

interface CompanyManagementState {
    companies: Company[];
    isLoading: boolean;
    error: string | null;
    isAddModalOpen: boolean;
    isEditModalOpen: boolean;
    isDeleteModalOpen: boolean;
    currentCompany: Company | null; // Company being edited or deleted
    formData: CompanyInputData; // For the add form
    editFormData: CompanyInputData; // For the edit form
    searchTerm: string;
}

// Initial state values
const initialFormData: CompanyInputData = {
    name: "", 
    site: "",
    branch: "", 
    desc: "", 
    email: null, 
    ph_no: "",
    avg_salary: 0,
    placed_students: [],
};

/**
 * Custom hook to manage company data, state, and interactions.
 * Handles fetching, adding, updating, deleting companies, and managing modal/form states.
 */
export const useCompanyManagement = () => {
    const [state, setState] = useState<CompanyManagementState>({
        companies: [],
        isLoading: false,
        error: null,
        isAddModalOpen: false,
        isEditModalOpen: false,
        isDeleteModalOpen: false,
        currentCompany: null,
        formData: initialFormData,
        editFormData: initialFormData,
        searchTerm: "",
    });

    // --- Data Fetching ---
    const fetchCompaniesData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const fetchedCompanies = await getCompaniesAPI();
            setState(prev => ({ ...prev, companies: fetchedCompanies, isLoading: false }));
        } catch (err) {
            console.error("Error fetching companies:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch companies.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error fetching companies: ${errorMessage}`,{
                position: 'bottom-left',
            });
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchCompaniesData();
    }, [fetchCompaniesData]);

    // --- Modal Handling ---
    const handleOpenAddModal = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAddModalOpen: true,
            formData: initialFormData, // Reset form
            error: null,
        }));
    }, []);

    const handleOpenEditModal = useCallback((company: Company) => {
        setState(prev => ({
            ...prev,
            isEditModalOpen: true,
            currentCompany: company,
            editFormData: { // Populate edit form
                name: company.name,
                site: company.site || "",
                branch: company.branch,
                desc: company.desc || "",
                email: company.email || null,
                ph_no: company.ph_no || "",
                avg_salary: company.avg_salary || 0,
                placed_students: company.placed_students || [],

            },
            error: null,
        }));
    }, []);

    const handleOpenDeleteModal = useCallback((company: Company) => {
        setState(prev => ({
            ...prev,
            isDeleteModalOpen: true,
            currentCompany: company,
            error: null,
        }));
    }, []);

    const handleCloseModals = useCallback(() => {
        setState(prev => ({
            ...prev,
            isAddModalOpen: false,
            isEditModalOpen: false,
            isDeleteModalOpen: false,
            currentCompany: null,
            error: null, // Clear error when closing modal
        }));
    }, []);

    // --- Form Handling ---
    const handleFormChange = useCallback((field: keyof CompanyInputData, value: string) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value },

            error: (field === 'name' || field === 'branch') ? null : prev.error
        }));
    }, []);

    const handleEditFormChange = useCallback((field: keyof CompanyInputData, value: string) => {
        setState(prev => ({
            ...prev,
            editFormData: { ...prev.editFormData, [field]: value },

            error: (field === 'name' || field === 'branch') ? null : prev.error

        }));
    }, []);

    // --- Search Handling ---
     const handleSearchChange = useCallback((value: string) => {
        setState(prev => ({ ...prev, searchTerm: value }));
    }, []);

    // --- CRUD Operations ---
    // Modified submitNewCompany function with validation
    const submitNewCompany = useCallback(async () => {
        // Form validation for required fields
        if (!state.formData.name.trim()) {
            setState(prev => ({ ...prev, error: "Company Name is required" }));
            return;
        }
        
        if (!state.formData.branch.trim()) {
            setState(prev => ({ ...prev, error: "Branch is required" }));
            return;
        }
        
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await addCompanyAPI(state.formData);
            toast.success("Company added successfully!", {
                position: 'bottom-left',
            });
            handleCloseModals();
            await fetchCompaniesData(); // Refresh data
        } catch (err: unknown) {
            const errorMessage = (err as Error).message;
            toast.error(errorMessage);
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(errorMessage, {
                position: 'bottom-left',
            });
        }
    }, [state.formData, fetchCompaniesData, handleCloseModals]);

    const handleAdd = useCallback(async () => {
        // Form validation for required fields
        if (!state.formData.name.trim()) {
            setState(prev => ({ ...prev, error: "Company Name is required" }));
            toast.error("Company Name is required", {
                position: 'bottom-left',
            });
            return;
        }
        
        if (!state.formData.branch.trim()) {
            setState(prev => ({ ...prev, error: "Branch is required" }));
            toast.error("Branch is required", {
                position: 'bottom-left',
            });
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        try {
            await addCompanyAPI(state.formData);
            setState(prev => ({ ...prev, isAddModalOpen: false }));
            await fetchCompaniesData();
            toast.success("Company added successfully!", {
                position: 'bottom-left',
            });
        } catch (err: unknown) {
            const errorMessage = (err as Error).message;
            setState(prev => ({ ...prev, error: errorMessage }));
            toast.error(errorMessage, {
                position: 'bottom-left',
            });
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [state.formData, fetchCompaniesData]);

    const submitUpdatedCompany = useCallback(async () => {
        // Form validation for required fields
        if (!state.editFormData.name.trim()) {
            setState(prev => ({ ...prev, error: "Company Name is required" }));
            return;
        }
        
        if (!state.editFormData.branch.trim()) {
            setState(prev => ({ ...prev, error: "Branch is required" }));
            return;
        }
        
        if (!state.currentCompany?._id) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await updateCompanyAPI(state.currentCompany._id, state.editFormData);
            toast.success("Company updated successfully!",{
                position: 'bottom-left',
            });
            handleCloseModals();
            await fetchCompaniesData(); // Refresh data
        } catch (err) {
            console.error("Error updating company:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to update company.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error updating company: ${errorMessage}`, {
                position: 'bottom-left',
            });
        }
    }, [state.currentCompany, state.editFormData, fetchCompaniesData, handleCloseModals]);

    const confirmDeletion = useCallback(async () => {
        if (!state.currentCompany?._id) return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await deleteCompanyAPI(state.currentCompany._id);
            toast.success("Company deleted successfully!", {
                position: 'bottom-left',
            });
            handleCloseModals();
            await fetchCompaniesData(); // Refresh data
        } catch (err) {
            console.error("Error deleting company:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete company.";
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
            toast.error(`Error deleting company: ${errorMessage}`, {
                position: 'bottom-left',
            });
        }
    }, [state.currentCompany, fetchCompaniesData, handleCloseModals]);

    // Expose state and actions
    return {
        ...state, // Spread all state properties
        // Actions/Handlers
        fetchCompaniesData,
        handleOpenAddModal,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleCloseModals,
        handleFormChange,
        handleEditFormChange,
        handleSearchChange,
        submitNewCompany,
        handleAdd,
        submitUpdatedCompany,
        confirmDeletion,
    };
};