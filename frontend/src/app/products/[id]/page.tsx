// app/products/[id]/page.tsx (Server Component)

import ProductDetailClient from './ProductDetailClient';

// This function pre-defines the list of product IDs that will be statically generated.
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // add more ids if needed
  ];
}

export default function ProductPage({ params }: { params: { id: string } }) {
  // You can perform additional server-side logic here if needed.
  return <ProductDetailClient id={params.id} />;
}
