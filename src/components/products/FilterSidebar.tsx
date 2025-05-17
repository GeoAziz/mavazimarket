
"use client";

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/lib/mock-data';

export interface SelectedFilters {
  subcategories: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  brands: string[];
  materials: string[];
}

interface FilterSidebarProps {
  currentCategorySlug?: string;
  onApplyFilters: (filters: SelectedFilters) => void;
  onClearFilters: () => void;
}

const allColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Beige', 'Brown', 'Grey'];
const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28W', '30W', '32W', '34W', '36W', '38W', '6', '7', '8', '9', '10', '11', '12'];
const allBrands = ['Mavazi Basics', 'Denim Co.', 'Urban Riders', 'StepUp', 'Summer Vibes', 'Elegance', 'Little Champs', 'Tiny Tots', 'Vituko', 'Kitenge Wear', 'Safari Gear'];
const allMaterials = ['Cotton', 'Leather', 'Denim', 'Silk', 'Polyester', 'Wool', 'Linen', 'Viscose', 'Canvas'];


export function FilterSidebar({ currentCategorySlug, onApplyFilters, onClearFilters }: FilterSidebarProps) {
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const currentCategory = mockCategories.find(cat => cat.slug === currentCategorySlug);
  const subcategories = currentCategory ? currentCategory.subcategories : [];

  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleApply = () => {
    onApplyFilters({
      subcategories: selectedSubcategories,
      priceRange,
      colors: selectedColors,
      sizes: selectedSizes,
      brands: selectedBrands,
      materials: selectedMaterials,
    });
  };

  const handleClear = () => {
    setSelectedSubcategories([]);
    setPriceRange([0, 20000]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedMaterials([]);
    onClearFilters();
  };

  return (
    <aside className="w-full space-y-6 p-4 border rounded-lg shadow-sm bg-card lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <h3 className="text-xl font-semibold text-primary">Filters</h3>

      {subcategories.length > 0 && (
        <Accordion type="single" collapsible defaultValue="subcategories" className="w-full">
          <AccordionItem value="subcategories">
            <AccordionTrigger className="text-lg font-medium hover:no-underline">Subcategories</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
              {subcategories.map((subcat) => (
                <div key={subcat.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`subcat-${subcat.slug}`} 
                    checked={selectedSubcategories.includes(subcat.slug)}
                    onCheckedChange={() => handleCheckboxChange(setSelectedSubcategories, subcat.slug)}
                  />
                  <Label htmlFor={`subcat-${subcat.slug}`} className="font-normal text-sm cursor-pointer">{subcat.name}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Accordion type="multiple" className="w-full" defaultValue={['price', 'color']}>
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-medium hover:no-underline">Price Range (KSh)</AccordionTrigger>
          <AccordionContent className="pt-2">
            <Slider
              value={priceRange}
              min={0}
              max={20000}
              step={100}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>KSh {priceRange[0].toLocaleString()}</span>
              <span>KSh {priceRange[1].toLocaleString()}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger className="text-lg font-medium hover:no-underline">Color</AccordionTrigger>
          <AccordionContent className="grid grid-cols-3 gap-2 pt-2 max-h-48 overflow-y-auto">
            {allColors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox 
                  id={`color-${color.toLowerCase()}`} 
                  checked={selectedColors.includes(color)}
                  onCheckedChange={() => handleCheckboxChange(setSelectedColors, color)}
                />
                <Label htmlFor={`color-${color.toLowerCase()}`} className="font-normal text-sm cursor-pointer">{color}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger className="text-lg font-medium hover:no-underline">Size</AccordionTrigger>
          <AccordionContent className="grid grid-cols-3 gap-2 pt-2 max-h-48 overflow-y-auto">
            {allSizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox 
                  id={`size-${size.toLowerCase()}`} 
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() => handleCheckboxChange(setSelectedSizes, size)}
                />
                <Label htmlFor={`size-${size.toLowerCase()}`} className="font-normal text-sm cursor-pointer">{size}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="brand">
          <AccordionTrigger className="text-lg font-medium hover:no-underline">Brand</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
            {allBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox 
                  id={`brand-${brand.toLowerCase().replace(/\s+/g, '-')}`} 
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleCheckboxChange(setSelectedBrands, brand)}
                />
                <Label htmlFor={`brand-${brand.toLowerCase().replace(/\s+/g, '-')}`} className="font-normal text-sm cursor-pointer">{brand}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="material">
          <AccordionTrigger className="text-lg font-medium hover:no-underline">Material</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
            {allMaterials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox 
                  id={`material-${material.toLowerCase()}`} 
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={() => handleCheckboxChange(setSelectedMaterials, material)}
                />
                <Label htmlFor={`material-${material.toLowerCase()}`} className="font-normal text-sm cursor-pointer">{material}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4 space-y-2">
        <Button onClick={handleApply} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Apply Filters</Button>
        <Button onClick={handleClear} variant="outline" className="w-full">Clear Filters</Button>
      </div>
    </aside>
  );
}
