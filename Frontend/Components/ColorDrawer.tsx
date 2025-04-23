import {useState} from 'react';
import {CardContent, CardDescription, CardHeader, CardTitle, PalleteCard,} from "@/Components/ui/PalleteCard";
import {HexColorInput, HexColorPicker} from "react-colorful";
import {Slider} from "@/Components/ui/slider";
import {Button} from "@/Components/ui/button";
import {Droplet, Image, Layers, Maximize2, Minus, Type} from 'lucide-react';

export const DrawingPropertiesPanel = () => {
    const [color, setColor] = useState('#3b82f6');
    const [lineWidth, setLineWidth] = useState(3);
    const [activeTab, setActiveTab] = useState('color');
    const [opacity, setOpacity] = useState(100);

    const presets = [
        '#3b82f6', // blue-500
        '#ef4444', // red-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#8b5cf6', // violet-500
        '#ec4899', // pink-500
        '#000000', // black
        '#ffffff', // white
    ];

    return (
        <PalleteCard className="w-full  max-w-xs">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Droplet className="w-5 h-5" />
                    Drawing Properties
                </CardTitle>
                <CardDescription>Customize your drawing tools</CardDescription>
            </CardHeader>

            <div className="flex border-b px-4">
                <Button
                    variant="ghost"
                    className={`rounded-none border-b-2 ${activeTab === 'color' ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setActiveTab('color')}
                >
                    Color
                </Button>
                <Button
                    variant="ghost"
                    className={`rounded-none border-b-2 ${activeTab === 'style' ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setActiveTab('style')}
                >
                    Style
                </Button>
                <Button
                    variant="ghost"
                    className={`rounded-none border-b-2 ${activeTab === 'layers' ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setActiveTab('layers')}
                >
                    Layers
                </Button>
            </div>

            <CardContent className="space-y-6 pt-4">
                {activeTab === 'color' && (
                    <>
                        <HexColorPicker color={color} onChange={setColor} className="w-full" />
                        <HexColorInput
                            color={color}
                            onChange={setColor}
                            prefixed
                            className="w-full p-2 border rounded-md"
                        />

                        <div>
                            <h4 className="text-sm font-medium mb-2">Color Presets</h4>
                            <div className="grid grid-cols-8 gap-2">
                                {presets.map((preset) => (
                                    <button
                                        key={preset}
                                        className="w-6 h-6 rounded-full border"
                                        style={{ backgroundColor: preset }}
                                        onClick={() => setColor(preset)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'style' && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  Line Width
                </span>
                                <span className="text-xs text-muted-foreground">{lineWidth}px</span>
                            </div>
                            <Slider
                                value={[lineWidth]}
                                onValueChange={([value]) => setLineWidth(value)}
                                min={1}
                                max={20}
                                step={1}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Opacity
                </span>
                                <span className="text-xs text-muted-foreground">{opacity}%</span>
                            </div>
                            <Slider
                                value={[opacity]}
                                onValueChange={([value]) => setOpacity(value)}
                                min={10}
                                max={100}
                                step={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Type className="w-4 h-4" />
                                Add Text
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Image className="w-4 h-4" />
                                Insert Image
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'layers' && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">Background</span>
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: '#ffffff' }} />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded bg-accent">
                            <span className="text-sm">Drawing Layer</span>
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: color }} />
                        </div>
                        <Button variant="outline" className="w-full justify-start gap-2 mt-4">
                            <Layers className="w-4 h-4" />
                            Add New Layer
                        </Button>
                    </div>
                )}
            </CardContent>
        </PalleteCard>
    );
};