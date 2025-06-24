
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
    setSavedData(prev => {
      const newSolicitantes = [...prev.solicitantes];
      if (!newSolicitantes.includes(nome.trim())) {
        newSolicitantes.push(nome.trim());
      }
      return {
        ...prev,
        solicitantes: newSolicitantes,
        updatedAt: new Date().toISOString()
      };
    });
    
    toast({
      title: "Solicitante adicionado",
      description: `${nome} foi salvo com sucesso!`,
    });
  }, []);

  const addEmpresa = useCallback((empresa: string) => {
    if (!empresa.trim()) return;
    setSavedData(prev => {
      const newEmpresas = [...prev.empresas];
      if (!newEmpresas.includes(empresa.trim())) {
        newEmpresas.push(empresa.trim());
      }
      return {
        ...prev,
        empresas: newEmpresas,
        updatedAt: new Date().toISOString()
      };
    });
    
    toast({
      title: "Empresa adicionada",
      description: `${empresa} foi salva com sucesso!`,
    });
  }, []);

  const addObservacao = useCallback((observacao: string) => {
    if (!observacao.trim()) return;
    setSavedData(prev => {
      const newObservacoes = [...prev.observacoes];
      if (!newObservacoes.includes(observacao.trim())) {
        newObservacoes.push(observacao.trim());
      }
      return {
        ...prev,
        observacoes: newObservacoes,
        updatedAt: new Date().toISOString()
      };
    });
    
    toast({
      title: "Observação adicionada",
      description: "Observação foi salva com sucesso!",
    });
  }, []);

  const removeSolicitante = useCallback((nome: string) => {
    setSavedData(prev => ({
      ...prev,
      solicitantes: prev.solicitantes.filter(s => s !== nome),
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Solicitante removido",
      description: `${nome} foi removido da lista.`,
    });
  }, []);

  const removeEmpresa = useCallback((empresa: string) => {
    setSavedData(prev => ({
      ...prev,
      empresas: prev.empresas.filter(e => e !== empresa),
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Empresa removida",
      description: `${empresa} foi removida da lista.`,
    });
  }, []);

  const removeObservacao = useCallback((observacao: string) => {
    setSavedData(prev => ({
      ...prev,
      observacoes: prev.observacoes.filter(o => o !== observacao),
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Observação removida",
      description: "Observação foi removida da lista.",
    });
  }, []);

  const exportData = useCallback(() => {
    try {
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
      a.download = `backup_dados_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup exportado",
        description: "Seus dados foram baixados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    }
  }, [savedData]);

  const importData = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nenhum arquivo selecionado'));
        return;
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo JSON válido.",
          variant: "destructive",
        });
        reject(new Error('Tipo de arquivo inválido'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== 'string') {
            throw new Error('Erro ao ler arquivo');
          }

          const importedData = JSON.parse(result);
          
          // Validar estrutura básica do arquivo
          if (typeof importedData !== 'object' || importedData === null) {
            throw new Error('Estrutura de arquivo inválida - não é um objeto');
          }

          // Garantir que os arrays existam, mesmo que vazios
          const validatedData = {
            solicitantes: Array.isArray(importedData.solicitantes) ? importedData.solicitantes : [],
            empresas: Array.isArray(importedData.empresas) ? importedData.empresas : [],
            observacoes: Array.isArray(importedData.observacoes) ? importedData.observacoes : [],
            createdAt: importedData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          setSavedData(validatedData);

          toast({
            title: "Dados importados",
            description: `Importados: ${validatedData.solicitantes.length} solicitantes, ${validatedData.empresas.length} empresas, ${validatedData.observacoes.length} observações.`,
          });
          
          resolve();
        } catch (error) {
          console.error('Erro ao importar dados:', error);
          toast({
            title: "Erro ao importar dados",
            description: "O arquivo selecionado não é um JSON válido ou está corrompido.",
            variant: "destructive",
          });
          reject(error);
        }
      };

      reader.onerror = () => {
        const error = new Error('Erro ao ler o arquivo');
        toast({
          title: "Erro de leitura",
          description: "Não foi possível ler o arquivo selecionado.",
          variant: "destructive",
        });
        reject(error);
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
