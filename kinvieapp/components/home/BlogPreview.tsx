import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="container mx-auto px-4 py-24 relative z-10">
      <div className="text-center mb-16">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/80 mb-4 px-4 py-2 bg-accent rounded-full">
          Blog & Guides
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5 text-balance">
          Goc Sen Tu Hoc
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Cam nang nuoi duong va cham soc meo chuan khoa hoc tu doi ngu KinVie.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {posts.map((post, index) => (
          <Link 
            href="/blog" 
            key={post.id} 
            className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image Container */}
              <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto relative overflow-hidden bg-muted shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground/50 text-xs px-2 text-center relative z-10">{post.img}</span>
                </div>
                
                {/* Number Badge */}
                <div className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-card/95 backdrop-blur-sm rounded-full text-sm font-bold text-primary shadow-lg border border-border/50">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide bg-accent px-3 py-1.5 rounded-full">
                    {post.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4">
                  Kham pha nhung meo hay ho va chuan khoa hoc de giup be meo nha ban khoe manh, xinh dep hon moi ngay...
                </p>
                
                <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                  <span>Doc them</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-16">
        <Link 
          href="/blog" 
          className="group inline-flex items-center gap-3 text-foreground font-semibold px-8 py-4 rounded-full bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          Xem tat ca bai viet
          <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
