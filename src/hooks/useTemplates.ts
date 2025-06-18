
import { useState, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

export interface TemplateData {
  id: string;
  name: string;
  formData: {
    nomeSolicitante: string;
    nomeEmpresa: string;
    dataSolicitacao: string;
    observacoes: string;
  };
  items: Array<{
    id: string;
    item: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  createdAt: string;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<TemplateData[]>([]);

  const saveTemplate = useCallback((templateName: string, formData: any, items: any[]) => {
    const template: TemplateData = {
      id: Date.now().toString(),
      name: templateName,
      formData,
      items,
      createdAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_${templateName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTemplates(prev => [...prev, template]);
    
    toast({
      title: "Modelo salvo",
      description: `O modelo "${templateName}" foi baixado com sucesso!`,
    });
  }, []);

  const loadTemplate = useCallback((file: File): Promise<TemplateData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target?.result as string);
          resolve(template);
          toast({
            title: "Modelo carregado",
            description: `O modelo "${template.name}" foi carregado com sucesso!`,
          });
        } catch (error) {
          reject(new Error('Arquivo JSON inválido'));
          toast({
            title: "Erro ao carregar modelo",
            description: "O arquivo selecionado não é um modelo válido.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    templates,
    saveTemplate,
    loadTemplate
  };
};
