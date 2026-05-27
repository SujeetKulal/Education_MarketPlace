import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

/*
 * ScrollReveal — wraps children in a motion.div that fades in + slides up
 * when it enters the viewport.  Fires only once.
 *
 * Props
 *   delay       – extra delay in seconds (default 0)
 *   duration    – animation duration in seconds (default 0.7)
 *   distance    – translateY start offset in px (default 30)
 *   threshold   – fraction of element visible before trigger (default 0.15)
 *   className   – forwarded to the wrapper
 *   style       – forwarded to the wrapper
 *   as          – framer-motion component type, e.g. motion.section (default motion.div)
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  distance = 30,
  threshold = 0.15,
  className,
  style,
  ...rest
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],   // cubic-bezier easeOut — smooth & premium
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/*
 * StaggerContainer — renders children inside a motion container that
 * orchestrates staggered reveals for its direct children.
 *
 * Works with <StaggerItem> children.
 *
 * Props
 *   stagger     – delay between each child (default 0.12)
 *   threshold   – viewport fraction (default 0.1)
 *   className / style – forwarded
 */
export function StaggerContainer({
  children,
  stagger = 0.12,
  threshold = 0.1,
  className,
  style,
  ...rest
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/*
 * StaggerItem — a single stagger-animated child.
 * Must be placed inside a <StaggerContainer>.
 *
 * Props
 *   duration – default 0.6
 *   distance – default 30
 */
export function StaggerItem({
  children,
  duration = 0.6,
  distance = 30,
  className,
  style,
  ...rest
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/*
 * HoverScale — simple scale-on-hover wrapper for cards / buttons.
 *
 * Props
 *   scale      – target scale (default 1.03)
 *   duration   – transition duration (default 0.25)
 */
export function HoverScale({
  children,
  scale = 1.03,
  duration = 0.25,
  className,
  style,
  ...rest
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration, ease: 'easeOut' }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/*
 * HoverLift — subtle upward lift + shadow enhancement on hover.
 * Best for cards.
 */
export function HoverLift({
  children,
  y = -5,
  duration = 0.3,
  className,
  style,
  ...rest
}) {
  return (
    <motion.div
      whileHover={{
        y,
        boxShadow: '0 12px 40px rgba(91, 76, 255, 0.15)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration, ease: 'easeOut' }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
