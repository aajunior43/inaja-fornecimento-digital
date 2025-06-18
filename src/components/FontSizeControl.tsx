
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Type, RotateCcw } from "lucide-react";

interface FontSizeControlProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export const FontSizeControl = ({ fontSize, onFontSizeChange }: FontSizeControlProps) => {
  const handleReset = () => {
    onFontSizeChange(12);
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-400 text-sm flex items-center">
          <Type className="mr-2 h-4 w-4" />
          Tamanho da Fonte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Tamanho:</span>
            <span className="text-slate-100 font-semibold">{fontSize}pt</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={(value) => onFontSizeChange(value[0])}
            max={18}
            min={8}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>8pt</span>
            <span>18pt</span>
          </div>
        </div>
        <Button
          onClick={handleReset}
          size="sm"
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          Resetar
        </Button>
      </CardContent>
    </Card>
  );
};
