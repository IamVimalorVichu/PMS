'use client';
import React, { useRef, useMemo } from 'react';
import { MdSearch, MdDeleteForever, MdEdit } from "react-icons/md";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input, Select, SelectItem } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useStudentManagement } from './components/useStudentManagement';
import { Student } from './components/types';

interface Params {
    data: Student;
}

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Renders the Student Management page UI.
 * Uses the useStudentManagement hook for state and logic.
 */
function StudentsPage() {
    const gridRef = useRef<AgGridReact>(null);
    const {
        students,
        isLoading,
        error,
        isAddModalOpen,
        isEditModalOpen,
        isDeleteModalOpen,
        currentStudent,
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
        submitNewStudent,
        submitUpdatedStudent,
        confirmDeletion,
    } = useStudentManagement();

    // Define column definitions using useMemo for performance
    const columnDefs = useMemo<ColDef<Student>[]>(() => [
        { 
            field: 'first_name', 
            headerName: 'Name', 
            flex: 2, 
            sortable: true, 
            filter: true,
            valueGetter: (params) => {
                const firstName = params.data?.first_name || '';
                const middleName = params.data?.middle_name || '';
                const lastName = params.data?.last_name || '';
                return `${firstName} ${middleName} ${lastName}`.trim();
            }
        },
        { field: 'email', headerName: 'Email', flex: 2, sortable: true, filter: true },
        { field: 'ph_no', headerName: 'Phone', flex: 1, sortable: true, filter: true },
        { 
            field: 'program', 
            headerName: 'Program', 
            flex: 1, 
            sortable: true, 
            filter: true 
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            flex: 1, 
            sortable: true, 
            filter: true,
            cellRenderer: (params: Params) => {
                if (!params.data) return null;
                
                const statusColors = {
                    'Active': 'bg-green-100 text-green-800',
                    'Discontinued': 'bg-red-100 text-red-800',
                    'completed': 'bg-blue-100 text-blue-800'
                };
                
                const statusClass = statusColors[params.data.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
                
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                        {params.data.status}
                    </span>
                );
            }
        },
        {
            headerName: 'Actions',
            flex: 1,
            cellRenderer: (params: Params) => {
                // Ensure params.data exists before rendering buttons
                if (!params.data) return null;
                return (
                    <div className="flex h-full items-center gap-1">
                        <Button
                            isIconOnly
                            size="sm"
                            aria-label={`Edit ${params.data.first_name}`}
                            onPress={() => handleOpenEditModal(params.data)}
                            className="bg-blue-600 text-white"
                        >
                            <MdEdit />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            aria-label={`Delete ${params.data.first_name}`}
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
            pinned: 'right',
            lockPinned: true,
            cellClass: "ag-actions-cell",
        }
    ], [handleOpenEditModal, handleOpenDeleteModal]);

    // Default column definition using useMemo
    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
    }), []);

    return (
        <div className="flex h-full flex-col p-4">
            <h1 className="mb-4 text-3xl font-semibold">Student Management</h1>

            {/* Top Bar: Search and Add Button */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="w-full flex-grow sm:w-auto md:max-w-xs">
                    <Input
                        isClearable
                        startContent={<MdSearch className="text-xl text-gray-500" />}
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        aria-label="Search Students Table"
                    />
                </div>
                <Button color="primary" onPress={handleOpenAddModal} disabled={isLoading}>
                    Add Student
                </Button>
            </div>

            {/* Error Display */}
            {error && <p className="mb-4 rounded border border-red-400 bg-red-100 p-2 text-center text-red-700">{error}</p>}

            {/* AG Grid Table */}
            <div className="flex-grow ag-theme-quartz" style={{ width: '100%' }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={students}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={15}
                    paginationPageSizeSelector={[15, 30, 50, 100]}
                    quickFilterText={searchTerm}
                    domLayout='autoHeight'
                    onGridReady={params => params.api.sizeColumnsToFit()}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading students...</span>'
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No students found.</span>'
                    loadingOverlayComponent={isLoading && !students.length ? undefined : 'agLoadingOverlay'}
                    noRowsOverlayComponent={!isLoading && !students.length ? undefined : 'agNoRowsOverlay'}
                />
            </div>

            {/* Add Student Modal */}
            <Modal isOpen={isAddModalOpen} onClose={handleCloseModals} backdrop="blur" size="3xl">
                <ModalContent>
                    <ModalHeader>Add New Student</ModalHeader>
                    <ModalBody>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input 
                                autoFocus 
                                label="First Name *" 
                                value={formData.first_name} 
                                onValueChange={v => handleFormChange('first_name', v)} 
                                isRequired 
                            />
                            <Input 
                                label="Middle Name" 
                                value={formData.middle_name} 
                                onValueChange={v => handleFormChange('middle_name', v)} 
                            />
                            <Input 
                                label="Last Name" 
                                value={formData.last_name} 
                                onValueChange={v => handleFormChange('last_name', v)} 
                            />
                            <Input 
                                label="Email *" 
                                type="email" 
                                value={formData.email} 
                                onValueChange={v => handleFormChange('email', v)} 
                                isRequired 
                            />
                            <Input 
                                label="Phone Number" 
                                value={formData.ph_no} 
                                onValueChange={v => handleFormChange('ph_no', v)} 
                            />
                            <Input 
                                label="Alternative Phone" 
                                value={formData.alt_ph} 
                                onValueChange={v => handleFormChange('alt_ph', v)} 
                            />
                            <Input 
                                label="Alternative Email" 
                                type="email" 
                                value={formData.alt_email || ''} 
                                onValueChange={v => handleFormChange('alt_email', v)} 
                            />
                            <Input 
                                label="Address" 
                                value={formData.address} 
                                onValueChange={v => handleFormChange('address', v)} 
                            />
                            <Input 
                                label="City" 
                                value={formData.city} 
                                onValueChange={v => handleFormChange('city', v)} 
                            />
                            <Input 
                                label="District" 
                                value={formData.district} 
                                onValueChange={v => handleFormChange('district', v)} 
                            />
                            <Input 
                                label="State" 
                                value={formData.state} 
                                onValueChange={v => handleFormChange('state', v)} 
                            />
                            <Input 
                                label="Admission Number" 
                                value={formData.adm_no} 
                                onValueChange={v => handleFormChange('adm_no', v)} 
                            />
                            <Input 
                                label="Registration Number" 
                                value={formData.reg_no} 
                                onValueChange={v => handleFormChange('reg_no', v)} 
                            />
                            <Select 
                                label="Gender" 
                                selectedKeys={[formData.gender]}
                                onChange={e => handleFormChange('gender', e.target.value)}
                            >
                                <SelectItem key="Male" >Male</SelectItem>
                                <SelectItem key="Female" >Female</SelectItem>
                                <SelectItem key="Other" >Other</SelectItem>
                            </Select>
                            <Select 
                                label="Program" 
                                selectedKeys={[formData.program]} 
                                onChange={e => handleFormChange('program', e.target.value)}
                            >
                                <SelectItem key="MCA">MCA</SelectItem>
                                <SelectItem key="MBA">MBA</SelectItem>
                                <SelectItem key="BCA">BCA</SelectItem>
                                <SelectItem key="BBA">BBA</SelectItem>
                            </Select>
                            <Select 
                                label="Status" 
                                selectedKeys={[formData.status]} 
                                onChange={e => handleFormChange('status', e.target.value)}
                            >
                                <SelectItem key="Active" >Active</SelectItem>
                                <SelectItem key="Discontinued">Discontinued</SelectItem>
                                <SelectItem key="completed" >Completed</SelectItem>
                            </Select>
                            <Input 
                                label="Date of Birth" 
                                type="date" 
                                value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}  
                                onChange={e => handleFormChange('dob', e.target.value)} 
                            />
                            <Input 
                                label="Join Date" 
                                type="date" 
                                value={formData.join_date ? new Date(formData.join_date).toISOString().split('T')[0] : ''} 
                                onChange={e => handleFormChange('join_date', e.target.value)} 
                            />
                            <Input 
                                label="End Date" 
                                type="date" 
                                value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''} 
                                onChange={e => handleFormChange('end_date', e.target.value)} 
                            />
                        </div>

                        {error && <p className="mb-2 mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="light" onPress={handleCloseModals} disabled={isLoading}>Cancel</Button>
                            <Button color="primary" onPress={submitNewStudent} isLoading={isLoading}>Submit</Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Edit Student Modal */}
            <Modal isOpen={isEditModalOpen} onClose={handleCloseModals} backdrop="blur" size="3xl">
                <ModalContent>
                    <ModalHeader>Edit Student: {currentStudent?.first_name}</ModalHeader>
                    <ModalBody>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Input 
                                autoFocus 
                                label="First Name *" 
                                value={editFormData.first_name} 
                                onValueChange={v => handleEditFormChange('first_name', v)} 
                                isRequired 
                            />
                            <Input 
                                label="Middle Name" 
                                value={editFormData.middle_name} 
                                onValueChange={v => handleEditFormChange('middle_name', v)} 
                            />
                            <Input 
                                label="Last Name" 
                                value={editFormData.last_name} 
                                onValueChange={v => handleEditFormChange('last_name', v)} 
                            />
                            <Input 
                                label="Email *" 
                                type="email" 
                                value={editFormData.email} 
                                onValueChange={v => handleEditFormChange('email', v)} 
                                isRequired 
                            />
                            <Input 
                                label="Phone Number" 
                                value={editFormData.ph_no} 
                                onValueChange={v => handleEditFormChange('ph_no', v)} 
                            />
                            <Input 
                                label="Alternative Phone" 
                                value={editFormData.alt_ph} 
                                onValueChange={v => handleEditFormChange('alt_ph', v)} 
                            />
                            <Input 
                                label="Alternative Email" 
                                type="email" 
                                value={editFormData.alt_email || ''} 
                                onValueChange={v => handleEditFormChange('alt_email', v)} 
                            />
                            <Input 
                                label="Address" 
                                value={editFormData.address} 
                                onValueChange={v => handleEditFormChange('address', v)} 
                            />
                            <Input 
                                label="City" 
                                value={editFormData.city} 
                                onValueChange={v => handleEditFormChange('city', v)} 
                            />
                            <Input 
                                label="District" 
                                value={editFormData.district} 
                                onValueChange={v => handleEditFormChange('district', v)} 
                            />
                            <Input 
                                label="State" 
                                value={editFormData.state} 
                                onValueChange={v => handleEditFormChange('state', v)} 
                            />
                            <Input 
                                label="Admission Number" 
                                value={editFormData.adm_no} 
                                onValueChange={v => handleEditFormChange('adm_no', v)} 
                            />
                            <Input 
                                label="Registration Number" 
                                value={editFormData.reg_no} 
                                onValueChange={v => handleEditFormChange('reg_no', v)} 
                            />
                            <Select 
                                label="Gender" 
                                value={editFormData.gender} 
                                onChange={e => handleEditFormChange('gender', e.target.value)}
                            >
                                <SelectItem key="Male" >Male</SelectItem>
                                <SelectItem key="Female" >Female</SelectItem>
                                <SelectItem key="Other" >Other</SelectItem>
                            </Select>
                            <Select 
                                label="Program" 
                                selectedKeys={[editFormData.program]} 
                                onChange={e => handleEditFormChange('program', e.target.value)}
                            >
                                <SelectItem key="MCA">MCA</SelectItem>
                                <SelectItem key="MBA" >MBA</SelectItem>
                                <SelectItem key="BCA" >BCA</SelectItem>
                                <SelectItem key="BBA" >BBA</SelectItem>
                            </Select>
                            <Select 
                                label="Status" 
                                selectedKeys={[editFormData.status]} 
                                onChange={e => handleEditFormChange('status', e.target.value)}
                            >
                                <SelectItem key="Active" >Active</SelectItem>
                                <SelectItem key="Discontinued">Discontinued</SelectItem>
                                <SelectItem key="completed">Completed</SelectItem>
                            </Select>
                            <Input 
                                label="Date of Birth" 
                                type="date" 
                                value={editFormData.dob ? new Date(editFormData.dob).toISOString().split('T')[0] : ''} 
                                onChange={e => handleEditFormChange('dob', e.target.value)} 
                            />
                            <Input 
                                label="Join Date" 
                                type="date" 
                                value={editFormData.join_date ? new Date(editFormData.join_date).toISOString().split('T')[0] : ''} 
                                onChange={e => handleEditFormChange('join_date', e.target.value)} 
                            />
                            <Input 
                                label="End Date" 
                                type="date" 
                                value={editFormData.end_date ? new Date(editFormData.end_date).toISOString().split('T')[0] : ''} 
                                onChange={e => handleEditFormChange('end_date', e.target.value)} 
                            />
                        </div>

                        {error && <p className="mb-2 mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="light" onPress={handleCloseModals} disabled={isLoading}>Cancel</Button>
                            <Button color="primary" onPress={submitUpdatedStudent} isLoading={isLoading}>Update</Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} size="sm" backdrop="blur">
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to delete the student: <strong>{currentStudent?.first_name} {currentStudent?.last_name}</strong>?</p>
                        <p className="mt-2 text-sm text-gray-600">This will also delete the associated user account.</p>
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

export default StudentsPage;