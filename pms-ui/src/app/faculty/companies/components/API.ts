// src/services/API.ts

import { Company, CompanyInputData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const COMPANY_ENDPOINT = `${API_BASE_URL}/company`;

/**
 * Fetches all companies from the API
 */
export const getCompaniesAPI = async (): Promise<Company[]> => {
  const response = await fetch(`${COMPANY_ENDPOINT}/get`, {
    method: "GET",
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail);
  }
  
  return data;
};

/**
 * Adds a new company
 */
export const addCompanyAPI = async (companyData: CompanyInputData): Promise<Company> => {
  const response = await fetch(`${COMPANY_ENDPOINT}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(companyData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    // Handle structured error responses
    if (typeof data.detail === 'object') {
      // Only extract the 'detail' field from the error response
      throw new Error(data.detail.detail || 'Failed to add company');
    }
    // Handle validation error arrays
    if (Array.isArray(data.detail)) {
      const errorMessage = data.detail.map((err: { msg: string }) => err.msg).join('\n');
      throw new Error(errorMessage);
    }
    // Default error fallback
    throw new Error(data.detail || 'Failed to add company');
  }

  return data;
};

/**
 * Updates an existing company
 */
export const updateCompanyAPI = async (companyId: string, companyData: CompanyInputData): Promise<Company> => {
  const response = await fetch(`${COMPANY_ENDPOINT}/update/${companyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(companyData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail);
  }

  return data;
};

/**
 * Deletes a company
 */
export const deleteCompanyAPI = async (companyId: string): Promise<void> => {
  const response = await fetch(`${COMPANY_ENDPOINT}/delete/${companyId}`, {
    method: "DELETE",
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail);
  }

  return data;
};

