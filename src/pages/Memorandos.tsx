
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Memorandos = () => {
  const [formData, setFormData] = useState({
    numero: '',
    de: '',
    para: '',
    assunto: '',
    conteudo: '',
    prioridade: 'Normal',
    observacoes: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const addBrasaoToPDF = async (doc: jsPDF) => {
    try {
      // Carrega o brasão da prefeitura
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Adiciona o brasão no canto superior esquerdo
          doc.addImage(img, 'PNG', 20, 15, 25, 25);
          resolve(true);
        };
        img.onerror = () => {
          console.log('Erro ao carregar brasão, continuando sem imagem');
          resolve(false);
        };
        img.src = '/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png';
      });
    } catch (error) {
      console.log('Erro ao processar brasão:', error);
      return false;
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Adiciona o brasão da prefeitura
    await addBrasaoToPDF(doc);

    // Header oficial com brasão
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PREFEITURA MUNICIPAL', 55, 25);
    doc.setFontSize(12);
    doc.text('SECRETARIA DE ADMINISTRAÇÃO', 55, 32);
    doc.setFontSize(10);
    doc.text('Rua Principal, 123 - Centro - CEP: 12345-678', 55, 38);
    
    // Título do documento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEMORANDO INTERNO', pageWidth / 2, 55, { align: 'center' });

    // Separador
    doc.setLineWidth(0.5);
    doc.line(20, 65, pageWidth - 20, 65);

    // Conteúdo do memorando
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 75;
    const lineHeight = 8;

    doc.text(`MEMORANDO Nº: ${formData.numero || 'N/A'}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`DE: ${formData.de}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`PARA: ${formData.para}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`DATA: ${getCurrentDate()}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`PRIORIDADE: ${formData.prioridade}`, 20, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFont('helvetica', 'bold');
    doc.text(`ASSUNTO: ${formData.assunto}`, 20, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFont('helvetica', 'normal');
    if (formData.conteudo) {
      const contentLines = doc.splitTextToSize(formData.conteudo, pageWidth - 40);
      doc.text(contentLines, 20, yPosition);
      yPosition += contentLines.length * lineHeight + 10;
    }

    if (formData.observacoes) {
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', 20, yPosition);
      yPosition += lineHeight;
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(formData.observacoes, pageWidth - 40);
      doc.text(obsLines, 20, yPosition);
      yPosition += obsLines.length * lineHeight + 10;
    }

    // Rodapé oficial
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento foi gerado automaticamente pelo Sistema de Memorandos da Prefeitura Municipal', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`memorando_${formData.numero || 'sem_numero'}.pdf`);
  };

  const generateWord = () => {
    const content = `
PREFEITURA MUNICIPAL
SECRETARIA DE ADMINISTRAÇÃO
Rua Principal, 123 - Centro - CEP: 12345-678

MEMORANDO INTERNO

MEMORANDO Nº: ${formData.numero || 'N/A'}
DE: ${formData.de}
PARA: ${formData.para}
DATA: ${getCurrentDate()}
PRIORIDADE: ${formData.prioridade}

ASSUNTO: ${formData.assunto}

${formData.conteudo}

${formData.observacoes ? `OBSERVAÇÕES:\n${formData.observacoes}` : ''}

___________________________________________
Este documento foi gerado automaticamente pelo Sistema de Memorandos da Prefeitura Municipal
Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    saveAs(blob, `memorando_${formData.numero || 'sem_numero'}.doc`);
  };

  const generateExcel = () => {
    const data = [
      ['PREFEITURA MUNICIPAL'],
      ['SECRETARIA DE ADMINISTRAÇÃO'],
      ['Rua Principal, 123 - Centro - CEP: 12345-678'],
      [''],
      ['MEMORANDO INTERNO'],
      [''],
      ['Número', formData.numero || 'N/A'],
      ['De', formData.de],
      ['Para', formData.para],
      ['Data', getCurrentDate()],
      ['Prioridade', formData.prioridade],
      ['Assunto', formData.assunto],
      [''],
      ['Conteúdo', formData.conteudo],
      [''],
      ['Observações', formData.observacoes],
      [''],
      ['Este documento foi gerado automaticamente pelo Sistema de Memorandos da Prefeitura Municipal'],
      ['Gerado em:', new Date().toLocaleString('pt-BR')]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Memorando');
    XLSX.writeFile(wb, `memorando_${formData.numero || 'sem_numero'}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
              alt="Prefeitura" 
              className="w-16 h-16"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Sistema de Memorandos Internos</h1>
              <p className="text-purple-200">Prefeitura Municipal</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link to="/">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-purple-600" />
                Dados do Memorando
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Número do Memorando
                  </label>
                  <Input
                    placeholder="Ex: 001/2024"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Prioridade
                  </label>
                  <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                    <SelectTrigger className="border-slate-300">
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
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  De (Remetente/Setor)
                </label>
                <Input
                  placeholder="Ex: Secretaria de Administração"
                  value={formData.de}
                  onChange={(e) => handleInputChange('de', e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Para (Destinatário/Setor)
                </label>
                <Input
                  placeholder="Ex: Secretaria de Obras"
                  value={formData.para}
                  onChange={(e) => handleInputChange('para', e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Assunto
                </label>
                <Input
                  placeholder="Assunto do memorando"
                  value={formData.assunto}
                  onChange={(e) => handleInputChange('assunto', e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Conteúdo do Memorando
                </label>
                <Textarea
                  placeholder="Digite o conteúdo do memorando..."
                  value={formData.conteudo}
                  onChange={(e) => handleInputChange('conteudo', e.target.value)}
                  className="border-slate-300 min-h-32"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Observações (Opcional)
                </label>
                <Textarea
                  placeholder="Observações adicionais..."
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  className="border-slate-300 min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview e Ações */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-slate-800">
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Visualização
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                  </Button>
                </CardTitle>
              </CardHeader>
              {showPreview && (
                <CardContent>
                  <div className="bg-white p-6 border rounded-lg text-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
                        alt="Brasão" 
                        className="w-12 h-12"
                      />
                      <div>
                        <h3 className="font-bold text-lg">PREFEITURA MUNICIPAL</h3>
                        <p className="text-sm">SECRETARIA DE ADMINISTRAÇÃO</p>
                        <p className="text-xs text-gray-600">Rua Principal, 123 - Centro - CEP: 12345-678</p>
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h4 className="font-bold">MEMORANDO INTERNO</h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p><strong>MEMORANDO Nº:</strong> {formData.numero || 'N/A'}</p>
                      <p><strong>DE:</strong> {formData.de || 'N/A'}</p>
                      <p><strong>PARA:</strong> {formData.para || 'N/A'}</p>
                      <p><strong>DATA:</strong> {getCurrentDate()}</p>
                      <p><strong>PRIORIDADE:</strong> <Badge variant={formData.prioridade === 'Muito Urgente' ? 'destructive' : formData.prioridade === 'Urgente' ? 'default' : 'secondary'}>{formData.prioridade}</Badge></p>
                    </div>

                    <Separator className="my-4" />

                    <div className="mb-4">
                      <p><strong>ASSUNTO:</strong> {formData.assunto || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <p className="whitespace-pre-wrap">{formData.conteudo || 'Conteúdo do memorando...'}</p>
                    </div>

                    {formData.observacoes && (
                      <div>
                        <p><strong>OBSERVAÇÕES:</strong></p>
                        <p className="whitespace-pre-wrap">{formData.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Download className="w-5 h-5 text-purple-600" />
                  Exportar Memorando
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button
                    onClick={generatePDF}
                    className="bg-red-600 hover:bg-red-700 text-white justify-start"
                    disabled={!formData.de || !formData.para || !formData.assunto}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                  <Button
                    onClick={generateWord}
                    className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    disabled={!formData.de || !formData.para || !formData.assunto}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar Word
                  </Button>
                  <Button
                    onClick={generateExcel}
                    className="bg-green-600 hover:bg-green-700 text-white justify-start"
                    disabled={!formData.de || !formData.para || !formData.assunto}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar Excel
                  </Button>
                </div>
                
                {(!formData.de || !formData.para || !formData.assunto) && (
                  <p className="text-sm text-slate-500 mt-3">
                    Preencha os campos obrigatórios para habilitar a exportação
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memorandos;
