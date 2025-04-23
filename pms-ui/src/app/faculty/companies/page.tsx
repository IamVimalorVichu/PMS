'use client';
import React, { useRef, useMemo } from 'react'; // Added useMemo
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'; // Import ColDef type
import { useCompanyManagement } from './components/useCompanyManagement'; // Adjust path
import { Company } from './components/types'; // Adjust path


interface Params{
    data: Company;
}

// Register AG Grid modules (do this once, typically in a layout or root component if possible)
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Renders the Company Management page UI.
 * Uses the useCompanyManagement hook for state and logic.
 */
function CompaniesPage() {
    const gridRef = useRef<AgGridReact>(null);
    const {
        companies,
        isLoading,
        error,
        isAddModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        currentCompany,
        formData,
        editFormData,
        searchTerm,
        handleOpenAddModal,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleCloseModals,
        handleFormChange,
        handleEditFormChange,
        handleSearchChange,
        submitNewCompany,
        submitUpdatedCompany,
        confirmDeletion,
    } = useCompanyManagement();

    // Define column definitions using useMemo for performance
    const columnDefs = useMemo<ColDef<Company>[]>(() => [
        { field: 'name', headerName: 'Company Name', flex: 2, sortable: true, filter: true },
        { field: 'branch', headerName: 'Branch', flex: 1, sortable: true, filter: true },
        { field: 'email', headerName: 'Email', flex: 2, sortable: true, filter: true },
        { field: 'ph_no', headerName: 'Phone', flex: 1, sortable: true, filter: true },
        {
            field: 'avg_salary',
            headerName: 'Avg Salary', // Shortened for space
            flex: 1,
            sortable: true,
            filter: 'agNumberColumnFilter', // Use number filter
             valueFormatter: params => params.value != null ? `₹${params.value.toLocaleString()}` : '-', // Format currency
        },
        {
            headerName: 'Actions',
            flex: 1,
            cellRenderer: (params: Params) => {
                // Ensure params.data exists before rendering buttons
                if (!params.data) return null;
                return (
                    <div className="flex h-full items-center gap-1"> {/* Adjusted gap/alignment */}
                        <Button
                            isIconOnly
                            size="sm" // Smaller buttons might fit better
                            aria-label={`Edit ${params.data.name}`}
                            onPress={() => handleOpenEditModal(params.data)}
                            className="bg-blue-600 text-white"
                        >
                            <MdEdit />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            aria-label={`Delete ${params.data.name}`}
                            onPress={() => handleOpenDeleteModal(params.data)}
                        >
                            <MdDeleteForever />
                        </Button>
                    </div>
                );
            },
            sortable: false,
            filter: false,
            resizable: false,
            pinned: 'right', // Pin actions to the right
             lockPinned: true, // Prevent unpinning by user
             cellClass: "ag-actions-cell", // Optional: for specific styling
        }
    ], [handleOpenEditModal, handleOpenDeleteModal]); // Dependencies for callbacks used inside

    // Default column definition using useMemo
    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        minWidth: 100,
        filter: true, // Enable filtering by default
        floatingFilter: true, // Add floating filters below headers
    }), []);

    return (
        // Use a more semantic container if applicable, otherwise div is fine
        <div className="flex h-full flex-col p-4"> {/* Use flex-col and h-full for better layout */}
            <h1 className="mb-4 text-3xl font-semibold">Company Management</h1>

            {/* Top Bar: Search and Add Button */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                 <div className="w-full flex-grow sm:w-auto md:max-w-xs"> {/* Responsive width */}
                    <Input
                        isClearable // Allow clearing search
                        startContent={<MdSearch className="text-xl text-gray-500" />} // Style icon
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        aria-label="Search Companies Table"
                    />
                </div>
                <Button color="primary" onPress={handleOpenAddModal} disabled={isLoading}>
                    Add Company
                </Button>
            </div>

             {/* Error Display */}
             {error && <p className="mb-4 rounded border border-red-400 bg-red-100 p-2 text-center text-red-700">{error}</p>}

            {/* AG Grid Table */}
            {/* Set height using container and flex-grow for responsiveness */}
             <div className="flex-grow ag-theme-quartz" style={{ width: '100%' }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={companies}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={15} // Adjust page size as needed
                    paginationPageSizeSelector={[15, 30, 50, 100]} // Allow user to change page size
                    quickFilterText={searchTerm} // Use built-in quick filter
                    domLayout='autoHeight' // Adjusts height to content - remove if using fixed height/flex-grow
                    // Consider adding row selection if needed: rowSelection="multiple"
                    suppressExcelExport={false} // Enable export if needed
                    onGridReady={params => params.api.sizeColumnsToFit()} // Initial column fit
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading companies...</span>' // Custom loading text
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No companies found.</span>' // Custom no rows text
                    loadingOverlayComponent={isLoading && !companies.length ? undefined : 'agLoadingOverlay'} // Show loading overlay
                    noRowsOverlayComponent={!isLoading && !companies.length ? undefined : 'agNoRowsOverlay'} // Show no rows overlay
                />
            </div>

            

            {/* Add Company Modal */}
            <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} backdrop="blur">
                <ModalContent>
                    <ModalHeader>Add New Company</ModalHeader>
                    <ModalBody>
                        {/* Reuse a form component later if needed */}
                        <Input autoFocus label="Company Name *" value={formData.name} onValueChange={v => handleFormChange('name', v)} className="mb-3" isRequired />
                        <Input label="Website" value={formData.site} onValueChange={v => handleFormChange('site', v)} className="mb-3" placeholder="https://example.com"/>
                        <Input label="Branch *" value={formData.branch} onValueChange={v => handleFormChange('branch', v)} className="mb-3" isRequired />
                        <Input label="Description" value={formData.desc} onValueChange={v => handleFormChange('desc', v)} className="mb-3" />
                        <Input label="Contact Email" type="email" value={formData.email || ""} onValueChange={v => handleFormChange('email', v)} className="mb-3" />
                        <Input label="Contact Phone" value={formData.ph_no} onValueChange={v => handleFormChange('ph_no', v)} className="mb-3" />

                         {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="light" onPress={handleCloseModals} disabled={isLoading}>Cancel</Button>
                            <Button color="primary" onPress={submitNewCompany} isLoading={isLoading}>Submit</Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Edit Company Modal */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} backdrop="blur">
                <ModalContent>
                    <ModalHeader>Edit Company: {currentCompany?.name}</ModalHeader>
                    <ModalBody>
                        <Input autoFocus label="Company Name *" value={editFormData.name} onValueChange={v => handleEditFormChange('name', v)} className="mb-3" isRequired />
                        <Input label="Website" value={editFormData.site} onValueChange={v => handleEditFormChange('site', v)} className="mb-3" placeholder="https://example.com"/>
                        <Input label="Branch *" value={editFormData.branch} onValueChange={v => handleEditFormChange('branch', v)} className="mb-3" isRequired />
                        <Input label="Description" value={editFormData.desc} onValueChange={v => handleEditFormChange('desc', v)} className="mb-3" />
                        <Input label="Contact Email" type="email" value={editFormData.email || ""} onValueChange={v => handleEditFormChange('email', v)} className="mb-3" />
                        <Input label="Contact Phone" value={editFormData.ph_no} onValueChange={v => handleEditFormChange('ph_no', v)} className="mb-3" />

                         {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="light" onPress={handleCloseModals} disabled={isLoading}>Cancel</Button>
                            <Button color="primary" onPress={submitUpdatedCompany} isLoading={isLoading}>Update</Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} size="sm" backdrop="blur">
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete the company: <strong>{currentCompany?.name}</strong>?</p>
                         {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="light" onPress={handleCloseModals} disabled={isLoading}>Cancel</Button>
                            <Button color="danger" onPress={confirmDeletion} isLoading={isLoading}>Delete</Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default CompaniesPage;