import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';

export default function PetshopGrid({ products }: { products: Product[] }) {
  return (
    <section id="beam-petshop" className="relative py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-muted" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(225,29,72,0.03),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-4 px-4 py-2 bg-card rounded-full border border-border/50">
              Beam Petshop
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5 text-balance">
              San Pham Yeu Thich
            </h2>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
              Lua chon nhung mon do xinh xan, chat luong va dinh duong nhat de cham soc hoang thuong.
            </p>
          </div>
                    <Link 
            href="/petshop"
            className="group inline-flex items-center gap-3 text-foreground font-semibold px-6 py-3.5 rounded-full bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
          >
            Den cua hang
            <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <article 
              key={product.id} 
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden bg-accent/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground/50 text-xs px-4 text-center">{product.img}</span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {product.category}
                </div>
                
                {/* Add to Cart Button */}
                <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-card rounded-full text-muted-foreground shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-card-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xl font-black text-primary">{product.price}</p>
                  <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
                    Chi tiet
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}