'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useMobile } from '@/hooks/useMobile';
import { initLenis, startLenisRAF } from '@/lib/lenis';


export function SmoothScrollProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        const lenis = initLenis();
        startLenisRAF(lenis);


        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    },
)
Button.displayName = "Button"

export function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 5 }, (_, i) => ({ // Reduced count to 5 for performance
        id: i,
        d: `M-${380 - i * 15 * position} -${189 + i * 6}C-${380 - i * 15 * position
            } -${189 + i * 6} -${312 - i * 15 * position} ${216 - i * 6} ${152 - i * 15 * position
            } ${343 - i * 6}C${616 - i * 15 * position} ${470 - i * 6} ${684 - i * 15 * position
            } ${875 - i * 6} ${684 - i * 15 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none" >
            <svg
                className="w-full h-full text-slate-950 dark:text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div >
    );
}


export function GyroTiltBox({ children, className }: { children: React.ReactNode, className?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 50, damping: 10 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 10 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["25deg", "-25deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-25deg", "25deg"]);
    const translateX = useTransform(mouseX, [-0.5, 0.5], ["-15px", "15px"]);
    const translateY = useTransform(mouseY, [-0.5, 0.5], ["-15px", "15px"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXRel = e.clientX - rect.left;
        const mouseYRel = e.clientY - rect.top;

        const xPct = (mouseXRel / width) - 0.5;
        const yPct = (mouseYRel / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
                x: translateX,
                y: translateY,
            }}
        >
            {children}
        </motion.div>
    );
}

interface ParallaxTextProps {
    children: React.ReactNode;
    speed?: number;
    className?: string;
    scaleEffect?: boolean; // Add scale effect
    opacityEffect?: boolean; // Add fade effect
}

export function ParallaxText({
    children,
    speed = -0.4,
    className = '',
    scaleEffect = false,
    opacityEffect = false,
}: ParallaxTextProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isMobile = useMobile();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const effectiveSpeed = isMobile ? speed * 0.5 : speed;

    const y = useTransform(scrollYProgress, [0, 1], [150 * effectiveSpeed, -150 * effectiveSpeed]);

    const scale = scaleEffect
        ? useTransform(scrollYProgress, [0, 0.5, 1], [1.5, 1, 0.8])
        : 1;

    const opacity = opacityEffect
        ? useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
        : 1;

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div style={{ y, scale, opacity }}>
                {children}
            </motion.div>
        </div>
    );
}

interface ParallaxSectionProps {
    children: React.ReactNode;
    speed?: number; // -1 to 1 (negative = slower, positive = faster)
    className?: string;
    direction?: 'up' | 'down'; // Direction of parallax movement
}

export function ParallaxSection({
    children,
    speed = -0.5,
    className = '',
    direction = 'up',
}: ParallaxSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isMobile = useMobile();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    const mobileSpeed = speed * 0.5;
    const effectiveSpeed = isMobile ? mobileSpeed : speed;

    const y = useTransform(
        scrollYProgress,
        [0, 1],
        direction === 'up' ? [200 * effectiveSpeed, -200 * effectiveSpeed] : [-200 * effectiveSpeed, 200 * effectiveSpeed]
    );

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div
                style={{ y }}
                transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 30,
                    mass: 1,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

interface ParallaxImageProps {
    src: string;
    alt: string;
    speed?: number;
    className?: string;
    priority?: boolean;
}

export function ParallaxImage({
    src,
    alt,
    speed = -0.3,
    className = '',
    priority = false,
}: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isMobile = useMobile();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    // Mobile-first: Reduce parallax on mobile
    const effectiveSpeed = isMobile ? speed * 0.5 : speed;

    const y = useTransform(scrollYProgress, [0, 1], [100 * effectiveSpeed, -100 * effectiveSpeed]);
    const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div
                style={{ y, scale }}
                className="w-full h-full"
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className="object-cover"
                    sizes="100vw"
                />
            </motion.div>
        </div>
    );
}

interface ParallaxRevealProps {
    backgroundImage: string; // up.JPG - full image
    foregroundImage: string; // down.png - transparent top, shows only bottom
    height?: string; // Height of the section
    children?: React.ReactNode; // Content to show between the layers
}


export function ParallaxReveal({
    backgroundImage,
    foregroundImage,
    height = '200vh',
    children,
}: ParallaxRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewportFactor, setViewportFactor] = useState(1);

    useEffect(() => {
        const updateViewport = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const aspectRatio = width / height;
            const viewportWidth = aspectRatio * 5;
            
            // Calculate smooth responsive factor: 0 (mobile) to 1 (desktop)
            // Mobile: < 2.5 viewport units -> factor: 0
            // Desktop: > 8 viewport units -> factor: 1
            // Tablet/In-between: smooth interpolation
            const factor = Math.min(1, Math.max(0, (viewportWidth - 2.5) / (8 - 2.5)));
            setViewportFactor(factor);
        };
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    const isMobile = viewportFactor < 0.2;
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: [isMobile ? 'start 40%' : 'start start', isMobile ? 'start start' : 'end start'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        mass: 0.2,
        stiffness: 50,
        damping: 15,
        restDelta: 0.005
    });

    // Unified background animation using viewport factor
    const backgroundYStart = -5 + (viewportFactor * 5); // -5vh (mobile) to 0vh (desktop)
    const backgroundYEnd = 5;
    
    const backgroundY = useTransform(
        smoothProgress,
        [0, isMobile ? 0.7 : 0.25],
        [`${backgroundYStart}vh`, `${backgroundYEnd}vh`]
    );

    const backgroundScale = useTransform(
        smoothProgress,
        [0, isMobile ? 0.7 : 0.25],
        [1.1, 1.0]
    );

    // Unified foreground animation using viewport factor
    const foregroundYStart = -10 + (viewportFactor * 12); // -10vh (mobile) to 2vh (desktop)
    const foregroundYEnd = 0 + (viewportFactor * 5); // 0vh (mobile) to 5vh (desktop)
    
    const foregroundY = useTransform(
        smoothProgress,
        [isMobile ? 0.2 : 0, isMobile ? 0.7 : 0.25],
        [`${foregroundYStart}vh`, `${foregroundYEnd}vh`]
    );

    const foregroundScaleStart = 1.0;
    const foregroundScaleEnd = 1.02 + (viewportFactor * 0.03); // 1.02 (mobile) to 1.05 (desktop)

    const foregroundScale = useTransform(
        smoothProgress,
        [0, isMobile ? 0.7 : 0.25],
        [foregroundScaleStart, foregroundScaleEnd]
    );


    const childrenOpacity = useTransform(
        smoothProgress,
        [0.10, 0.30],
        [0, 1]
    );

    const childrenY = useTransform(
        smoothProgress,
        [0.0, 0.30],
        [50, 0]
    );

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            style={{ height }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

                {/* Background Layer - up.JPG (moves up from below) */}
                <motion.div
                    className="absolute inset-0 w-full h-full transform-gpu"
                    style={{
                        y: backgroundY,
                        scale: backgroundScale,
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                    }}
                >
                    <div className="absolute inset-0 w-full h-full">
                        <Image
                            src={backgroundImage}
                            alt="Background Concert"
                            className="w-full h-full object-cover grayscale"
                            style={{
                                objectPosition: isMobile ? 'center center' : 'center 25%', // Favor top even more
                                transform: 'translateZ(0)',
                                width: '100%',
                                height: '100%'
                            }}
                            width={1920}
                            height={1080}
                            sizes="100vw"
                            quality={100}
                            priority
                            unoptimized
                        />
                    </div>
                </motion.div>

                {/* Content Layer - Between background and foreground */}
                {children && (
                    <motion.div
                        className="absolute inset-0 w-full h-full z-20 flex items-center justify-center pointer-events-none"
                        style={{ opacity: childrenOpacity, y: childrenY }}
                    >
                        {children}
                    </motion.div>
                )}

                {/* Foreground Layer - down.png (stays fixed) */}
                <motion.div
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none transform-gpu"
                    style={{ 
                        scale: foregroundScale, 
                        y: foregroundY,
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                    }}
                >
                    <div className="absolute inset-0 w-full h-full">
                        <Image
                            src={foregroundImage}
                            alt="Foreground Crowd"
                            className="w-full h-full object-cover grayscale"
                            style={{
                                objectPosition: 'center center',
                                width: '100%',
                                height: '100%',
                                transform: 'translateZ(0)'
                            }}
                            width={1920}
                            height={1080}
                            sizes="100vw"
                            quality={100}
                            priority
                            unoptimized
                        />
                        {/* Dark gradient at bottom for smooth transition */}
                        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-black to-transparent"></div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

interface ScrollFadeTextProps {
    children: React.ReactNode;
    className?: string;
    fadeInStart?: number;
    fadeInEnd?: number;
    fadeOutStart?: number;
    fadeOutEnd?: number;
    animationType?: 'fade' | 'slideUp' | 'slideDown' | 'blur' | 'zoom';
}

export function ScrollFadeText({
    children,
    className = '',
    fadeInStart = 0,
    fadeInEnd = 0.3,
    fadeOutStart = 0.7,
    fadeOutEnd = 1,
    animationType = 'fade',
}: ScrollFadeTextProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });


    const opacity = useTransform(
        scrollYProgress,
        [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
        [0, 1, 1, 0]
    );


    const getAnimationProps = () => {
        switch (animationType) {
            case 'slideUp':
                const yUp = useTransform(
                    scrollYProgress,
                    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
                    [100, 0, 0, -100]
                );
                return { opacity, y: yUp };

            case 'slideDown':
                const yDown = useTransform(
                    scrollYProgress,
                    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
                    [-100, 0, 0, 100]
                );
                return { opacity, y: yDown };

            case 'blur':
                const blur = useTransform(
                    scrollYProgress,
                    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
                    [10, 0, 0, 10]
                );
                return {
                    opacity,
                    filter: blur.get() !== undefined ? `blur(${blur}px)` : 'blur(0px)'
                };

            case 'zoom':
                const scale = useTransform(
                    scrollYProgress,
                    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
                    [0.5, 1, 1, 1.5]
                );
                return { opacity, scale };

            default: // 'fade'
                return { opacity };
        }
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div style={getAnimationProps()}>
                {children}
            </motion.div>
        </div>
    );
}

export default function Scene2() {
    return (
        <motion.div
            id="about"
            className="bg-black relative z-10 -mt-16 md:-mt-1"
        >
            {/* Your Parallax Reveal Effect */}
            <ParallaxReveal
                backgroundImage="/images/up6.JPG"
                foregroundImage="/images/down5.png"
                height="100vh"
            >
            </ParallaxReveal>

            {/* ABOUT US text - pulled up with negative margin on mobile */}
            <div className="relative z-50 bg-black -mt-32 md:mt-0 py-8 md:py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full flex justify-center items-center px-4"
                >
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-4xl md:text-6xl font-mono tracking-tighter text-center leading-none flex gap-3 justify-center items-center group">
                            <span className="font-bold text-white">ABOUT</span>
                            <span className="text-red-500 animate-pulse">//</span>
                            <span className="font-light text-gray-300 group-hover:text-white transition-colors">US</span>
                        </h2>
                    </div>
                </motion.div>
            </div>

            {/* Spacer between parallax and next section */}
            <div className="h-12 md:h-10 bg-black"></div>

            {/* NEON NOIR FEATURE SECTION */}
            <section className="relative bg-black pt-0 md:pt-12 pb-32 overflow-hidden">

                {/* Massive Background Typography - Parallax or Fixed */}
                <div className="absolute top-[5%] left-0 w-full overflow-hidden pointer-events-none select-none z-0">
                    <h2 className="text-[25vw] font-bebas text-white/5 leading-none tracking-tighter whitespace-nowrap opacity-20">
                        ADVAY 2026
                    </h2>
                </div>
                <div className="absolute bottom-[5%] right-0 w-full overflow-hidden pointer-events-none select-none z-0 flex justify-end">
                    <h2 className="text-[25vw] font-bebas text-white/5 leading-none tracking-tighter whitespace-nowrap opacity-20">
                        FUTURE
                    </h2>
                </div>

                {/* Background Paths Layer - Absolute Full Width */}
                <div className="absolute top-1/2 left-0 w-full h-[80vh] -translate-y-1/2 -z-0 opacity-80 pointer-events-none mix-blend-screen scale-150 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]">
                    <div className="relative w-full h-full overflow-hidden bg-transparent opacity-60">
                        <div className="absolute inset-0">
                            <FloatingPaths position={1} />
                            <FloatingPaths position={-1} />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 lg:px-24 space-y-12 md:space-y-24">

                    {/* Feature 1: FASHION (Runway) */}
                    <div className="relative group">
                        {/* Asymmetrical Layout - stacks on mobile/tablet, horizontal on desktop */}
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-12 relative">

                            {/* Image Composition */}
                            <div className="w-full lg:w-1/2 relative z-10">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-white/10 shadow-[0_0_50px_-10px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_80px_-10px_rgba(220,38,38,0.5)] transition-shadow duration-700">
                                    <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay z-10" />
                                    <img
                                        src="/images/advay_fashion_bw1.jpg"
                                        alt="ADVAY Fashion"
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105 grayscale contrast-125"
                                    />
                                </div>

                                {/* Floating Decor Element */}
                                <div className="absolute -bottom-10 -left-10 w-full h-full border border-red-500/20 z-0 hidden lg:block" />
                            </div>

                            {/* Content Card - Overlapping */}
                            <div className="w-full lg:w-2/5 relative z-20 -mt-10 lg:mt-0 lg:-ml-20">
                                <div className="bg-black/90 border border-white/10 p-6 lg:p-12 relative overflow-hidden">
                                    {/* Card Shine Effect */}
                                    <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />

                                    <div className="space-y-6 relative z-10">
                                        <div className="space-y-1">
                                            <span className="block font-mono text-xs text-red-500 tracking-[0.3em]">NATIONAL // LEVEL</span>
                                            <h2 className="text-5xl lg:text-7xl font-bebas text-white tracking-wide leading-[0.85]">
                                                <span className="text-red-500">A</span>DVAY
                                            </h2>
                                        </div>

                                        <div className="h-px w-12 bg-red-500" />

                                        <div className="space-y-4">
                                            <p className="text-white font-medium text-lg leading-tight">
                                                Advay is a <span className="text-red-500 italic">National-level</span> Techno Cultural fest of Toc H Institute of Science & Technology.
                                            </p>
                                            <p className="text-gray-400 font-light leading-relaxed text-sm lg:text-base">
                                                Taking place annually at TIST, Advay features a wide range of cultural and technical events, including Deca Dance, Roadies, Fashion show, and music performances. Since 2009, it has been a major hub for talented students across Kerala to showcase their skills.
                                            </p>
                                        </div>

                                        <button className="group flex items-center gap-3 text-white font-mono text-sm uppercase tracking-widest hover:text-red-400 transition-colors">
                                            <span>Explore Events</span>
                                            <span className="w-8 h-px bg-current transition-all group-hover:w-16" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Feature 2: MUSIC (Highlights/Symphony) - Reversed */}
                    <div className="relative group">
                        <div className="flex flex-col lg:flex-row-reverse items-center justify-center gap-0 lg:gap-12 relative">

                            {/* Image Composition */}
                            <div className="w-full lg:w-1/2 relative z-10">
                                <div className="relative aspect-video lg:aspect-[4/3] overflow-hidden rounded-sm border border-white/10 shadow-[0_0_50px_-10px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_80px_-10px_rgba(220,38,38,0.5)] transition-shadow duration-700">
                                    <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay z-10" />
                                    <img
                                        src="/images/voice_advay24.JPG"
                                        alt="ADVAY Music"
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-105 grayscale contrast-125"
                                    />
                                </div>
                                {/* Floating Decor Element */}
                                <div className="absolute -top-10 -right-10 w-full h-full border border-red-500/20 z-0 hidden lg:block" />
                            </div>

                            {/* Content Card - Overlapping */}
                            <div className="w-full lg:w-2/5 relative z-20 -mt-10 lg:mt-0 lg:-mr-20">
                                <div className="bg-black/90 border border-white/10 p-6 lg:p-12 relative overflow-hidden">
                                    <div className="space-y-6 relative z-10">
                                        <div className="space-y-1 text-right lg:text-left">
                                            <span className="block font-mono text-xs text-red-500 tracking-[0.3em] uppercase">Tech // Cultural</span>
                                            <h2 className="text-5xl lg:text-6xl font-bebas text-white tracking-wide leading-[0.85]">
                                                HIGH<span className="text-white">LIGHTS</span>
                                            </h2>
                                        </div>

                                        <div className="flex justify-end lg:justify-start">
                                            <div className="h-px w-12 bg-red-500" />
                                        </div>

                                        <div className="space-y-6 text-right lg:text-left">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">120+ Events</h3>
                                                <p className="text-gray-400 font-light leading-relaxed text-sm lg:text-base">
                                                    A plethora of events ranging from enigmatic culturals to brain-storming technical shows shall be proudly presented to all of you.
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">KTU Points</h3>
                                                <p className="text-gray-400 font-light leading-relaxed text-sm lg:text-base">
                                                    Hop onto a meritorious journey where entertainment, informative workshops, and engaging events are all just a tap away!!
                                                </p>
                                            </div>
                                        </div>

                                        {/* Full Lineup button removed */}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </section>


        </motion.div>
    );
}
