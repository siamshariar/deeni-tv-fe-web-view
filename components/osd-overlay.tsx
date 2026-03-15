'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Languages, Calendar, Info, Heart } from 'lucide-react'
import { LanguageModal } from './language-modal'
import { ScheduleModal } from './schedule-modal'
import { AboutModal } from './about-modal'

export function OSDOverlay() {
  const [isVisible, setIsVisible] = useState(true)
  const [activeModal, setActiveModal] = useState<'language' | 'schedule' | 'about' | null>(null)
  const timeoutRef = useState<NodeJS.Timeout | null>(null)[0]

  const handleActivity = useCallback(() => {
    setIsVisible(true)
    if (timeoutRef) {
      clearTimeout(timeoutRef)
    }
    const timeout = setTimeout(() => {
      if (!activeModal) {
        setIsVisible(false)
      }
    }, 5000)
  }, [activeModal, timeoutRef])

  useEffect(() => {
    handleActivity()
    
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('touchstart', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [handleActivity, timeoutRef])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Top Right Donate Button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-8 right-8 z-50"
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl animate-pulse-slow font-semibold px-8"
              >
                <Heart className="mr-2 h-5 w-5" />
                Donate
              </Button>
            </motion.div>

            {/* Bottom Menu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-2 shadow-2xl">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setActiveModal('language')}
                    className="text-white hover:bg-white/20 hover:text-white flex-col gap-2 h-auto py-4 px-6"
                  >
                    <Languages className="h-6 w-6" />
                    <span className="text-xs font-medium">Channel</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setActiveModal('schedule')}
                    className="text-white hover:bg-white/20 hover:text-white flex-col gap-2 h-auto py-4 px-6"
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-xs font-medium">Schedule</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setActiveModal('about')}
                    className="text-white hover:bg-white/20 hover:text-white flex-col gap-2 h-auto py-4 px-6"
                  >
                    <Info className="h-6 w-6" />
                    <span className="text-xs font-medium">About</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <LanguageModal
        isOpen={activeModal === 'language'}
        onClose={() => setActiveModal(null)}
      />
      <ScheduleModal
        isOpen={activeModal === 'schedule'}
        onClose={() => setActiveModal(null)}
        schedule={[]}
      />
      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
      />
    </>
  )
}
