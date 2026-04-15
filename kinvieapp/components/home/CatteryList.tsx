import React from 'react';
import CatCard from '@/components/common/CatCard'; // Kéo card dùng chung vào

export default function CatteryList({ cats }: { cats: any[] }) {
  if (!cats || cats.length === 0) {
    return <div className="text-center text-stone-500">Hiện tại các bé đang bận ngủ, chưa có sẵn để đón...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cats.map((cat) => (
        <CatCard key={cat.id} cat={cat} />
      ))}
    </div>
  );
}