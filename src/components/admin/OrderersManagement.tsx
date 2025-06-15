
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { useSystemConfig } from '@/contexts/SystemConfigContext';

const OrderersManagement = () => {
  const { config, addOrderer, removeOrderer } = useSystemConfig();
  const [newOrderer, setNewOrderer] = useState({ name: '', position: '', department: '' });

  const handleAdd = () => {
    if (newOrderer.name && newOrderer.position && newOrderer.department) {
      addOrderer(newOrderer);
      setNewOrderer({ name: '', position: '', department: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ordenadores de Despesa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Formulário para adicionar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newOrderer.name}
                onChange={(e) => setNewOrderer({...newOrderer, name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={newOrderer.position}
                onChange={(e) => setNewOrderer({...newOrderer, position: e.target.value})}
                placeholder="Ex: Prefeito, Secretário"
              />
            </div>
            <div>
              <Label htmlFor="department">Secretaria</Label>
              <Input
                id="department"
                value={newOrderer.department}
                onChange={(e) => setNewOrderer({...newOrderer, department: e.target.value})}
                placeholder="Ex: Educação, Saúde"
              />
            </div>
            <div className="md:col-span-3">
              <Button onClick={handleAdd} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Ordenador
              </Button>
            </div>
          </div>

          {/* Lista de ordenadores */}
          {config.orderers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.orderers.map((orderer) => (
                  <TableRow key={orderer.id}>
                    <TableCell>{orderer.name}</TableCell>
                    <TableCell>{orderer.position}</TableCell>
                    <TableCell>{orderer.department}</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeOrderer(orderer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderersManagement;
