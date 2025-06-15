
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, FileText, Download, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface Item {
  id: string;
  item: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface FormData {
  nomeSolicitante: string;
  nomeEmpresa: string;
  dataSolicitacao: string;
  observacoes: string;
}

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    nomeSolicitante: '',
    nomeEmpresa: '',
    dataSolicitacao: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
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

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      item: '',
      descricao: '',
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantidade' || field === 'valorUnitario') {
          updatedItem.valorTotal = updatedItem.quantidade * updatedItem.valorUnitario;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const clearForm = () => {
    setFormData({
      nomeSolicitante: '',
      nomeEmpresa: '',
      dataSolicitacao: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
      observacoes: ''
    });
    setItems([{
      id: '1',
      item: '',
      descricao: '',
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: 0
    }]);
    toast({
      title: "Formulário limpo",
      description: "Todos os campos foram resetados.",
    });
  };

  const getTotalGeral = () => {
    return items.reduce((total, item) => total + item.valorTotal, 0);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Cores mais sóbrias e profissionais
    const primaryColor = [52, 73, 94]; // Azul escuro
    const lightGray = [245, 245, 245];
    const darkGray = [44, 62, 80];
    
    // Função para converter imagem para base64
    const addImageToPDF = (imageSrc: string) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        };
        img.onerror = function() {
          resolve(null);
        };
        img.src = imageSrc;
      });
    };

    // Adicionar logo e cabeçalho
    addImageToPDF('/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png').then((logoBase64: any) => {
      // Linha decorativa no topo mais sutil
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 5, 'F');
      
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, 15, 25, 25);
      }
      
      // Cabeçalho mais sóbrio
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("PREFEITURA MUNICIPAL DE INAJÁ", 105, 25, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Av. Antônio Veiga Martins, 80 - CEP: 87670-000", 105, 35, { align: "center" });
      doc.text("Telefone: (44) 3112-4320 | E-mail: prefeito@inaja.pr.gov.br", 105, 42, { align: "center" });
      
      // Linha separadora
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(20, 48, 190, 48);
      
      // Título do documento sem caixa colorida
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("SOLICITAÇÃO DE FORNECIMENTO", 105, 60, { align: "center" });
      
      // Dados do formulário em formato mais limpo
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      
      // Caixa de informações mais sutil
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(20, 75, 170, 25, 'S');
      
      doc.setFont("helvetica", "bold");
      doc.text("Solicitante:", 25, 83);
      doc.setFont("helvetica", "normal");
      doc.text(formData.nomeSolicitante, 55, 83);
      
      doc.setFont("helvetica", "bold");
      doc.text("Empresa:", 25, 90);
      doc.setFont("helvetica", "normal");
      doc.text(formData.nomeEmpresa, 50, 90);
      
      doc.setFont("helvetica", "bold");
      doc.text("Data:", 25, 97);
      doc.setFont("helvetica", "normal");
      doc.text(formData.dataSolicitacao, 40, 97);
      
      // Tabela de itens mais limpa
      let yPosition = 115;
      
      // Cabeçalho da tabela em tom mais sóbrio
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(20, yPosition - 8, 170, 12, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      // Desenhar bordas do cabeçalho
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(20, yPosition - 8, 25, 12);
      doc.rect(45, yPosition - 8, 70, 12);
      doc.rect(115, yPosition - 8, 20, 12);
      doc.rect(135, yPosition - 8, 27, 12);
      doc.rect(162, yPosition - 8, 28, 12);
      
      // Texto do cabeçalho
      doc.text("ITEM", 32, yPosition - 2, { align: "center" });
      doc.text("DESCRIÇÃO", 80, yPosition - 2, { align: "center" });
      doc.text("QTD", 125, yPosition - 2, { align: "center" });
      doc.text("VALOR UNIT.", 148, yPosition - 2, { align: "center" });
      doc.text("VALOR TOTAL", 176, yPosition - 2, { align: "center" });
      
      yPosition += 4; // Ajuste para posição inicial dos itens
      
      // Itens da tabela sem cores alternadas
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
      
      items.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Altura da linha
        const rowHeight = 8;
        
        // Desenhar bordas das células
        doc.rect(20, yPosition, 25, rowHeight);
        doc.rect(45, yPosition, 70, rowHeight);
        doc.rect(115, yPosition, 20, rowHeight);
        doc.rect(135, yPosition, 27, rowHeight);
        doc.rect(162, yPosition, 28, rowHeight);
        
        // Texto das células - centralizado verticalmente
        const textY = yPosition + (rowHeight / 2) + 1;
        doc.text(item.item.substring(0, 20), 22, textY);
        doc.text(item.descricao.substring(0, 45), 47, textY);
        doc.text(item.quantidade.toString(), 125, textY, { align: "center" });
        doc.text(`R$ ${item.valorUnitario.toFixed(2)}`, 148, textY, { align: "center" });
        doc.text(`R$ ${item.valorTotal.toFixed(2)}`, 176, textY, { align: "center" });
        yPosition += rowHeight;
      });
      
      // Total geral com fundo cinza
      const rowHeight = 8;
      doc.setFillColor(220, 220, 220);
      doc.rect(20, yPosition, 142, rowHeight, 'F');
      doc.rect(162, yPosition, 28, rowHeight, 'F');
      doc.rect(20, yPosition, 170, rowHeight, 'S');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const textY = yPosition + (rowHeight / 2) + 1;
      doc.text("TOTAL GERAL:", 148, textY, { align: "center" });
      doc.text(`R$ ${getTotalGeral().toFixed(2)}`, 176, textY, { align: "center" });
      
      yPosition += rowHeight + 10; // Espaço após a tabela
      
      // Observações
      if (formData.observacoes) {
        yPosition += 20;
        doc.setDrawColor(200, 200, 200);
        doc.setTextColor(0, 0, 0);
        
        const observHeight = Math.max(20, doc.splitTextToSize(formData.observacoes, 160).length * 5 + 10);
        doc.rect(20, yPosition - 5, 170, observHeight, 'S');
        
        doc.setFont("helvetica", "bold");
        doc.text("OBSERVAÇÕES:", 25, yPosition + 2);
        yPosition += 10;
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(formData.observacoes, 160);
        doc.text(splitText, 25, yPosition);
        yPosition += observHeight - 10;
      }
      
      // Espaço para assinatura mais adequado
      yPosition += 40;
      
      // Uma linha para assinatura centralizada
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.line(60, yPosition, 150, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Assinatura do Solicitante", 105, yPosition + 8, { align: "center" });
      
      // Data e local
      yPosition += 25;
      doc.text(`Inajá - PR, ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, 105, yPosition, { align: "center" });
      
      doc.save(`Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: "O arquivo foi baixado com sucesso!",
      });
    });
  };

  const exportToWord = async () => {
    try {
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            // Cabeçalho
            new Paragraph({
              children: [
                new TextRun({
                  text: "PREFEITURA MUNICIPAL DE INAJÁ",
                  bold: true,
                  size: 28,
                  color: "344A5E",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "Av. Antônio Veiga Martins, 80 - CEP: 87670-000",
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Telefone: (44) 3112-4320 | E-mail: prefeito@inaja.pr.gov.br",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Título do documento
            new Paragraph({
              children: [
                new TextRun({
                  text: "SOLICITAÇÃO DE FORNECIMENTO",
                  bold: true,
                  size: 24,
                  color: "344A5E",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Informações do formulário
            new Paragraph({
              children: [
                new TextRun({ text: "Solicitante: ", bold: true }),
                new TextRun({ text: formData.nomeSolicitante }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Empresa: ", bold: true }),
                new TextRun({ text: formData.nomeEmpresa }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Data: ", bold: true }),
                new TextRun({ text: formData.dataSolicitacao }),
              ],
              spacing: { after: 400 },
            }),
            
            // Tabela
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              },
              rows: [
                // Cabeçalho da tabela
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "ITEM", bold: true })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "F5F5F5" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "DESCRIÇÃO", bold: true })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "F5F5F5" },
                      width: { size: 40, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "QTD", bold: true })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "F5F5F5" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "VALOR UNIT.", bold: true })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "F5F5F5" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "VALOR TOTAL", bold: true })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "F5F5F5" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                // Linhas dos itens
                ...items.map((item) => new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph(item.item)],
                    }),
                    new TableCell({ 
                      children: [new Paragraph(item.descricao)],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        text: item.quantidade.toString(),
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        text: `R$ ${item.valorUnitario.toFixed(2)}`,
                        alignment: AlignmentType.RIGHT,
                      })],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        text: `R$ ${item.valorTotal.toFixed(2)}`,
                        alignment: AlignmentType.RIGHT,
                      })],
                    }),
                  ],
                })),
                // Total geral
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph("")],
                      columnSpan: 4,
                      shading: { fill: "DCDCDC" },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "TOTAL GERAL:", bold: true })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "DCDCDC" },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: `R$ ${getTotalGeral().toFixed(2)}`, bold: true })],
                        alignment: AlignmentType.RIGHT,
                      })],
                      shading: { fill: "DCDCDC" },
                    }),
                  ],
                }),
              ],
            }),
            
            // Observações
            new Paragraph({
              text: "",
              spacing: { after: 400 },
            }),
            ...(formData.observacoes ? [
              new Paragraph({
                children: [new TextRun({ text: "OBSERVAÇÕES:", bold: true })],
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: formData.observacoes,
                spacing: { after: 400 },
              }),
            ] : []),
            
            // Assinatura
            new Paragraph({
              text: "",
              spacing: { after: 800 },
            }),
            new Paragraph({
              text: "_________________________________",
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: "Assinatura do Solicitante",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "",
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: `Inajá - PR, ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Usar saveAs do file-saver para melhor compatibilidade
      saveAs(blob, `Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.docx`);
      
      toast({
        title: "Word exportado",
        description: "O arquivo foi baixado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar Word:', error);
      toast({
        title: "Erro ao exportar Word",
        description: "Ocorreu um erro durante a exportação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const worksheetData = [
      ['PREFEITURA MUNICIPAL DE INAJÁ'],
      ['SOLICITAÇÃO DE FORNECIMENTO'],
      [],
      ['Solicitante:', formData.nomeSolicitante],
      ['Empresa:', formData.nomeEmpresa],
      ['Data:', formData.dataSolicitacao],
      [],
      ['ITEM', 'DESCRIÇÃO', 'QUANTIDADE', 'VALOR UNITÁRIO', 'VALOR TOTAL'],
      ...items.map(item => [
        item.item,
        item.descricao,
        item.quantidade,
        item.valorUnitario,
        item.valorTotal
      ]),
      [],
      ['', '', '', 'TOTAL GERAL:', getTotalGeral()],
      [],
      ['OBSERVAÇÕES:', formData.observacoes]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitação');
    
    XLSX.writeFile(workbook, `Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.xlsx`);
    
    toast({
      title: "Excel exportado",
      description: "O arquivo foi baixado com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
              alt="Brasão da Prefeitura de Inajá" 
              className="h-16 w-16 mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-blue-400">Sistema de Solicitação de Fornecimento</h1>
              <p className="text-slate-400">Prefeitura Municipal de Inajá - PR</p>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário Principal */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <FileText className="mr-2" />
                    Dados da Solicitação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="solicitante" className="text-slate-300">Nome do Solicitante</Label>
                      <Input
                        id="solicitante"
                        value={formData.nomeSolicitante}
                        onChange={(e) => setFormData({ ...formData, nomeSolicitante: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="Digite o nome do solicitante"
                      />
                    </div>
                    <div>
                      <Label htmlFor="empresa" className="text-slate-300">Nome da Empresa</Label>
                      <Input
                        id="empresa"
                        value={formData.nomeEmpresa}
                        onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="Digite o nome da empresa"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="data" className="text-slate-300">Data da Solicitação</Label>
                    <Input
                      id="data"
                      value={formData.dataSolicitacao}
                      onChange={(e) => setFormData({ ...formData, dataSolicitacao: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes" className="text-slate-300">Observações Gerais</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-slate-100 min-h-[100px]"
                      placeholder="Digite observações adicionais..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações */}
            <div>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400">Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowPreview(true)} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Separator className="bg-slate-600" />
                  <Button 
                    onClick={exportToPDF} 
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    onClick={exportToWord} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Word
                  </Button>
                  <Button 
                    onClick={exportToExcel} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </Button>
                  <Separator className="bg-slate-600" />
                  <Button 
                    onClick={clearForm} 
                    variant="destructive" 
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Formulário
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Itens */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-blue-400">Itens da Solicitação</CardTitle>
                  <Button 
                    onClick={addItem} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Item
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left p-2 text-slate-300">Item</th>
                          <th className="text-left p-2 text-slate-300">Descrição</th>
                          <th className="text-left p-2 text-slate-300">Qtd</th>
                          <th className="text-left p-2 text-slate-300">Valor Unit.</th>
                          <th className="text-left p-2 text-slate-300">Valor Total</th>
                          <th className="text-left p-2 text-slate-300">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-700">
                            <td className="p-2">
                              <Input
                                value={item.item}
                                onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                                placeholder="Item"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={item.descricao}
                                onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                                placeholder="Descrição"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={item.quantidade}
                                onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                                placeholder="0"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.valorUnitario}
                                onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                                className="bg-slate-700 border-slate-600 text-slate-100"
                                placeholder="0,00"
                              />
                            </td>
                            <td className="p-2">
                              <div className="p-2 bg-slate-700 rounded text-slate-100 text-right">
                                R$ {item.valorTotal.toFixed(2)}
                              </div>
                            </td>
                            <td className="p-2">
                              <Button
                                onClick={() => removeItem(item.id)}
                                size="sm"
                                variant="destructive"
                                disabled={items.length === 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-slate-600">
                          <td colSpan={4} className="p-2 text-right font-bold text-slate-300">
                            TOTAL GERAL:
                          </td>
                          <td className="p-2">
                            <div className="p-2 bg-blue-900 rounded text-blue-100 text-right font-bold">
                              R$ {getTotalGeral().toFixed(2)}
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Pré-visualização
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => setShowPreview(false)} 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← Voltar ao Formulário
              </Button>
              <div className="space-x-2">
                <Button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={exportToWord} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" />
                  Word
                </Button>
                <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>

            <Card className="bg-white text-black max-w-4xl mx-auto">
              <CardContent className="p-8">
                {/* Cabeçalho do documento */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
                      alt="Brasão da Prefeitura de Inajá" 
                      className="h-20 w-20 mr-4"
                    />
                    <div>
                      <h1 className="text-xl font-bold">PREFEITURA MUNICIPAL DE INAJÁ</h1>
                      <p className="text-sm">Av. Antônio Veiga Martins, 80 - CEP: 87670-000</p>
                      <p className="text-sm">Telefone: (44) 3112-4320</p>
                      <p className="text-sm">E-mail: prefeito@inaja.pr.gov.br</p>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold mt-6">SOLICITAÇÃO DE FORNECIMENTO</h2>
                </div>

                {/* Dados do formulário */}
                <div className="mb-6 space-y-2">
                  <p><strong>Solicitante:</strong> {formData.nomeSolicitante}</p>
                  <p><strong>Empresa:</strong> {formData.nomeEmpresa}</p>
                  <p><strong>Data:</strong> {formData.dataSolicitacao}</p>
                </div>

                {/* Tabela de itens */}
                <table className="w-full border-collapse border border-black mb-6">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-2 text-left">ITEM</th>
                      <th className="border border-black p-2 text-left">DESCRIÇÃO</th>
                      <th className="border border-black p-2 text-center">QTD</th>
                      <th className="border border-black p-2 text-right">VALOR UNIT.</th>
                      <th className="border border-black p-2 text-right">VALOR TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-black p-2">{item.item}</td>
                        <td className="border border-black p-2">{item.descricao}</td>
                        <td className="border border-black p-2 text-center">{item.quantidade}</td>
                        <td className="border border-black p-2 text-right">R$ {item.valorUnitario.toFixed(2)}</td>
                        <td className="border border-black p-2 text-right">R$ {item.valorTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-black p-2" colSpan={4}>TOTAL GERAL:</td>
                      <td className="border border-black p-2 text-right">R$ {getTotalGeral().toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Observações */}
                {formData.observacoes && (
                  <div className="mb-8">
                    <h3 className="font-bold mb-2">OBSERVAÇÕES:</h3>
                    <p className="text-justify">{formData.observacoes}</p>
                  </div>
                )}

                {/* Espaço para assinatura */}
                <div className="mt-16 text-center">
                  <div className="border-b border-black w-80 mx-auto mb-2"></div>
                  <p>Assinatura do Solicitante</p>
                  <p className="mt-8">Inajá - PR, {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
