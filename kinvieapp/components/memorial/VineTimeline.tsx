"use client";
import React from 'react';

const SEGMENT_HEIGHT = 260;  // khoảng cách dọc giữa 2 ảnh liên tiếp
const VB_WIDTH = 400;
const TRUNK_CENTER = VB_WIDTH / 2;
const TRUNK_AMPLITUDE = 22;   // thân cây lượn sóng nhẹ qua lại bao nhiêu px
const TRUNK_PERIOD = 240;     // 1 chu kỳ lượn sóng dài bao nhiêu px theo chiều dọc
const BRANCH_REACH = 95;      // nhánh rẽ ra xa thân bao nhiêu px để tới ảnh
const SAMPLE_STEP = 20;       // độ mịn của đường cong thân cây

function calculateAgeAtPhoto(birthdate?: string | null, takenDate?: string | null): string | null {
    if (!birthdate || !takenDate) return null;
    const birth = new Date(birthdate);
    const taken = new Date(takenDate);
    if (isNaN(birth.getTime()) || isNaN(taken.getTime())) return null;
    let years = taken.getFullYear() - birth.getFullYear();
    let months = taken.getMonth() - birth.getMonth();
    if (taken.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    if (years < 0) return null;
    if (years === 0 && months === 0) return 'Mới sinh';
    if (years === 0) return `${months} tháng tuổi`;
    if (months === 0) return `${years} năm tuổi`;
    return `${years} năm ${months} tháng tuổi`;
}

// Vị trí X của thân cây tại 1 độ cao y bất kỳ (lượn sóng nhẹ qua lại quanh trục giữa)
function trunkXAt(y: number) {
    return TRUNK_CENTER + TRUNK_AMPLITUDE * Math.sin((y / TRUNK_PERIOD) * Math.PI * 2);
}

export default function VineTimeline({ photos }: { photos: any[] }) {
    const n = photos.length;
    if (n === 0) return null;

    const [selected, setSelected] = React.useState<any>(null);
    const totalHeight = n * SEGMENT_HEIGHT;

    // 🎯 Ảnh cuối cùng của mỗi bé (mảng photos đã sort tăng dần theo taken_date từ trang cha)
    const lastPhotoIndexByPet = new Map<number, number>();
    photos.forEach((photo, i) => {
        const petId = photo.memorial_photo_pets?.[0]?.pets?.petid;
        if (petId != null) lastPhotoIndexByPet.set(petId, i);
    });

    // Ảnh cũ nhất ở gốc (dưới cùng), mới nhất ở ngọn (trên cùng), so le trái phải
    const points = photos.map((photo, i) => {
        const y = (n - 1 - i) * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2;
        const isLeft = i % 2 === 0;
        const trunkX = trunkXAt(y);
        const pet = photo.memorial_photo_pets?.[0]?.pets;
        const isMemorialCap = pet?.status === 'Đã lên thiên đường mèo' && lastPhotoIndexByPet.get(pet.petid) === i;
        return {
            photo,
            y,
            isLeft,
            trunkX,
            x: trunkX + (isLeft ? -BRANCH_REACH : BRANCH_REACH),
            isMemorialCap,
        };
    });

    // 🎯 Thân cây chính: 1 đường lượn sóng nhẹ, to, chạy xuyên suốt từ gốc lên ngọn
    let trunkPath = '';
    for (let y = totalHeight; y >= 0; y -= SAMPLE_STEP) {
        const x = trunkXAt(y);
        trunkPath += trunkPath === '' ? `M ${x},${y}` : ` L ${x},${y}`;
    }
    trunkPath += ` L ${trunkXAt(0)},0`;

    return (
        <div className="relative w-full" style={{ height: totalHeight }}>

            {/* 🎯 Ảnh nền — full khung ảnh khách up kiểu polaroid, phủ lớp mờ nhẹ để tách với phần chính */}
            <div className="absolute top-0 left-1/2 w-screen -translate-x-1/2 h-full overflow-hidden pointer-events-none select-none z-0">
                {photos.map((p, i) => {
                    const isLeft = i % 2 === 0;
                    const y = (n - 1 - i) * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2;
                    const topPercent = (y / totalHeight) * 100;
                    const rotate = (isLeft ? -1 : 1) * (5 + (i % 3) * 3);

                    return (
                        <div
                            key={`bg-${p.id}`}
                            className="absolute w-28 md:w-40 bg-white p-2 pb-6 rounded-[2px] shadow-lg"
                            style={{
                                top: `${topPercent}%`,
                                [isLeft ? 'left' : 'right']: '25%',
                                transform: `translateY(-50%) rotate(${rotate}deg)`,
                            }}
                        >
                            <img
                                src={p.image_url}
                                alt=""
                                className="w-full aspect-[4/5] object-cover"
                            />
                        </div>
                    );
                })}

                {/* Lớp phủ trắng bán trong suốt — làm nền lùi ra sau, KHÔNG blur từng ảnh */}
                <div className="absolute inset-0 bg-[#FFF8FA]/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8FA] via-transparent to-[#FFF8FA]" />
            </div>

            {/* 🎯 Thân cây + nhánh + lá, đặt trong khung căn giữa như cột nội dung */}
            <div className="relative w-full mx-auto h-full" style={{ maxWidth: VB_WIDTH }}>
                <svg
                    className="absolute inset-0 w-full h-full z-[1]"
                    viewBox={`0 0 ${VB_WIDTH} ${totalHeight}`}
                    preserveAspectRatio="none"
                    fill="none"
                >
                    <defs>
                        <linearGradient id="trunkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8bb56f" />
                            <stop offset="100%" stopColor="#4c7536" />
                        </linearGradient>
                    </defs>

                    {/* Thân cây chính: to, có bóng đổ để trông có khối */}
                    <path d={trunkPath} stroke="#345527" strokeWidth="24" strokeLinecap="round" opacity="0.25" />
                    <path d={trunkPath} stroke="url(#trunkGradient)" strokeWidth="16" strokeLinecap="round" />
                    <path d={trunkPath} stroke="#a8d18a" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

                    {/* Nhánh rẽ từ thân ra từng ảnh + lá + tua cuốn */}
                    {points.map((pt, i) => {
                        const side = pt.isLeft ? -1 : 1;
                        const branchPath = `M ${pt.trunkX},${pt.y} C ${pt.trunkX + side * (BRANCH_REACH * 0.35)},${pt.y - 14} ${pt.x - side * (BRANCH_REACH * 0.35)},${pt.y + 14} ${pt.x},${pt.y}`;
                        return (
                            <g key={i}>
                                <path d={branchPath} stroke="#5d8a4a" strokeWidth="5" strokeLinecap="round" fill="none" />
                                <g transform={`translate(${(pt.trunkX + pt.x) / 2},${pt.y - 8}) scale(${side},1)`}>
                                    <path d="M0,0 C 12,-6 22,-3 24,8 C 20,16 10,15 0,0 Z" fill="#6f9c50" />
                                    <path d="M28,8 C 36,4 36,-6 29,-8 C 24,-9 22,-3 27,0" stroke="#6f9c50" strokeWidth="2" fill="none" strokeLinecap="round" />
                                </g>
                            </g>
                        );
                    })}
                </svg>

                {/* Ảnh tròn dọc theo 2 bên thân cây */}
                {points.map((pt) => {
                    const pet = pt.photo.memorial_photo_pets?.[0]?.pets;
                    const age = calculateAgeAtPhoto(pet?.birthdate, pt.photo.taken_date);
                    const isMemorialCap = pt.isMemorialCap;

                    return (
                        <div
                            key={pt.photo.id}
                            className="absolute flex flex-col items-center text-center z-10"
                            style={{
                                left: `${(pt.x / VB_WIDTH) * 100}%`,
                                top: `${(pt.y / totalHeight) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                width: isMemorialCap ? '11rem' : '9rem',
                            }}
                        >
                            <div className={`relative ${isMemorialCap ? 'w-36 h-36 md:w-44 md:h-44' : 'w-24 h-24 md:w-28 md:h-28'}`}>
                                {isMemorialCap ? (
                                    <>
                                        {/* Hào quang phía sau */}
                                        <div className="absolute -inset-3 rounded-full bg-amber-100/50 blur-lg vine-glow" />

                                        {/* Vòng hoa tưởng niệm */}
                                        <div className="absolute -inset-4 z-20 pointer-events-none">
                                            <svg
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%_+_2rem)] h-[calc(100%_+_2rem)] z-20 pointer-events-none"
                                                viewBox="0 0 100 100"
                                                fill="none"
                                            >
                                                {Array.from({ length: 20 }).map((_, i) => {
                                                    const angle = (i / 20) * Math.PI * 2;
                                                    const cx = 50 + 42 * Math.cos(angle);
                                                    const cy = 50 + 42 * Math.sin(angle);
                                                    const rot = (angle * 180) / Math.PI + 90;
                                                    return (
                                                        <ellipse
                                                            key={`leaf-${i}`}
                                                            cx={cx}
                                                            cy={cy}
                                                            rx="5"
                                                            ry="2.5"
                                                            fill={i % 2 === 0 ? '#8bb56f' : '#a3c785'}
                                                            transform={`rotate(${rot} ${cx} ${cy})`}
                                                        />
                                                    );
                                                })}
                                                {[0, 1, 2, 3].map((k) => {
                                                    const angle = (k / 4) * Math.PI * 2 + Math.PI / 8;
                                                    const cx = 50 + 42 * Math.cos(angle);
                                                    const cy = 50 + 42 * Math.sin(angle);
                                                    return (
                                                        <g key={`flower-${k}`}>
                                                            {Array.from({ length: 5 }).map((_, p) => {
                                                                const pa = (p / 5) * Math.PI * 2;
                                                                const px = cx + 3 * Math.cos(pa);
                                                                const py = cy + 3 * Math.sin(pa);
                                                                return <circle key={p} cx={px} cy={py} r="2.4" fill="#f2a65a" />;
                                                            })}
                                                            <circle cx={cx} cy={cy} r="2.2" fill="#d9782f" />
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>

                                        <button
                                            onClick={() => setSelected(pt.photo)}
                                            className="group relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl cursor-pointer"
                                        >
                                            <img
                                                src={pt.photo.image_url}
                                                alt={pet?.petname || 'Kỷ niệm'}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute -inset-3 rounded-full bg-amber-200/40 blur-lg vine-glow" />
                                        <button
                                            onClick={() => setSelected(pt.photo)}
                                            className="relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-emerald-200 cursor-pointer hover:scale-105 transition-transform"
                                        >
                                            <img src={pt.photo.image_url} alt={pet?.petname || 'Kỷ niệm'} className="w-full h-full object-cover" />
                                        </button>
                                        <svg className="absolute -bottom-2 -left-2 w-7 h-7 z-20" viewBox="0 0 24 24" fill="none">
                                            <circle cx="7" cy="9" r="2.8" fill="#f7b955" />
                                            <circle cx="17" cy="9" r="2.8" fill="#f7b955" />
                                            <circle cx="7" cy="16" r="2.8" fill="#f7b955" />
                                            <circle cx="17" cy="16" r="2.8" fill="#f7b955" />
                                            <circle cx="12" cy="12.5" r="3.2" fill="#f2994a" />
                                        </svg>
                                        <svg className="absolute -top-2 -right-2 w-8 h-8 z-20" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2C12 2 20 6 20 13C20 18 16 21 12 21C8 21 4 18 4 13C4 6 12 2 12 2Z" fill="#8bb56f" />
                                            <path d="M12 4V19" stroke="#4c7536" strokeWidth="1" strokeLinecap="round" />
                                        </svg>
                                    </>
                                )}
                            </div>

                            {pet?.petname && <p className={`mt-2 font-black text-emerald-700 ${isMemorialCap ? 'text-sm' : 'text-xs'}`}>{pet.petname}</p>}
                            {age && <p className="text-[11px] font-bold text-stone-500">{age}</p>}
                            {isMemorialCap && <p className="text-[10px] text-stone-400 italic mt-0.5">🌈 Đã an nghỉ</p>}
                            {pt.photo.caption && <p className="mt-0.5 text-[10px] text-stone-400 italic line-clamp-2">"{pt.photo.caption}"</p>}
                        </div>
                    );
                })}
            </div>
            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] overflow-hidden max-w-sm w-full max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={selected.image_url} className="w-full max-h-[60vh] object-contain bg-stone-50" alt="" />
                        <div className="p-5 text-center">
                            {selected.memorial_photo_pets?.[0]?.pets?.petname && (
                                <p className="font-black text-emerald-700">{selected.memorial_photo_pets[0].pets.petname}</p>
                            )}
                            {selected.taken_date && (
                                <p className="text-xs text-stone-400 font-bold mt-1">{new Date(selected.taken_date).toLocaleDateString('vi-VN')}</p>
                            )}
                            {selected.caption && (
                                <p className="text-sm text-stone-500 italic mt-3">"{selected.caption}"</p>
                            )}
                            <button
                                onClick={() => setSelected(null)}
                                className="mt-5 px-6 py-2.5 bg-stone-100 rounded-xl font-black text-sm text-stone-600"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}