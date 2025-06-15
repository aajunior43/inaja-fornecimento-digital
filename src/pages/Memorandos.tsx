
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
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface MemorandoData {
  numero: string;
  de: string;
  para: string;
  data: string;
  assunto: string;
  prioridade: string;
  conteudo: string;
  observacoes: string;
}

const Memorandos = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MemorandoData>({
    numero: '',
    de: '',
    para: '',
    data: new Date().toISOString().split('T')[0],
    assunto: '',
    prioridade: 'Normal',
    conteudo: '',
    observacoes: ''
  });

  const updateField = (field: keyof MemorandoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      numero: '',
      de: '',
      para: '',
      data: new Date().toISOString().split('T')[0],
      assunto: '',
      prioridade: 'Normal',
      conteudo: '',
      observacoes: ''
    });
    toast.success("Formulário limpo com sucesso!");
  };

  const exportToPDF = () => {
    if (!formData.numero || !formData.de || !formData.para || !formData.assunto || !formData.conteudo) {
      toast.error("Preencha os campos obrigatórios antes de exportar!");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('PREFEITURA MUNICIPAL', 105, 20, { align: 'center' });
    doc.text('MEMORANDO INTERNO', 105, 30, { align: 'center' });
    
    // Linha
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Dados do memorando
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    let yPos = 50;
    doc.text(`Memorando nº: ${formData.numero}`, 20, yPos);
    yPos += 10;
    doc.text(`De: ${formData.de}`, 20, yPos);
    yPos += 10;
    doc.text(`Para: ${formData.para}`, 20, yPos);
    yPos += 10;
    doc.text(`Data: ${new Date(formData.data).toLocaleDateString('pt-BR')}`, 20, yPos);
    yPos += 10;
    doc.text(`Prioridade: ${formData.prioridade}`, 20, yPos);
    yPos += 15;
    
    doc.setFont(undefined, 'bold');
    doc.text(`Assunto: ${formData.assunto}`, 20, yPos);
    yPos += 15;
    
    doc.setFont(undefined, 'normal');
    const splitContent = doc.splitTextToSize(formData.conteudo, 170);
    doc.text(splitContent, 20, yPos);
    
    if (formData.observacoes) {
      yPos += splitContent.length * 5 + 15;
      doc.setFont(undefined, 'bold');
      doc.text('Observações:', 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      const splitObs = doc.splitTextToSize(formData.observacoes, 170);
      doc.text(splitObs, 20, yPos);
    }
    
    doc.save(`memorando_${formData.numero || 'sem_numero'}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportToWord = async () => {
    if (!formData.numero || !formData.de || !formData.para || !formData.assunto || !formData.conteudo) {
      toast.error("Preencha os campos obrigatórios antes de exportar!");
      return;
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "PREFEITURA MUNICIPAL",
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "MEMORANDO INTERNO",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Memorando nº: ${formData.numero}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `De: ${formData.de}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Para: ${formData.para}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Data: ${new Date(formData.data).toLocaleDateString('pt-BR')}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Prioridade: ${formData.prioridade}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Assunto: ${formData.assunto}`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formData.conteudo,
                size: 24,
              }),
            ],
            spacing: { after: 300 },
          }),
        ],
      }],
    });

    if (formData.observacoes) {
      doc.sections[0].children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Observações:",
              bold: true,
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: formData.observacoes,
              size: 24,
            }),
          ],
        })
      );
    }

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `memorando_${formData.numero || 'sem_numero'}.docx`);
    toast.success("Documento Word exportado com sucesso!");
  };

  const exportToExcel = () => {
    if (!formData.numero || !formData.de || !formData.para || !formData.assunto || !formData.conteudo) {
      toast.error("Preencha os campos obrigatórios antes de exportar!");
      return;
    }

    const data = [
      ['MEMORANDO INTERNO'],
      [''],
      ['Número', formData.numero],
      ['De', formData.de],
      ['Para', formData.para],
      ['Data', new Date(formData.data).toLocaleDateString('pt-BR')],
      ['Prioridade', formData.prioridade],
      ['Assunto', formData.assunto],
      [''],
      ['Conteúdo'],
      [formData.conteudo],
      [''],
      ['Observações'],
      [formData.observacoes || 'Não há observações']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Memorando');
    XLSX.writeFile(wb, `memorando_${formData.numero || 'sem_numero'}.xlsx`);
    toast.success("Planilha Excel exportada com sucesso!");
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
                  Sistema de Memorandos Internos
                </h1>
                <p className="text-blue-200 text-sm sm:text-base">
                  Prefeitura Municipal - Comunicação Interna
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
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
                      Número do Memorando *
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
                      De (Remetente/Setor) *
                    </label>
                    <Input
                      value={formData.de}
                      onChange={(e) => updateField('de', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Ex: Secretaria de Administração"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Para (Destinatário/Setor) *
                    </label>
                    <Input
                      value={formData.para}
                      onChange={(e) => updateField('para', e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                      placeholder="Ex: Secretaria de Obras"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Prioridade
                    </label>
                    <Select value={formData.prioridade} onValueChange={(value) => updateField('prioridade', value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                        <SelectItem value="Muito Urgente">Muito Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Assunto *
                  </label>
                  <Input
                    value={formData.assunto}
                    onChange={(e) => updateField('assunto', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Descreva o assunto do memorando"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conteúdo do Memorando *
                  </label>
                  <Textarea
                    value={formData.conteudo}
                    onChange={(e) => updateField('conteudo', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white min-h-[150px]"
                    placeholder="Digite aqui o conteúdo do memorando..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Observações (Opcional)
                  </label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => updateField('observacoes', e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Observações adicionais..."
                  />
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
                  Exportar Memorando
                </h3>
                <div className="space-y-3">
                  <Button 
                    onClick={exportToPDF} 
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    onClick={exportToWord} 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar Word
                  </Button>
                  <Button 
                    onClick={exportToExcel} 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar Excel
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
                    <div>MEMORANDO INTERNO</div>
                  </div>
                  <div><strong>Memorando nº:</strong> {formData.numero || '[Número]'}</div>
                  <div><strong>De:</strong> {formData.de || '[Remetente]'}</div>
                  <div><strong>Para:</strong> {formData.para || '[Destinatário]'}</div>
                  <div><strong>Data:</strong> {formData.data ? new Date(formData.data).toLocaleDateString('pt-BR') : '[Data]'}</div>
                  <div><strong>Prioridade:</strong> {formData.prioridade}</div>
                  <div className="mt-4"><strong>Assunto:</strong> {formData.assunto || '[Assunto]'}</div>
                  <div className="mt-4">
                    <div className="whitespace-pre-wrap">{formData.conteudo || '[Conteúdo do memorando]'}</div>
                  </div>
                  {formData.observacoes && (
                    <div className="mt-4">
                      <strong>Observações:</strong>
                      <div className="whitespace-pre-wrap">{formData.observacoes}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memorandos;
