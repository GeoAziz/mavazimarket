
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 5;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts); // In a real app, fetch this data
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleSelectProduct = (productId: string, checked: boolean | string) => {
    setSelectedProductIds(prev => 
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedProductIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const isAllSelected = paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length;
  const isSomeSelected = selectedProductIds.length > 0 && selectedProductIds.length < paginatedProducts.length;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/admin/products/new">
            <PlusCircle size={20} className="mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Product List</CardTitle>
           <div className="mt-4 relative">
            <Input 
              type="search" 
              placeholder="Search products (name, category, brand...)" 
              className="pl-10 w-full md:w-1/2" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all products on this page"
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (KSh)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length > 0 ? paginatedProducts.map((product) => (
                  <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) ? "selected" : ""}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, checked)}
                        aria-label={`Select product ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={64}
                        className="rounded-md object-cover"
                        data-ai-hint={product.dataAiHint || 'product clothing'}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category}{product.subcategory ? `/${product.subcategory}` : ''}</TableCell>
                    <TableCell className="text-muted-foreground">{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{product.stockQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.stockQuantity > 0 ? 'default' : 'destructive'} 
                            className={product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/edit/${product.slug}`}>
                          <Edit size={18} className="text-blue-500 hover:text-blue-700" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => alert(`Delete ${product.name}? (Mock)`)}>
                        <Trash2 size={18} className="text-destructive hover:text-red-700" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
      {selectedProductIds.length > 0 && (
        <div className="mt-4 p-2 bg-muted rounded-md text-sm text-muted-foreground">
          {selectedProductIds.length} product(s) selected. (Bulk actions placeholder)
        </div>
      )}
    </div>
  );
}
