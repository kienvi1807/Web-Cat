"use client"

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroBanner() {
  const [isDay, setIsDay] = useState(true);
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'cloudy' | 'rain' | 'thunder'>('clear');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref để điều khiển cuộn ngang bằng nút bấm trên PC
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 🕒 TÍNH TOÁN QUỸ ĐẠO BÁN NGUYỆT THEO THỜI GIAN THỰC TẾ
  const [celestialProgress, setCelestialProgress] = useState(0.5);

  useEffect(() => {
    const updateTimeProgress = () => {
      const date = new Date();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const timeInHours = hour + minute / 60; // Tính ra số thập phân (VD: 6h30 = 6.5)

      let progress = 0.5;
      // Ban ngày: từ 6h sáng (0%) đến 18h tối (100%)
      if (timeInHours >= 6 && timeInHours < 18) {
        progress = (timeInHours - 6) / 12;
      } 
      // Ban đêm: từ 18h tối (0%) đến 6h sáng hôm sau (100%)
      else {
        let nightHour = timeInHours >= 18 ? timeInHours - 18 : timeInHours + 6;
        progress = nightHour / 12;
      }
      setCelestialProgress(progress);
    };

    updateTimeProgress();
    const interval = setInterval(updateTimeProgress, 60000); // Cập nhật lại mỗi 1 phút
    return () => clearInterval(interval);
  }, []);

  // 🌍 ĐỒNG BỘ THỜI TIẾT
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
        setIsLoading(false);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const getDynamicSlogan = () => {
    if (weatherCondition === 'clear') {
      return isDay ? '✨ Trời nắng đẹp quá, bế Boss ra sưởi nắng thôi sen ơi!' : '🌙 Đêm thanh gió mát, Boss đang nằm ườn hóng gió nè.';
    }
    if (weatherCondition === 'cloudy') return '🍃 Trời nhiều gió rùi, sen nhớ mặc thêm áo cho Boss nha.';
    if (weatherCondition === 'rain') return '☔ Đang mưa rí rắc, ở nhà đặt ship pate là chuẩn bài!';
    if (weatherCondition === 'thunder') return '⚡ Sấm đùng đùng kìa, sen ôm Boss chặt vào kẻo em nó sợ.';
    return '✨ Mọi thứ Boss cần, KinVie đều có đủ!'; 
  };

  const getSkyGradient = () => {
    if (weatherCondition === 'thunder') return 'from-slate-900 via-stone-900 to-black';
    if (weatherCondition === 'rain') return isDay ? 'from-slate-500 via-gray-600 to-slate-800' : 'from-slate-800 via-stone-900 to-black';
    if (weatherCondition === 'cloudy') return isDay ? 'from-sky-300 via-slate-300 to-gray-400' : 'from-slate-800 to-gray-900';
    return isDay ? 'from-sky-400 via-blue-300 to-amber-100' : 'from-indigo-950 via-purple-900 to-stone-900'; 
  };

  const scrollSlide = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      ref={scrollContainerRef}
      className="w-full h-[750px] md:h-[700px] flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar relative bg-stone-900"
    >
      
      {/* TẤT CẢ CSS ANIMATION NẰM Ở ĐÂY */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Import Font chữ mềm mại (Dancing Script) */
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        
        .font-cursive { font-family: 'Dancing Script', cursive; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Hiệu ứng thở và đổi màu mượt mà cho Logo KinVie */
        @keyframes smooth-breathe {
          0%, 100% { transform: scale(1); filter: hue-rotate(0deg); drop-shadow: 0 5px 15px rgba(244,114,182,0.3); }
          50% { transform: scale(1.03); filter: hue-rotate(15deg); drop-shadow: 0 8px 25px rgba(244,114,182,0.6); }
        }
        .animate-smooth-breathe { animation: smooth-breathe 6s ease-in-out infinite; }

        /* HIỆU ỨNG ẢNH NỀN BỒNG BỀNH */
        @keyframes subtle-float { 
          0%, 100% { transform: scale(1.02) translate(0, 0); } 
          50% { transform: scale(1.05) translate(-15px, 10px); } 
        }
        .animate-subtle-float { animation: subtle-float 15s ease-in-out infinite; }

        /* HIỆU ỨNG NGÔI SAO PHI TIÊU BAY (SHURIKEN STAR) */
        @keyframes fly-shoot {
          0% { transform: translate(30vw, -30vh) rotate(135deg); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(-100vw, 100vh) rotate(135deg); opacity: 0; }
        }
        @keyframes spin-shuriken {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .star-wrapper { position: absolute; width: 250px; height: 35px; opacity: 0; z-index: 15; pointer-events: none; }
        .star-tail {
          position: absolute; top: 16px; left: 0; width: 220px; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9));
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.8));
        }
        .star-head {
          position: absolute; top: 0; right: 0; width: 35px; height: 35px; color: white;
          filter: drop-shadow(0 0 10px rgba(255,255,255,1));
          animation: spin-shuriken 0.8s linear infinite;
        }

        .star-1 { top: 5%; left: 80%; animation: fly-shoot 4.5s linear infinite 1s; }
        .star-2 { top: -10%; left: 50%; animation: fly-shoot 5.5s linear infinite 4s; }
        .star-3 { top: 25%; left: 100%; animation: fly-shoot 6s linear infinite 8s; }

        /* CÁC ANIMATION THỜI TIẾT KHÁC */
        @keyframes rain-fall { 0% { transform: translateY(-10vh) translateX(5px) rotate(5deg); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100vh) translateX(-10px) rotate(5deg); opacity: 0; } }
        @keyframes flash { 0%, 95%, 98% { opacity: 0; } 96%, 99%, 100% { opacity: 1; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes float-cloud-1 { 0% { transform: translateX(100vw); } 100% { transform: translateX(-50vw); } }
        @keyframes float-cloud-2 { 0% { transform: translateX(100vw); } 100% { transform: translateX(-80vw); } }
        @keyframes wind-leaf { 0% { transform: translate(120vw, -10vh) rotate(0deg); opacity: 0;} 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translate(-20vw, 80vh) rotate(360deg); opacity: 0;} }
        @keyframes bounce-horizontal { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
        
        /* Hiệu ứng vệt gió bay xẹt qua */
        @keyframes wind-gust {
          0% { transform: translateX(-20vw); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(120vw); opacity: 0; }
        }
        .wind-line { position: absolute; fill: none; stroke: rgba(255,255,255,0.4); animation: wind-gust linear infinite; z-index: 10; pointer-events: none;}

        .raindrop { position: absolute; width: 1.5px; height: 40px; background: linear-gradient(transparent, rgba(255,255,255,0.5)); animation: rain-fall 1.2s linear infinite; }
        .cloud-fast { position: absolute; animation: float-cloud-1 30s linear infinite; }
        .cloud-slow { position: absolute; animation: float-cloud-2 50s linear infinite; opacity: 0.5; }
        .falling-leaf { position: absolute; font-size: 24px; animation: wind-leaf 6s linear infinite; }
        .animate-bounce-horizontal { animation: bounce-horizontal 1.5s infinite; }
      `}} />

      {/* =======================================
          SLIDE 1: BANNER NỀN ẢNH + NGÔI SAO
          ======================================= */}
      <div className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center overflow-hidden bg-[#fdf3f5]">
        
        <div className="absolute inset-0 w-full h-full animate-subtle-float origin-center z-0">
          <Image 
            src="/images/banner.png" 
            alt="KinVie Banner Background" 
            fill 
            sizes="100vw"
            className="object-cover object-center opacity-80"
            priority
          />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div className="star-wrapper star-1">
            <div className="star-tail"></div>
            <svg className="star-head" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/>
            </svg>
          </div>
          <div className="star-wrapper star-2">
            <div className="star-tail"></div>
            <svg className="star-head" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/>
            </svg>
          </div>
          <div className="star-wrapper star-3">
            <div className="star-tail"></div>
            <svg className="star-head" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/>
            </svg>
          </div>
        </div>
        
        <div className="relative z-20 text-center px-6 max-w-4xl flex flex-col items-center">
          
          {/* Logo KinVie */}
          <h1 className="font-cursive text-[100px] md:text-[160px] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 animate-smooth-breathe leading-tight mb-2 pb-4">
            KinVie
          </h1>
          
          {/* Slogan */}
          <div className="flex items-center gap-4 mb-16 opacity-90">
            <span className="hidden md:block w-16 h-[1.5px] bg-gradient-to-r from-transparent to-rose-400 rounded-full"></span>
            <p className="text-sm md:text-xl font-bold text-stone-600 tracking-[0.3em] uppercase">
              có mọi thứ Boss cần
            </p>
            <span className="hidden md:block w-16 h-[1.5px] bg-gradient-to-l from-transparent to-rose-400 rounded-full"></span>
          </div>
          
          <div className="md:hidden inline-flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full text-pink-600 font-bold uppercase tracking-widest text-xs border border-white/60 shadow-sm mt-4">
            <span>Vuốt sang trái xem thời tiết</span>
            <span className="text-lg animate-bounce-horizontal">👉</span>
          </div>
        </div>

        <button 
          onClick={() => scrollSlide('right')}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/50 text-pink-500 rounded-full items-center justify-center shadow-lg transition-all"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>

      </div>

      {/* =======================================
          SLIDE 2: DIORAMA THỜI TIẾT (KHÔNG MÈO)
          ======================================= */}
      <div className={`w-full h-full flex-shrink-0 snap-center relative overflow-hidden transition-colors duration-[3000ms] bg-gradient-to-br ${getSkyGradient()}`}>
        
        <button 
          onClick={() => scrollSlide('left')}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full items-center justify-center shadow-lg transition-all"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-slate-900/50 backdrop-blur-sm z-50">
            <svg className="w-16 h-16 text-pink-400 animate-bounce opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 19c-2.48 0-4.5-2.02-4.5-4.5 0-.25.02-.5.06-.74A5.996 5.996 0 0 0 8 15c-3.31 0-6-2.69-6-6s2.69-6 6-6c.38 0 .75.04 1.11.1A6.994 6.994 0 0 1 16 2.01c3.86 0 7 3.14 7 7 0 3.3-2.26 6.09-5.32 6.84-.36.09-.75.15-1.18.15z"/></svg>
            <p className="text-pink-200 font-medium tracking-wide animate-pulse">Đang kết nối trạm thời tiết...</p>
          </div>
        ) : (
          <>
            {/* THIÊN THỂ QUỸ ĐẠO BÁN NGUYỆT: Biến mất khi có Mưa/Sấm */}
            {weatherCondition !== 'rain' && weatherCondition !== 'thunder' && (
              <div 
                className="absolute z-0 transition-all duration-[60000ms] ease-linear pointer-events-none"
                style={{
                  left: `${celestialProgress * 100}%`,
                  bottom: `${Math.sin(celestialProgress * Math.PI) * 70}%`, // Lên đỉnh cao nhất 70% chiều cao màn hình
                  transform: 'translate(-50%, 50%)'
                }}
              >
                {isDay ? (
                  /* MẶT TRỜI XỊN CÓ HÀO QUANG TOẢ SÁNG */
                  <div className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-[30px] opacity-70 animate-pulse"></div>
                    <div className="absolute inset-4 bg-yellow-200 rounded-full blur-[15px] opacity-90"></div>
                    <div className="relative w-full h-full bg-gradient-to-tr from-yellow-100 via-yellow-300 to-orange-400 rounded-full shadow-[0_0_80px_rgba(253,224,71,0.8)]"></div>
                  </div>
                ) : (
                  /* MẶT TRĂNG XỊN CÓ HỐ THIÊN THẠCH */
                  <div className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32">
                    <div className="absolute inset-0 bg-blue-300 rounded-full blur-[30px] opacity-40 animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-stone-100 to-stone-400 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden border border-white/20">
                       {/* Các hố thiên thạch (Craters) */}
                       <div className="absolute top-[20%] left-[25%] w-[25%] h-[25%] bg-stone-500/30 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"></div>
                       <div className="absolute top-[55%] left-[60%] w-[35%] h-[35%] bg-stone-500/20 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"></div>
                       <div className="absolute top-[65%] left-[20%] w-[15%] h-[15%] bg-stone-500/30 rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {(weatherCondition === 'cloudy' || weatherCondition === 'rain' || weatherCondition === 'thunder') && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <svg className="cloud-slow top-[5%] w-[400px] md:w-[600px]" fill={isDay ? "#f1f5f9" : "#334155"} viewBox="0 0 512 512"><path d="M400,224c-13.6,0-26.6,2.9-38.3,8.1C343.8,162.7,272.9,112,192,112c-97.2,0-176,78.8-176,176c0,97.2,78.8,176,176,176h208 c61.9,0,112-50.1,112-112C512,274.1,461.9,224,400,224z"/></svg>
                <svg className="cloud-fast top-[20%] w-[300px] md:w-[450px]" fill={isDay ? "#ffffff" : "#475569"} opacity="0.8" viewBox="0 0 512 512" style={{ animationDelay: '5s' }}><path d="M400,224c-13.6,0-26.6,2.9-38.3,8.1C343.8,162.7,272.9,112,192,112c-97.2,0-176,78.8-176,176c0,97.2,78.8,176,176,176h208 c61.9,0,112-50.1,112-112C512,274.1,461.9,224,400,224z"/></svg>
                
                {weatherCondition === 'cloudy' && (
                  <>
                    <div className="falling-leaf" style={{ animationDelay: '0s' }}>🍂</div>
                    <div className="falling-leaf" style={{ animationDelay: '2.5s', top: '10%' }}>🍃</div>
                    <div className="falling-leaf" style={{ animationDelay: '4s', top: '30%', fontSize: '18px' }}>🍂</div>
                    
                    {/* HIỆU ỨNG GIÓ THỔI CUỘN LINE */}
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                      {/* Vệt gió 1 */}
                      <svg className="wind-line top-[20%] w-[300px] md:w-[500px]" style={{ animationDuration: '7s', animationDelay: '0s', strokeWidth: '2px' }} viewBox="0 0 200 40">
                        <path d="M -50 20 Q 20 20 40 10 T 100 20 T 160 30 T 250 20" />
                        <path d="M 0 30 Q 30 30 50 20 T 110 30 T 170 40 T 230 30" stroke="rgba(255,255,255,0.2)"/>
                      </svg>
                      {/* Vệt gió 2 có cuộn xoáy */}
                      <svg className="wind-line top-[50%] w-[400px] md:w-[600px]" style={{ animationDuration: '9s', animationDelay: '2s', strokeWidth: '3px' }} viewBox="0 0 200 40">
                        <path d="M -50 20 Q 30 30 50 15 T 120 20 T 180 10 T 250 20" />
                        <path d="M 120 20 C 130 20 140 10 130 5 C 120 0 110 10 120 20" strokeWidth="2"/>
                      </svg>
                      {/* Vệt gió 3 */}
                      <svg className="wind-line top-[75%] w-[250px] md:w-[400px]" style={{ animationDuration: '6s', animationDelay: '4s', strokeWidth: '2px' }} viewBox="0 0 200 40">
                        <path d="M -50 20 Q 10 10 30 20 T 90 30 T 150 20 T 250 20" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            )}

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

            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/90 via-stone-900/40 to-transparent z-10 pointer-events-none" />

            <div className="relative z-20 container mx-auto px-6 max-w-7xl h-full flex flex-col pt-16 pb-0 md:justify-center md:pt-0">
              
              <div className="absolute top-6 right-6 md:top-12 md:right-12 z-50">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 text-white px-5 py-2.5 rounded-2xl shadow-xl transition-transform hover:scale-105">
                  <svg className="w-5 h-5 text-pink-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex flex-col border-l border-white/20 pl-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-[16px] md:text-[18px] tracking-tight text-white">Hải Phòng</span>
                      <span className="font-bold text-pink-400 text-[14px] md:text-[16px]">
                        {temperature !== null ? `${temperature}°C` : '--°C'}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-[11px] font-bold text-stone-300 uppercase tracking-[0.1em] mt-0.5">
                      {weatherCondition === 'clear' && (isDay ? 'Trời Nắng' : 'Trời Quang')}
                      {weatherCondition === 'cloudy' && 'Nhiều Gió'}
                      {weatherCondition === 'rain' && 'Có Mưa'}
                      {weatherCondition === 'thunder' && 'Sấm Chớp'}
                    </span>
                  </div>
                </div>
              </div>

              {/* KHU VỰC CÂU CHÂM NGÔN: Lui xuống thấp ở mobile (mt-[40vh]), hiện giữa ở PC */}
              <div className="w-full mt-[40vh] md:mt-0 relative z-30 px-2 text-center">
                <div className="inline-block bg-stone-900/50 backdrop-blur-xl border border-white/10 py-5 px-6 md:py-8 md:px-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <p className="text-xl md:text-3xl font-serif italic text-stone-100 tracking-wide leading-snug drop-shadow-md">
                    "{getDynamicSlogan()}"
                  </p>
                </div>
              </div>

              {/* ĐÃ XÓA TOÀN BỘ ẢNH MÈO THEO YÊU CẦU */}

            </div>
          </>
        )}
      </div>

    </section>
  );
}