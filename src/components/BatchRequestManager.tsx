import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Check, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BatchRequest {
  solicitante: string;
  empresa: string;
  observacoes: string;
  items: Array<{
    item: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
  }>;
}

interface BatchRequestManagerProps {
  onProcessBatch: (requests: BatchRequest[]) => void;
}

export const BatchRequestManager = ({ onProcessBatch }: BatchRequestManagerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<Array<{
    line: number;
    error: string;
    data?: BatchRequest;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateContent = `# MODELO PARA SOLICITAÇÃO EM LOTE
# Cada linha representa uma solicitação
# Formato: SOLICITANTE|EMPRESA|OBSERVACOES|ITEM1:DESCRICAO1:QTD1:VALOR1;ITEM2:DESCRICAO2:QTD2:VALOR2
# Exemplo:

João Silva|Empresa ABC Ltda|Materiais para reforma|Tinta Latex:Tinta branca para parede:4:25.50;Pincel:Pincel para tinta:2:15.00
Maria Santos|Construtora XYZ|Material elétrico|Fio Elétrico:Fio 2.5mm 100m:2:45.00;Disjuntor:Disjuntor 20A:3:12.50
Pedro Oliveira|Loja de Materiais|Ferramentas|Martelo:Martelo cabo madeira:1:35.00;Chave Fenda:Chave fenda grande:2:8.50

# INSTRUÇÕES:
# - Não use acentos em nomes de arquivos
# - Separe campos com | (pipe)
# - Separe itens com ; (ponto e vírgula)
# - Separe detalhes do item com : (dois pontos)
# - Ordem do item: NOME:DESCRIÇÃO:QUANTIDADE:VALOR_UNITARIO
# - Use ponto para decimais (ex: 25.50)
# - Linhas que começam com # são comentários e serão ignoradas
`;

    const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_solicitacao_lote.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Modelo baixado",
      description: "O arquivo modelo foi baixado com sucesso!",
    });
  };

  const downloadAIInstructions = () => {
    const aiInstructionsContent = `# INSTRUÇÕES PARA IA - GERAÇÃO DE ARQUIVO DE SOLICITAÇÕES EM LOTE

## CONTEXTO
Você é uma IA especializada em ajudar a criar arquivos TXT para o sistema de solicitações em lote da Prefeitura Municipal de Inajá. Sua função é converter solicitações de compras/serviços em formato estruturado.

## FORMATO OBRIGATÓRIO
Cada linha representa uma solicitação no formato:
SOLICITANTE|EMPRESA|OBSERVACOES|ITEM1:DESCRICAO1:QTD1:VALOR1;ITEM2:DESCRICAO2:QTD2:VALOR2

## REGRAS IMPORTANTES
1. Use exatamente 4 campos separados por | (pipe)
2. Campos obrigatórios: SOLICITANTE e EMPRESA
3. OBSERVACOES pode ser vazio mas o campo deve existir
4. Itens são separados por ; (ponto e vírgula)
5. Detalhes do item são separados por : (dois pontos)
6. Ordem do item: NOME:DESCRIÇÃO:QUANTIDADE:VALOR_UNITÁRIO
7. Use ponto para decimais (25.50, não 25,50)
8. Não use acentos nos nomes dos arquivos
9. Linhas iniciadas com # são comentários

## EXEMPLO DE CONVERSAÇÃO

**Usuário:** "Preciso de uma solicitação para o João Silva da Secretaria de Obras comprar 10 sacos de cimento a R$ 35,00 cada e 5 metros de ferro a R$ 12,50 o metro para construção de calçada"

**Sua resposta:**
\`\`\`
João Silva|Secretaria de Obras|Materiais para construção de calçada|Saco de Cimento:Cimento CP-II 50kg:10:35.00;Ferro para Construção:Ferro 8mm por metro:5:12.50
\`\`\`

## PADRÕES PARA DIFERENTES TIPOS DE SOLICITAÇÃO

### Materiais de Construção
Nome do Item:Descrição técnica detalhada:Quantidade:Valor

### Material de Escritório  
Nome do Item:Especificação do produto:Quantidade:Valor

### Serviços
Nome do Serviço:Descrição completa do serviço:Quantidade/Horas:Valor

### Equipamentos
Nome do Equipamento:Modelo e especificações:Quantidade:Valor

## DICAS PARA VALORES
- Sempre use ponto para separar decimais
- Se o usuário informar com vírgula, converta para ponto
- Se não informar centavos, adicione .00
- Valores devem ser realistas para o mercado atual

## TRATAMENTO DE DADOS INCOMPLETOS
- Se faltar informação, peça esclarecimento
- Sugira valores aproximados quando necessário
- Sempre confirme antes de gerar a linha final

## VALIDAÇÃO ANTES DE ENTREGAR
Antes de enviar sua resposta, verifique:
✓ Exatamente 4 campos separados por |
✓ Pelo menos 1 item no formato correto
✓ Valores com ponto decimal
✓ Nomes sem caracteres especiais problemáticos

## EXEMPLO COMPLETO DE MÚLTIPLAS SOLICITAÇÕES

\`\`\`
# Solicitações da Secretaria de Obras - Janeiro 2024
José Santos|Secretaria de Obras|Material para reforma da escola|Tinta Latex:Tinta branca 18L:5:45.00;Rolo de Pintura:Rolo espuma 23cm:10:8.50
Maria Oliveira|Secretaria de Saúde|Equipamentos para posto de saúde|Termômetro Digital:Termômetro infravermelho:3:89.00;Álcool Gel:Álcool gel 70% 500ml:20:12.00
Pedro Silva|Secretaria de Educação|Material escolar|Papel A4:Papel sulfite 500 folhas:50:25.00;Caneta Azul:Caneta esferográfica azul:100:1.50
\`\`\`

## RESPOSTA PADRÃO
Sempre forneça:
1. O texto formatado entre \`\`\`
2. Confirmação dos dados interpretados
3. Sugestão de revisão se necessário

Agora você está pronto para ajudar na criação de arquivos de solicitação em lote!`;

    const blob = new Blob([aiInstructionsContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instrucoes_IA_solicitacao_lote.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Instruções para IA baixadas",
      description: "O arquivo de instruções para IA foi baixado com sucesso!",
    });
  };

  const parseTextFile = (content: string): Array<{ line: number; error: string; data?: BatchRequest }> => {
    const lines = content.split('\n');
    const results: Array<{ line: number; error: string; data?: BatchRequest }> = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Ignorar linhas vazias e comentários
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      try {
        const parts = trimmedLine.split('|');
        
        if (parts.length !== 4) {
          results.push({
            line: lineNumber,
            error: `Formato inválido. Esperado 4 campos separados por |, encontrados ${parts.length}`
          });
          return;
        }

        const [solicitante, empresa, observacoes, itemsStr] = parts.map(p => p.trim());

        if (!solicitante) {
          results.push({
            line: lineNumber,
            error: "Nome do solicitante é obrigatório"
          });
          return;
        }

        if (!empresa) {
          results.push({
            line: lineNumber,
            error: "Nome da empresa é obrigatório"
          });
          return;
        }

        // Parse dos itens
        const items: Array<{
          item: string;
          descricao: string;
          quantidade: number;
          valorUnitario: number;
        }> = [];

        if (itemsStr) {
          const itemParts = itemsStr.split(';');
          
          for (const itemPart of itemParts) {
            const itemDetails = itemPart.trim().split(':');
            
            if (itemDetails.length !== 4) {
              results.push({
                line: lineNumber,
                error: `Item inválido: "${itemPart}". Esperado formato NOME:DESCRIÇÃO:QTD:VALOR`
              });
              return;
            }

            const [item, descricao, qtdStr, valorStr] = itemDetails.map(d => d.trim());

            if (!item || !descricao) {
              results.push({
                line: lineNumber,
                error: `Item com nome ou descrição vazia: "${itemPart}"`
              });
              return;
            }

            const quantidade = parseInt(qtdStr);
            const valorUnitario = parseFloat(valorStr.replace(',', '.'));

            if (isNaN(quantidade) || quantidade <= 0) {
              results.push({
                line: lineNumber,
                error: `Quantidade inválida no item "${item}": "${qtdStr}"`
              });
              return;
            }

            if (isNaN(valorUnitario) || valorUnitario < 0) {
              results.push({
                line: lineNumber,
                error: `Valor unitário inválido no item "${item}": "${valorStr}"`
              });
              return;
            }

            items.push({
              item,
              descricao,
              quantidade,
              valorUnitario
            });
          }
        }

        if (items.length === 0) {
          results.push({
            line: lineNumber,
            error: "Nenhum item válido encontrado"
          });
          return;
        }

        // Se chegou até aqui, a linha é válida
        results.push({
          line: lineNumber,
          error: "",
          data: {
            solicitante,
            empresa,
            observacoes: observacoes || "",
            items
          }
        });

      } catch (error) {
        results.push({
          line: lineNumber,
          error: `Erro ao processar linha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    });

    return results;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo .txt",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const content = await file.text();
      const results = parseTextFile(content);
      setValidationResults(results);

      const validRequests = results.filter(r => !r.error && r.data).map(r => r.data!);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        toast({
          title: "Arquivo processado com erros",
          description: `${validRequests.length} solicitações válidas, ${errors.length} erros encontrados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Arquivo processado",
          description: `${validRequests.length} solicitações prontas para processar.`,
        });
      }

    } catch (error) {
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Limpar o input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processBatch = () => {
    const validRequests = validationResults.filter(r => !r.error && r.data).map(r => r.data!);
    
    if (validRequests.length === 0) {
      toast({
        title: "Nenhuma solicitação válida",
        description: "Não há solicitações válidas para processar.",
        variant: "destructive",
      });
      return;
    }

    onProcessBatch(validRequests);
    setValidationResults([]);
    
    toast({
      title: "Lote processado",
      description: `${validRequests.length} solicitações foram processadas com sucesso!`,
    });
  };

  const validCount = validationResults.filter(r => !r.error).length;
  const errorCount = validationResults.filter(r => r.error).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Solicitação em Lote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="template-download">1. Baixar Modelo Manual</Label>
            <Button 
              onClick={downloadTemplate}
              variant="outline" 
              className="w-full mt-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Modelo TXT
            </Button>
          </div>

          <div>
            <Label htmlFor="ai-instructions">1b. Baixar Instruções para IA</Label>
            <Button 
              onClick={downloadAIInstructions}
              variant="outline" 
              className="w-full mt-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Instruções IA
            </Button>
          </div>

          <div>
            <Label htmlFor="file-upload">2. Enviar Arquivo</Label>
            <div className="mt-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {validationResults.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-sm font-medium text-green-800">Válidas</div>
                <div className="text-2xl font-bold text-green-600">{validCount}</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-sm font-medium text-red-800">Erros</div>
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-blue-800">Total</div>
                <div className="text-2xl font-bold text-blue-600">{validationResults.length}</div>
              </div>
            </div>

            {errorCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Erros encontrados:</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {validationResults
                      .filter(r => r.error)
                      .map((result, index) => (
                        <div key={index} className="text-sm">
                          <strong>Linha {result.line}:</strong> {result.error}
                        </div>
                      ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={processBatch}
                disabled={validCount === 0}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Processar {validCount} Solicitações
              </Button>
              
              <Button 
                onClick={() => setValidationResults([])}
                variant="outline"
              >
                Limpar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};