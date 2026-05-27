import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ScrollReveal, StaggerContainer, StaggerItem, HoverLift
} from '../components/animations/ScrollReveal'
import Footer from '../components/layout/Footer'
import HeroScrollCanvas from '../components/animations/HeroScrollCanvas'
import {
  BookOpen, Video, ClipboardCheck, ShoppingBag, GraduationCap,
  Shield, TrendingUp, Users, Zap, ArrowRight, Star, Sparkles,
  ChevronLeft, ChevronRight, Lightbulb,
  MessageCircle, BookMarked, Pen
} from 'lucide-react'
import bookIllustration from '../../assests/book_png.png'
import marketplaceBookIllustration from '../../assests/book_png3.png'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const heroContainerRef = useRef(null)

  // Use scroll progress for fading out the text as the user scrolls
  const { scrollYProgress } = useScroll({
    target: heroContainerRef,
    offset: ["start start", "end end"]
  })

  // Keep the hero text invisible until 30% of the scroll, then fade it in
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3, 0.45, 1], [0, 0, 1, 1])
  const heroY = useTransform(scrollYProgress, [0, 0.3, 0.45, 1], [50, 50, 0, 0])

  const features = [
    {
      icon: BookOpen,
      title: 'PDF E-books',
      desc: 'Access premium curriculum-aligned study materials from verified authors.',
      color: '#FF6B6B',
      bg: '#FFE8E8',
    },
    {
      icon: Video,
      title: 'Video Lessons',
      desc: 'Stream high-quality video lectures organized by course and semester.',
      color: '#0052CC',
      bg: '#E6F0FF',
    },
    {
      icon: ClipboardCheck,
      title: 'MCQ Practice Tests',
      desc: 'Take timed quizzes with instant grading and detailed explanations.',
      color: '#FFB84D',
      bg: '#FFF3DB',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Students', icon: Users },
    { value: '500+', label: 'Materials', icon: BookOpen },
    { value: '50+', label: 'Universities', icon: GraduationCap },
    { value: '4.8', label: 'Avg Rating', icon: Star },
  ]

  const topics = [
    { icon: BookOpen, label: 'PDF E-books' },
    { icon: Video, label: 'Video Lectures' },
    { icon: ClipboardCheck, label: 'MCQ Practice' },
    { icon: GraduationCap, label: 'University Courses' },
    { icon: Shield, label: 'Verified Authors' },
    { icon: Lightbulb, label: 'Smart Learning' },
  ]

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* ═══════ HERO SECTION (Scroll Animation) ═══════ */}
      <section
        ref={heroContainerRef}
        style={{
          position: 'relative',
          height: '300vh', // Tall container to allow scroll
          background: '#000',
        }}
      >
        <div className="sticky-hero" style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <HeroScrollCanvas containerRef={heroContainerRef} />

          {/* Hero Content — wraps all text and floats, animated based on scroll */}
          <motion.div
            style={{
              opacity: heroOpacity,
              y: heroY,
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 24px',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Floating Decorative Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: '15%', left: '8%',
                  fontSize: '2.5rem',
                  animation: 'floatSlow 6s ease-in-out infinite',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                }}
              >🎨</motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: '20%', right: '10%',
                  fontSize: '2rem',
                  animation: 'float 5s ease-in-out infinite 0.5s',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                }}
              >✏️</motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute', bottom: '25%', left: '12%',
                  fontSize: '1.8rem',
                  animation: 'float 7s ease-in-out infinite 1s',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                }}
              >📚</motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
                style={{
                  position: 'absolute', bottom: '30%', right: '8%',
                  fontSize: '2.2rem',
                  animation: 'floatSlow 5s ease-in-out infinite 0.8s',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                }}
              >🎓</motion.div>
              <div style={{
                position: 'absolute', top: '45%', left: '5%',
                width: 10, height: 10,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
              }} />
              <div style={{
                position: 'absolute', top: '30%', right: '15%',
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
              }} />

              {/* Hero Content — animated on mount */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                maxWidth: 800,
                width: '100%',
              }}>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    marginBottom: 20,
                    color: 'white',
                  }}
                >
                  Expand your mind,{' '}
                  <span style={{ display: 'block' }}>explore education</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{
                    fontSize: '1.1rem',
                    color: 'rgba(255,255,255,0.85)',
                    maxWidth: 560,
                    margin: '0 auto 36px',
                    lineHeight: 1.7,
                  }}
                >
                  Discover premium PDF e-books, video lessons, and MCQ practice tests
                  from verified authors — all tailored to your university, course, and semester.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <Link to={isAuthenticated ? '/marketplace' : '/register'} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '14px 32px',
                      borderRadius: 999,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      background: 'var(--text-primary)',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'box-shadow 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}>
                      {isAuthenticated ? 'Browse Marketplace' : 'Get Started Free'}
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/marketplace" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '14px 32px',
                      borderRadius: 999,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      background: 'transparent',
                      color: 'white',
                      textDecoration: 'none',
                      border: '2px solid rgba(255,255,255,0.4)',
                      transition: 'all 0.3s ease',
                    }}>
                      Explore Materials
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Central Illustration Area */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{
                    marginTop: 48,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{
                    width: 80, height: 80,
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'float 4s ease-in-out infinite',
                  }}>
                    <BookOpen size={36} color="white" />
                  </div>
                  <div style={{
                    width: 100, height: 100,
                    borderRadius: 24,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'float 4s ease-in-out infinite 0.3s',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  }}>
                    <Lightbulb size={48} color="#FFD700" />
                  </div>
                  <div style={{
                    width: 80, height: 80,
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'float 4s ease-in-out infinite 0.6s',
                  }}>
                    <GraduationCap size={36} color="white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave Bottom - Attached to the bottom of the sticky container so it overlaps the canvas, 
        or we can attach it to the absolute bottom of the 300vh container. 
        Attaching to the absolute bottom of the 300vh container is better for smooth transition to next section. */}
        <div style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
        }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{
            width: '100%',
            height: 80,
            display: 'block',
          }}>
            <path d="M0,60 C360,120 720,0 1440,80 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══════ ABOUT SECTION ═══════ */}
      <section style={{
        padding: '80px 24px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}>
          <ScrollReveal>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}>
              About<br />
              The EduMarket Library
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.8,
              marginBottom: 24,
            }}>
              EduMarket is your one-stop platform for curriculum-aligned educational
              resources. Browse through a curated collection of PDF e-books, video lectures,
              and MCQ practice tests — all created by verified authors from top universities.
              Filter by university, course, and semester to find exactly what you need.
            </p>
          </ScrollReveal>

          {/* Library Info Card */}
          <ScrollReveal delay={0.2}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={{
                flex: 1,
                minWidth: 160,
                height: 200,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #E6F0FF, #F8FAFC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '12px' }}>
                  <img
                    src={bookIllustration}
                    alt="EduMarket library books illustration"
                    style={{
                      width: '100%',
                      maxWidth: 160,
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(circle at 30% 70%, rgba(91,76,255,0.08), transparent 60%)',
                }} />
              </div>
              <HoverLift style={{
                flex: 1,
                minWidth: 180,
                background: 'white',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                border: '1px solid rgba(91,76,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 16,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  The<br />EduMarket Library
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={16} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Authors</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Verified Educators</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>500+ Resources</div>
                    </div>
                  </div>
                </div>
              </HoverLift>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ NEW ARRIVALS / FEATURED ═══════ */}
      <section style={{
        padding: '60px 24px 80px',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                New Arrivals
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}><ChevronLeft size={18} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: 'none',
                  background: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                }}><ChevronRight size={18} /></motion.button>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 36 }}>
              Explore the latest study materials added by our verified authors across all courses.
            </p>
          </ScrollReveal>

          <StaggerContainer
            stagger={0.15}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 30,
            }}
          >
            {features.map((feature, i) => (
              <StaggerItem key={i}>
                <HoverLift y={-6} style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  height: '100%',
                }}>
                  {/* Circular icon background */}
                  <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: feature.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <feature.icon size={40} style={{ color: feature.color }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>{feature.title}</h3>
                    <span style={{
                      background: '#E8FFE8',
                      color: '#22C55E',
                      padding: '2px 10px',
                      borderRadius: 999,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}>Free</span>
                  </div>
                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}>{feature.desc}</p>
                  <Link to="/marketplace" style={{
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    View Details <ArrowRight size={14} />
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section style={{
        padding: '80px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}>
          <ScrollReveal>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}>
              What People<br />
              Say about the<br />
              EduMarket Library
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.7,
              marginBottom: 24,
            }}>
              Hear from students and educators who have used EduMarket
              to enhance their learning and teaching experience.
            </p>
            <Link to="/marketplace" style={{
              color: 'var(--text-secondary)',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.95rem',
            }}>
              Reviews <ArrowRight size={16} />
            </Link>
          </ScrollReveal>

          {/* Testimonial Card */}
          <ScrollReveal delay={0.2} distance={40}>
            <HoverLift y={-4} style={{
              background: 'linear-gradient(135deg, #E6F0FF 0%, #F8FAFC 100%)',
              borderRadius: 20,
              padding: 32,
              position: 'relative',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 48, height: 48,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}>S</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Student Review</div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#FFB84D" color="#FFB84D" />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontSize: '0.95rem',
                fontStyle: 'italic',
              }}>
                "EduMarket has completely transformed how I study. The materials are
                well-organized and perfectly aligned with my curriculum. Highly recommended
                for all university students!"
              </p>

              {/* Decorative elements */}
              <div style={{
                position: 'absolute', top: -12, right: 32,
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MessageCircle size={18} color="white" />
              </div>

              {/* Navigation dots */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 24,
              }}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}><ChevronLeft size={16} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: 'none',
                  background: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                }}><ChevronRight size={16} /></motion.button>
              </div>
            </HoverLift>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ WHAT'S INSIDE ═══════ */}
      <section style={{
        padding: '60px 24px 80px',
        maxWidth: 1200,
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Decorative dots */}
        <div style={{
          position: 'absolute', top: 20, left: 40,
          width: 12, height: 12, borderRadius: '50%',
          background: 'var(--primary)',
          opacity: 0.3,
        }} />
        <div style={{
          position: 'absolute', bottom: 60, right: 100,
          width: 18, height: 18, borderRadius: '50%',
          background: '#FF6B6B',
          opacity: 0.25,
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}>
          <ScrollReveal>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 8,
            }}>Browse by category</p>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              color: 'var(--text-primary)',
              marginBottom: 16,
            }}>
              What's inside<br />our marketplace
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.7,
              marginBottom: 28,
            }}>
              From textbook PDFs to interactive quizzes, our library covers
              every format you need to succeed in your courses.
            </p>

            {/* Topic Grid */}
            <StaggerContainer stagger={0.1} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}>
              {topics.map((topic, i) => (
                <StaggerItem key={i} distance={20}>
                  <motion.div
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'default',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--primary-ultra-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <topic.icon size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}>{topic.label}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>

          {/* Illustration Side */}
          <ScrollReveal delay={0.2} distance={50}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <div style={{
                width: 280,
                height: 280,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #E6F0FF 0%, #F8FAFC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <img
                  src={marketplaceBookIllustration}
                  alt="Open book illustration"
                  style={{
                    width: '85%',
                    maxWidth: 220,
                    height: 'auto',
                    objectFit: 'contain',
                    animation: 'floatSlow 6s ease-in-out infinite',
                  }}
                />

                {/* Floating accent */}
                <div style={{
                  position: 'absolute', top: -15, right: -15,
                  width: 40, height: 40, borderRadius: 10,
                  background: '#FFE8E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'float 4s ease-in-out infinite 0.5s',
                }}>
                  <Pen size={18} style={{ color: '#FF6B6B' }} />
                </div>
                <div style={{
                  position: 'absolute', bottom: -10, left: -10,
                  width: 36, height: 36, borderRadius: 8,
                  background: '#FFF3DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'float 5s ease-in-out infinite 1s',
                }}>
                  <BookMarked size={16} style={{ color: '#FFB84D' }} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ CTA SECTION ═══════ */}
      <section style={{
        padding: '80px 24px 120px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ScrollReveal distance={50}>
          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #0052CC 0%, #2684FF 100%)',
            borderRadius: 32,
            padding: '60px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08), transparent 50%)',
              pointerEvents: 'none',
            }} />

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: 12,
                position: 'relative',
              }}
            >JOIN US TODAY</motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.2,
                marginBottom: 28,
                position: 'relative',
              }}
            >
              Ready to Ace Your<br />Next Semester?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ position: 'relative' }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                <Link to={isAuthenticated ? '/marketplace' : '/register'} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 36px',
                  borderRadius: 999,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  background: 'white',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}>
                  Sign up <ArrowRight size={18} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Decorative */}
            <div style={{
              position: 'absolute', bottom: -30, right: 40,
              fontSize: '4rem',
              opacity: 0.2,
              transform: 'rotate(-15deg)',
            }}>📝</div>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  )
}
