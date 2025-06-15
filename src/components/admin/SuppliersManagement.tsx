
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Building } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contact: string;
  email: string;
}

const SuppliersManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newSupplier, setNewSupplier] = useState({ name: '', cnpj: '', contact: '', email: '' });

  const addSupplier = () => {
    if (newSupplier.name && newSupplier.cnpj) {
      const supplier: Supplier = {
        id: Date.now().toString(),
        ...newSupplier
      };
      setSuppliers([...suppliers, supplier]);
      setNewSupplier({ name: '', cnpj: '', contact: '', email: '' });
    }
  };

  const removeSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Fornecedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Formulário para adicionar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="supplier-name">Nome da Empresa</Label>
              <Input
                id="supplier-name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                placeholder="Razão social"
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={newSupplier.cnpj}
                onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                placeholder="Telefone/WhatsApp"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addSupplier} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fornecedor
              </Button>
            </div>
          </div>

          {/* Lista de fornecedores */}
          {suppliers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.cnpj}</TableCell>
                    <TableCell>{supplier.contact}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeSupplier(supplier.id)}
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

export default SuppliersManagement;
