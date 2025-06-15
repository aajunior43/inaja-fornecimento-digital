
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    municipalityName: 'Prefeitura Municipal de Inajá-PE',
    address: '',
    phone: '',
    email: '',
    logo: '',
    description: 'Sistema de Gestão de Solicitações'
  });

  const handleSave = () => {
    // Aqui você salvaria as configurações
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
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
                value={settings.municipalityName}
                onChange={(e) => setSettings({...settings, municipalityName: e.target.value})}
                placeholder="Nome oficial da prefeitura"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                placeholder="(87) 0000-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail Oficial</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                placeholder="contato@inaja.pe.gov.br"
              />
            </div>
            <div>
              <Label htmlFor="logo">URL do Logotipo</Label>
              <Input
                id="logo"
                value={settings.logo}
                onChange={(e) => setSettings({...settings, logo: e.target.value})}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              placeholder="Endereço completo da prefeitura"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição do Sistema</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
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
