
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
    <div className="p-0">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-gray-800 text-white rounded-t-2xl">
        <CardTitle className="text-xl font-bold">Itens da Solicitação</CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white">
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <th className="border border-blue-200 p-4 text-left font-semibold">Item</th>
                <th className="border border-blue-200 p-4 text-left font-semibold">Descrição</th>
                <th className="border border-blue-200 p-4 text-center font-semibold">Qtd</th>
                <th className="border border-blue-200 p-4 text-center font-semibold">Valor Unit.</th>
                <th className="border border-blue-200 p-4 text-center font-semibold">Valor Total</th>
                <th className="border border-blue-200 p-4 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-200 p-3">
                    <Input
                      value={item.item}
                      onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                      placeholder="Nome do item"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <Input
                      value={item.descricao}
                      onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                      placeholder="Descrição"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <Input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value) || 0)}
                      className="w-20 text-center border-gray-300 focus:border-blue-500"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      className="w-28 text-center border-gray-300 focus:border-blue-500"
                    />
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className="font-bold text-green-600">
                      R$ {item.valorTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="hover:bg-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <td colSpan={4} className="border border-green-200 p-4 text-right font-bold text-lg">
                  TOTAL GERAL:
                </td>
                <td className="border border-green-200 p-4 font-bold text-xl text-center">
                  R$ {getTotalGeral().toFixed(2)}
                </td>
                <td className="border border-green-200 p-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-6">
          <Button 
            onClick={addItem} 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default ItemsTable;
