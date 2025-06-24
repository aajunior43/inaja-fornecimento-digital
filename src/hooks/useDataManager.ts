
import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

export interface SavedData {
  solicitantes: string[];
  empresas: string[];
  observacoes: string[];
  createdAt: string;
  updatedAt: string;
}

export const useDataManager = () => {
  const [savedData, setSavedData] = useState<SavedData>({
    solicitantes: [],
    empresas: [],
    observacoes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const addSolicitante = useCallback((nome: string) => {
    if (!nome.trim()) return;
    setSavedData(prev => ({
      ...prev,
      solicitantes: [...new Set([...prev.solicitantes, nome.trim()])],
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const addEmpresa = useCallback((empresa: string) => {
    if (!empresa.trim()) return;
    setSavedData(prev => ({
      ...prev,
      empresas: [...new Set([...prev.empresas, empresa.trim()])],
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const addObservacao = useCallback((observacao: string) => {
    if (!observacao.trim()) return;
    setSavedData(prev => ({
      ...prev,
      observacoes: [...new Set([...prev.observacoes, observacao.trim()])],
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const removeSolicitante = useCallback((nome: string) => {
    setSavedData(prev => ({
      ...prev,
      solicitantes: prev.solicitantes.filter(s => s !== nome),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const removeEmpresa = useCallback((empresa: string) => {
    setSavedData(prev => ({
      ...prev,
      empresas: prev.empresas.filter(e => e !== empresa),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const removeObservacao = useCallback((observacao: string) => {
    setSavedData(prev => ({
      ...prev,
      observacoes: prev.observacoes.filter(o => o !== observacao),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const exportData = useCallback(() => {
    const dataToExport = {
      ...savedData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_sistema_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Dados exportados",
      description: "Seus dados foram baixados com sucesso!",
    });
  }, [savedData]);

  const importData = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Validar estrutura do arquivo
          if (!importedData.solicitantes || !importedData.empresas || !importedData.observacoes) {
            throw new Error('Estrutura de arquivo inválida');
          }

          setSavedData({
            solicitantes: Array.isArray(importedData.solicitantes) ? importedData.solicitantes : [],
            empresas: Array.isArray(importedData.empresas) ? importedData.empresas : [],
            observacoes: Array.isArray(importedData.observacoes) ? importedData.observacoes : [],
            createdAt: importedData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          toast({
            title: "Dados importados",
            description: "Seus dados foram carregados com sucesso!",
          });
          resolve();
        } catch (error) {
          reject(new Error('Arquivo JSON inválido'));
          toast({
            title: "Erro ao importar dados",
            description: "O arquivo selecionado não é válido.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    savedData,
    addSolicitante,
    addEmpresa,
    addObservacao,
    removeSolicitante,
    removeEmpresa,
    removeObservacao,
    exportData,
    importData
  };
};
