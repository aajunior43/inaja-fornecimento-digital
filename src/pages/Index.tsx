
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Settings, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { useSystemConfig } from "@/contexts/SystemConfigContext";

const Index = () => {
  const { config } = useSystemConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Building className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {config.municipalityName}
          </h1>
          <p className="text-xl text-gray-600 mb-2">{config.address}</p>
          <p className="text-lg text-gray-700">{config.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Nova Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Crie uma nova solicitação de compra, serviço ou manutenção para sua secretaria.
              </p>
              <Link to="/solicitar">
                <Button className="w-full">
                  Criar Solicitação
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-gray-600" />
                Administração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Acesse o painel administrativo para gerenciar configurações e dados do sistema.
              </p>
              <Link to="/admin/login">
                <Button variant="outline" className="w-full">
                  Área Administrativa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {config.phone || config.email ? (
          <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="flex justify-center gap-6 text-gray-600">
              {config.phone && <span>📞 {config.phone}</span>}
              {config.email && <span>✉️ {config.email}</span>}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Index;
