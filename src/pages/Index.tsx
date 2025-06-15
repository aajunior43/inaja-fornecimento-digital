import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import FormHeader from '@/components/FormHeader';
import ItemsTable, { Item } from '@/components/ItemsTable';
import ExportActions from '@/components/ExportActions';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  const [formData, setFormData] = useState({
    nomeSolicitante: '',
    nomeEmpresa: '',
    dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
    observacoes: ''
  });

  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      item: '',
      descricao: '',
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: 0
    }
  ]);

  const [showPreview, setShowPreview] = useState(false);

  const clearForm = () => {
    setFormData({
      nomeSolicitante: '',
      nomeEmpresa: '',
      dataSolicitacao: format(new Date(), 'yyyy-MM-dd'),
      observacoes: ''
    });
    setItems([
      {
        id: '1',
        item: '',
        descricao: '',
        quantidade: 0,
        valorUnitario: 0,
        valorTotal: 0
      }
    ]);
    toast({
      title: "Formulário limpo",
      description: "Todos os campos foram resetados."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4 md:p-6 transition-colors duration-300">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
          <FormHeader formData={formData} setFormData={setFormData} />
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
          <ItemsTable items={items} setItems={setItems} />
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold">Ações do Documento</h3>
            <ExportActions 
              formData={formData}
              items={items}
              setShowPreview={setShowPreview}
              clearForm={clearForm}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
