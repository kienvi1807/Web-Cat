"use client"

import React, { useState, useEffect, useRef } from 'react';

export default function ReviewPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hateButtonPos, setHateButtonPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 1. Kiểm tra xem khách này đã "Thích" chưa
    // Sếp có thể dùng localStorage hoặc check từ API Database ở đây
    const hasLiked = localStorage.getItem('hasLikedKinVie');
    
    if (!hasLiked) {
      // 2. Canh đúng 2 phút (120000ms) thì hiện Popup
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 120000); 

      return () => clearTimeout(timer);
    }
  }, []);

  // 3. Hàm làm nút Ghét chạy lung tung
  const moveHateButton = () => {
    if (buttonRef.current) {
      // Random vị trí trong khoảng an toàn để nút không chạy ra khỏi màn hình
      const newTop = Math.random() * 200 - 100; // Thay đổi tùy kích thước box
      const newLeft = Math.random() * 200 - 100;
      setHateButtonPos({ top: newTop, left: newLeft });
    }
  };

  // 4. Hàm xử lý khi khách bấm Thích
  const handleLike = async () => {
    // Lưu vào LocalStorage để lần sau không hiện
    localStorage.setItem('hasLikedKinVie', 'true');
    
    // GỌI API LƯU VÀO DATABASE Ở ĐÂY
    // await fetch('/api/user/like', { method: 'POST', ... })

    alert("Cảm ơn Boss đã yêu thương KinVie! 🥰"); // Có thể thay bằng Toast/Notification xịn hơn
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      {/* Box Popup */}
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 relative overflow-hidden">
        <h2 className="text-3xl font-black text-pink-500 mb-2">Xin chào Sen! 👋</h2>
        <p className="text-stone-600 mb-8 font-medium">Lượn web KinVie nãy giờ, Sen thấy có ưng cái bụng không nàooo?</p>
        
        <div className="relative h-32 flex items-center justify-center gap-4">
          
          {/* NÚT THÍCH (Đứng im) */}
          <button 
            onClick={handleLike}
            className="bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Thích xỉu luôn! 😻
          </button>

          {/* NÚT GHÉT (Chạy lung tung) */}
          <button
            ref={buttonRef}
            onMouseEnter={moveHateButton}
            onTouchStart={moveHateButton} // Hỗ trợ điện thoại chạm vào là chạy
            className="absolute bg-stone-200 text-stone-600 font-bold py-3 px-8 rounded-full shadow transition-all duration-200 ease-out"
            style={{
              transform: `translate(${hateButtonPos.left}px, ${hateButtonPos.top}px)`,
            }}
          >
            Cũng bình thường 😿
          </button>

        </div>
      </div>
    </div>
  );
}