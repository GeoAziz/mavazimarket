
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
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminProductsPage() {
  const products: Product[] = mockProducts; // In a real app, fetch this data

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
            <Input type="search" placeholder="Search products..." className="pl-10 w-full md:w-1/3" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {products.map((product) => (
                <TableRow key={product.id}>
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
                  <TableCell className="text-muted-foreground">{product.category}/{product.subcategory}</TableCell>
                  <TableCell className="text-muted-foreground">{product.price.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{product.stockQuantity}</TableCell>
                  <TableCell>
                    <Badge variant={product.stockQuantity > 0 ? 'default' : 'destructive'} 
                           className={product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/products/edit/${product.slug}`}>
                        <Edit size={18} className="text-blue-500" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 size={18} className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Pagination (Placeholder) */}
      <div className="flex justify-center mt-6">
        <Button variant="outline" className="mr-2">Previous</Button>
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
}
