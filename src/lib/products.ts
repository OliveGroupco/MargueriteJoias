export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "aneis" | "colares" | "brincos" | "pulseiras";
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  description: string;
  details: string[];
  images: string[];
  featured?: boolean;
  isNew?: boolean;
  rating: number;
  reviews: number;
  stock: number;
};

export const categories = [
  { id: "aneis", label: "Anéis", description: "Peças que celebram momentos", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80" },
  { id: "colares", label: "Colares", description: "Elegância em cada detalhe", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" },
  { id: "brincos", label: "Brincos", description: "Brilho ao seu redor", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" },
  { id: "pulseiras", label: "Pulseiras", description: "Acentos refinados", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80" },
] as const;

import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("ativo", true)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  
  return data.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.nome,
    category: p.categoria_id as any,
    categoryLabel: categories.find(c => c.id === p.categoria_id)?.label || "Categoria",
    price: p.preco_promocional ? Number(p.preco_promocional) : Number(p.preco),
    oldPrice: p.preco_promocional ? Number(p.preco) : undefined,
    description: p.descricao || "",
    details: [], // Add details parsing if needed later
    images: p.imagens || [],
    featured: p.destaque,
    isNew: false,
    rating: 5,
    reviews: 0,
    stock: p.estoque,
  }));
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};

export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  const products = await fetchProducts();
  return products.find(p => p.slug === slug) || null;
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const products = await fetchProducts();
      return products.find(p => p.slug === slug) || null;
    },
    enabled: !!slug,
  });
};
export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
