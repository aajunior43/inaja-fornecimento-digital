
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  nomeSolicitante: string;
  nomeEmpresa: string;
  dataSolicitacao: string;
  observacoes: string;
}

interface FormHeaderProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const FormHeader = ({ formData, setFormData }: FormHeaderProps) => {
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
            alt="Prefeitura de Inajá" 
            className="h-20 w-auto"
          />
        </div>
        <CardTitle className="text-blue-800 text-xl">
          PREFEITURA MUNICIPAL DE INAJÁ
        </CardTitle>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Av. Antônio Veiga Martins, 80 - CEP: 87670-000</p>
          <p>Telefone: (44) 3112-4320 | E-mail: prefeito@inaja.pr.gov.br</p>
        </div>
        <h2 className="text-lg font-semibold mt-4 text-gray-800">
          SOLICITAÇÃO DE FORNECIMENTO
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="solicitante">Nome do Solicitante</Label>
            <Input
              id="solicitante"
              value={formData.nomeSolicitante}
              onChange={(e) => updateFormData('nomeSolicitante', e.target.value)}
              placeholder="Digite o nome do solicitante"
            />
          </div>
          <div>
            <Label htmlFor="empresa">Nome da Empresa</Label>
            <Input
              id="empresa"
              value={formData.nomeEmpresa}
              onChange={(e) => updateFormData('nomeEmpresa', e.target.value)}
              placeholder="Digite o nome da empresa"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="data">Data da Solicitação</Label>
          <Input
            id="data"
            value={formData.dataSolicitacao}
            onChange={(e) => updateFormData('dataSolicitacao', e.target.value)}
            type="date"
          />
        </div>
        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => updateFormData('observacoes', e.target.value)}
            placeholder="Digite observações adicionais"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FormHeader;
