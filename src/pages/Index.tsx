
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
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel } from 'docx';

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
    
    // Tabela de itens
    let yPosition = 110;
    doc.setFont("helvetica", "bold");
    doc.text("ITEM", 20, yPosition);
    doc.text("DESCRIÇÃO", 40, yPosition);
    doc.text("QTD", 120, yPosition);
    doc.text("VALOR UNIT.", 140, yPosition);
    doc.text("VALOR TOTAL", 170, yPosition);
    
    yPosition += 7;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    
    doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(item.item, 20, yPosition);
      doc.text(item.descricao.substring(0, 30), 40, yPosition);
      doc.text(item.quantidade.toString(), 120, yPosition);
      doc.text(`R$ ${item.valorUnitario.toFixed(2)}`, 140, yPosition);
      doc.text(`R$ ${item.valorTotal.toFixed(2)}`, 170, yPosition);
      yPosition += 7;
    });
    
    // Total geral
    yPosition += 5;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 7;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL GERAL: R$ ${getTotalGeral().toFixed(2)}`, 170, yPosition, { align: "right" });
    
    // Observações
    if (formData.observacoes) {
      yPosition += 15;
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVAÇÕES:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      const splitText = doc.splitTextToSize(formData.observacoes, 170);
      doc.text(splitText, 20, yPosition);
    }
    
    // Espaço para assinatura
    yPosition += 30;
    doc.line(20, yPosition, 90, yPosition);
    doc.text("Assinatura do Solicitante", 20, yPosition + 10);
    
    doc.save(`Solicitacao_Fornecimento_${formData.dataSolicitacao.replace(/\//g, '')}.pdf`);
    
    toast({
      title: "PDF exportado",
      description: "O arquivo foi baixado com sucesso!",
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

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "PREFEITURA MUNICIPAL DE INAJÁ",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Av. Antônio Veiga Martins, 80 - CEP: 87670-000",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Telefone: (44) 3112-4320 | E-mail: prefeito@inaja.pr.gov.br",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "",
          }),
          new Paragraph({
            text: "SOLICITAÇÃO DE FORNECIMENTO",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "",
          }),
          new Paragraph({
            text: `Solicitante: ${formData.nomeSolicitante}`,
          }),
          new Paragraph({
            text: `Empresa: ${formData.nomeEmpresa}`,
          }),
          new Paragraph({
            text: `Data: ${formData.dataSolicitacao}`,
          }),
          new Paragraph({
            text: "",
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("ITEM")] }),
                  new TableCell({ children: [new Paragraph("DESCRIÇÃO")] }),
                  new TableCell({ children: [new Paragraph("QTD")] }),
                  new TableCell({ children: [new Paragraph("VALOR UNIT.")] }),
                  new TableCell({ children: [new Paragraph("VALOR TOTAL")] }),
                ],
              }),
              ...items.map(item => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(item.item)] }),
                  new TableCell({ children: [new Paragraph(item.descricao)] }),
                  new TableCell({ children: [new Paragraph(item.quantidade.toString())] }),
                  new TableCell({ children: [new Paragraph(`R$ ${item.valorUnitario.toFixed(2)}`)] }),
                  new TableCell({ children: [new Paragraph(`R$ ${item.valorTotal.toFixed(2)}`)] }),
                ],
              })),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("TOTAL GERAL:")] }),
                  new TableCell({ children: [new Paragraph(`R$ ${getTotalGeral().toFixed(2)}`)] }),
                ],
              }),
            ],
          }),
          new Paragraph({
            text: "",
          }),
          new Paragraph({
            text: "OBSERVAÇÕES:",
          }),
          new Paragraph({
            text: formData.observacoes,
          }),
          new Paragraph({
            text: "",
          }),
          new Paragraph({
            text: "_________________________________",
          }),
          new Paragraph({
            text: "Assinatura do Solicitante",
          }),
        ],
      }],
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
                <div className="mt-16">
                  <div className="border-b border-black w-80 mb-2"></div>
                  <p>Assinatura do Solicitante</p>
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
