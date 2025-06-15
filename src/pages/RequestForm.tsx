
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Send } from 'lucide-react';
import { useSystemConfig } from '@/contexts/SystemConfigContext';
import { useToast } from '@/hooks/use-toast';

const RequestForm = () => {
  const { config } = useSystemConfig();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    requestType: '',
    description: '',
    justification: '',
    ordererId: '',
    supplierId: '',
    value: '',
    department: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedOrderer = config.orderers.find(o => o.id === formData.ordererId);
    const selectedSupplier = config.suppliers.find(s => s.id === formData.supplierId);
    
    console.log('Solicitação criada:', {
      ...formData,
      orderer: selectedOrderer,
      supplier: selectedSupplier,
      municipality: config.municipalityName
    });
    
    toast({
      title: "Solicitação enviada",
      description: "Sua solicitação foi enviada com sucesso para análise.",
    });
    
    // Reset form
    setFormData({
      requestType: '',
      description: '',
      justification: '',
      ordererId: '',
      supplierId: '',
      value: '',
      department: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {config.municipalityName}
          </h1>
          <p className="text-gray-600">{config.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nova Solicitação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requestType">Tipo de Solicitação</Label>
                  <Select value={formData.requestType} onValueChange={(value) => handleChange('requestType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compra">Compra</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Secretaria</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Ex: Educação, Saúde"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="orderer">Ordenador de Despesa</Label>
                  {config.orderers.length > 0 ? (
                    <Select value={formData.ordererId} onValueChange={(value) => handleChange('ordererId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ordenador" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.orderers.map((orderer) => (
                          <SelectItem key={orderer.id} value={orderer.id}>
                            {orderer.name} - {orderer.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground flex items-center">
                      Nenhum ordenador cadastrado
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="supplier">Fornecedor</Label>
                  {config.suppliers.length > 0 ? (
                    <Select value={formData.supplierId} onValueChange={(value) => handleChange('supplierId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.cnpj}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground flex items-center">
                      Nenhum fornecedor cadastrado
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="value">Valor Estimado (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição da Solicitação</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente o que está sendo solicitado"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="justification">Justificativa</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => handleChange('justification', e.target.value)}
                  placeholder="Justifique a necessidade desta solicitação"
                  rows={3}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestForm;
