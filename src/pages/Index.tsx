import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Download, Trash2, Home, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SolicitationData {
  numero: string;
  data: string;
  setor: string;
  solicitante: string;
  descricao: string;
  status: string;
  observacoes: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SolicitationData>({
    numero: '',
    data: new Date().toISOString().split('T')[0],
    setor: '',
    solicitante: '',
    descricao: '',
    status: 'Pendente',
    observacoes: ''
  });

  const updateField = (field: keyof SolicitationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      numero: '',
      data: new Date().toISOString().split('T')[0],
      setor: '',
      solicitante: '',
      descricao: '',
      status: 'Pendente',
      observacoes: ''
    });
    toast.success("Formulário limpo com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/95 to-blue-900/95 backdrop-blur-sm border-b border-slate-700/50 shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Sistema de Solicitações
                </h1>
                <p className="text-blue-200 text-sm sm:text-base">
                  Prefeitura Municipal - Gestão Digital
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/memorandos')} 
                variant="outline" 
                className="bg-green-700/50 border-green-600 text-white hover:bg-green-600/50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Memorandos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Número da Solicitação
                    </label>
                    <Input
                      value={formData.numero}
                      onChange={(e) => updateField('numero', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Ex: 001/2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) => updateField('data', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Setor
                    </label>
                    <Input
                      value={formData.setor}
                      onChange={(e) => updateField('setor', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Ex: Secretaria de Administração"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Solicitante
                    </label>
                    <Input
                      value={formData.solicitante}
                      onChange={(e) => updateField('solicitante', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Nome do solicitante"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição da Solicitação
                  </label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => updateField('descricao', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white min-h-[150px]"
                    placeholder="Descreva detalhadamente a solicitação..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Observações
                  </label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => updateField('observacoes', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Ações */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Ações
                </h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => { /* Implementar função de salvar/enviar solicitação */ }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Salvar Solicitação
                  </Button>
                  <Separator className="bg-gradient-to-r from-slate-600/50 to-slate-500/50" />
                  <Button 
                    onClick={clearForm} 
                    variant="destructive" 
                    className="w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Formulário
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                <div className="bg-white p-4 rounded-lg text-black text-sm space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-center font-bold mb-4">
                    <div>PREFEITURA MUNICIPAL</div>
                    <div>SOLICITAÇÃO</div>
                  </div>
                  <div><strong>Número:</strong> {formData.numero || '[Número]'}</div>
                  <div><strong>Data:</strong> {formData.data ? new Date(formData.data).toLocaleDateString('pt-BR') : '[Data]'}</div>
                  <div><strong>Setor:</strong> {formData.setor || '[Setor]'}</div>
                  <div><strong>Solicitante:</strong> {formData.solicitante || '[Solicitante]'}</div>
                  <div className="mt-4"><strong>Descrição:</strong></div>
                  <div className="mt-4">
                    <div className="whitespace-pre-wrap">{formData.descricao || '[Descrição da solicitação]'}</div>
                  </div>
                  {formData.observacoes && (
                    <div className="mt-4">
                      <strong>Observações:</strong>
                      <div className="whitespace-pre-wrap">{formData.observacoes}</div>
                    </div>
                  )}
                  <div className="mt-4"><strong>Status:</strong> {formData.status}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
