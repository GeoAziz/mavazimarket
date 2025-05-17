"use client";

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockCategories } from '@/lib/mock-data';
import type { Category as CategoryType } from '@/lib/types';

interface FilterSidebarProps {
  currentCategorySlug?: string;
}

const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const brands = ['Mavazi Basics', 'Denim Co.', 'Urban Riders', 'StepUp', 'Summer Vibes', 'Elegance', 'Little Champs', 'Tiny Tots', 'Vituko', 'Kitenge Wear'];
const materials = ['Cotton', 'Leather', 'Denim', 'Silk', 'Polyester', 'Wool'];


export function FilterSidebar({ currentCategorySlug }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);

  const currentCategory = mockCategories.find(cat => cat.slug === currentCategorySlug);
  const subcategories = currentCategory ? currentCategory.subcategories : [];

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 space-y-6 p-4 border rounded-lg shadow-sm bg-card">
      <h3 className="text-xl font-semibold text-primary">Filters</h3>

      {subcategories.length > 0 && (
        <Accordion type="single" collapsible defaultValue="subcategories">
          <AccordionItem value="subcategories">
            <AccordionTrigger className="text-lg font-medium">Subcategories</AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {subcategories.map((subcat) => (
                <div key={subcat.id} className="flex items-center space-x-2">
                  <Checkbox id={`subcat-${subcat.id}`} />
                  <Label htmlFor={`subcat-${subcat.id}`} className="font-normal text-sm">{subcat.name}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Accordion type="multiple" collapsible className="w-full" defaultValue={['price', 'color']}>
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg font-medium">Price Range (KSh)</AccordionTrigger>
          <AccordionContent className="pt-2">
            <Slider
              defaultValue={[priceRange[0], priceRange[1]]}
              min={0}
              max={20000}
              step={100}
              onValueChange={handlePriceChange}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>KSh {priceRange[0].toLocaleString()}</span>
              <span>KSh {priceRange[1].toLocaleString()}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger className="text-lg font-medium">Color</AccordionTrigger>
          <AccordionContent className="grid grid-cols-3 gap-2 pt-2 max-h-48 overflow-y-auto">
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox id={`color-${color.toLowerCase()}`} />
                <Label htmlFor={`color-${color.toLowerCase()}`} className="font-normal text-sm">{color}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger className="text-lg font-medium">Size</AccordionTrigger>
          <AccordionContent className="grid grid-cols-3 gap-2 pt-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox id={`size-${size.toLowerCase()}`} />
                <Label htmlFor={`size-${size.toLowerCase()}`} className="font-normal text-sm">{size}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="brand">
          <AccordionTrigger className="text-lg font-medium">Brand</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand.toLowerCase().replace(/\s+/g, '-')}`} />
                <Label htmlFor={`brand-${brand.toLowerCase().replace(/\s+/g, '-')}`} className="font-normal text-sm">{brand}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="material">
          <AccordionTrigger className="text-lg font-medium">Material</AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
            {materials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox id={`material-${material.toLowerCase()}`} />
                <Label htmlFor={`material-${material.toLowerCase()}`} className="font-normal text-sm">{material}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Apply Filters</Button>
      <Button variant="outline" className="w-full">Clear Filters</Button>
    </aside>
  );
}
