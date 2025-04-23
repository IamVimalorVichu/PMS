'use client';
import React, { useRef, useMemo } from 'react';
import { MdSearch, MdEdit, MdDeleteForever } from "react-icons/md";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useAlumniManagement } from './components/useAlumniManagement';
import AlumniForm from './components/AlumniForm';
import { Alumni } from './components/types';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

function AlumniPage() {
  const {
    // Data
    alumni,
    formData,
    editFormData,
    error,
    loading,
    searchContent,
    statusOptions,
    
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    openDeleteModal,
    
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
    handleDelete
  } = useAlumniManagement();

  const gridRef = useRef<AgGridReact>(null);

  // Column definitions for AG Grid - defined in the component since it contains JSX
  const columnDefs = useMemo(() => [
    { field: 'first_name', headerName: 'First Name', flex: 2, sortable: true, filter: true },
    { field: 'last_name', headerName: 'Last Name', flex: 2, sortable: true, filter: true },
    { field: 'email', headerName: 'Email', flex: 3, sortable: true, filter: true },
    { field: 'ph_no', headerName: 'Phone', flex: 2, sortable: true, filter: true },
    { field: 'adm_no', headerName: 'Admission No', flex: 2, sortable: true, filter: true },
    { field: 'passout_year', headerName: 'Passout Year', flex: 2, sortable: true, filter: true },
    { field: 'status', headerName: 'Status', flex: 1, sortable: true, filter: true },
    {
      headerName: 'Actions',
      flex: 1,
      cellRenderer: (params: { data: Alumni }) => {
        return (
          <div className="flex w-full gap-2">
            <Button 
              isIconOnly
              onPress={() => handleEdit(params.data)} 
              className="bg-blue-600 text-white"
            >
              <MdEdit />
            </Button>
            <Button 
              isIconOnly
              onPress={() => openDeleteModal(params.data)} 
              color="danger"
            >
              <MdDeleteForever />
            </Button>
          </div>
        );
      }
    }
  ], [handleEdit, openDeleteModal]);

  // Default column definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
    minWidth: 100
  }), []);

  return (
    <div className="p-0">
      <div className="flex flex-col items-center bg-gray-100 p-4 mb-4">
        <h1 className="text-3xl font-semibold mb-4">Alumni Management</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="flex gap-2 justify-end w-full mb-4">
          <Button color="primary" onPress={openAddModal}>Add Alumni</Button>
        </div>

        <div className="w-full flex justify-start mb-4">
          <Input
            startContent={<MdSearch/>}
            placeholder="Search alumni..."
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>

        <div className="w-full ag-theme-quartz" style={{ height: '500px' }}>
          <AgGridReact
            ref={gridRef}
            rowData={alumni}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            quickFilterText={searchContent}
            overlayLoadingTemplate={
              '<span class="ag-overlay-loading-center">Loading data...</span>'
            }
            overlayNoRowsTemplate={
              '<span class="ag-overlay-no-rows-center">No alumni records found</span>'
            }
          />
        </div>

        {/* Add Alumni Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Add New Alumni</ModalHeader>
            <ModalBody>
              <AlumniForm
                formData={formData}
                statusOptions={statusOptions}
                onFormChange={handleFormChange}
                onCancel={() => setIsAddModalOpen(false)}
                onSubmit={handleAdd}
                submitLabel="Submit"
                isLoading={loading}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit Alumni Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Edit Alumni</ModalHeader>
            <ModalBody>
              <AlumniForm
                formData={editFormData}
                statusOptions={statusOptions}
                onFormChange={handleEditFormChange}
                onCancel={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdate}
                submitLabel="Update"
                isLoading={loading}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <ModalContent>
            <ModalHeader>Confirm Delete</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this alumni?</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button color="default" onPress={() => setIsDeleteModalOpen(false)} isDisabled={loading}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete} isLoading={loading}>
                  Delete
                </Button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default AlumniPage;