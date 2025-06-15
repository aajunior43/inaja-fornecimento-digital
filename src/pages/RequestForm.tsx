
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText } from 'lucide-react';
import { useSystemConfig } from '@/contexts/SystemConfigContext';
import { useToast } from '@/hooks/use-toast';

const RequestForm = () => {
  const navigate = useNavigate();
  const { config } = useSystemConfig();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    orderer: '',
    supplier: '',
    description: '',
    value: '',
    justification: '',
    urgency: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderer || !formData.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Solicitação criada",
      description: "Sua solicitação foi registrada com sucesso.",
    });
    
    // Aqui você pode adicionar a lógica para salvar a solicitação
    console.log('Dados da solicitação:', formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Nova Solicitação
                </h1>
                <p className="text-sm text-gray-500">
                  Preencha os dados da solicitação
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ordenador de Despesa */}
                <div>
                  <Label htmlFor="orderer">Ordenador de Despesa *</Label>
                  <Select value={formData.orderer} onValueChange={(value) => handleChange('orderer', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ordenador" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.orderers.length > 0 ? (
                        config.orderers.map((orderer) => (
                          <SelectItem key={orderer.id} value={orderer.id}>
                            {orderer.name} - {orderer.position}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          Nenhum ordenador cadastrado
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fornecedor */}
                <div>
                  <Label htmlFor="supplier">Fornecedor</Label>
                  <Select value={formData.supplier} onValueChange={(value) => handleChange('supplier', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.suppliers.length > 0 ? (
                        config.suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          Nenhum fornecedor cadastrado
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Valor */}
                <div>
                  <Label htmlFor="value">Valor Estimado</Label>
                  <Input
                    id="value"
                    type="text"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    placeholder="R$ 0,00"
                  />
                </div>

                {/* Urgência */}
                <div>
                  <Label htmlFor="urgency">Urgência</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="description">Descrição da Solicitação *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente o que está sendo solicitado"
                  rows={4}
                />
              </div>

              {/* Justificativa */}
              <div>
                <Label htmlFor="justification">Justificativa</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => handleChange('justification', e.target.value)}
                  placeholder="Justifique a necessidade desta solicitação"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Criar Solicitação
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestForm;
