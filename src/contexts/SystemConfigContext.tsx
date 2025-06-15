
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SystemConfig {
  municipalityName: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  description: string;
  orderers: Array<{
    id: string;
    name: string;
    position: string;
    department: string;
  }>;
  suppliers: Array<{
    id: string;
    name: string;
    cnpj: string;
    contact: string;
    email: string;
  }>;
}

interface SystemConfigContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  addOrderer: (orderer: Omit<SystemConfig['orderers'][0], 'id'>) => void;
  removeOrderer: (id: string) => void;
  addSupplier: (supplier: Omit<SystemConfig['suppliers'][0], 'id'>) => void;
  removeSupplier: (id: string) => void;
}

const defaultConfig: SystemConfig = {
  municipalityName: 'Prefeitura Municipal de Inajá-PR',
  address: 'Inajá, Paraná',
  phone: '',
  email: '',
  logo: '',
  description: 'Sistema de Gestão de Solicitações',
  orderers: [],
  suppliers: []
};

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const SystemConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const addOrderer = (orderer: Omit<SystemConfig['orderers'][0], 'id'>) => {
    const newOrderer = { ...orderer, id: Date.now().toString() };
    setConfig(prev => ({
      ...prev,
      orderers: [...prev.orderers, newOrderer]
    }));
  };

  const removeOrderer = (id: string) => {
    setConfig(prev => ({
      ...prev,
      orderers: prev.orderers.filter(o => o.id !== id)
    }));
  };

  const addSupplier = (supplier: Omit<SystemConfig['suppliers'][0], 'id'>) => {
    const newSupplier = { ...supplier, id: Date.now().toString() };
    setConfig(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, newSupplier]
    }));
  };

  const removeSupplier = (id: string) => {
    setConfig(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== id)
    }));
  };

  return (
    <SystemConfigContext.Provider value={{
      config,
      updateConfig,
      addOrderer,
      removeOrderer,
      addSupplier,
      removeSupplier
    }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
};
