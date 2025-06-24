
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Upload, 
  Download, 
  Database, 
  Plus, 
  X, 
  User, 
  Building2, 
  FileText 
} from "lucide-react";
import { useDataManager } from "@/hooks/useDataManager";

interface DataManagerProps {
  onSelectSolicitante: (nome: string) => void;
  onSelectEmpresa: (empresa: string) => void;
  onSelectObservacao: (observacao: string) => void;
  currentSolicitante?: string;
  currentEmpresa?: string;
  currentObservacao?: string;
}

export const DataManager = ({ 
  onSelectSolicitante, 
  onSelectEmpresa, 
  onSelectObservacao,
  currentSolicitante,
  currentEmpresa,
  currentObservacao
}: DataManagerProps) => {
  const [newSolicitante, setNewSolicitante] = useState('');
  const [newEmpresa, setNewEmpresa] = useState('');
  const [newObservacao, setNewObservacao] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    savedData,
    addSolicitante,
    addEmpresa,
    addObservacao,
    removeSolicitante,
    removeEmpresa,
    removeObservacao,
    exportData,
    importData
  } = useDataManager();

  const handleAddSolicitante = () => {
    if (newSolicitante.trim()) {
      addSolicitante(newSolicitante);
      setNewSolicitante('');
    }
  };

  const handleAddEmpresa = () => {
    if (newEmpresa.trim()) {
      addEmpresa(newEmpresa);
      setNewEmpresa('');
    }
  };

  const handleAddObservacao = () => {
    if (newObservacao.trim()) {
      addObservacao(newObservacao);
      setNewObservacao('');
    }
  };

  const handleSaveCurrentData = () => {
    if (currentSolicitante?.trim()) {
      addSolicitante(currentSolicitante);
    }
    if (currentEmpresa?.trim()) {
      addEmpresa(currentEmpresa);
    }
    if (currentObservacao?.trim()) {
      addObservacao(currentObservacao);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-3 border-b border-slate-700/50">
        <CardTitle className="text-cyan-400 text-sm flex items-center">
          <Database className="mr-2 h-4 w-4" />
          Gerenciador de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4">
        {/* Ações principais */}
        <div className="space-y-3">
          <Button
            onClick={handleSaveCurrentData}
            size="sm"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Dados Atuais
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={exportData}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="mr-2 h-3 w-3" />
              Exportar
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Upload className="mr-2 h-3 w-3" />
              Importar
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-600/50" />

        {/* Solicitantes */}
        <div className="space-y-3">
          <Label className="text-slate-300 text-xs flex items-center">
            <User className="w-3 h-3 mr-2 text-cyan-400" />
            Solicitantes Salvos
          </Label>
          
          <div className="flex space-x-2">
            <Input
              value={newSolicitante}
              onChange={(e) => setNewSolicitante(e.target.value)}
              placeholder="Novo solicitante"
              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSolicitante()}
            />
            <Button
              onClick={handleAddSolicitante}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 px-3"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <ScrollArea className="h-24 w-full">
            <div className="space-y-1">
              {savedData.solicitantes.map((solicitante) => (
                <div key={solicitante} className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-cyan-600 text-xs flex-1 mr-2 justify-start"
                    onClick={() => onSelectSolicitante(solicitante)}
                  >
                    {solicitante}
                  </Badge>
                  <Button
                    onClick={() => removeSolicitante(solicitante)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-slate-600/50" />

        {/* Empresas */}
        <div className="space-y-3">
          <Label className="text-slate-300 text-xs flex items-center">
            <Building2 className="w-3 h-3 mr-2 text-cyan-400" />
            Empresas Salvas
          </Label>
          
          <div className="flex space-x-2">
            <Input
              value={newEmpresa}
              onChange={(e) => setNewEmpresa(e.target.value)}
              placeholder="Nova empresa"
              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmpresa()}
            />
            <Button
              onClick={handleAddEmpresa}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 px-3"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <ScrollArea className="h-24 w-full">
            <div className="space-y-1">
              {savedData.empresas.map((empresa) => (
                <div key={empresa} className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-cyan-600 text-xs flex-1 mr-2 justify-start"
                    onClick={() => onSelectEmpresa(empresa)}
                  >
                    {empresa}
                  </Badge>
                  <Button
                    onClick={() => removeEmpresa(empresa)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-slate-600/50" />

        {/* Observações */}
        <div className="space-y-3">
          <Label className="text-slate-300 text-xs flex items-center">
            <FileText className="w-3 h-3 mr-2 text-cyan-400" />
            Observações Salvas
          </Label>
          
          <div className="flex space-x-2">
            <Input
              value={newObservacao}
              onChange={(e) => setNewObservacao(e.target.value)}
              placeholder="Nova observação"
              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAddObservacao()}
            />
            <Button
              onClick={handleAddObservacao}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 px-3"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <ScrollArea className="h-24 w-full">
            <div className="space-y-1">
              {savedData.observacoes.map((observacao) => (
                <div key={observacao} className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-cyan-600 text-xs flex-1 mr-2 justify-start"
                    onClick={() => onSelectObservacao(observacao)}
                  >
                    {observacao.length > 30 ? `${observacao.substring(0, 30)}...` : observacao}
                  </Badge>
                  <Button
                    onClick={() => removeObservacao(observacao)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
