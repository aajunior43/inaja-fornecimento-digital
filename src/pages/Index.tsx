
import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import FormHeader from '@/components/FormHeader';
import ItemsTable, { Item } from '@/components/ItemsTable';
import ExportActions from '@/components/ExportActions';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <FormHeader formData={formData} setFormData={setFormData} />
        
        <Separator className="my-6" />
        
        <ItemsTable items={items} setItems={setItems} />
        
        <Separator className="my-6" />
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ExportActions 
            formData={formData}
            items={items}
            setShowPreview={setShowPreview}
            clearForm={clearForm}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
