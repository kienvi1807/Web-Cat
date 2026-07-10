/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";
import { useEffect, useRef } from "react";

interface EvilEyeProps {
    eyeColor?: string;
    cycleColors?: boolean;
    cycleIntervalMs?: number;
    intensity?: number;
    pupilSize?: number;
    irisWidth?: number;
    glowIntensity?: number;
    scale?: number;
    noiseScale?: number;
    pupilFollow?: number;
    flameSpeed?: number;
    backgroundColor?: string;
    className?: string;
    pupilOpen?: boolean;
}

function hexToVec3(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ];
}

const BRAND_COLOR_CYCLE = ["#CC5500", "#4169E1", "#006400", "#FF69B4"];

function getCycledColor(intervalMs: number): string {
    const idx = Math.floor(Date.now() / intervalMs) % BRAND_COLOR_CYCLE.length;
    return BRAND_COLOR_CYCLE[idx];
}

function generateNoiseTexture(size = 256) {
    const data = new Uint8Array(size * size * 4);

    function hash(x: number, y: number, s: number) {
        let n = x * 374761393 + y * 668265263 + s * 1274126177;
        n = Math.imul(n ^ (n >>> 13), 1274126177);
        return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }

    function noise(px: number, py: number, freq: number, seed: number) {
        const fx = (px / size) * freq;
        const fy = (py / size) * freq;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const tx = fx - ix;
        const ty = fy - iy;
        const w = freq | 0;
        const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);
        const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);
        const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
        const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
        return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;
    }

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let v = 0;
            let amp = 0.4;
            let totalAmp = 0;
            for (let o = 0; o < 8; o++) {
                const f = 32 * (1 << o);
                v += amp * noise(x, y, f, o * 31);
                totalAmp += amp;
                amp *= 0.65;
            }
            v /= totalAmp;
            v = (v - 0.5) * 2.2 + 0.5;
            v = Math.max(0, Math.min(1, v));
            const val = Math.round(v * 255);
            const i = (y * size + x) * 4;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = 255;
        }
    }

    return data;
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;
uniform float uPupilSize;
uniform float uIrisWidth;
uniform float uGlowIntensity;
uniform float uIntensity;
uniform float uScale;
uniform float uNoiseScale;
uniform vec2 uMouse;
uniform float uPupilFollow;
uniform float uFlameSpeed;
uniform float uPupilAspectX;
uniform vec3 uEyeColor;
uniform vec3 uBgColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
  uv /= uScale;
  float ft = uTime * uFlameSpeed;

  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);

  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));

  float distanceMask = 1.0 - length(uv);

  // Inner ring
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;
  innerRing += noiseA.r - 0.5;
  innerRing *= 1.3;
  innerRing = clamp(innerRing, 0.0, 1.0);

  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;
  outerRing += noiseC.r - 0.5;
  outerRing *= 1.3;
  outerRing = clamp(outerRing, 0.0, 1.0);

  innerRing += outerRing;

  // Inner eye
  float innerEye = distanceMask - 0.1 * 2.0;
  innerEye *= noiseB.r * 2.0;

  // Pupil with cursor tracking
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;
  vec2 pupilUv = uv - pupilOffset;
  float pupil = 1.0 - length(pupilUv * vec2(uPupilAspectX, 2.3));
  pupil *= uPupilSize;
  pupil = clamp(pupil, 0.0, 1.0);
  pupil /= 0.35;

  // Outer eye
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
  outerEyeGlow += noiseC.r - 0.5;
  float outerBgGlow = outerEyeGlow;
  outerEyeGlow = pow(outerEyeGlow, 2.0);
  outerEyeGlow += distanceMask;
  outerEyeGlow *= uGlowIntensity;
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

  // Outer eye bg glow
  outerBgGlow += distanceMask;
  outerBgGlow = pow(outerBgGlow, 0.5);
  outerBgGlow *= 0.15;

  vec3 color = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);
  color += uBgColor;

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function EvilEye({
    eyeColor = "#FF6F37",
    cycleColors = false,
    cycleIntervalMs = 0.5 * 60 * 1000, // 5 phút
    intensity = 1.5,
    pupilSize = 0.6,
    irisWidth = 0.25,
    glowIntensity = 0.35,
    scale = 0.8,
    noiseScale = 1.0,
    pupilFollow = 1.0,
    flameSpeed = 1.0,
    backgroundColor = "#000000",
    className = "",
    pupilOpen = false,
}: EvilEyeProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Màu hiện đang hiển thị (mượt dần tới targetColorRef mỗi frame)
    const currentColorRef = useRef<[number, number, number]>(
        hexToVec3(cycleColors ? getCycledColor(cycleIntervalMs) : eyeColor)
    );
    // Màu đích cần tiến tới — đổi mỗi 5 phút nếu cycleColors=true
    const targetColorRef = useRef<[number, number, number]>(currentColorRef.current);

    // 🆕 Độ "dẹt" của pupil: 9.0 = khe dọc như mắt mèo, ~2.3 = tròn (bằng trục kia)
    const pupilAspectRef = useRef<number>(9.0);
    const targetPupilAspectRef = useRef<number>(9.0);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const noiseData = generateNoiseTexture(256);
        const noiseTexture = new Texture(gl, {
            image: noiseData as any,
            width: 256,
            height: 256,
            generateMipmaps: false,
            flipY: false,
        });
        noiseTexture.minFilter = gl.LINEAR;
        noiseTexture.magFilter = gl.LINEAR;
        noiseTexture.wrapS = gl.REPEAT;
        noiseTexture.wrapT = gl.REPEAT;

        const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

        // Tính hướng nhìn dựa trên toạ độ tuyệt đối (x, y) trên màn hình,
        // so với tâm của khung con mắt — dùng chung cho cả chuột lẫn chạm tay
        function updateGazeFromPoint(clientX: number, clientY: number) {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            // Khoảng cách tối đa để "nhìn hết cỡ" theo mỗi trục (px) — chỉnh số này để tăng/giảm độ nhạy
            const maxDist = 600;
            mouse.tx = Math.max(-1, Math.min(1, (clientX - centerX) / maxDist));
            mouse.ty = Math.max(-1, Math.min(1, -(clientY - centerY) / maxDist));
        }

        function onMouseMove(e: MouseEvent) {
            updateGazeFromPoint(e.clientX, e.clientY);
        }

        function onTouchMove(e: TouchEvent) {
            if (e.touches.length === 0) return;
            updateGazeFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        }

        function onTouchEnd() {
            mouse.tx = 0;
            mouse.ty = 0;
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchstart", onTouchMove, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", onTouchEnd);

        let program: any;

        function resize() {
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            if (program) {
                program.uniforms.uResolution.value = [
                    gl.canvas.width,
                    gl.canvas.height,
                    gl.canvas.width / gl.canvas.height,
                ];
            }
        }
        window.addEventListener("resize", resize);
        resize();

        const geometry = new Triangle(gl);
        program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height] },
                uNoiseTexture: { value: noiseTexture },
                uPupilSize: { value: pupilSize },
                uIrisWidth: { value: irisWidth },
                uGlowIntensity: { value: glowIntensity },
                uIntensity: { value: intensity },
                uScale: { value: scale },
                uNoiseScale: { value: noiseScale },
                uMouse: { value: [0, 0] },
                uPupilFollow: { value: pupilFollow },
                uFlameSpeed: { value: flameSpeed },
                uPupilAspectX: { value: pupilAspectRef.current },
                uEyeColor: { value: currentColorRef.current },
                uBgColor: { value: hexToVec3(backgroundColor) },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        container.appendChild(gl.canvas);

        let animationFrameId: number;

        function update(time: number) {
            animationFrameId = requestAnimationFrame(update);
            mouse.x += (mouse.tx - mouse.x) * 0.05;
            mouse.y += (mouse.ty - mouse.y) * 0.05;
            program.uniforms.uMouse.value = [mouse.x, mouse.y];
            program.uniforms.uTime.value = time * 0.001;

            // Crossfade màu mắt mượt dần sang màu đích (đổi số 0.01 để nhanh/chậm hơn)
            const cur = currentColorRef.current;
            const tgt = targetColorRef.current;
            cur[0] += (tgt[0] - cur[0]) * 0.01;
            cur[1] += (tgt[1] - cur[1]) * 0.01;
            cur[2] += (tgt[2] - cur[2]) * 0.01;
            program.uniforms.uEyeColor.value = cur;
            pupilAspectRef.current += (targetPupilAspectRef.current - pupilAspectRef.current) * 0.08;
            program.uniforms.uPupilAspectX.value = pupilAspectRef.current;

            renderer.render({ scene: mesh });
        }
        animationFrameId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("touchstart", onTouchMove);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            if (gl.canvas.parentNode === container) {
                container.removeChild(gl.canvas);
            }
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [intensity, pupilSize, irisWidth, glowIntensity, scale, noiseScale, pupilFollow, flameSpeed, backgroundColor]);

    useEffect(() => {
        if (!cycleColors) {
            targetColorRef.current = hexToVec3(eyeColor);
            return;
        }
        const tick = () => {
            targetColorRef.current = hexToVec3(getCycledColor(cycleIntervalMs));
        };
        tick();
        const id = setInterval(tick, 5000); // kiểm tra mỗi 5s, đủ nhẹ và chính xác
        return () => clearInterval(id);
    }, [cycleColors, cycleIntervalMs, eyeColor]);

    useEffect(() => {
        targetPupilAspectRef.current = pupilOpen ? 2.3 : 9.0;
    }, [pupilOpen]);

    return <div ref={containerRef} className={`evil-eye-container ${className}`} />;
}