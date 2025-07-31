import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemSettings {
  systemName: string;
  systemLogo: string | null;
  companyInfo: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    email: string;
    telefone: string;
    whatsapp: string;
    endereco: {
      cep: string;
      logradouro: string;
      bairro: string;
      cidade: string;
      estado: string;
      complemento: string;
    };
  };
  updateSystemName: (name: string) => void;
  updateSystemLogo: (logo: string | null) => void;
  updateCompanyInfo: (info: Partial<SystemSettings['companyInfo']>) => void;
}

export const useSystemSettings = create<SystemSettings>()(
  persist(
    (set) => ({
      systemName: 'StudyPro',
      systemLogo: null,
      companyInfo: {
        cnpj: '00.000.000/0001-00',
        razaoSocial: 'StudyPro Educação Ltda',
        nomeFantasia: 'StudyPro',
        email: 'contato@studypro.com.br',
        telefone: '(11) 99999-9999',
        whatsapp: '(11) 99999-9999',
        endereco: {
          cep: '01234-567',
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          complemento: 'Sala 45'
        }
      },
      updateSystemName: (name) => set({ systemName: name }),
      updateSystemLogo: (logo) => set({ systemLogo: logo }),
      updateCompanyInfo: (info) => set((state) => ({
        companyInfo: { ...state.companyInfo, ...info }
      }))
    }),
    {
      name: 'system-settings'
    }
  )
);