import React from 'react';
import Link from 'next/link';
import { Cat } from '@/types';

export default function CatteryList({ cats }: { cats: Cat[] }) {
  return (
    <section id="kinvie-cattery" className="container mx-auto px-4 py-24 relative z-10">
      <div className="text-center mb-16">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-4 px-4 py-2 bg-accent rounded-full">
          Maine Coon Premium
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5 text-balance">
          KinVie Cattery
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Những em be Maine Coon mum mim, form dang chuan show dang cho Sen toi don ve dinh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cats.map((cat) => (
          <article 
            key={cat.id} 
            className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
          >
            {/* Image Container */}
            <div className="aspect-[4/5] relative overflow-hidden bg-muted">
              <img
                src={cat.img || "https://ui-avatars.com/api/?name=Cat&background=fecdd3&color=be123c"} 
                alt={`Meo Maine Coon - ${cat.name}`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating Badge */}
              <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-primary shadow-lg border border-border/50">
                {cat.breed}
              </div>
              
              {/* Quick View Button */}
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <button className="w-full bg-card/95 backdrop-blur-sm text-foreground font-semibold py-3 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-colors duration-300 shadow-xl">
                  Xem Chi Tiet
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {cat.name}
                </h3>
                <span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-muted rounded-full">
                  {cat.color}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>San sang ve nha moi</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <div className="text-center mt-16">
        <Link 
          href="/cattery" 
          className="group inline-flex items-center gap-3 text-foreground font-semibold px-8 py-4 rounded-full bg-card border border-border hover:border-primary/30 hover:bg-accent shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          Xem tat ca cac be
          <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
