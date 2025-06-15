import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Calendar, User, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const Index = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    data: '',
    mensagem: '',
    prioridade: 'Normal'
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
    doc.text('SOLICITAÇÃO DE SERVIÇO', pageWidth / 2, 55, { align: 'center' });

    // Separador
    doc.setLineWidth(0.5);
    doc.line(20, 65, pageWidth - 20, 65);

    // Conteúdo da solicitação
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 75;
    const lineHeight = 8;

    doc.text(`DATA: ${getCurrentDate()}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`PRIORIDADE: ${formData.prioridade}`, 20, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFont('helvetica', 'bold');
    doc.text(`DADOS DO SOLICITANTE`, 20, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFont('helvetica', 'normal');
    doc.text(`NOME: ${formData.nome || 'N/A'}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`EMAIL: ${formData.email}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`TELEFONE: ${formData.telefone}`, 20, yPosition);
    yPosition += lineHeight;
    
    doc.text(`ENDEREÇO: ${formData.endereco}`, 20, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFont('helvetica', 'bold');
    doc.text(`MENSAGEM:`, 20, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFont('helvetica', 'normal');
    if (formData.mensagem) {
      const contentLines = doc.splitTextToSize(formData.mensagem, pageWidth - 40);
      doc.text(contentLines, 20, yPosition);
      yPosition += contentLines.length * lineHeight + 10;
    }

    // Rodapé oficial
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento foi gerado automaticamente pelo Sistema de Solicitações da Prefeitura Municipal', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, footerY + 5, { align: 'center' });

    doc.save(`solicitacao_${formData.nome || 'sem_nome'}.pdf`);
  };

  const generateWord = () => {
    const content = `
PREFEITURA MUNICIPAL
SECRETARIA DE ADMINISTRAÇÃO
Rua Principal, 123 - Centro - CEP: 12345-678

SOLICITAÇÃO DE SERVIÇO

DATA: ${getCurrentDate()}
PRIORIDADE: ${formData.prioridade}

DADOS DO SOLICITANTE
NOME: ${formData.nome || 'N/A'}
EMAIL: ${formData.email}
TELEFONE: ${formData.telefone}
ENDEREÇO: ${formData.endereco}

MENSAGEM:
${formData.mensagem}

___________________________________________
Este documento foi gerado automaticamente pelo Sistema de Solicitações da Prefeitura Municipal
Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    saveAs(blob, `solicitacao_${formData.nome || 'sem_nome'}.doc`);
  };

  const generateExcel = () => {
    const data = [
      ['PREFEITURA MUNICIPAL'],
      ['SECRETARIA DE ADMINISTRAÇÃO'],
      ['Rua Principal, 123 - Centro - CEP: 12345-678'],
      [''],
      ['SOLICITAÇÃO DE SERVIÇO'],
      [''],
      ['Data', getCurrentDate()],
      ['Prioridade', formData.prioridade],
      [''],
      ['Dados do Solicitante'],
      ['Nome', formData.nome || 'N/A'],
      ['Email', formData.email],
      ['Telefone', formData.telefone],
      ['Endereço', formData.endereco],
      [''],
      ['Mensagem', formData.mensagem],
      [''],
      ['Este documento foi gerado automaticamente pelo Sistema de Solicitações da Prefeitura Municipal'],
      ['Gerado em:', new Date().toLocaleString('pt-BR')]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Solicitação');
    XLSX.writeFile(wb, `solicitacao_${formData.nome || 'sem_nome'}.xlsx`);
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
              <h1 className="text-3xl font-bold text-white">Sistema de Solicitações</h1>
              <p className="text-purple-200">Prefeitura Municipal</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link to="/memorandos">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                <MessageSquare className="w-4 h-4 mr-2" />
                Memorandos Internos
              </Button>
            </Link>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
              Sistema Ativo
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-purple-600" />
                Dados da Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Nome Completo
                  </label>
                  <Input
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
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
                  Email
                </label>
                <Input
                  placeholder="seuemail@email.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Telefone
                </label>
                <Input
                  placeholder="(99) 99999-9999"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Endereço
                </label>
                <Input
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  className="border-slate-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Mensagem
                </label>
                <Textarea
                  placeholder="Descreva sua solicitação..."
                  value={formData.mensagem}
                  onChange={(e) => handleInputChange('mensagem', e.target.value)}
                  className="border-slate-300 min-h-32"
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
                      <h4 className="font-bold">SOLICITAÇÃO DE SERVIÇO</h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p><strong>DATA:</strong> {getCurrentDate()}</p>
                      <p><strong>PRIORIDADE:</strong> <Badge variant={formData.prioridade === 'Muito Urgente' ? 'destructive' : formData.prioridade === 'Urgente' ? 'default' : 'secondary'}>{formData.prioridade}</Badge></p>
                    </div>

                    <Separator className="my-4" />

                    <div className="mb-4">
                      <p><strong>DADOS DO SOLICITANTE</strong></p>
                      <p><strong>NOME:</strong> {formData.nome || 'N/A'}</p>
                      <p><strong>EMAIL:</strong> {formData.email || 'N/A'}</p>
                      <p><strong>TELEFONE:</strong> {formData.telefone || 'N/A'}</p>
                      <p><strong>ENDEREÇO:</strong> {formData.endereco || 'N/A'}</p>
                    </div>

                    <div className="mb-4">
                      <p className="whitespace-pre-wrap">{formData.mensagem || 'Mensagem do solicitante...'}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Download className="w-5 h-5 text-purple-600" />
                  Exportar Solicitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button
                    onClick={generatePDF}
                    className="bg-red-600 hover:bg-red-700 text-white justify-start"
                    disabled={!formData.nome || !formData.email || !formData.telefone || !formData.endereco}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                  <Button
                    onClick={generateWord}
                    className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                    disabled={!formData.nome || !formData.email || !formData.telefone || !formData.endereco}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar Word
                  </Button>
                  <Button
                    onClick={generateExcel}
                    className="bg-green-600 hover:bg-green-700 text-white justify-start"
                    disabled={!formData.nome || !formData.email || !formData.telefone || !formData.endereco}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar Excel
                  </Button>
                </div>
                
                {(!formData.nome || !formData.email || !formData.telefone || !formData.endereco) && (
                  <p className="text-sm text-slate-500 mt-3">
                    Preencha todos os campos para habilitar a exportação
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

export default Index;
