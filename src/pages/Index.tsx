import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, FileText, Download, Trash2, Eye, Settings, Building2, User, Calendar, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { FontSizeControl } from "@/components/FontSizeControl";
import { TemplateManager } from "@/components/TemplateManager";
import { DataManager } from "@/components/DataManager";
import { BatchRequestManager } from "@/components/BatchRequestManager";
import { TemplateData } from "@/hooks/useTemplates";
import { useBatchRequest } from "@/hooks/useBatchRequest";

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
  const navigate = useNavigate();
  
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
  const [fontSize, setFontSize] = useState(12);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showBatchManager, setShowBatchManager] = useState(false);
  
  const { 
    processedRequests, 
    processBatchRequests, 
    exportBatchToJSON, 
    clearProcessedRequests, 
    getRequestSummary 
  } = useBatchRequest();

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

  const handleLoadTemplate = (template: TemplateData) => {
    setFormData(template.formData);
    setItems(template.items);
    toast({
      title: "Modelo carregado",
      description: `O modelo "${template.name}" foi aplicado com sucesso!`,
    });
  };

  const handleBatchProcess = (batchRequests: Array<{
    solicitante: string;
    empresa: string;
    observacoes: string;
    items: Array<{
      item: string;
      descricao: string;
      quantidade: number;
      valorUnitario: number;
    }>;
  }>) => {
    processBatchRequests(batchRequests);
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
      doc.setFontSize(fontSize + 2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("SOLICITAÇÃO DE AQUISIÇÃO DE PRODUTOS OU SERVIÇOS", 105, 60, { align: "center" });
      
      // Dados do formulário em formato mais limpo
      doc.setFontSize(fontSize - 2);
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
      doc.rect(20, yPosition, 170, 10, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fontSize - 3);
      doc.setTextColor(0, 0, 0);
      
      // Desenhar bordas do cabeçalho
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(20, yPosition, 25, 10);
      doc.rect(45, yPosition, 70, 10);
      doc.rect(115, yPosition, 20, 10);
      doc.rect(135, yPosition, 27, 10);
      doc.rect(162, yPosition, 28, 10);
      
      // Texto do cabeçalho
      doc.text("ITEM", 32, yPosition + 6, { align: "center" });
      doc.text("DESCRIÇÃO", 80, yPosition + 6, { align: "center" });
      doc.text("QTD", 125, yPosition + 6, { align: "center" });
      doc.text("VALOR UNIT.", 148, yPosition + 6, { align: "center" });
      doc.text("VALOR TOTAL", 176, yPosition + 6, { align: "center" });
      
      yPosition += 10; // Move para a primeira linha de dados
      
      // Itens da tabela sem cores alternadas
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
      doc.setFontSize(fontSize - 4);
      
      items.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Altura da linha fixa
        const rowHeight = 8;
        
        // Desenhar bordas das células
        doc.rect(20, yPosition, 25, rowHeight);
        doc.rect(45, yPosition, 70, rowHeight);
        doc.rect(115, yPosition, 20, rowHeight);
        doc.rect(135, yPosition, 27, rowHeight);
        doc.rect(162, yPosition, 28, rowHeight);
        
        // Texto das células - centralizado verticalmente
        const textY = yPosition + (rowHeight / 2) + 1.5;
        doc.text(item.item.substring(0, 20), 22, textY);
        doc.text(item.descricao.substring(0, 45), 47, textY);
        doc.text(item.quantidade.toString(), 125, textY, { align: "center" });
        doc.text(`R$ ${item.valorUnitario.toFixed(2)}`, 148, textY, { align: "center" });
        doc.text(`R$ ${item.valorTotal.toFixed(2)}`, 176, textY, { align: "center" });
        yPosition += rowHeight;
      });
      
      // Total geral com fundo cinza - altura consistente
      const totalRowHeight = 8;
      doc.setFillColor(220, 220, 220);
      doc.rect(20, yPosition, 142, totalRowHeight, 'F');
      doc.rect(162, yPosition, 28, totalRowHeight, 'F');
      
      // Bordas do total
      doc.setDrawColor(0, 0, 0);
      doc.rect(20, yPosition, 142, totalRowHeight, 'S');
      doc.rect(162, yPosition, 28, totalRowHeight, 'S');
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const totalTextY = yPosition + (totalRowHeight / 2) + 1.5;
      doc.text("TOTAL GERAL:", 148, totalTextY, { align: "center" });
      doc.text(`R$ ${getTotalGeral().toFixed(2)}`, 176, totalTextY, { align: "center" });
      
      yPosition += totalRowHeight + 15; // Espaço após a tabela
      
      // Observações
      if (formData.observacoes) {
        doc.setDrawColor(200, 200, 200);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(fontSize - 2);
        
        const observHeight = Math.max(20, doc.splitTextToSize(formData.observacoes, 160).length * 5 + 10);
        doc.rect(20, yPosition, 170, observHeight, 'S');
        
        doc.setFont("helvetica", "bold");
        doc.text("OBSERVAÇÕES:", 25, yPosition + 8);
        yPosition += 15;
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(formData.observacoes, 160);
        doc.text(splitText, 25, yPosition);
        yPosition += observHeight;
      }
      
      // Espaço para assinatura mais adequado
      yPosition += 30;
      
      // Uma linha para assinatura centralizada
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.line(60, yPosition, 150, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize - 2);
      doc.text("Assinatura do Solicitante", 105, yPosition + 8, { align: "center" });
      
      // Data e local
      yPosition += 25;
      doc.text(`Inajá - PR, ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`, 105, yPosition, { align: "center" });
      
      doc.save(`Solicitacao_Aquisicao_${formData.dataSolicitacao.replace(/\//g, '')}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: "O arquivo foi baixado com sucesso!",
      });
    });
  };

  const exportBatchToPDF = () => {
    if (processedRequests.length === 0) {
      toast({
        title: "Nenhuma solicitação",
        description: "Não há solicitações processadas para exportar.",
        variant: "destructive",
      });
      return;
    }

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

    // Processar cada solicitação
    addImageToPDF('/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png').then((logoBase64: any) => {
      processedRequests.forEach((request, requestIndex) => {
        if (requestIndex > 0) {
          doc.addPage();
        }

        // Linha decorativa no topo
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 5, 'F');
        
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 15, 15, 25, 25);
        }
        
        // Cabeçalho
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
        
        // Título do documento
        doc.setFontSize(fontSize + 2);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("SOLICITAÇÃO DE AQUISIÇÃO DE PRODUTOS OU SERVIÇOS", 105, 60, { align: "center" });
        
        // Dados do formulário
        doc.setFontSize(fontSize - 2);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        
        // Caixa de informações
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(20, 75, 170, 25, 'S');
        
        doc.setFont("helvetica", "bold");
        doc.text("Solicitante:", 25, 83);
        doc.setFont("helvetica", "normal");
        doc.text(request.solicitante, 55, 83);
        
        doc.setFont("helvetica", "bold");
        doc.text("Empresa:", 25, 90);
        doc.setFont("helvetica", "normal");
        doc.text(request.empresa, 50, 90);
        
        doc.setFont("helvetica", "bold");
        doc.text("Data:", 25, 97);
        doc.setFont("helvetica", "normal");
        doc.text(request.dataSolicitacao, 40, 97);
        
        // Tabela de itens
        let yPosition = 115;
        
        // Cabeçalho da tabela
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(20, yPosition, 170, 10, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize - 3);
        doc.setTextColor(0, 0, 0);
        
        // Desenhar bordas do cabeçalho
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(20, yPosition, 25, 10);
        doc.rect(45, yPosition, 70, 10);
        doc.rect(115, yPosition, 20, 10);
        doc.rect(135, yPosition, 27, 10);
        doc.rect(162, yPosition, 28, 10);
        
        // Texto do cabeçalho
        doc.text("ITEM", 32, yPosition + 6, { align: "center" });
        doc.text("DESCRIÇÃO", 80, yPosition + 6, { align: "center" });
        doc.text("QTD", 125, yPosition + 6, { align: "center" });
        doc.text("VALOR UNIT.", 148, yPosition + 6, { align: "center" });
        doc.text("VALOR TOTAL", 176, yPosition + 6, { align: "center" });
        
        yPosition += 10;
        
        // Itens da tabela
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);
        doc.setFontSize(fontSize - 4);
        
        request.items.forEach((item) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          const rowHeight = 8;
          const valorTotal = item.quantidade * item.valorUnitario;
          
          // Desenhar bordas das células
          doc.rect(20, yPosition, 25, rowHeight);
          doc.rect(45, yPosition, 70, rowHeight);
          doc.rect(115, yPosition, 20, rowHeight);
          doc.rect(135, yPosition, 27, rowHeight);
          doc.rect(162, yPosition, 28, rowHeight);
          
          // Texto das células
          const textY = yPosition + (rowHeight / 2) + 1.5;
          doc.text(item.item.substring(0, 20), 22, textY);
          doc.text(item.descricao.substring(0, 45), 47, textY);
          doc.text(item.quantidade.toString(), 125, textY, { align: "center" });
          doc.text(`R$ ${item.valorUnitario.toFixed(2)}`, 148, textY, { align: "center" });
          doc.text(`R$ ${valorTotal.toFixed(2)}`, 176, textY, { align: "center" });
          yPosition += rowHeight;
        });
        
        // Total geral
        const totalRowHeight = 8;
        doc.setFillColor(220, 220, 220);
        doc.rect(20, yPosition, 142, totalRowHeight, 'F');
        doc.rect(162, yPosition, 28, totalRowHeight, 'F');
        
        doc.setDrawColor(0, 0, 0);
        doc.rect(20, yPosition, 142, totalRowHeight, 'S');
        doc.rect(162, yPosition, 28, totalRowHeight, 'S');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        const totalTextY = yPosition + (totalRowHeight / 2) + 1.5;
        doc.text("TOTAL GERAL:", 148, totalTextY, { align: "center" });
        doc.text(`R$ ${request.valorTotal.toFixed(2)}`, 176, totalTextY, { align: "center" });
        
        yPosition += totalRowHeight + 15;
        
        // Observações
        if (request.observacoes) {
          doc.setDrawColor(200, 200, 200);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(fontSize - 2);
          
          const observHeight = Math.max(20, doc.splitTextToSize(request.observacoes, 160).length * 5 + 10);
          doc.rect(20, yPosition, 170, observHeight, 'S');
          
          doc.setFont("helvetica", "bold");
          doc.text("OBSERVAÇÕES:", 25, yPosition + 8);
          yPosition += 15;
          doc.setFont("helvetica", "normal");
          const splitText = doc.splitTextToSize(request.observacoes, 160);
          doc.text(splitText, 25, yPosition);
          yPosition += observHeight;
        }
        
        // Assinatura
        yPosition += 30;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(60, yPosition, 150, yPosition);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize - 2);
        doc.text("Assinatura do Solicitante", 105, yPosition + 8, { align: "center" });
        
        yPosition += 25;
        doc.text(`Inajá - PR, ${request.dataSolicitacao}`, 105, yPosition, { align: "center" });
      });

      doc.save(`Lote_Solicitacoes_${format(new Date(), 'ddMMyyyy')}.pdf`);
      
      toast({
        title: "PDF do lote exportado",
        description: `${processedRequests.length} solicitações foram exportadas para PDF!`,
      });
    });
  };

  const exportToWord = async () => {
    try {
      // Função para converter imagem para buffer
      const getImageBuffer = async (imageSrc: string): Promise<Uint8Array | null> => {
        try {
          const response = await fetch(imageSrc);
          if (!response.ok) throw new Error('Failed to fetch image');
          const arrayBuffer = await response.arrayBuffer();
          return new Uint8Array(arrayBuffer);
        } catch (error) {
          console.error('Error loading image:', error);
          return null;
        }
      };

      // Carregar o logo
      const logoBuffer = await getImageBuffer('/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png');

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
            // Cabeçalho com logo
            new Paragraph({
              children: [
                ...(logoBuffer ? [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 80,
                      height: 80,
                    },
                    type: "png",
                  }),
                  new TextRun({
                    text: "     ", // Espaçamento
                  }),
                ] : []),
                new TextRun({
                  text: "PREFEITURA MUNICIPAL DE INAJÁ",
                  bold: true,
                  size: Math.round(fontSize * 1.5),
                  color: "344A5E",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Estado do Paraná",
                  size: Math.round(fontSize * 0.8),
                  color: "666666",
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
              spacing: { after: 600 },
            }),
            
            // Linha decorativa usando caracteres
            new Paragraph({
              children: [
                new TextRun({
                  text: "═════════════════════════════════════════════════════════════",
                  color: "344A5E",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Título do documento
            new Paragraph({
              children: [
                new TextRun({
                  text: "SOLICITAÇÃO DE AQUISIÇÃO DE PRODUTOS OU SERVIÇOS",
                  bold: true,
                  size: Math.round(fontSize * 1.2),
                  color: "344A5E",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),
            
            // Informações do formulário
            new Paragraph({
              children: [
                new TextRun({ text: "Solicitante: ", bold: true, size: fontSize }),
                new TextRun({ text: formData.nomeSolicitante, size: fontSize }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Empresa: ", bold: true, size: fontSize }),
                new TextRun({ text: formData.nomeEmpresa, size: fontSize }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Data: ", bold: true, size: fontSize }),
                new TextRun({ text: formData.dataSolicitacao, size: fontSize }),
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
                        children: [new TextRun({ text: "ITEM", bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "E8E8E8" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "DESCRIÇÃO", bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "E8E8E8" },
                      width: { size: 40, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "QTD", bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "E8E8E8" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "VALOR UNIT.", bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "E8E8E8" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "VALOR TOTAL", bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.CENTER,
                      })],
                      shading: { fill: "E8E8E8" },
                      width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                // Linhas dos itens
                ...items.map((item) => new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: item.item, size: Math.round(fontSize * 0.75) })],
                      })],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: item.descricao, size: Math.round(fontSize * 0.75) })],
                      })],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: item.quantidade.toString(), size: Math.round(fontSize * 0.75) })],
                        alignment: AlignmentType.CENTER,
                      })],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: `R$ ${item.valorUnitario.toFixed(2)}`, size: Math.round(fontSize * 0.75) })],
                        alignment: AlignmentType.RIGHT,
                      })],
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: `R$ ${item.valorTotal.toFixed(2)}`, size: Math.round(fontSize * 0.75) })],
                        alignment: AlignmentType.RIGHT,
                      })],
                    }),
                  ],
                })),
                // Total geral
                new TableRow({
                  children: [
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: "TOTAL GERAL:", bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.RIGHT,
                      })],
                      columnSpan: 4,
                      shading: { fill: "D0D0D0" },
                    }),
                    new TableCell({ 
                      children: [new Paragraph({ 
                        children: [new TextRun({ text: `R$ ${getTotalGeral().toFixed(2)}`, bold: true, size: Math.round(fontSize * 0.8) })],
                        alignment: AlignmentType.RIGHT,
                      })],
                      shading: { fill: "D0D0D0" },
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
                children: [new TextRun({ text: "OBSERVAÇÕES:", bold: true, size: fontSize })],
                spacing: { after: 200 },
              }),
              new Paragraph({
                children: [new TextRun({ text: formData.observacoes, size: Math.round(fontSize * 0.8) })],
                spacing: { after: 400 },
              }),
            ] : []),
            
            // Assinatura
            new Paragraph({
              text: "",
              spacing: { after: 800 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "_".repeat(50), size: fontSize })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "Assinatura do Solicitante", size: Math.round(fontSize * 0.75) })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "",
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [new TextRun({ 
                text: `Inajá - PR, ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
                size: Math.round(fontSize * 0.75)
              })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      // Usar abordagem mais compatível com browser
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Solicitacao_Aquisicao_${formData.dataSolicitacao.replace(/\//g, '')}.docx`);
      
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
      ['SOLICITAÇÃO DE AQUISIÇÃO DE PRODUTOS OU SERVIÇOS'],
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
    
    XLSX.writeFile(workbook, `Solicitacao_Aquisicao_${formData.dataSolicitacao.replace(/\//g, '')}.xlsx`);
    
    toast({
      title: "Excel exportado",
      description: "O arquivo foi baixado com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-4 sm:space-y-0">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-full blur-lg"></div>
                <img 
                  src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
                  alt="Brasão da Prefeitura de Inajá" 
                  className="relative h-16 w-16 sm:h-20 sm:w-20 sm:mr-6 drop-shadow-lg"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  Sistema de Solicitação de Aquisição
                </h1>
                <p className="text-slate-300 text-sm sm:text-base flex items-center justify-center sm:justify-start">
                  <Building2 className="w-4 h-4 mr-2 text-indigo-400" />
                  Prefeitura Municipal de Inajá - PR
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-indigo-500"
              >
                <Settings className="mr-2 h-4 w-4" />
                Opções Avançadas
              </Button>
              <Button
                onClick={() => setShowBatchManager(!showBatchManager)}
                variant="outline"
                size="sm"
                className="border-orange-600 text-orange-300 hover:bg-orange-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-400"
              >
                <FileText className="mr-2 h-4 w-4" />
                Solicitação em Lote
              </Button>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Enhanced Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Enhanced Main Form */}
              <div className="xl:col-span-2">
                <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-cyan-600/5"></div>
                  <CardHeader className="relative border-b border-slate-700/50 bg-slate-800/60">
                    <CardTitle className="text-indigo-400 flex items-center text-lg sm:text-xl">
                      <FileText className="mr-3 h-6 w-6 text-indigo-400" />
                      Dados da Solicitação de Aquisição
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-6 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="solicitante" className="text-slate-300 text-sm sm:text-base flex items-center">
                          <User className="w-4 h-4 mr-2 text-indigo-400" />
                          Nome do Solicitante
                        </Label>
                        <Input
                          id="solicitante"
                          value={formData.nomeSolicitante}
                          onChange={(e) => setFormData({ ...formData, nomeSolicitante: e.target.value })}
                          className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm sm:text-base focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                          placeholder="Digite o nome do solicitante"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa" className="text-slate-300 text-sm sm:text-base flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-indigo-400" />
                          Nome da Empresa/Departamento
                        </Label>
                        <Input
                          id="empresa"
                          value={formData.nomeEmpresa}
                          onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                          className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm sm:text-base focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                          placeholder="Digite o nome da empresa ou departamento"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="data" className="text-slate-300 text-sm sm:text-base flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                          Data da Solicitação
                        </Label>
                        <Input
                          id="data"
                          value={formData.dataSolicitacao}
                          onChange={(e) => setFormData({ ...formData, dataSolicitacao: e.target.value })}
                          className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm sm:text-base focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observacoes" className="text-slate-300 text-sm sm:text-base flex items-center">
                        <FileEdit className="w-4 h-4 mr-2 text-indigo-400" />
                        Observações Gerais
                      </Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        className="bg-slate-700/80 border-slate-600/50 text-slate-100 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 resize-none"
                        placeholder="Digite observações adicionais..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Actions Panel */}
              <div className="xl:col-span-2 space-y-4">
                <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600/5 to-cyan-600/5"></div>
                  <CardHeader className="relative pb-3 border-b border-slate-700/50 bg-slate-800/60">
                    <CardTitle className="text-teal-400 text-lg flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Ações do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-3 p-4">
                    <Button 
                      onClick={() => setShowPreview(true)} 
                      className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar Documento
                    </Button>
                    <Separator className="bg-gradient-to-r from-slate-600/50 to-slate-500/50" />
                    <div className="space-y-2">
                      <p className="text-slate-400 text-xs font-medium">Exportar Documento:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          onClick={exportToPDF} 
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-xs shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          size="sm"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          PDF
                        </Button>
                        <Button 
                          onClick={exportToWord} 
                          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-xs shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          size="sm"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Word
                        </Button>
                        <Button 
                          onClick={exportToExcel} 
                          className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-xs shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          size="sm"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Excel
                        </Button>
                      </div>
                    </div>
                    <Separator className="bg-gradient-to-r from-slate-600/50 to-slate-500/50" />
                    <Button 
                      onClick={clearForm} 
                      variant="destructive" 
                      className="w-full text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpar Formulário
                    </Button>
                  </CardContent>
                </Card>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                  <div className="grid grid-cols-1 gap-4">
                    <DataManager
                      onSelectSolicitante={(nome) => setFormData(prev => ({ ...prev, nomeSolicitante: nome }))}
                      onSelectEmpresa={(empresa) => setFormData(prev => ({ ...prev, nomeEmpresa: empresa }))}
                      onSelectObservacao={(observacao) => setFormData(prev => ({ ...prev, observacoes: observacao }))}
                      currentSolicitante={formData.nomeSolicitante}
                      currentEmpresa={formData.nomeEmpresa}
                      currentObservacao={formData.observacoes}
                    />
                    <FontSizeControl 
                      fontSize={fontSize} 
                      onFontSizeChange={setFontSize} 
                    />
                    <TemplateManager
                      formData={formData}
                      items={items}
                      onLoadTemplate={handleLoadTemplate}
                    />
                  </div>
                )}

                {/* Batch Request Manager */}
                {showBatchManager && (
                  <div className="grid grid-cols-1 gap-4">
                    <BatchRequestManager onProcessBatch={handleBatchProcess} />
                    
                    {processedRequests.length > 0 && (
                      <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-orange-400 flex items-center">
                            <FileText className="mr-2 h-5 w-5" />
                            Solicitações Processadas ({processedRequests.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-orange-400">{getRequestSummary().totalRequests}</div>
                              <div className="text-sm text-slate-300">Solicitações</div>
                            </div>
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-green-400">R$ {getRequestSummary().totalValue.toFixed(2)}</div>
                              <div className="text-sm text-slate-300">Valor Total</div>
                            </div>
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-blue-400">{getRequestSummary().uniqueSolicitantes}</div>
                              <div className="text-sm text-slate-300">Solicitantes</div>
                            </div>
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="text-2xl font-bold text-purple-400">{getRequestSummary().uniqueEmpresas}</div>
                              <div className="text-sm text-slate-300">Empresas</div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              onClick={exportBatchToPDF}
                              className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Gerar Lote PDF
                            </Button>
                            <Button 
                              onClick={exportBatchToJSON}
                              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Exportar Lote JSON
                            </Button>
                            <Button 
                              onClick={clearProcessedRequests}
                              variant="destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Limpar Lote
                            </Button>
                          </div>
                          
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {processedRequests.map((request) => (
                              <div key={request.id} className="bg-slate-700/30 p-3 rounded border-l-4 border-orange-400">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-slate-200">{request.solicitante} - {request.empresa}</div>
                                    <div className="text-sm text-slate-400">{request.items.length} itens - R$ {request.valorTotal.toFixed(2)}</div>
                                  </div>
                                  <div className="text-xs text-slate-500">{request.dataSolicitacao}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Items Table */}
            <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5"></div>
              <CardHeader className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 border-b border-slate-700/50 bg-slate-800/60">
                <CardTitle className="text-emerald-400 text-lg sm:text-xl flex items-center">
                  <FileText className="mr-3 h-6 w-6" />
                  Itens da Solicitação
                </CardTitle>
                <Button 
                  onClick={addItem} 
                  size="sm" 
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent className="relative p-0">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-700/40">
                        <th className="text-left p-4 text-slate-300 text-sm font-semibold">Item</th>
                        <th className="text-left p-4 text-slate-300 text-sm font-semibold">Descrição</th>
                        <th className="text-left p-4 text-slate-300 text-sm font-semibold">Qtd</th>
                        <th className="text-left p-4 text-slate-300 text-sm font-semibold">Valor Unit.</th>
                        <th className="text-left p-4 text-slate-300 text-sm font-semibold">Valor Total</th>
                        <th className="text-left p-4 text-slate-300 text-sm font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className={`border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-200 ${index % 2 === 0 ? 'bg-slate-800/40' : 'bg-slate-800/20'}`}>
                          <td className="p-4">
                            <Input
                              value={item.item}
                              onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                              placeholder="Item"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              value={item.descricao}
                              onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                              placeholder="Descrição"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm w-20 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.valorUnitario}
                              onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                              className="bg-slate-700/80 border-slate-600/50 text-slate-100 text-sm w-28 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
                              placeholder="0,00"
                            />
                          </td>
                          <td className="p-4">
                            <div className="p-3 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-md text-slate-100 text-right text-sm font-semibold shadow-inner border border-slate-600/30">
                              R$ {item.valorTotal.toFixed(2)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              onClick={() => removeItem(item.id)}
                              size="sm"
                              variant="destructive"
                              disabled={items.length === 1}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-600 bg-gradient-to-r from-indigo-900/60 to-teal-900/60">
                        <td colSpan={4} className="p-4 text-right font-bold text-slate-200 text-base">
                          TOTAL GERAL:
                        </td>
                        <td className="p-4">
                          <div className="p-3 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-md text-white text-right font-bold text-base shadow-lg border border-indigo-500/30">
                            R$ {getTotalGeral().toFixed(2)}
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Enhanced Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                  {items.map((item, index) => (
                    <Card key={item.id} className="bg-slate-700/70 backdrop-blur-sm border-slate-600/50 shadow-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-teal-600/5"></div>
                      <CardHeader className="relative pb-3 border-b border-slate-600/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-indigo-400 text-base flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Item {index + 1}
                          </CardTitle>
                          <Button
                            onClick={() => removeItem(item.id)}
                            size="sm"
                            variant="destructive"
                            disabled={items.length === 1}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-30"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="relative space-y-4 p-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm flex items-center">
                            <FileText className="w-3 h-3 mr-2 text-indigo-400" />
                            Nome do Item
                          </Label>
                          <Input
                            value={item.item}
                            onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                            className="bg-slate-600/80 border-slate-500/50 text-slate-100 text-sm focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                            placeholder="Digite o nome do item"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300 text-sm flex items-center">
                            <FileEdit className="w-3 h-3 mr-2 text-indigo-400" />
                            Descrição
                          </Label>
                          <Input
                            value={item.descricao}
                            onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                            className="bg-slate-600/80 border-slate-500/50 text-slate-100 text-sm focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                            placeholder="Digite a descrição"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Quantidade</Label>
                            <Input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                              className="bg-slate-600/80 border-slate-500/50 text-slate-100 text-sm focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300 text-sm">Valor Unitário</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.valorUnitario}
                              onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                              className="bg-slate-600/80 border-slate-500/50 text-slate-100 text-sm focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200"
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-slate-600/80 to-slate-500/80 p-4 rounded-lg shadow-inner border border-slate-500/30">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300 text-sm font-medium">Valor Total:</span>
                            <span className="text-indigo-300 font-bold text-lg">R$ {item.valorTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Enhanced Total Mobile */}
                  <Card className="bg-gradient-to-r from-indigo-900/80 to-teal-900/80 backdrop-blur-sm border-indigo-700/50 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-teal-600/10"></div>
                    <CardContent className="relative p-6 border border-indigo-600/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-100 font-bold text-lg">TOTAL GERAL:</span>
                        <span className="text-white font-bold text-2xl drop-shadow-lg">R$ {getTotalGeral().toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Pré-visualização responsiva com controle de fonte
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <Button 
                onClick={() => setShowPreview(false)} 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 w-full sm:w-auto hover:border-indigo-500 transition-all duration-300"
              >
                ← Voltar ao Formulário
              </Button>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Button onClick={exportToPDF} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button onClick={exportToWord} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" />
                  Word
                </Button>
                <Button onClick={exportToExcel} className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>

            <Card className="bg-white text-black max-w-4xl mx-auto shadow-2xl border-2 border-slate-300" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto', transform: 'scale(0.85)' }}>
              <CardContent className="p-4 sm:p-6 lg:p-8" style={{ fontSize: `${fontSize}px` }}>
                {/* Cabeçalho do documento responsivo */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-2 sm:space-y-0">
                    <img 
                      src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
                      alt="Brasão da Prefeitura de Inajá" 
                      className="h-16 w-16 sm:h-20 sm:w-20 sm:mr-4"
                    />
                    <div className="text-center sm:text-left">
                      <h1 style={{ fontSize: `${fontSize + 4}px` }} className="font-bold">PREFEITURA MUNICIPAL DE INAJÁ</h1>
                      <p style={{ fontSize: `${fontSize - 2}px` }}>Av. Antônio Veiga Martins, 80 - CEP: 87670-000</p>
                      <p style={{ fontSize: `${fontSize - 2}px` }}>Telefone: (44) 3112-4320</p>
                      <p style={{ fontSize: `${fontSize - 2}px` }}>E-mail: prefeito@inaja.pr.gov.br</p>
                    </div>
                  </div>
                  <h2 style={{ fontSize: `${fontSize + 2}px` }} className="font-bold mt-4 sm:mt-6">SOLICITAÇÃO DE AQUISIÇÃO DE PRODUTOS OU SERVIÇOS</h2>
                </div>

                {/* Dados do formulário */}
                <div className="mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                  <p><strong>Solicitante:</strong> {formData.nomeSolicitante}</p>
                  <p><strong>Empresa/Departamento:</strong> {formData.nomeEmpresa}</p>
                  <p><strong>Data:</strong> {formData.dataSolicitacao}</p>
                </div>

                {/* Tabela de itens responsiva */}
                <div className="mb-4 sm:mb-6">
                  {/* Tabela desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-black" style={{ fontSize: `${fontSize - 2}px` }}>
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border-2 border-black p-1 sm:p-2 text-left">ITEM</th>
                          <th className="border-2 border-black p-1 sm:p-2 text-left">DESCRIÇÃO</th>
                          <th className="border-2 border-black p-1 sm:p-2 text-center">QTD</th>
                          <th className="border-2 border-black p-1 sm:p-2 text-right">VALOR UNIT.</th>
                          <th className="border-2 border-black p-1 sm:p-2 text-right">VALOR TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="border border-black p-1 sm:p-2">{item.item}</td>
                            <td className="border border-black p-1 sm:p-2">{item.descricao}</td>
                            <td className="border border-black p-1 sm:p-2 text-center">{item.quantidade}</td>
                            <td className="border border-black p-1 sm:p-2 text-right">R$ {item.valorUnitario.toFixed(2)}</td>
                            <td className="border border-black p-1 sm:p-2 text-right">R$ {item.valorTotal.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-200 font-bold">
                          <td className="border-2 border-black p-1 sm:p-2" colSpan={4}>TOTAL GERAL:</td>
                          <td className="border-2 border-black p-1 sm:p-2 text-right">R$ {getTotalGeral().toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cards mobile */}
                  <div className="sm:hidden space-y-3">
                    {items.map((item, index) => (
                      <div key={item.id} className="border-2 border-gray-400 p-3 rounded bg-gray-50">
                        <div className="space-y-2" style={{ fontSize: `${fontSize - 2}px` }}>
                          <div><strong>Item {index + 1}:</strong> {item.item}</div>
                          <div><strong>Descrição:</strong> {item.descricao}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><strong>Qtd:</strong> {item.quantidade}</div>
                            <div><strong>Unit.:</strong> R$ {item.valorUnitario.toFixed(2)}</div>
                          </div>
                          <div className="bg-gray-300 p-2 rounded border">
                            <strong>Total: R$ {item.valorTotal.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-4 border-gray-800 p-4 rounded bg-gray-200">
                      <div className="text-center font-bold" style={{ fontSize: `${fontSize}px` }}>
                        TOTAL GERAL: R$ {getTotalGeral().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {formData.observacoes && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="font-bold mb-2">OBSERVAÇÕES:</h3>
                    <p className="text-justify break-words border border-gray-300 p-3 bg-gray-50 rounded">{formData.observacoes}</p>
                  </div>
                )}

                {/* Espaço para assinatura */}
                <div className="mt-12 sm:mt-16 text-center">
                  <div className="border-b-2 border-black w-60 sm:w-80 mx-auto mb-2"></div>
                  <p className="font-semibold">Assinatura do Solicitante</p>
                  <p className="mt-6 sm:mt-8 font-medium">Inajá - PR, {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Developer Credit */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <span className="text-slate-400 text-sm">
              Desenvolvido por{" "}
              <span className="text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 bg-clip-text font-semibold">
                ALEKSANDRO ALVES
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
