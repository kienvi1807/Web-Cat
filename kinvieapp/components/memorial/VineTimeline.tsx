"use client";
import React from 'react';
import Image from 'next/image';

const SEGMENT_HEIGHT = 210;  // khoảng cách dọc giữa 2 ảnh liên tiếp
const TOP_PADDING = 100;
const BOTTOM_PADDING = 150;
const MEMORIAL_TOP_EXTRA_GAP = 220;
const VB_WIDTH = 450;         // 🎯 tăng từ 400 -> 450 để có chỗ cho thân cây to hơn + nhánh vươn xa hơn
const TRUNK_CENTER = VB_WIDTH / 2;
const TRUNK_AMPLITUDE = 0;   // thân cây lượn sóng nhẹ qua lại bao nhiêu px
const TRUNK_PERIOD = 240;     // 1 chu kỳ lượn sóng dài bao nhiêu px theo chiều dọc
const BRANCH_REACH = 180;     // 🎯 tăng từ 95 -> 130, để ảnh tròn không bị đè bởi thân cây to hơn
const SAMPLE_STEP = 20;       // độ mịn của đường cong thân cây
// 🎯 Kích thước 1 tile ảnh leaf.svg khi lặp lại dọc thân cây
// leaf.svg gốc có tỉ lệ 211.52 x 1131.2 (~1 : 5.35)
const LEAF_TILE_WIDTH = 150;  // 🎯 tăng mạnh từ 70 -> 150 để dây leo to hẳn ra như yêu cầu
const LEAF_TILE_HEIGHT = LEAF_TILE_WIDTH * (5658 / 1265);
// 🎯 Khoảng cách an toàn giữa ảnh polaroid nền 2 bên và mép cột thân cây (tránh đè vào giữa)
const SIDE_PHOTO_GAP = 30;
const SIDE_PHOTO_OFFSET = VB_WIDTH / 2 + SIDE_PHOTO_GAP;

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

