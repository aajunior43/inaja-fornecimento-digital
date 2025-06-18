
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, FileText } from "lucide-react";
import { useTemplates, TemplateData } from "@/hooks/useTemplates";

interface TemplateManagerProps {
  formData: any;
  items: any[];
  onLoadTemplate: (template: TemplateData) => void;
}

export const TemplateManager = ({ formData, items, onLoadTemplate }: TemplateManagerProps) => {
  const [templateName, setTemplateName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveTemplate, loadTemplate } = useTemplates();

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      return;
    }
    saveTemplate(templateName, formData, items);
    setTemplateName('');
  };

  const handleLoadTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const template = await loadTemplate(file);
      onLoadTemplate(template);
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
    }

    // Resetar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-400 text-sm flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Modelos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-slate-300 text-xs">
              Nome do Modelo
            </Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Modelo Padrão"
              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm"
            />
          </div>
          <Button
            onClick={handleSaveTemplate}
            disabled={!templateName.trim()}
            size="sm"
            className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Modelo
          </Button>
        </div>

        <Separator className="bg-slate-600/50" />

        <div className="space-y-2">
          <Label className="text-slate-300 text-xs">Carregar Modelo</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadTemplate}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Carregar Modelo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
