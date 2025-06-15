
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { Item } from './ItemsTable';

interface FormData {
  nomeSolicitante: string;
  nomeEmpresa: string;
  dataSolicitacao: string;
  observacoes: string;
}

interface ExportActionsProps {
  formData: FormData;
  items: Item[];
  setShowPreview: (show: boolean) => void;
  clearForm: () => void;
}

const ExportActions = ({ formData, items, setShowPreview, clearForm }: ExportActionsProps) => {
  const getTotalGeral = () => {
    return items.reduce((total, item) => total + item.valorTotal, 0);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    
    try {
      // Adicionar logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        doc.addImage(dataURL, 'PNG', 15, 10, 20, 20);
        
        generatePDFContent(doc);
      };
      
      img.onerror = () => {
        generatePDFContent(doc);
      };
    } catch (error) {
      generatePDFContent(doc);
    }
  };

  const generatePDFContent = (doc: jsPDF) => {
    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PREFEITURA MUNICIPAL DE INAJÁ", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Av. Antônio Veiga Martins, 80 - CEP: 87670-000", 105, 30, { align: "center" });
    doc.text("Telefone: (44) 3112-4320", 105, 37, { align: "center" });
    doc.text("E-mail: prefeito@inaja.pr.gov.br", 105, 44, { align: "center" });

    // Título do documento
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SOLICITAÇÃO DE FORNECIMENTO", 105, 60, { align: "center" });

    // Dados do formulário
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Solicitante: ${formData.nomeSolicitante}`, 20, 80);
    doc.text(`Empresa: ${formData.nomeEmpresa}`, 20, 87);
    doc.text(`Data: ${formData.dataSolicitacao}`, 20, 94);

    // Preparar dados da tabela
    const tableData = items.map((item) => [
      item.item,
      item.descricao,
      item.quantidade.toString(),
      `R$ ${item.valorUnitario.toFixed(2)}`,
      `R$ ${item.valorTotal.toFixed(2)}`
    ]);

    tableData.push(['', '', '', 'TOTAL GERAL:', `R$ ${getTotalGeral().toFixed(2)}`]);

    // Criar tabela
    (doc as any).autoTable({
      startY: 105,
      head: [['ITEM', 'DESCRIÇÃO', 'QTD', 'VALOR UNIT.', 'VALOR TOTAL']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // Observações
    if (formData.observacoes) {
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVAÇÕES:", 20, finalY);
      finalY += 7;
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(formData.observacoes, 170);
      doc.text(splitText, 20, finalY);
      finalY += splitText.length * 5;
    }

    // Assinatura
    finalY += 20;
    doc.line(20, finalY, 90, finalY);
    doc.text("Assinatura do Solicitante", 20, finalY + 10);

    doc.save(`Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.pdf`);
    
    toast({
      title: "PDF exportado",
      description: "O arquivo foi baixado com sucesso!"
    });
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
      ...items.map((item) => [
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
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitação');
    XLSX.writeFile(workbook, `Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.xlsx`);

    toast({
      title: "Excel exportado",
      description: "O arquivo foi baixado com sucesso!"
    });
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "PREFEITURA MUNICIPAL DE INAJÁ",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: "SOLICITAÇÃO DE FORNECIMENTO",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: `Solicitante: ${formData.nomeSolicitante}` }),
          new Paragraph({ text: `Empresa: ${formData.nomeEmpresa}` }),
          new Paragraph({ text: `Data: ${formData.dataSolicitacao}` }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("ITEM")] }),
                  new TableCell({ children: [new Paragraph("DESCRIÇÃO")] }),
                  new TableCell({ children: [new Paragraph("QTD")] }),
                  new TableCell({ children: [new Paragraph("VALOR UNIT.")] }),
                  new TableCell({ children: [new Paragraph("VALOR TOTAL")] })
                ]
              }),
              ...items.map(item => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(item.item)] }),
                  new TableCell({ children: [new Paragraph(item.descricao)] }),
                  new TableCell({ children: [new Paragraph(item.quantidade.toString())] }),
                  new TableCell({ children: [new Paragraph(`R$ ${item.valorUnitario.toFixed(2)}`)] }),
                  new TableCell({ children: [new Paragraph(`R$ ${item.valorTotal.toFixed(2)}`)] })
                ]
              })),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("TOTAL GERAL:")] }),
                  new TableCell({ children: [new Paragraph(`R$ ${getTotalGeral().toFixed(2)}`)] })
                ]
              })
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Word exportado",
      description: "O arquivo foi baixado com sucesso!"
    });
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button onClick={() => setShowPreview(true)} variant="outline">
        <Eye className="h-4 w-4 mr-2" />
        Visualizar
      </Button>
      <Button onClick={exportToPDF}>
        <FileText className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
      <Button onClick={exportToExcel} variant="secondary">
        <Download className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>
      <Button onClick={exportToWord} variant="secondary">
        <Download className="h-4 w-4 mr-2" />
        Exportar Word
      </Button>
      <Button onClick={clearForm} variant="destructive">
        <Trash2 className="h-4 w-4 mr-2" />
        Limpar Formulário
      </Button>
    </div>
  );
};

export default ExportActions;
