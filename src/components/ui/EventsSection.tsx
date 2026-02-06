'use client'

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/all"
import React, { useRef, useState, useMemo } from "react"
import {
  Music, Users, Trophy, Car, Film,
  Gamepad2, Sparkles, Zap, Star, Calendar, LucideIcon
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

interface Event {
  title: string;
  subtitle: string;
  status: string;
  icon: LucideIcon;
  gradient: string;
  image: string;
  description: string;
}

export default function EventsSection() {

  const sectionRef = useRef<HTMLDivElement>(null)

  const [activeCategory, setActiveCategory] = useState("featured")
  const [selectedFact, setSelectedFact] = useState(0)

  /* ---------------- PARTICLES ---------------- */

  const particles = useMemo(() =>
    [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2
    })), []
  )

  /* ---------------- DATA ---------------- */

  const funFacts: { icon: LucideIcon; fact: string }[] = [
    { icon: Star, fact: "Over 5000+ students participate in Advay annually from across India!" },
    { icon: Zap, fact: "Advay has been running for 15+ years, making it one of Kerala's longest-running fests!" },
    { icon: Trophy, fact: "₹10 Lakhs+ in prizes distributed across all events every year!" },
    { icon: Calendar, fact: "3 Days of non-stop entertainment, competition, and celebration!" }
  ]

  const featuredEvents: Event[] = [
    {
      title: "Avante Garde",
      subtitle: "Fashion Extravaganza",
      status: "Register",
      icon: Sparkles,
      gradient: "from-red-600 via-black to-red-900",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
      description: "Showcase your style on the grand runway"
    },
    {
      title: "Battle of Bands",
      subtitle: "Music Competition",
      status: "Register",
      icon: Music,
      gradient: "from-black via-red-800 to-black",
      image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80",
      description: "Rock the stage with your band"
    },
    {
      title: "Deca Dance",
      subtitle: "Dance Championship",
      status: "Register",
      icon: Users,
      gradient: "from-red-900 via-black to-red-600",
      image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&q=80",
      description: "10 dance forms, one ultimate winner"
    },
    {
      title: "Mr and Ms Advay",
      subtitle: "Personality Contest",
      status: "Register",
      icon: Trophy,
      gradient: "from-black via-red-700 to-black",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      description: "Crown the face of Advay 2026"
    }
  ]

  const allEvents: Event[] = [
    ...featuredEvents,
    {
      title: "DriftX",
      subtitle: "Racing Challenge",
      status: "Open",
      icon: Car,
      gradient: "from-black via-red-800 to-black",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      description: "Ultimate street racing competition"
    },
    {
      title: "Roadies",
      subtitle: "Adventure Reality",
      status: "Full",
      icon: Users,
      gradient: "from-red-900 via-black to-red-600",
      image: "https://images.unsplash.com/  photo-1551632811-561732d1e306?w=800&q=80",
      description: "Test your limits, face your fears"
    },
    {
      title: "Spot Choreo",
      subtitle: "Instant Dance",
      status: "Register",
      icon: Users,
      gradient: "from-black via-red-700 to-black",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
      description: "Create magic on the spot"
    },
    {
      title: "Symphony",
      subtitle: "Orchestra Performance",
      status: "Register",
      icon: Music,
      gradient: "from-red-600 via-black to-red-900",
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
      description: "Harmonize with your team"
    },
    {
      title: "Chithram",
      subtitle: "Short Film Festival",
      status: "Register",
      icon: Film,
      gradient: "from-black via-red-800 to-black",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
      description: "Tell stories through cinema"
    },
    {
      title: "BGMI Competition",
      subtitle: "Gaming Tournament",
      status: "Register",
      icon: Gamepad2,
      gradient: "from-red-900 via-black to-red-600",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      description: "Battle royale supremacy"
    }
  ]

  /* ---------------- GSAP ---------------- */

  useGSAP(() => {

    gsap.fromTo("#events-title",
      { opacity: 0, scale: 0.3 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        scrollTrigger: {
          trigger: "#events-section",
          start: "top 80%"
        }
      }
    )

    gsap.utils.toArray<HTMLElement>(".event-card").forEach(card => {
      gsap.fromTo(card,
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: card,
            start: "top 90%"
          }
        }
      )
    })

    gsap.to(".particle", {
      y: "random(-40,40)",
      x: "random(-30,30)",
      repeat: -1,
      yoyo: true,
      duration: "random(2,4)",
      ease: "sine.inOut"
    })

  }, { scope: sectionRef })

  /* ---------------- CARD ---------------- */

  function EventCard({ event }: { event: Event }) {

    const Icon = event.icon
    const [flip, setFlip] = useState(false)

    return (
      <div
        className="event-card group relative h-[400px]"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setFlip(true)}
        onMouseLeave={() => setFlip(false)}
      >

        <div
          className={`relative w-full h-full transition-all duration-700 transform-gpu ${flip ? "rotate-y-180" : ""}`}
          style={{ transformStyle: "preserve-3d" }}
        >

          {/* FRONT */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden">

            <div className="absolute inset-0">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} opacity-85`} />
            </div>

            <div className="absolute inset-0 border-2 border-red-500/20 group-hover:border-red-500/60 transition-all" />

            <div className="relative h-full p-6 flex flex-col justify-between">

              <div className="flex justify-between items-start">

                <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center border border-red-500/30">
                  <Icon className="w-8 h-8 text-red-400" />
                </div>

                <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                  event.status === "Full"
                    ? "bg-gray-800/60 text-gray-300"
                    : event.status === "Open"
                    ? "bg-green-600/40 text-green-200"
                    : "bg-red-600/40 text-red-200 animate-pulse"
                }`}>
                  {event.status}
                </span>

              </div>

              <div>
                <p className="text-red-400 uppercase text-sm">{event.subtitle}</p>
                <h3 className="text-white text-3xl font-black">{event.title}</h3>
                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100">
                  Hover to learn more
                </p>
              </div>

            </div>

          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-900 via-red-950 to-black p-8"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >

            <div className="flex flex-col h-full justify-between">

              <div>
                <Icon className="w-12 h-12 text-red-400 mb-4" />
                <h4 className="text-white text-2xl font-bold">{event.title}</h4>
                <p className="text-gray-300 mt-3">{event.description}</p>
              </div>

              <button
                disabled={event.status === "Full"}
                className={`py-4 rounded-xl font-bold ${
                  event.status === "Full"
                    ? "bg-gray-700 text-gray-400"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Register Now →
              </button>

            </div>

          </div>

        </div>
      </div>
    )
  }

  /* ---------------- RENDER ---------------- */

  return (
    <section
      id="events-section"
      ref={sectionRef}
      className="relative min-h-screen bg-black py-24 px-6 overflow-hidden"
    >

      {/* PARTICLES */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle absolute w-2 h-2 bg-red-500/30 rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}

      <div className="relative max-w-7xl mx-auto">

        {/* TITLE */}
        <div id="events-title" className="text-center mb-12">
          <h2 className="text-5xl font-black text-red-500">EVENTS</h2>
        </div>

        {/* TOGGLE */}
        <div className="flex justify-center mb-12 gap-4">
          <button onClick={() => setActiveCategory("featured")}>Featured</button>
          <button onClick={() => setActiveCategory("all")}>All Events</button>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {(activeCategory === "featured" ? featuredEvents : allEvents)
            .map((event, i) => (
              <EventCard key={i} event={event} />
            ))}

        </div>

        {/* VIEW MORE */}
        {activeCategory === "featured" && (
          <div className="text-center">
            <button
              onClick={() => setActiveCategory("all")}
              className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              View More Events →
            </button>
          </div>
        )}

      </div>

    </section>
  )
}
