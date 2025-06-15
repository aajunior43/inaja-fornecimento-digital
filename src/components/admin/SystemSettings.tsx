
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save } from 'lucide-react';
import { useSystemConfig } from '@/contexts/SystemConfigContext';
import { useToast } from '@/hooks/use-toast';

const SystemSettings = () => {
  const { config, updateConfig } = useSystemConfig();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso.",
    });
  };

  const handleChange = (field: string, value: string) => {
    updateConfig({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="municipality">Nome da Prefeitura</Label>
              <Input
                id="municipality"
                value={config.municipalityName}
                onChange={(e) => handleChange('municipalityName', e.target.value)}
                placeholder="Nome oficial da prefeitura"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={config.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(44) 0000-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail Oficial</Label>
              <Input
                id="email"
                type="email"
                value={config.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contato@inaja.pr.gov.br"
              />
            </div>
            <div>
              <Label htmlFor="logo">URL do Logotipo</Label>
              <Input
                id="logo"
                value={config.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={config.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Endereço completo da prefeitura"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição do Sistema</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição que aparecerá no sistema"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
