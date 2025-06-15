
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
    <div className="p-0">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <img 
              src="/lovable-uploads/007f16c7-9a20-4239-954a-386da9c3b0b4.png" 
              alt="Prefeitura de Inajá" 
              className="h-16 w-auto"
            />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold mb-2">
          PREFEITURA MUNICIPAL DE INAJÁ
        </CardTitle>
        <div className="space-y-1 text-blue-100 text-sm">
          <p>Av. Antônio Veiga Martins, 80 - CEP: 87670-000</p>
          <p>Telefone: (44) 3112-4320 | E-mail: prefeito@inaja.pr.gov.br</p>
        </div>
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-6">
          <h2 className="text-xl font-bold text-white">
            SOLICITAÇÃO DE FORNECIMENTO
          </h2>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="solicitante" className="text-gray-700 font-medium">Nome do Solicitante</Label>
            <Input
              id="solicitante"
              value={formData.nomeSolicitante}
              onChange={(e) => updateFormData('nomeSolicitante', e.target.value)}
              placeholder="Digite o nome do solicitante"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="empresa" className="text-gray-700 font-medium">Nome da Empresa</Label>
            <Input
              id="empresa"
              value={formData.nomeEmpresa}
              onChange={(e) => updateFormData('nomeEmpresa', e.target.value)}
              placeholder="Digite o nome da empresa"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data" className="text-gray-700 font-medium">Data da Solicitação</Label>
          <Input
            id="data"
            value={formData.dataSolicitacao}
            onChange={(e) => updateFormData('dataSolicitacao', e.target.value)}
            type="date"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 max-w-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="observacoes" className="text-gray-700 font-medium">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => updateFormData('observacoes', e.target.value)}
            placeholder="Digite observações adicionais"
            rows={4}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </CardContent>
    </div>
  );
};

export default FormHeader;
