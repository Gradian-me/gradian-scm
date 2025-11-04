import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Company {
  id: string | number;
  name: string;
  logo?: string;
  abbreviation?: string;
  [key: string]: any;
}

interface CompanyState {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  getCompanyId: () => string | number | null;
  clearSelectedCompany: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedCompany: null,
        
        setSelectedCompany: (company: Company | null) => {
          set({ selectedCompany: company }, false, 'setSelectedCompany');
        },
        
        getCompanyId: () => {
          const company = get().selectedCompany;
          // Return null if "All Companies" is selected (id === -1)
          if (company && company.id !== -1) {
            return company.id;
          }
          return null;
        },
        
        clearSelectedCompany: () => {
          set({ selectedCompany: null }, false, 'clearSelectedCompany');
        },
      }),
      {
        name: 'company-store',
      }
    ),
    {
      name: 'company-store',
    }
  )
);
