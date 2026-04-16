"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function HeroBanner() {
  const [isDay, setIsDay] = useState(true);
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'cloudy' | 'rain' | 'thunder'>('clear');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm state loading

  // 🌍 1. ĐỒNG BỘ THỜI TIẾT HẢI PHÒNG (API Open-Meteo)
  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=20.8648&longitude=106.6835&current_weather=true&timezone=Asia%2FHo_Chi_Minh');
        const data = await res.json();
        const current = data.current_weather;

        const code = current.weathercode;
        if (code === 0) setWeatherCondition('clear');
        else if (code >= 1 && code <= 3) setWeatherCondition('cloudy');
        else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) setWeatherCondition('rain');
        else if (code >= 95) setWeatherCondition('thunder');
        else setWeatherCondition('clear');

        setIsDay(current.is_day === 1);
        setTemperature(Math.round(current.temperature));
      } catch (error) {
        console.error("Lỗi đồng bộ thời tiết:", error);
      } finally {
        // Sau khi lấy xong (dù lỗi hay không), tắt loading
        setIsLoading(false);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  // 📝 2. LOGIC CÂU SLOGAN ĐỘNG THEO THỜI TIẾT (Cập nhật dễ thương hơn)
  const getDynamicSlogan = () => {
    if (weatherCondition === 'clear') {
      return isDay ? '✨ Trời nắng đẹp quá, bế Boss ra sưởi nắng thôi sen ơi!' : '🌙 Đêm thanh gió mát, Boss đang nằm ườn hóng gió nè.';
    }
    if (weatherCondition === 'cloudy') return '🍃 Trời nhiều gió rùi, sen nhớ mặc thêm áo cho Boss nha.';
    if (weatherCondition === 'rain') return '☔ Đang mưa rí rắc, ở nhà đặt ship pate là chuẩn bài!';
    if (weatherCondition === 'thunder') return '⚡ Sấm đùng đùng kìa, sen ôm Boss chặt vào kẻo em nó sợ.';
    return '✨ Mọi thứ Boss cần, KinVie đều có đủ!'; 
  };

  // 🎨 3. MÀU BẦU TRỜI CHUYỂN ĐỔI MƯỢT MÀ
  const getSkyGradient = () => {
    if (weatherCondition === 'thunder') return 'from-slate-900 via-stone-900 to-black';
    if (weatherCondition === 'rain') return isDay ? 'from-slate-500 via-gray-600 to-slate-800' : 'from-slate-800 via-stone-900 to-black';
    if (weatherCondition === 'cloudy') return isDay ? 'from-sky-300 via-slate-300 to-gray-400' : 'from-slate-800 to-gray-900';
    return isDay ? 'from-sky-400 via-blue-300 to-amber-100' : 'from-indigo-950 via-purple-900 to-stone-900'; 
  };

  // =======================================
  // HIỂN THỊ MÀN HÌNH LOADING
  // =======================================
  if (isLoading) {
    return (
      <section className="relative h-[600px] md:h-[750px] w-full bg-slate-800 flex items-center justify-center flex-col gap-4">
        <style dangerouslySetInnerHTML={{__html: `@keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } } .animate-bounce-slow { animation: bounce-slow 2s infinite ease-in-out; }`}} />
        <svg className="w-20 h-20 text-pink-300 animate-bounce-slow opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 19c-2.48 0-4.5-2.02-4.5-4.5 0-.25.02-.5.06-.74A5.996 5.996 0 0 0 8 15c-3.31 0-6-2.69-6-6s2.69-6 6-6c.38 0 .75.04 1.11.1A6.994 6.994 0 0 1 16 2.01c3.86 0 7 3.14 7 7 0 3.3-2.26 6.09-5.32 6.84-.36.09-.75.15-1.18.15z"/></svg>
        <p className="text-pink-200/80 font-medium tracking-wide animate-pulse">Đang xem thời tiết Hải Phòng...</p>
      </section>
    );
  }

  // =======================================
  // GIAO DIỆN CHÍNH SAU KHI LOAD XONG
  // =======================================
  return (
    <section className={`relative h-[600px] md:h-[750px] w-full overflow-hidden transition-colors duration-[3000ms] bg-gradient-to-br ${getSkyGradient()} flex items-center`}>
      
      {/* CSS ANIMATIONS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rain-fall { 0% { transform: translateY(-10vh) translateX(5px) rotate(5deg); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100vh) translateX(-10px) rotate(5deg); opacity: 0; } }
        @keyframes flash { 0%, 95%, 98% { opacity: 0; } 96%, 99%, 100% { opacity: 1; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes float-cloud-1 { 0% { transform: translateX(100vw); } 100% { transform: translateX(-50vw); } }
        @keyframes float-cloud-2 { 0% { transform: translateX(100vw); } 100% { transform: translateX(-80vw); } }
        @keyframes wind-leaf { 0% { transform: translate(120vw, -10vh) rotate(0deg); opacity: 0;} 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(-20vw, 80vh) rotate(360deg); opacity: 0;} }
        @keyframes text-shine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        
        @keyframes cat-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes cat-shiver { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        
        .animate-shine { background-size: 200% auto; animation: text-shine 4s linear infinite; }
        .raindrop { position: absolute; width: 1.5px; height: 40px; background: linear-gradient(transparent, rgba(255,255,255,0.5)); animation: rain-fall 1.2s linear infinite; }
        .cloud-fast { position: absolute; animation: float-cloud-1 30s linear infinite; }
        .cloud-slow { position: absolute; animation: float-cloud-2 50s linear infinite; opacity: 0.5; }
        .falling-leaf { position: absolute; font-size: 24px; animation: wind-leaf 6s linear infinite; }
        
        .animate-cat-float { animation: cat-float 4s ease-in-out infinite; }
        .animate-cat-shiver { animation: cat-shiver 0.15s infinite; }
      `}} />

      {/* HIỆU ỨNG MẶT TRỜI / MẶT TRĂNG */}
      <div className={`absolute transition-all duration-[2000ms] ${isDay && weatherCondition === 'clear' ? 'top-20 right-32' : 'top-10 right-20'} z-0`}>
        {isDay && weatherCondition !== 'rain' && weatherCondition !== 'thunder' ? (
          <div className="w-32 h-32 md:w-48 md:h-48 bg-yellow-300 rounded-full shadow-[0_0_100px_40px_rgba(253,224,71,0.5)] animate-pulse" />
        ) : !isDay ? (
          <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-100 rounded-full shadow-[0_0_50px_15px_rgba(255,255,255,0.3)] relative overflow-hidden">
            <div className="absolute top-2 right-4 w-full h-full bg-indigo-950 rounded-full opacity-90 mix-blend-multiply" />
          </div>
        ) : null}
      </div>

      {/* SAO ĐÊM */}
      {!isDay && weatherCondition === 'clear' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full animate-[twinkle_3s_infinite]" style={{
              width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 50 + '%', left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's'
            }} />
          ))}
        </div>
      )}

      {/* CHỈ HIỆN MÂY KHI TRỜI CLOUDY */}
      {weatherCondition === 'cloudy' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Cụm mây xịn xò */}
          <svg className="cloud-slow top-[5%] w-[400px] md:w-[600px]" fill={isDay ? "#f1f5f9" : "#334155"} viewBox="0 0 512 512"><path d="M400,224c-13.6,0-26.6,2.9-38.3,8.1C343.8,162.7,272.9,112,192,112c-97.2,0-176,78.8-176,176c0,97.2,78.8,176,176,176h208 c61.9,0,112-50.1,112-112C512,274.1,461.9,224,400,224z"/></svg>
          <svg className="cloud-fast top-[20%] w-[300px] md:w-[450px]" fill={isDay ? "#ffffff" : "#475569"} opacity="0.8" viewBox="0 0 512 512" style={{ animationDelay: '5s' }}><path d="M400,224c-13.6,0-26.6,2.9-38.3,8.1C343.8,162.7,272.9,112,192,112c-97.2,0-176,78.8-176,176c0,97.2,78.8,176,176,176h208 c61.9,0,112-50.1,112-112C512,274.1,461.9,224,400,224z"/></svg>
          
          {/* Lá rụng do gió thổi */}
          <div className="falling-leaf" style={{ animationDelay: '0s' }}>🍂</div>
          <div className="falling-leaf" style={{ animationDelay: '2.5s', top: '10%' }}>🍃</div>
          <div className="falling-leaf" style={{ animationDelay: '4s', top: '30%', fontSize: '18px' }}>🍂</div>
        </div>
      )}

      {/* HIỆU ỨNG MƯA & SẤM CHỚP */}
      {(weatherCondition === 'rain' || weatherCondition === 'thunder') && (
        <div className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-hidden">
           {[...Array(50)].map((_, i) => (
             <div key={i} className="raindrop" style={{ left: `${Math.random() * 120 - 10}%`, animationDelay: `${Math.random() * 2}s` }} />
           ))}
        </div>
      )}
      {weatherCondition === 'thunder' && (
        <div className="absolute inset-0 w-full h-full bg-white mix-blend-overlay pointer-events-none z-10" style={{ animation: 'flash 5s infinite' }}></div>
      )}

      {/* =======================================
          🐈 MÈO MAINE COON BẰNG ẢNH THẬT
          ======================================= */}
      <div className="absolute bottom-0 right-0 md:right-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] z-10 pointer-events-none flex items-end justify-center">
        
        {weatherCondition === 'clear' && (
          <div className="relative w-full h-full animate-cat-float">
            <Image src="/weather-status/sunny.png" alt="Mèo tận hưởng nắng" fill sizes="(max-width: 768px) 350px, 600px" className="object-contain object-bottom drop-shadow-2xl" />
          </div>
        )}

        {weatherCondition === 'cloudy' && (
          <div className="relative w-full h-full animate-cat-float" style={{ animationDuration: '3s' }}>
            <Image src="/weather-status/cloudy.png" alt="Mèo vui chơi đón gió" fill sizes="(max-width: 768px) 350px, 600px" className="object-contain object-bottom drop-shadow-2xl" />
          </div>
        )}

        {weatherCondition === 'rain' && (
          <div className="relative w-full h-full">
            <Image src="/weather-status/raining.png" alt="Mèo trú mưa dưới lá sen" fill sizes="(max-width: 768px) 350px, 600px" className="object-contain object-bottom drop-shadow-2xl" priority />
          </div>
        )}

        {weatherCondition === 'thunder' && (
          <div className="relative w-full h-full animate-cat-shiver">
            <Image src="/weather-status/thunder.png" alt="Mèo sợ sấm chớp" fill sizes="(max-width: 768px) 350px, 600px" className="object-contain object-bottom drop-shadow-2xl" />
          </div>
        )}

      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/50 to-transparent z-10 pointer-events-none" />

      {/* =======================================
          NỘI DUNG CHÍNH
          ======================================= */}
      <div className="relative z-20 container mx-auto px-6 max-w-7xl h-full flex flex-col justify-center">
        
        {/* WIDGET ĐỊA ĐIỂM HẢI PHÒNG (Nâng cấp) */}
        <div className="absolute top-8 right-6 md:top-12 md:right-12 z-50">
          <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 cursor-default">
            
            {/* Chấm Ping Sang Trọng */}
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)]"></span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-[16px] tracking-wide text-white">Hải Phòng</span>
                <span className="font-semibold text-pink-300 text-[14px]">
                  {temperature !== null ? `${temperature}°C` : '--°C'}
                </span>
              </div>
              <span className="text-[11px] font-medium text-stone-300 uppercase tracking-wider mt-0.5">
                {weatherCondition === 'clear' && (isDay ? 'Trời Nắng' : 'Trời Quang')}
                {weatherCondition === 'cloudy' && 'Nhiều Gió'}
                {weatherCondition === 'rain' && 'Có Mưa'}
                {weatherCondition === 'thunder' && 'Sấm Chớp'}
              </span>
            </div>
          </div>
        </div>

        {/* HAI DÒNG SLOGAN */}
        <div className="max-w-2xl space-y-8 mt-10 md:mt-0">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <span className="inline-block relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-200 to-rose-400 animate-shine font-serif italic pr-2">
                KinVie
              </span>
            </span>
            <br />
            có mọi thứ <br /> Boss cần.
          </h1>
          
          {/* Câu Slogan Động (Dễ thương hơn) */}
          <div className="inline-flex items-center gap-4 bg-stone-900/60 backdrop-blur-sm border border-stone-700/50 py-3 px-6 rounded-3xl rounded-tl-sm shadow-xl mt-4">
            <p className="text-lg md:text-xl font-medium text-stone-200 tracking-wide">
              {getDynamicSlogan()}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}