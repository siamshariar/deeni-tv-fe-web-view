'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoProgram } from '@/types/schedule'
import { formatTime, formatDuration } from '@/lib/schedule-utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule: VideoProgram[]
  currentProgramId?: string
}

export function ScheduleModal({ isOpen, onClose, schedule, currentProgramId }: ScheduleModalProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  // Filter out watched programs - only show current and upcoming
  const filteredSchedule = schedule.filter((program, index) => {
    const currentIndex = schedule.findIndex(p => p.id === currentProgramId)
    // Show current program and all upcoming programs
    return index >= currentIndex
  })

  // The first item in filteredSchedule that matches currentProgramId is "Now Playing".
  // Using filteredIndex (position in filtered list) ensures only ONE item gets the badge,
  // even when the same video ID appears multiple times in the schedule.
  const nowPlayingFilteredIndex = filteredSchedule.findIndex(p => p.id === currentProgramId)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-h-[80vh] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden ${isMobile ? 'max-w-sm' : 'max-w-2xl'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white">Programs Schedule</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={`text-white/60 hover:text-white hover:bg-white/10 rounded-xl ${
                  isMobile ? 'h-12 w-12' : 'h-10 w-10'
                }`}
              >
                <X className={isMobile ? 'h-7 w-7' : 'h-5 w-5'} />
              </Button>
            </div>
            
            {/* Schedule List - Display only, no hover/click */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              {filteredSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <p className="text-white/60 text-sm mb-2">No previous program available.</p>
                  <p className="text-white/40 text-xs">
                    The schedule is currently unavailable.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSchedule.map((program, index) => {
                    // Only the FIRST occurrence of the current ID gets the Now Playing badge
                    const isCurrent = index === nowPlayingFilteredIndex
                    // Up Next is the item immediately after the Now Playing item
                    const isUpNext = nowPlayingFilteredIndex >= 0 && index === nowPlayingFilteredIndex + 1
                    
                    return (
                      <motion.div
                        key={`${program.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border select-none ${
                          isCurrent 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1.5">
                              {isCurrent && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                                  Now Playing
                                </span>
                              )}
                              {!isCurrent && isUpNext && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full">
                                  Up Next
                                </span>
                              )}
                            </div>
                            <h3 className={`font-semibold leading-snug ${
                              isCurrent ? 'text-primary' : 'text-white'
                            }`}>
                              {program.title}
                            </h3>
                            <p className="text-white/40 text-xs mt-1.5">{formatDuration(program.duration)}</p>
                          </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
