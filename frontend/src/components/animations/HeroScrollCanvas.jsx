import React, { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

export default function HeroScrollCanvas({ containerRef }) {
  const canvasRef = useRef(null)

  // We track the scroll progress of the passed container.
  // The container should be taller than 100vh (e.g., 300vh) to allow scrolling.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // 240 frames total
  const frameCount = 240
  // Map 0 -> 1 scroll progress to 1 -> 209 frame index
  const currentFrame = useTransform(scrollYProgress, [0, 1], [1, frameCount])

  const images = useRef([])
  const [imagesLoaded, setImagesLoaded] = useState(0)

  // Preload images
  useEffect(() => {
    let loadedCount = 0
    const loadedImages = []

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const frameStr = String(i).padStart(3, '0')
      img.src = `/hero-frames/ezgif-frame-${frameStr}.jpg`
      img.onload = () => {
        loadedCount++
        setImagesLoaded(loadedCount)
      }
      loadedImages.push(img)
    }
    images.current = loadedImages
  }, [])

  // Draw to canvas when scroll changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d', { alpha: false }) // Optimize for no transparency

    const render = () => {
      // Get the current frame index from scroll
      const frameIndex = Math.round(currentFrame.get()) - 1
      const clampedIndex = Math.max(0, Math.min(frameIndex, frameCount - 1))

      const img = images.current[clampedIndex]
      if (img && img.complete && img.naturalWidth !== 0) {
        // We use logical pixels because the context is already scaled by dpr
        const logicalWidth = window.innerWidth
        const logicalHeight = window.innerHeight

        const canvasRatio = logicalWidth / logicalHeight
        const imgRatio = img.width / img.height
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0

        // Scale factor to slightly decrease the image size (e.g. 85% of cover size)
        const scaleFactor = 1

        if (imgRatio > canvasRatio) {
          drawHeight = logicalHeight * scaleFactor
          drawWidth = img.width * (drawHeight / img.height)
        } else {
          drawWidth = logicalWidth * scaleFactor
          drawHeight = img.height * (drawWidth / img.width)
        }

        // Center the scaled image in the logical window
        offsetX = (logicalWidth - drawWidth) / 2
        offsetY = (logicalHeight - drawHeight) / 2

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      }
    }

    // Set canvas resolution
    const handleResize = () => {
      // Use devicePixelRatio for sharp rendering
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      context.scale(dpr, dpr)
      render()
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Setup initial size and draw first frame

    const unsubscribe = currentFrame.on('change', render)

    return () => {
      unsubscribe()
      window.removeEventListener('resize', handleResize)
    }
  }, [currentFrame, imagesLoaded])

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
      {/* Dark overlay so white text remains readable over the image sequence */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 100%)',
      }} />
    </div>
  )
}