export default function VineTimeline({ photos, showMemorialCap = true }: { photos: any[]; showMemorialCap?: boolean }) {
    const n = photos.length;
    if (n === 0) return null;

    const [selected, setSelected] = React.useState<any>(null);

    // Kiểm tra ảnh cuối cùng (top) có phải ảnh tưởng niệm không, để dành thêm khoảng cách
    const lastPhoto = photos[n - 1];
    const lastPet = lastPhoto?.memorial_photo_pets?.[0]?.pets;
    const hasMemorialCap = showMemorialCap && lastPet?.status === 'Đã lên thiên đường mèo' && lastPhoto?.is_last_photo === true;
    const extraGap = hasMemorialCap ? MEMORIAL_TOP_EXTRA_GAP : 0;

    const totalHeight = n * SEGMENT_HEIGHT + TOP_PADDING + extraGap + BOTTOM_PADDING;

    // Ảnh cũ nhất ở gốc (dưới cùng), mới nhất ở ngọn (trên cùng), so le trái phải
    const points = photos.map((photo, i) => {
        const isTopNode = i === n - 1;
        // Toàn bộ các node PHÍA DƯỚI node tưởng niệm bị đẩy xuống thêm extraGap,
        // giữ nguyên khoảng cách giữa chúng với nhau, chỉ nới rộng khoảng với node trên cùng
        const gapOffset = (!isTopNode && hasMemorialCap) ? extraGap : 0;
        const y = (n - 1 - i) * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2 + TOP_PADDING + gapOffset;
        const isLeft = i % 2 === 0;
        const trunkX = trunkXAt(y);
        const pet = photo.memorial_photo_pets?.[0]?.pets;
        const isMemorialCap = showMemorialCap && pet?.status === 'Đã lên thiên đường mèo' && photo.is_last_photo === true;
        return {
            photo,
            y,
            isLeft,
            trunkX,
            // 🎯 Ảnh tưởng niệm (điểm cuối) nằm ngay chính giữa thân cây, không lệch trái/phải như ảnh thường
            x: isMemorialCap ? trunkX : trunkX + (isLeft ? -BRANCH_REACH : BRANCH_REACH),
            isMemorialCap,
        };
    });

    // 🎯 Thân cây chính: 1 đường lượn sóng nhẹ, to, chạy xuyên suốt từ gốc lên ngọn
    // Nếu ảnh trên cùng (mới nhất) là ảnh tưởng niệm cuối cùng -> thân cây dừng ngay tại đó, đây là điểm kết thúc, KHÔNG mọc thêm phía trên
    const topPoint = points[points.length - 1];
    const trunkTopY = topPoint?.isMemorialCap ? topPoint.y : 0;

    return (
        <div className="relative w-full" style={{ height: totalHeight }}>

            {/* 🎯 Ảnh nền — full khung ảnh khách up kiểu polaroid, phủ lớp mờ nhẹ để tách với phần chính */}
            <div className="absolute top-0 left-1/2 w-screen -translate-x-1/2 h-full overflow-hidden pointer-events-none select-none z-0">
                {photos.map((p, i) => {
                    const pet = p.memorial_photo_pets?.[0]?.pets;
                    const isMemorialCap = showMemorialCap && pet?.status === 'Đã lên thiên đường mèo' && p.is_last_photo === true;
                    if (isMemorialCap) return null;

                    const isLeft = i % 2 === 0;
                    const gapOffset = hasMemorialCap ? extraGap : 0;
                    const y = (n - 1 - i) * SEGMENT_HEIGHT + SEGMENT_HEIGHT / 2 + TOP_PADDING + gapOffset;
                    const topPercent = (y / totalHeight) * 100;
                    const rotate = (isLeft ? -1 : 1) * (5 + (i % 3) * 3);

                    return (
                        <div
                            key={`bg-${p.id}`}
                            className={`absolute bg-white p-1.5 pb-3 sm:p-2 sm:pb-5 md:p-2.5 md:pb-7 rounded-[2px] shadow-2xl ring-1 ring-black/5
                                    w-24 sm:w-28 md:w-36 lg:w-44 xl:w-52 aspect-[4/5]
                                    ${isLeft
                                    ? 'left-[calc(50%+7rem)] sm:left-[calc(50%+8rem)] md:left-[calc(50%+9.5rem)] lg:left-[calc(50%+16rem)] xl:left-[calc(50%+17rem)]'
                                    : 'right-[calc(50%+7rem)] sm:right-[calc(50%+8rem)] md:right-[calc(50%+9.5rem)] lg:right-[calc(50%+16rem)] xl:right-[calc(50%+17rem)]'}`}
                            style={{ top: `${topPercent}%`, transform: `translateY(-50%) rotate(${rotate}deg)` }}
                        >
                            <Image src={p.image_url} alt="" fill sizes="208px" className="object-cover" />
                        </div>
                    );
                })}

                {/* 🌫️ Lớp phủ mờ nhẹ lên ảnh nền polaroid — làm chúng lùi ra sau, không chọi màu với nội dung chính */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8FA]/60 via-[#FFF8FA]/20 to-[#FFF8FA]/60" />
            </div>

            {/* 🎯 Thân cây + nhánh + lá, đặt trong khung căn giữa như cột nội dung */}
            <div className="relative w-full mx-auto h-full" style={{ maxWidth: VB_WIDTH }}>

                {/* 🎯 Thân dây leo = chính ảnh vine-real.png, lặp lại dọc theo chiều cao (repeat-y),
                    KHÔNG vẽ theo path SVG nữa. Dừng đúng tại trunkTopY nếu ảnh trên cùng là ảnh tưởng niệm */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 z-[1] pointer-events-none select-none"
                    style={{
                        top: trunkTopY,
                        width: LEAF_TILE_WIDTH,
                        height: totalHeight - trunkTopY,
                        backgroundImage: "url('/images/vine-real.png')",
                        backgroundRepeat: 'repeat-y',
                        backgroundPosition: 'top center',
                        backgroundSize: `${LEAF_TILE_WIDTH}px ${LEAF_TILE_HEIGHT}px`,
                    }}
                />

                <svg
                    className="absolute inset-0 w-full h-full z-[2]"
                    viewBox={`0 0 ${VB_WIDTH} ${totalHeight}`}
                    preserveAspectRatio="none"
                    fill="none"
                >
                    {/* Nhánh rẽ từ thân ra từng ảnh + lá + tua cuốn */}
                    {points.map((pt, i) => {
                        if (pt.isMemorialCap) return null;
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
                                width: isMemorialCap ? '24rem' : '9rem',   // 👈 16rem -> 22rem
                            }}
                        >
                            <div className={`relative ${isMemorialCap ? 'w-72 h-72 md:w-96 md:h-96' : 'w-24 h-24 md:w-28 md:h-28'}`}>
                                {isMemorialCap ? (
                                    <>
                                        {/* Hào quang phía sau */}
                                        <div className="absolute -inset-3 rounded-full bg-amber-100/50 blur-lg vine-glow" />

                                        {/* Ảnh mèo - thu nhỏ vào trong để vòng hoa phủ được lên mép ảnh */}
                                        <button
                                            onClick={() => setSelected(pt.photo)}
                                            className="group absolute inset-[20%] z-10 rounded-full overflow-hidden border-4 border-white shadow-xl cursor-pointer bg-stone-900"
                                        >
                                            <Image src={pt.photo.image_url} alt="" aria-hidden="true" fill sizes="(max-width: 768px) 288px, 384px"
                                                className="object-cover grayscale blur-md scale-110 opacity-70 group-hover:grayscale-0 transition-all duration-500" />
                                            <Image src={pt.photo.image_url} alt={pet?.petname || 'Kỷ niệm'} fill sizes="(max-width: 768px) 288px, 384px"
                                                className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        </button>

                                        {/* Vòng hoa tưởng niệm */}
                                        <div className="absolute -inset-4 z-20 pointer-events-none">
                                            <img
                                                src="/images/vong-hoa.png"
                                                alt=""
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%_+_2rem)] h-[calc(100%_+_2rem)] object-contain"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute -inset-3 rounded-full bg-amber-200/40 blur-lg vine-glow" />
                                        <button
                                            onClick={() => setSelected(pt.photo)}
                                            className="relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-emerald-200 cursor-pointer hover:scale-105 transition-transform"
                                        >
                                            <Image src={pt.photo.image_url} alt={pet?.petname || 'Kỷ niệm'} fill sizes="(max-width: 768px) 96px, 112px" className="object-cover" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {isMemorialCap ? (
                                <div className="mt-4 px-4 py-2.5 rounded-2xl bg-white/85 backdrop-blur-sm shadow-lg ring-1 ring-black/5">
                                    {pet?.petname && <p className="text-sm font-black text-emerald-700">{pet.petname}</p>}
                                    {age && <p className="text-[11px] font-bold text-stone-600">{age}</p>}
                                    <p className="text-[10px] text-stone-500 italic mt-0.5">🌈 Đã an nghỉ</p>
                                    {pt.photo.caption && <p className="mt-0.5 text-[10px] text-stone-500 italic line-clamp-2">"{pt.photo.caption}"</p>}
                                </div>
                            ) : (
                                <>
                                    {pet?.petname && <p className="mt-2 font-black text-emerald-700 text-xs">{pet.petname}</p>}
                                    {age && <p className="text-[11px] font-bold text-stone-500">{age}</p>}
                                    {pt.photo.caption && <p className="mt-0.5 text-[10px] text-stone-400 italic line-clamp-2">"{pt.photo.caption}"</p>}
                                </>
                            )}
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
                        <img src={selected.image_url} className="w-full max-h-[60vh] object-contain bg-stone-50" alt="" loading="lazy" />
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