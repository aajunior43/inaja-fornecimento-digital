
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

export interface Item {
  id: string;
  item: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface ItemsTableProps {
  items: Item[];
  setItems: (items: Item[]) => void;
}

const ItemsTable = ({ items, setItems }: ItemsTableProps) => {
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
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updatedItem = {
          ...item,
          [field]: value
        };
        if (field === 'quantidade' || field === 'valorUnitario') {
          updatedItem.valorTotal = updatedItem.quantidade * updatedItem.valorUnitario;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const getTotalGeral = () => {
    return items.reduce((total, item) => total + item.valorTotal, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens da Solicitação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Item</th>
                <th className="border border-gray-300 p-2 text-left">Descrição</th>
                <th className="border border-gray-300 p-2 text-left">Qtd</th>
                <th className="border border-gray-300 p-2 text-left">Valor Unit.</th>
                <th className="border border-gray-300 p-2 text-left">Valor Total</th>
                <th className="border border-gray-300 p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={item.item}
                      onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                      placeholder="Nome do item"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={item.descricao}
                      onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                      placeholder="Descrição"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <span className="font-semibold">
                      R$ {item.valorTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={4} className="border border-gray-300 p-2 text-right font-semibold">
                  TOTAL GERAL:
                </td>
                <td className="border border-gray-300 p-2 font-bold">
                  R$ {getTotalGeral().toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4">
          <Button onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsTable;
