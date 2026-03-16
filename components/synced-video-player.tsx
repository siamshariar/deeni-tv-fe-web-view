
'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, VolumeX, Maximize, MoreHorizontal, Minimize, 
  Tv, Clock, ArrowRight, Eye, EyeOff, Repeat, Volume1, 
  Volume, AlertCircle, RefreshCw, Play, Loader2, Radio,
  WifiOff, Globe, X, Smartphone, Tablet, Laptop,
  Sparkles, Zap, Shield, Star, Heart, ChevronRight,
  ChevronLeft, Menu, Home, Settings, Info, Calendar,
  Moon, Sun, Battery, Wifi, Signal, Volume as VolumeIcon,
  ChevronUp, ChevronDown, TrendingUp, Radio as RadioIcon,
  PlayCircle, RefreshCcw, Timer, Hourglass, History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMediaQuery } from '@/hooks/use-media-query'
import { CurrentVideoData, VideoProgram, Channel } from '@/types/schedule'
import { clientFetchWithAuth } from '@/lib/client-fetch'
import { 
  formatTime, 
  CHANNELS, 
  MASTER_EPOCH_START, 
  getTotalScheduleDuration,
  getChannelPrograms,
  getSavedChannel,
  saveChannel,
  addToPreviousVideos,
  getPreviousVideos,
  savePreviousVideos,
  STORAGE_KEY,
  ApiChannel,
  getStoredApiChannels,
  saveApiChannels,
} from '@/lib/schedule-utils'
import { useYouTubePlayer, YT_STATE } from '@/hooks/use-youtube-player'
import { PreviousVideosModal } from './previous-videos-modal'

interface SyncedVideoPlayerProps {
  onMenuOpen: () => void
  initialChannelId?: string
  onChannelChange?: (channelId: string) => void
  showStartModal?: boolean
  onStartClick?: () => void
  openHistoryModal?: boolean
  onHistoryModalClose?: () => void
  onOpenSchedule?: () => void
  openChannelSelectorModal?: boolean
  onChannelSelectorModalClose?: () => void
  /** Called whenever the current program / schedule changes (video transition, API sync, etc.) */
  onProgramChange?: (currentProgramId: string, schedule: VideoProgram[]) => void
  /** Increment this counter to trigger a channel reload (e.g. from the Reload menu option) */
  triggerReload?: number
}

// Channel Selector Modal Component
const ChannelSelectorModal = ({ 
  isOpen, 
  onClose, 
  channels, 
  onSelectChannel, 
  currentChannelId 
}: { 
  isOpen: boolean
  onClose: () => void
  channels: ApiChannel[]
  onSelectChannel: (channelId: string) => void
  currentChannelId?: string
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredChannels = channels.filter(channel => 
    channel.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${
              isMobile ? 'max-w-sm' : 'max-w-2xl'
            } bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-white/10 z-[70] overflow-hidden`}
          >
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 animate-gradient" />
              <div className="relative flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Select Channel</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* <div className="p-4 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <Globe className="absolute left-3 top-3.5 h-4 w-4 text-white/40" />
              </div>
            </div> */}
            
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChannels.map((channel, index) => (
                  <motion.button
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectChannel(String(channel.id))
                      onClose()
                    }}
                    className={`relative group p-4 rounded-xl border transition-all ${
                      String(channel.id) === currentChannelId
                        ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/50 shadow-lg shadow-primary/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {String(channel.id) === currentChannelId && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-primary/20"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    
                    <div className="relative flex items-center gap-3">
                      {/* <div className="text-lg filter drop-shadow-lg">
                        {channel.isQuran ? '📖' : '📺'}
                      </div> */}
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${
                          String(channel.id) === currentChannelId ? 'text-primary' : 'text-white'
                        }`}>
                          {channel.title}
                        </p>
                      </div>
                      {String(channel.id) === currentChannelId && (
                        <div className="px-2 py-1 bg-primary/20 rounded-full">
                          <span className="text-primary text-xs font-medium">Current</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-white/5">
              <p className="text-center text-xs text-white/40">
                {filteredChannels.length} channels available • Select your preferred channel
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Start Screen Component - Fully responsive for all screen sizes
const StartScreen = ({ onPlayClick }: { onPlayClick: () => void }) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-black z-50 overflow-hidden"
    >      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8"
      >
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
          {/* App Logo with Animation */}
          <div className="relative flex items-center justify-center">
            <div className={`relative flex items-center justify-center ${
              isMobile ? 'w-16 h-16' : isTablet ? 'w-24 h-24' : 'w-32 h-32'
            }`}>
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.03, 1],
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative flex items-center justify-center"
              >
                <div className={`absolute rounded-full bg-primary/20 blur-xl animate-pulse ${
                  isMobile ? 'w-12 h-12' : isTablet ? 'w-20 h-20' : 'w-28 h-28'
                }`} />
                <Radio className={`${
                  isMobile ? 'h-8 w-8' : 
                  isTablet ? 'h-14 w-14' : 
                  'h-20 w-20'
                } text-primary relative z-10 flex-shrink-0`} />
                
                <motion.div
                  animate={{ y: ['-50%', '150%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm pointer-events-none"
                />
              </motion.div>
            </div>
          </div>
          
          {/* Logo with full branding */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img 
              src="/DeeniTV-V-2.png" 
              alt="Deeni.tv - Your Spiritual TV Experience"
              className={isMobile ? 'h-8' : isTablet ? 'h-10' : 'h-12'}
            />
          </motion.div>
          
          <motion.p 
            className={`text-white/60 text-center ${
              isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your Spiritual TV Experience
          </motion.p>
          
          {/* Feature badges - hidden on very small mobile, shown on larger */}
          {!isMobile && (
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: Zap, text: 'Live TV' },
                { icon: Shield, text: 'Halal Content' },
                { icon: Sparkles, text: 'Premium' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/5 rounded-full border border-white/10"
                >
                  <item.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-white/80 whitespace-nowrap">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {/* Start button - always visible */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-1 sm:mt-2"
          >
            <Button
              onClick={onPlayClick}
              size={isMobile ? 'default' : 'lg'}
              className={`relative group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full shadow-2xl shadow-primary/30 overflow-hidden ${
                isMobile ? 'px-5 py-3 text-sm' : isTablet ? 'px-6 py-4 text-base' : 'px-8 py-5 text-lg'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <PlayCircle className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                <span className="font-bold">Start Watching</span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </Button>
          </motion.div>
          
          <motion.p 
            className={`text-white/40 text-center ${isMobile ? 'text-[9px]' : 'text-[11px]'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Click to start your spiritual journey
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Tap-to-Unmute Screen ──
// Full-screen overlay (same style as StartScreen) shown when the player is
// muted and waiting for a user gesture — required on iOS for audio autoplay.
const TapToUnmuteScreen = ({ onUnmuteClick }: { onUnmuteClick: () => void }) => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-black z-50 overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8"
      >
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
          {/* Icon */}
          <div className="relative flex items-center justify-center">
            <div className={`relative flex items-center justify-center ${
              isMobile ? 'w-16 h-16' : isTablet ? 'w-24 h-24' : 'w-32 h-32'
            }`}>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center"
              >
                <div className={`absolute rounded-full bg-primary/20 blur-xl animate-pulse ${
                  isMobile ? 'w-12 h-12' : isTablet ? 'w-20 h-20' : 'w-28 h-28'
                }`} />
                <VolumeX className={`${
                  isMobile ? 'h-8 w-8' :
                  isTablet ? 'h-14 w-14' :
                  'h-20 w-20'
                } text-primary relative z-10 flex-shrink-0`} />
              </motion.div>
            </div>
          </div>

          {/* Logo */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src="/DeeniTV-V-2.png"
              alt="Deeni.tv"
              className={isMobile ? 'h-8' : isTablet ? 'h-10' : 'h-12'}
            />
          </motion.div>

          <motion.p
            className={`text-white/60 text-center ${
              isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-base'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Video is playing — audio is muted
          </motion.p>

          {/* Unmute button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-1 sm:mt-2"
          >
            <Button
              onClick={onUnmuteClick}
              size={isMobile ? 'default' : 'lg'}
              className={`relative group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full shadow-2xl shadow-primary/30 overflow-hidden touch-manipulation ${
                isMobile ? 'px-5 py-3 text-sm' : isTablet ? 'px-6 py-4 text-base' : 'px-8 py-5 text-lg'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Volume2 className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                <span className="font-bold">Tap to Unmute</span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </Button>
          </motion.div>

          <motion.p
            className={`text-white/40 text-center ${isMobile ? 'text-[9px]' : 'text-[11px]'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Tap the button above to enable audio
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Live Badge Component
const LiveBadge = ({ variant = 'default', isMobile = false }: { variant?: 'default' | 'transparent', isMobile?: boolean }) => {
  // Component is kept for potential future use but not displayed per requirements
  return null
}

// Branded Loading Overlay - Shows during YouTube iframe loading (event-based, not timer-based)
const BrandedLoadingOverlay = ({ 
  isVisible, 
  programName,
  startTime,
}: { 
  isVisible: boolean
  programName: string
  startTime?: string | null
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[45] flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          </div>
          
          {/* Logo and branding — fully responsive sizing */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 20 }}
            className="relative flex flex-col items-center gap-2.5 sm:gap-3 md:gap-4"
          >
            {/* Spinning loader ring + logo — scales with viewport */}
            <div className="relative flex items-center justify-center w-[14vmin] h-[14vmin] min-w-[3.5rem] min-h-[3.5rem] max-w-[7rem] max-h-[7rem] sm:min-w-[4.5rem] sm:min-h-[4.5rem] sm:max-w-[8rem] sm:max-h-[8rem] md:max-w-[9rem] md:max-h-[9rem]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-primary/20"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-primary"
              />
              {/* Logo image — 40% of the spinner circle */}
              <img 
                src="/DeeniTV-V-2.png" 
                alt="Deeni.tv"
                className="h-[40%] w-auto object-contain"
              />
            </div>
            
            {/* Program name banner */}
            <div className="max-w-[85%] sm:max-w-md md:max-w-lg text-center px-3 sm:px-5 md:px-6">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3"
              >
                <p className="text-white/50 uppercase tracking-wider font-medium text-[7px] sm:text-[9px] md:text-[10px] mb-0.5 sm:mb-1">
                  Now Playing
                </p>
                <h3 className="text-white font-bold leading-tight line-clamp-2 text-sm sm:text-base md:text-lg lg:text-xl">
                  {programName || 'Loading program...'}
                </h3>
                {startTime && (
                  <p className="text-white/60 text-[10px] sm:text-xs mt-1">
                    Starts at {startTime}
                  </p>
                )}
              </motion.div>
            </div>
            
            {/* Loading bar animation */}
            <motion.div 
              className="w-[25vmin] min-w-[6rem] max-w-[12rem] h-1 bg-white/10 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Program Overlay Component - Auto-appearing Now Playing bar (ticker-style)
const ProgramOverlay = ({ 
  currentProgram, 
  nextProgram, 
  isVisible,
  isMobile 
}: { 
  currentProgram: VideoProgram | null
  nextProgram: VideoProgram | null
  isVisible: boolean
  isMobile: boolean
}) => {
  return (
    <AnimatePresence>
      {isVisible && currentProgram && (
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? -20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? -20 : 0 }}
          transition={{ duration: 0.4 }}
          className={`absolute z-30 ${
            isMobile ? 'top-2 left-2 right-2' : 'top-4 left-4 right-1/3'
          }`}
        >
          {/* <div className={`backdrop-blur-xl bg-black/70 border border-white/10 rounded-xl ${
            isMobile ? 'p-2' : 'p-3'
          } shadow-2xl`}> */}
            {/* Now Playing - Just name */}
            {/* <div className="flex items-center gap-2 mb-0.5">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-primary"></span>
              </span>
              <span className={`text-primary font-bold ${isMobile ? 'text-[8px]' : 'text-xs'} uppercase tracking-wider`}>
                Now Playing
              </span>
            </div>
            <h3 className={`text-white font-bold ${isMobile ? 'text-[11px] leading-tight' : 'text-sm'} line-clamp-1`}>
              {currentProgram.title}
            </h3> */}
            
            {/* Up Next - Just name */}
            {/* {nextProgram && (
              // <div className={`pt-0.5 md:pt-1 border-t border-white/10 ${isMobile ? 'mt-1' : 'mt-1.5'}`}>
              //   <div className="flex items-center gap-1 md:gap-2 mb-0.5">
              //     <ArrowRight className={`text-yellow-300 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
              //     <span className={`text-yellow-300 font-bold ${isMobile ? 'text-[8px]' : 'text-xs'} uppercase tracking-wider`}>
              //       Up Next
              //     </span>
              //   </div>
              //   <p className={`text-white/80 ${isMobile ? 'text-[10px] leading-tight' : 'text-sm'} line-clamp-1`}>
              //     {nextProgram.title}
              //   </p>
              // </div>
            )} */}
          {/* </div> */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Deeni.tv Logo Component
const DeeniLogo = ({ isMobile = false }: { isMobile?: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center"
    >
      <img 
        src="/DeeniTV-V-2.png" 
        alt="Deeni.tv"
        className={isMobile ? 'h-4' : 'h-6'}
      />
    </motion.div>
  )
}

// Desktop Ticker Component - Enhanced bold text, 360-degree infinite scroll
const DesktopTicker = ({ videos, currentIndex, totalPrograms, currentProgramId }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  totalPrograms: number,
  currentProgramId?: string
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -500] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          className="whitespace-nowrap"
        >
          <span className="text-white/90 font-bold px-4 text-sm">
            <RadioIcon className="inline h-3 w-3 mr-2 text-primary animate-pulse" />
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  const items: React.ReactElement[] = []
  const repeatCount = 40 // Very high for true 360-degree infinite loop
  
  for (let i = 0; i < repeatCount; i++) {
    videos.forEach((video, index) => {
      const isNextVideo = index === 0 // Only the first video in the list is "NEXT"
      const isCurrentVideo = video.id === currentProgramId
      const prefix = isNextVideo ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      
      if (isCurrentVideo) return;
      
      items.push(
        <div key={`${video.id}-${i}-${index}`} className="inline-flex items-center mx-5">
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-black mr-3 whitespace-nowrap
            ${isNextVideo 
              ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/70 shadow-lg shadow-yellow-500/30 font-extrabold' 
              : 'bg-white/30 text-white border border-white/40 shadow-lg font-bold'
            }
          `}>
            {prefix}
          </span>
          <span className={`font-black text-sm whitespace-nowrap tracking-wide ${
            isNextVideo ? 'text-yellow-300 font-extrabold' : 'text-white'
          }`}>
            {video.title}
          </span>
          <span className={`ml-3 font-mono text-sm font-black whitespace-nowrap ${
            isNextVideo ? 'text-yellow-300' : 'text-white/80'
          }`}>
            {duration}
          </span>
        </div>
      )
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center group">
      {/* Gradient Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/95 to-transparent z-10 pointer-events-none" />
      
      {/* Infinite Scrolling - 360-degree never ends */}
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -20000] }}
        transition={{ 
          duration: 150, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
        style={{ willChange: "transform" }}
      >
        {items}
      </motion.div>
    </div>
  )
}

// Mobile Ticker Component - Ultra compact with more items
const MobileTicker = ({ videos, currentIndex, totalPrograms, currentProgramId }: { 
  videos: VideoProgram[], 
  currentIndex: number,
  totalPrograms: number,
  currentProgramId?: string
}) => {
  if (videos.length === 0) {
    return (
      <div className="relative flex overflow-hidden h-full items-center">
        <motion.div 
          animate={{ x: [0, -300] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          className="whitespace-nowrap"
        >
          <span className="text-white/90 font-bold px-2 text-[10px]">
            More content coming...
          </span>
        </motion.div>
      </div>
    )
  }

  const items: React.ReactElement[] = []
  const repeatCount = 40 // Increased for smoother infinite loop
  
  for (let i = 0; i < repeatCount; i++) {
    videos.forEach((video, index) => {
      const isNextVideo = index === 0 // Only the first video in the list is "NEXT"
      const isCurrentVideo = video.id === currentProgramId
      const prefix = isNextVideo ? 'NEXT' : 'UP NEXT'
      const duration = formatTime(video.duration)
      
      if (isCurrentVideo) return;
      
      items.push(
        <div key={`${video.id}-${i}-${index}`} className="inline-flex items-center mx-2">
          <span className={`
            px-1.5 py-0.5 rounded-full text-[8px] font-black mr-1.5 whitespace-nowrap
            ${isNextVideo 
              ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/70 shadow-sm font-extrabold' 
              : 'bg-white/30 text-white border border-white/40 shadow-sm font-bold'
            }
          `}>
            {prefix}
          </span>
          <span className={`font-black text-[10px] whitespace-nowrap tracking-wide ${
            isNextVideo ? 'text-yellow-300 font-extrabold' : 'text-white'
          }`}>
            {video.title}
          </span>
          <span className={`ml-1.5 font-mono text-[9px] font-black whitespace-nowrap ${
            isNextVideo ? 'text-yellow-300' : 'text-white/80'
          }`}>
            {duration}
          </span>
        </div>
      )
    })
  }

  return (
    <div className="relative flex overflow-hidden h-full items-center">
      {/* Gradient Fades - Smaller on mobile */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/95 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/95 to-transparent z-10 pointer-events-none" />
      
      {/* Infinite Scrolling - 360-degree never ends - Standard TV news speed */}
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -15000] }}
        transition={{ 
          duration: 180, 
          repeat: Infinity, 
          ease: "linear",
          repeatType: "loop"
        }}
        style={{ willChange: "transform" }}
      >
        {items}
      </motion.div>
    </div>
  )
}

// Modern Time Display Component
const ModernTimeDisplay = () => {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })
  
  const formattedDate = time.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  })
  
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-4 right-4 z-40"
    >
      <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-white font-semibold text-sm tracking-wide">
          {formattedTime}
        </span>
        <div className="w-px h-4 bg-white/20" />
        <span className="text-white/80 text-xs font-medium">
          {formattedDate}
        </span>
      </div>
    </motion.div>
  )
}

export function SyncedVideoPlayer({ 
  onMenuOpen, 
  initialChannelId = CHANNELS[0].id,
  onChannelChange,
  showStartModal = false,
  onStartClick,
  openHistoryModal = false,
  onHistoryModalClose,
  onOpenSchedule,
  openChannelSelectorModal = false,
  onChannelSelectorModalClose,
  onProgramChange,
  triggerReload = 0
}: SyncedVideoPlayerProps) {
  // ── iOS detection ──
  // iOS Safari blocks autoplaying video with sound. We start muted on iOS so the
  // browser allows playback, then the user taps the unmute button (user gesture)
  // to restore sound. On Android / desktop we start unmuted as normal.
  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  }, [])

  // UI State
  const [showControls, setShowControls] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(true)
  // On iOS start muted (autoplay restriction); on other platforms start unmuted
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof navigator === 'undefined') return false
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    )
  })
  const [volume, setVolume] = useState(75)
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false)
  const [showTicker, setShowTicker] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreviousModal, setShowPreviousModal] = useState(false)
  const [previousVideos, setPreviousVideos] = useState<VideoProgram[]>([])
  const [showProgramOverlay, setShowProgramOverlay] = useState(false)
  const [mainPlayerPaused, setMainPlayerPaused] = useState(false)
  
  // Branded loading overlay state - event-based, not timer-based
  const [showBrandedOverlay, setShowBrandedOverlay] = useState(false)
  const brandedOverlayProgramRef = useRef<string>('')
  // iframeVisible — keeps the iframe container at opacity:0 until the REAL video
  // fires its first PLAYING event.  Prevents the primer (zoo) video from flashing
  // on screen.
  const [iframeVisible, setIframeVisible] = useState(false)

  // Hide the branded loading overlay as soon as the real iframe starts rendering.
  // This ensures the overlay is visible while the iframe is still loading and
  // automatically disappears when playback begins.
  useEffect(() => {
    if (iframeVisible) {
      setShowBrandedOverlay(false)
    }
  }, [iframeVisible])
  
  // Channel State
  const [apiChannels, setApiChannels] = useState<ApiChannel[]>([])
  const [currentChannelId, setCurrentChannelId] = useState<string>(initialChannelId)
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  
  // Player State
  const [currentProgram, setCurrentProgram] = useState<VideoProgram | null>(null)
  const [nextProgram, setNextProgram] = useState<VideoProgram | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('0:00')
  const [displayTime, setDisplayTime] = useState('0:00')
  const [videoDuration, setVideoDuration] = useState(0)
  const [cycleInfo, setCycleInfo] = useState({ current: 1, total: 1 })
  const [upcomingVideos, setUpcomingVideos] = useState<VideoProgram[]>([])
  
  // App State
  const [isLoading, setIsLoading] = useState(false)
  const [showStartScreen, setShowStartScreen] = useState(showStartModal)
  const [playerReady, setPlayerReady] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [serverTimeOffset, setServerTimeOffset] = useState(0)

  // Computed program timing (used for loading/buffering UI)
  const [programStartTime, setProgramStartTime] = useState<string | null>(null)
  
  // Refs
  const playerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')
  const lastVideoIdRef = useRef<string>('')
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)
  const masterEpochRef = useRef<number>(MASTER_EPOCH_START)
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const videoEndTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hiddenAtRef = useRef<number | null>(null)
  const lastResumeAtRef = useRef<number>(0)
  const isTransitioningRef = useRef(false)
  // "Latest value" refs — used inside syncWithServer so we don't need those values
  // in the useCallback dependency array (which would reset the 5-min interval on each video change)
  const currentProgramRef = useRef<VideoProgram | null>(null)
  const upcomingVideosRef = useRef<VideoProgram[]>([])
  // playNextVideoRef — always holds the latest playNextVideo closure.
  // onStateChange (ENDED) and the time-update check both call this so they always
  // advance the CURRENT queue, not the stale one captured at initializePlayer time.
  const playNextVideoRef = useRef<() => void>(() => {})
  // syncImmediateAfterTransitionRef — holds the latest closure so playNextVideo
  // (defined before syncImmediateAfterTransition) can call it without a TDZ error.
  const syncImmediateAfterTransitionRef = useRef<(channelId: string) => Promise<void>>(async () => {})
  
  // YouTube player hook
  const { 
    containerRef: youtubeContainerRef, 
    initializePlayer, 
    primePlayer,
    unmuteAndResume,
    setPlayerCallbacks,
    isPrimedRef,
    loadVideo, 
    getDuration,
    setVolume: setYouTubeVolume,
    setMuted: setYouTubeMuted,
    seekTo,
    getCurrentTime,
    play,
    pause,
    destroy
  } = useYouTubePlayer()

  // ── Helper: build schedule array from current state and notify parent ──
  // Deduplicates: ensures the currently-playing video never also appears in upcoming.
  const notifyParentScheduleChange = useCallback((
    nowPlaying: VideoProgram,
    upcoming: VideoProgram[]
  ) => {
    if (!onProgramChange) return
    // Remove the now-playing video from the upcoming list to avoid duplicates
    const dedupedUpcoming = upcoming.filter(p => p.videoId !== nowPlaying.videoId)
    const schedule: VideoProgram[] = [nowPlaying, ...dedupedUpcoming]
    onProgramChange(nowPlaying.id, schedule)
  }, [onProgramChange])

  // Load stored API channels from localStorage on mount
  useEffect(() => {
    const stored = getStoredApiChannels()
    if (stored.length > 0) setApiChannels(stored)
  }, [])

  // ── iOS silent primer ────────────────────────────────────────────────────────
  // While the start screen is visible, silently initialise a muted YouTube player
  // in the background.  iOS Safari allows muted autoplay without a gesture, so
  // this "warms up" the WebView's video permission context.  When the user later
  // taps "Start Watching" we can call unmuteAndResume() synchronously inside that
  // gesture (before any async work), granting audio permission for the session.
  useEffect(() => {
    if (!showStartScreen) return        // only prime on the start screen
    if (isPrimedRef.current) return     // already primed — don't recreate
    primePlayer()                       // fire-and-forget; errors are swallowed inside
  }, [showStartScreen, primePlayer, isPrimedRef])

  // Load previous videos when channel changes
  useEffect(() => {
    if (currentChannelId) {
      const saved = getPreviousVideos(currentChannelId)
      setPreviousVideos(saved)
    }
  }, [currentChannelId])

  // Keep "latest value" refs in sync — allows syncWithServer to read current state
  // without being in its dependency array (which would reset the 5-min interval)
  useEffect(() => { currentProgramRef.current = currentProgram }, [currentProgram])
  useEffect(() => { upcomingVideosRef.current = upcomingVideos }, [upcomingVideos])

  // Update showStartScreen when prop changes
  useEffect(() => {
    setShowStartScreen(showStartModal)
  }, [showStartModal])

  // Update program start time string (used in loading/buffering UI)
  useEffect(() => {
    if (!currentProgram) {
      setProgramStartTime(null)
      return
    }

    if (currentProgram.startTime) {
      const start = new Date(currentProgram.startTime)
      setProgramStartTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      return
    }

    // Fallback: approximate start time based on current playback position
    if (currentTime > 0) {
      const start = new Date(Date.now() + serverTimeOffset - currentTime * 1000)
      setProgramStartTime(start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      return
    }

    setProgramStartTime(null)
  }, [currentProgram?.startTime, currentTime, serverTimeOffset])

  // Handle external openHistoryModal prop
  useEffect(() => {
    if (openHistoryModal && !showPreviousModal) {
      setShowPreviousModal(true)
    }
  }, [openHistoryModal, showPreviousModal])

  // Handle external openChannelSelectorModal trigger (from 3-dot menu)
  useEffect(() => {
    if (openChannelSelectorModal && !showChannelSelector) {
      setShowChannelSelector(true)
    }
  }, [openChannelSelectorModal, showChannelSelector])

  // Update currentChannelId when initialChannelId changes
  useEffect(() => {
    if (initialChannelId && initialChannelId !== currentChannelId) {
      setCurrentChannelId(initialChannelId)
    }
  }, [initialChannelId, currentChannelId])

  // Play next video function - CRITICAL for continuous playback
  const playNextVideo = useCallback(() => {
    if (isTransitioningRef.current || !currentProgram || !nextProgram || !currentChannelId) {
      console.log('❌ Cannot play next video: missing program or channel')
      return
    }
    
    isTransitioningRef.current = true
    
    console.log('▶️ Playing next video:', nextProgram.title)
    
    // Show branded overlay during loading transition
    brandedOverlayProgramRef.current = nextProgram.title
    setShowBrandedOverlay(true)
    
    // Add current video to previous list
    if (currentProgram) {
      const updatedPrevious = addToPreviousVideos(currentChannelId, currentProgram)
      setPreviousVideos(updatedPrevious)
    }
    
    const startTime = 0
    
    // Update state with next program
    setCurrentProgram(nextProgram)
    setCurrentTime(startTime)
    setDisplayTime(formatTime(startTime))
    setVideoDuration(nextProgram.duration)
    setProgramStartTime(
      nextProgram.startTime
        ? new Date(nextProgram.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
    
    // Shift the API-populated upcoming queue: nextProgram is now playing,
    // so remove it from the front and promote the rest
    const newUpcomingQueue = upcomingVideos.slice(1)
    const newNextProgram = newUpcomingQueue[0] || null

    if (newNextProgram) {
      // Still have API queue items
      setNextProgram(newNextProgram)
      setUpcomingVideos(newUpcomingQueue)
      // Instantly notify parent so ScheduleModal / UI reflects the change
      notifyParentScheduleChange(nextProgram, newUpcomingQueue)
    } else {
      // API queue exhausted — fall back to local schedule data
      const programs = getChannelPrograms(currentChannelId)
      const currentIndex = programs.findIndex(p => p.id === nextProgram.id)
      if (programs.length > 0 && currentIndex >= 0) {
        const fallbackNext = programs[(currentIndex + 1) % programs.length]
        setNextProgram(fallbackNext)
        const fallbackUpcoming: VideoProgram[] = []
        for (let i = 1; i <= 15; i++) {
          fallbackUpcoming.push(programs[(currentIndex + i) % programs.length])
        }
        setUpcomingVideos(fallbackUpcoming)
        // Notify parent with fallback data
        notifyParentScheduleChange(nextProgram, fallbackUpcoming)
      } else {
        setNextProgram(null)
        setUpcomingVideos([])
        notifyParentScheduleChange(nextProgram, [])
      }
    }
    
    // Update cycle info
    setCycleInfo(prev => ({ 
      current: prev.total > 0 ? (prev.current % prev.total) + 1 : 1, 
      total: prev.total 
    }))
    
    // Clear any existing timeout
    if (videoEndTimeoutRef.current) {
      clearTimeout(videoEndTimeoutRef.current)
      videoEndTimeoutRef.current = null
    }
    
    // ── Update currentProgramRef inline so syncImmediateAfterTransition gets the
    // correct value immediately (don't wait for the useEffect after render). ──
    currentProgramRef.current = nextProgram

    // Load and play the next video
    lastVideoIdRef.current = nextProgram.videoId
    const loaded = loadVideo(nextProgram.videoId, startTime)
    
    if (loaded) {
      console.log('✅ Next video loaded successfully')
      setYouTubeVolume(volume)
      setYouTubeMuted(isMuted)
      
      // // Small delay to ensure video is loaded
      // setTimeout(() => {
      //   play()
      //   console.log('▶️ Playing next video now')
      //   isTransitioningRef.current = false
        
      //   // Get duration from YouTube API
      //   const duration = getDuration()
      //   if (duration && duration > 0) {
      //     setVideoDuration(duration)
      //   }
      // }, 10)
      // TODO: Is this delay mandatory??
      play()
      console.log('▶️ Playing next video now')
      isTransitioningRef.current = false
      
      // Get duration from YouTube API
      const duration = getDuration()
      if (duration && duration > 0) {
        setVideoDuration(duration)
      }

      // ── Immediate API sync to replenish queue with authoritative data ──
      // Runs quickly after transition so the schedule / previous list updates fast.
      // This refreshes upcoming list, previous videos, and notifies parent.
      const channelForSync = currentChannelId
      setTimeout(() => {
        syncImmediateAfterTransitionRef.current(channelForSync)
      }, 500)
    } else {
      console.error('❌ Failed to load next video')
      isTransitioningRef.current = false
    }
    
  }, [currentProgram, nextProgram, currentChannelId, upcomingVideos, loadVideo, volume, isMuted, setYouTubeVolume, setYouTubeMuted, play, getDuration, notifyParentScheduleChange])

  // Keep playNextVideoRef always pointing at the freshest closure.
  // onStateChange (ENDED) and updateTimeDisplay both call this so they always
  // advance the CURRENT queue, never a stale one captured at initializePlayer time.
  useEffect(() => { playNextVideoRef.current = playNextVideo }, [playNextVideo])

  // Update time display - uses actual video time from YouTube
  const updateTimeDisplay = useCallback(() => {
    if (!currentProgram || isTransitioningRef.current) return
    
    // Get current time from YouTube player
    const playerTime = getCurrentTime()
    
    if (playerTime !== undefined && !isNaN(playerTime)) {
      setCurrentTime(playerTime)
      setDisplayTime(formatTime(playerTime))
      
      // Use video duration from YouTube API if available, otherwise use program duration
      const duration = getDuration()
      const actualDuration = duration > 0 ? duration : videoDuration
      
      const remaining = Math.max(0, actualDuration - playerTime)
      setTimeRemaining(formatTime(remaining))
      
      // Check if video is near the end (less than 0.5 seconds remaining)
      if (actualDuration > 0 && remaining <= 0.5 && !isTransitioningRef.current && nextProgram) {
        console.log('⚠️ Video ending soon, preparing next video...')
        setShowBrandedOverlay(true)
        setIsLoading(false)
        setShowStartScreen(false)
        
        if (videoEndTimeoutRef.current) {
          clearTimeout(videoEndTimeoutRef.current)
        }
        // Use ref so we always call the latest closure (queue already shifted correctly)
        playNextVideoRef.current()
      }
    }
  }, [currentProgram, getCurrentTime, getDuration, videoDuration, nextProgram])

  // ── Browser-side external API call (bypasses Cloudflare) ──
  const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.deeniinfotech.com/api/tv-schedules'

  const fetchFromBrowserAPI = useCallback(async (channelId: string): Promise<any | null> => {
    try {
      // Look up channel from localStorage — no static mapping needed
      const storedChannels = getStoredApiChannels()
      const channel = storedChannels.find(c => String(c.id) === channelId)
      const lid = channel?.localizationId || '5'

      let apiUrl = `${EXTERNAL_API_BASE}/live?lid=${lid}`
      if (channel?.isQuran === true) {
        apiUrl += '&iq=true'
      }

      console.log('📡 Browser → External API:', apiUrl)
      const data = await clientFetchWithAuth(apiUrl)

      // Normalise the response shape coming from the real API
      const curr = data?.currentProgram || data?.current || data?.data?.currentProgram
      if (!curr) return null

      const serverTime = data?.serverTime || Date.now()

      const currentProgram = {
        ytVideoId: curr.ytVideoId || curr.videoId || curr.yt_video_id,
        title: curr.title || curr.name,
        startTime: curr.startTime || curr.start_time || serverTime,
        endTime: curr.endTime || curr.end_time || (serverTime + (curr.duration || 3600) * 1000),
        duration: curr.duration || 3600,
        seekTo: curr.seekTo || curr.seek_to || 0,
      }

      const mapProg = (prog: any) => ({
        ytVideoId: prog.ytVideoId || prog.videoId || prog.yt_video_id,
        title: prog.title || prog.name,
        startTime: prog.startTime || prog.start_time,
        endTime: prog.endTime || prog.end_time,
        duration: prog.duration,
      })

      const prevList = data?.previousPrograms || data?.previous || data?.data?.previousPrograms || []
      const upList = data?.upcomingPrograms || data?.upcoming || data?.data?.upcomingPrograms || []

      console.log('✅ External API OK — video:', currentProgram.ytVideoId)
      return {
        serverTime,
        currentProgram,
        previousPrograms: (Array.isArray(prevList) ? prevList : []).map(mapProg),
        upcomingPrograms: (Array.isArray(upList) ? upList : []).map(mapProg),
        _source: 'external-api',
      }
    } catch (err) {
      console.warn('⚠️ Browser API call failed, will use local fallback:', err)
      return null
    }
  }, [])

  // ── Immediate API refresh after a video ends ──
  // Runs once right after playNextVideo shifts the queue locally.
  // Replenishes all three sections from the server so the user always sees fresh data.
  const syncImmediateAfterTransition = useCallback(async (channelId: string) => {
    try {
      console.log('🔄 Immediate API sync after video transition...')

      let result = await fetchFromBrowserAPI(channelId)

      if (!result) {
        const response = await fetch(`/api/current-video?channel=${channelId}`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (!response.ok) return
        result = await response.json()
      }

      if (!result) return

      // Update server time offset
      if (result.serverTime) {
        setServerTimeOffset(result.serverTime - Date.now())
      }

      // ── Section 1: Previous videos — always re-read from localStorage ──
      // localStorage was already written synchronously in playNextVideo.
      // Re-reading here ensures the modal reflects the absolute latest list.
      const latestPrevious = getPreviousVideos(channelId)
      if (latestPrevious.length > 0) {
        setPreviousVideos(latestPrevious)
      }

      // ── Section 2 & 3: Upcoming queue + schedule notification ──
      // The API may LAG: it might still report the OLD video as "currentProgram"
      // and include the NEW current video in "upcomingPrograms".
      // Strategy: always trust our local currentProgramRef as ground truth for
      // what is NOW playing, and strip any matching ID from upcoming.
      if (result.upcomingPrograms && Array.isArray(result.upcomingPrograms)) {
        const localCurrentId = currentProgramRef.current?.videoId
        const apiCurrentId   = result.currentProgram?.ytVideoId

        // Build the mapped upcoming list
        const mapped: VideoProgram[] = result.upcomingPrograms.map(
          (prog: { ytVideoId: string; title: string; duration: number }) => ({
            id: prog.ytVideoId,
            videoId: prog.ytVideoId,
            title: prog.title,
            description: prog.title,
            duration: prog.duration,
            category: 'Lecture',
            language: 'Bengali',
            channelId,
            thumbnail: `https://img.youtube.com/vi/${prog.ytVideoId}/maxresdefault.jpg`
          })
        )

        // Strip BOTH the local current video AND (if API is lagging) also the
        // API-reported current video so neither appears in the upcoming queue.
        const upcoming = mapped.filter(
          (p: VideoProgram) => p.videoId !== localCurrentId && p.videoId !== apiCurrentId
        )

        // If the API has caught up (apiCurrentId === localCurrentId), include
        // everything that comes after — the filter above already handles that.
        // If the API is still lagging (apiCurrentId !== localCurrentId), the API's
        // currentProgram is the old video; it won't appear in upcoming anyway.
        // Either way, the result is correct.

        setUpcomingVideos(upcoming)
        if (upcoming[0]) setNextProgram(upcoming[0])

        // Notify parent (schedule modal + current-program indicator) with fresh data
        if (currentProgramRef.current) {
          notifyParentScheduleChange(currentProgramRef.current, upcoming)
        }
      }

      console.log('✅ Immediate post-transition sync complete — all sections updated')
    } catch (error) {
      console.error('⚠️ Immediate post-transition sync failed (non-critical):', error)
    }
  }, [fetchFromBrowserAPI, notifyParentScheduleChange])

  // Keep the ref in sync with the latest closure
  useEffect(() => { syncImmediateAfterTransitionRef.current = syncImmediateAfterTransition }, [syncImmediateAfterTransition])

  const loadChannel = useCallback(async (channelId: string) => {
    if (isLoading) return
    
    setIsLoading(true)
    setApiError(null)
    setCurrentChannelId(channelId)
    onChannelChange?.(channelId)
    
    saveChannel(channelId)
    
    // Load previous videos for this channel
    const savedPrevious = getPreviousVideos(channelId)
    setPreviousVideos(savedPrevious)
    
    try {
      console.log('🎬 Loading channel:', channelId)
      
      const clientTime = Date.now()

      // 1️⃣ Try external API directly from browser (bypasses Cloudflare)
      let result = await fetchFromBrowserAPI(channelId)

      // 2️⃣ Fallback to our own Next.js API route (local schedule data)
      if (!result) {
        console.log('📋 Falling back to local /api/current-video route...')
        const response = await fetch(`/api/current-video?channel=${channelId}`, {
          headers: { 
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        result = await response.json()
      }
      
      // Unified format: { serverTime, currentProgram, previousPrograms, upcomingPrograms }
      if (!result.serverTime || !result.currentProgram) {
        throw new Error('Invalid API response')
      }
      
      const offset = result.serverTime - clientTime
      setServerTimeOffset(offset)
      
      // Convert new API format to internal program format
      const program: VideoProgram = {
        id: result.currentProgram.ytVideoId,
        videoId: result.currentProgram.ytVideoId,
        title: result.currentProgram.title,
        description: result.currentProgram.title,
        duration: result.currentProgram.duration,
        startTime: result.currentProgram.startTime ? new Date(Number(result.currentProgram.startTime)) : undefined,
        category: 'Lecture',
        language: 'Bengali',
        channelId: channelId,
        thumbnail: `https://img.youtube.com/vi/${result.currentProgram.ytVideoId}/maxresdefault.jpg`
      }
      
      const startTime = result.currentProgram.seekTo
      const timeRemaining = result.currentProgram.duration - result.currentProgram.seekTo
      
      brandedOverlayProgramRef.current = program.title

      setIsLoading(false)
      setShowStartScreen(false)
      setShowBrandedOverlay(true)
      setCurrentProgram(program)
      setCurrentTime(startTime)
      setDisplayTime(formatTime(startTime))
      setTimeRemaining(formatTime(timeRemaining))
      setVideoDuration(program.duration)

      // If this is the first load (no previous history), add the current video
      // to the history so the Previous Programs list isn't empty on first open.
      if (savedPrevious.length === 0) {
        const updatedPrev = addToPreviousVideos(channelId, program)
        setPreviousVideos(updatedPrev)
      }
      
      // Get next program from upcomingPrograms
      if (result.upcomingPrograms && result.upcomingPrograms.length > 0) {
        const nextProg = result.upcomingPrograms[0]
        const nextProgram: VideoProgram = {
          id: nextProg.ytVideoId,
          videoId: nextProg.ytVideoId,
          title: nextProg.title,
          description: nextProg.title,
          duration: nextProg.duration,
          category: 'Lecture',
          language: 'Bengali',
          channelId: channelId,
          thumbnail: `https://img.youtube.com/vi/${nextProg.ytVideoId}/maxresdefault.jpg`
        }
        setNextProgram(nextProgram)
      }
      
      // Set cycle info from schedule
      const programs = getChannelPrograms(channelId)
      const currentIndex = programs.findIndex(p => p.videoId === result.currentProgram.ytVideoId)
      setCycleInfo({ 
        current: currentIndex >= 0 ? currentIndex + 1 : 1, 
        total: programs.length 
      })
      
      // Set upcoming videos from API response — filter out the currently-playing video
      const upcoming: VideoProgram[] = (result.upcomingPrograms || [])
        .map((prog: { ytVideoId: string; title: string; duration: number }) => ({
          id: prog.ytVideoId,
          videoId: prog.ytVideoId,
          title: prog.title,
          description: prog.title,
          duration: prog.duration,
          category: 'Lecture',
          language: 'Bengali',
          channelId: channelId,
          thumbnail: `https://img.youtube.com/vi/${prog.ytVideoId}/maxresdefault.jpg`
        }))
        .filter((p: VideoProgram) => p.videoId !== program.videoId)
      setUpcomingVideos(upcoming)
      
      // Notify parent with fresh schedule data so ScheduleModal is up-to-date
      notifyParentScheduleChange(program, upcoming)
      
      // Prefer the server's previous-program list (most accurate). When we must
      // fall back to the local schedule (e.g. /api/current-video gets a local
      // fallback), we do NOT want to show stale historical data.
      const isLocalFallback = result._source === 'local-schedule'
      const apiPrevious: VideoProgram[] = isLocalFallback
        ? []
        : (result.previousPrograms || []).map((prog: { ytVideoId: string; title: string; duration: number }) => ({
            id: prog.ytVideoId,
            videoId: prog.ytVideoId,
            title: prog.title,
            description: prog.title,
            duration: prog.duration,
            category: 'Lecture',
            language: 'Bengali',
            channelId: channelId,
            thumbnail: `https://img.youtube.com/vi/${prog.ytVideoId}/maxresdefault.jpg`
          }))

      if (!isLocalFallback && apiPrevious.length > 0) {
        const existingPrevious = getPreviousVideos(channelId)
        const mergedPrevious = [
          ...apiPrevious,
          ...existingPrevious.filter(v => !apiPrevious.some(api => api.id === v.id))
        ].slice(0, 30)

        setPreviousVideos(mergedPrevious)
        savePreviousVideos(channelId, mergedPrevious)
      } else {
        // No server-provided previous program data — clear any stale history
        setPreviousVideos([])
        savePreviousVideos(channelId, [])
      }

      lastVideoIdRef.current = program.videoId
      
      // No branded overlay on initial channel load — only on video transitions (playNextVideo)
      
      // if (playerReady) {
      //   console.log('🔄 Loading new video in existing player')
      //   // First destroy and reset everything
      //   // destroy()
      //   setPlayerReady(false)
        
      //   // Small delay to ensure clean slate
      //   await new Promise(resolve => setTimeout(resolve, 100))
        
      //   // Re-initialize player with new channel
      //   await initializePlayer({
      //     videoId: program.videoId,
      //     startSeconds: Math.floor(startTime),
      //     volume: volume,
      //     muted: isIOS, // start muted on iOS so Safari allows autoplay; user taps to unmute
      //     onReady: () => {
      //       console.log('✅ 11 Player ready after channel switch')
      //       setPlayerReady(true)
      //       setIsLoading(false)
      //       setShowStartScreen(false) // Important: Reset start screen
            
      //       seekTo(startTime, true)
      //       play()
            
      //       const duration = getDuration()
      //       if (duration && duration > 0) {
      //         setVideoDuration(duration)
      //       }
            
      //       setYouTubeVolume(volume)
      //       setYouTubeMuted(isMuted)
      //       // On iOS keep muted until user taps the unmute button (user gesture required)
      //       // if (!isIOS) {
      //       //   setIsMuted(false)
      //       //   setYouTubeMuted(false)
      //       // }
      //     },
      //     onStateChange: (state) => {
      //       if (!mountedRef.current) return
            
      //       console.log('🎬 11 YouTube state changed:', state)
            
      //       if (state === YT_STATE.ENDED) {
      //         setShowBrandedOverlay(true)
      //         setIsLoading(false)
      //         setShowStartScreen(false)
      //         console.log('📺 11 Video ended event received - playing next')
      //         if (videoEndTimeoutRef.current) {
      //           clearTimeout(videoEndTimeoutRef.current)
      //         }
      //         // Use ref so we always call the LATEST closure (not the stale one from init)
      //         playNextVideoRef.current()
      //       } else if (state === YT_STATE.PLAYING) {
      //         console.log('▶️ 11 Video is now playing')
      //         setIsLoading(false);
      //         setShowStartScreen(false) // Ensure start screen is hidden
      //         setIframeVisible(true)
      //         setIsMuted(false)
      //         onStartClick?.()
      //         setTimeout(() => {
      //           setShowBrandedOverlay(false) // Hide branded overlay when playback starts
      //         }, 3000);
      //       } else if (state === YT_STATE.PAUSED) {
      //         console.log('⏸️ Video paused - resuming')
      //         play()
      //       } else if (state === YT_STATE.BUFFERING) {
      //         console.log('⏳ Video buffering...')
      //       } else if (state === YT_STATE.CUED) {
      //         console.log('🎬 Video cued - playing')
      //         play()
      //       }
      //     },
      //     onDurationChange: (duration) => {
      //       if (duration && duration > 0) {
      //         console.log('📏 Video duration:', duration)
      //         setVideoDuration(duration)
      //       }
      //     },
      //     onError: (code, msg) => {
      //       console.error('Player error:', code, msg)
      //       if (code === 2 || code === 5 || code === 100) {
      //         setApiError(`Playback error: ${msg}`)
      //         setIsLoading(false)
      //       } else {
      //         console.log('⚠️ Non-critical error, continuing playback')
      //         setIsLoading(false)
      //       }
      //     }
      //   })
      // } else 
        
      if (isPrimedRef.current) {
        // ── iOS fast-path: REUSE the primed player — do NOT destroy it ────────
        // The primed YT.Player already has iOS's audio-unlock context from the
        // synchronous unmuteAndResume() call in handleFirstTimeStart.  Calling
        // initializePlayer would nuke that player and create a new one OUTSIDE
        // the gesture window → iOS blocks audio again → stuck on loading.
        //
        // Instead:
        //   1. setPlayerCallbacks() — swap the no-op event refs to real handlers
        //   2. loadVideo() — calls loadVideoById on the SAME player instance
        // The same YT.Player stays alive, audio stays unlocked, events flow.
        console.log('🍎 iOS primer path — reusing primed player (no destroy)')
        //isPrimedRef.current = false // consumed; subsequent loads go through normal path

        // 1. Wire up real event handlers via the delegating refs
        setPlayerCallbacks({
          onReady: () => {
            // This fires on initial creation only; for loadVideoById it won't fire
            // again — we handle everything via onStateChange below.
          },
          onStateChange: (state: number) => {
            if (!mountedRef.current) return
            console.log('🎬 🍎 iOS state changed:', state)
            if (state === YT_STATE.ENDED) {
              setShowBrandedOverlay(true)
              setIsLoading(false)
              setShowStartScreen(false)
              if (videoEndTimeoutRef.current) clearTimeout(videoEndTimeoutRef.current)
              playNextVideoRef.current()
            } else if (state === YT_STATE.PLAYING) {
              console.log('▶️ 🍎 Real video is PLAYING on iOS')
              setIsLoading(false)
              setShowStartScreen(false)
              setPlayerReady(true)
              setIframeVisible(true) // Reveal iframe — real video is now rendering
              setIsMuted(false)
              onStartClick?.()
              setTimeout(() => setShowBrandedOverlay(false), 3000)
            } else if (state === YT_STATE.PAUSED) {
              // iOS sometimes auto-pauses; resume
              play()
            } else if (state === YT_STATE.BUFFERING) {
              console.log('⏳ 🍎 Buffering...')
              setShowBrandedOverlay(true)
              setIframeVisible(false)
            } else if (state === YT_STATE.CUED) {
              play()
            }
          },
          onDurationChange: (duration: number) => {
            if (duration && duration > 0) setVideoDuration(duration)
          },
          onError: (code: number, msg: string) => {
            console.error('🍎 Player error:', code, msg)
            if (code === 2 || code === 5 || code === 100) {
              setApiError(`Playback error: ${msg}`)
            }
            setIsLoading(false)
          },
        })

        // 2. Swap the video on the existing player — keeps audio unlock alive
        lastVideoIdRef.current = program.videoId
        const loaded = loadVideo(program.videoId, Math.floor(startTime))
        if (loaded) {
          console.log('✅ 🍎 Video swapped on primed player')
          setYouTubeVolume(volume)
          // Don't call setYouTubeMuted(false) — unmuteAndResume already did it
          // synchronously in the gesture. Calling it again is harmless but redundant.
        } else {
          console.error('❌ 🍎 loadVideo failed on primed player')
          setIsLoading(false)
        }
      } else {
        await initializePlayer({
          videoId: program.videoId,
          startSeconds: Math.floor(startTime),
          volume: volume,
          muted: isIOS, // start muted on iOS so Safari allows autoplay; user taps to unmute
          onReady: () => {
            console.log('✅ 22 Player ready - starting playback')
            setPlayerReady(true)
            setIsLoading(false)
            setShowStartScreen(false)
            onStartClick?.()
            
            seekTo(startTime, true)
            play()
            
            // Get actual duration from YouTube
            const duration = getDuration()
            if (duration && duration > 0) {
              setVideoDuration(duration)
            }
            
            setYouTubeVolume(volume)
            // On iOS keep muted until user taps the unmute button (user gesture required)
            if (!isIOS) {
              setIsMuted(false)
              setYouTubeMuted(false)
            }
          },
          onStateChange: (state) => {
            if (!mountedRef.current) return
            
            console.log('🎬 YouTube state changed:', state)
            
            if (state === YT_STATE.ENDED) {
              console.log('📺 22 Video ended event received - playing next')
              // setIsLoading(true)
              setShowBrandedOverlay(true)
              setIsLoading(false)
              setShowStartScreen(false)
              if (videoEndTimeoutRef.current) {
                clearTimeout(videoEndTimeoutRef.current)
              }
              // Use ref so we always call the LATEST closure (not the stale one from init)
              playNextVideoRef.current()
            } else if (state === YT_STATE.PLAYING) {
              console.log('▶️ 22 Video is now playing')
              setIsLoading(false);
              setIframeVisible(true)
              setTimeout(() => {
                setShowBrandedOverlay(false) // Hide branded overlay when playback starts
              }, 3000);
              
            } else if (state === YT_STATE.PAUSED) {
              console.log('⏸️ 22 Video paused - resuming')
              play()
            } else if (state === YT_STATE.BUFFERING) {
              console.log('⏳ 22 Video buffering...')
              setShowBrandedOverlay(true)
              setIframeVisible(false)
            } else if (state === YT_STATE.CUED) {
              console.log('🎬 22 Video cued - playing')
              play()
            }
          },
          onDurationChange: (duration) => {
            if (duration && duration > 0) {
              console.log('📏 22 Video duration:', duration)
              setVideoDuration(duration)
            }
          },
          onError: (code, msg) => {
            console.error('Player error:', code, msg)
            if (code === 2 || code === 5 || code === 100) {
              setApiError(`Playback error: ${msg}`)
              setIsLoading(false)
            } else {
              console.log('⚠️ 22 Non-critical error, continuing playback')
              setIsLoading(false)
            }
          }
        })
      }
      
    } catch (error) {
      console.error('API call failed:', error)
      setApiError(error instanceof Error ? error.message : 'Failed to load video')
      setIsLoading(false)
    }
  }, [isLoading, playerReady, isPrimedRef, volume, initializePlayer, loadVideo, seekTo, play, setYouTubeVolume, setYouTubeMuted, onChannelChange, onStartClick, getDuration, fetchFromBrowserAPI, notifyParentScheduleChange])

  const handleFirstTimeStart = useCallback(async () => {
    // ── Step 0 (synchronous — MUST be first, before any await) ──────────────
    // On iOS the user gesture window closes as soon as the call stack goes async.
    // Calling unmuteAndResume() HERE, before any fetch/await, tells the browser
    // "the user intentionally enabled audio" and unlocks sound for this player
    // instance.  loadVideoById() later will reuse the same unlocked player, so
    // the real video starts with audio automatically.
    if (isPrimedRef.current) {
      unmuteAndResume(volume)
    }

    // 1. Fetch channel list from live API and store in localStorage (only if not cached)
    let channels = getStoredApiChannels()
    if (channels.length === 0) {
      try {
        // Try live API directly (no JWT needed for channel list)
        const res = await clientFetchWithAuth('https://api.deeniinfotech.com/api/tv-channels')
        if (res?.data?.length) {
            saveApiChannels(res.data)
            channels = res.data
          }
      } catch {
        // ignore
      }
      // Fallback: Next.js API route (serves live data with static fallback for STG)
      if (channels.length === 0) {
        try {
          const res = await fetch('/api/tv-channels')
          const json = await res.json()
          if (json?.data?.length) {
            saveApiChannels(json.data)
            channels = json.data
          }
        } catch { /* ignore */ }
      }
    }
    if (channels.length > 0) {
      setApiChannels(channels)
    }

    // 2. Start the player
    if (!currentChannelId) {
      setShowChannelSelector(true)
    } else {
      // Immediately hide the start screen and show the loading overlay so the
      // user gets instant visual feedback on tap — especially important on iOS
      // where a user-gesture must trigger visible UI change synchronously.
      setShowStartScreen(false)
      setIsLoading(true)
      loadChannel(currentChannelId)
    }
  }, [currentChannelId, loadChannel, isPrimedRef, unmuteAndResume, volume])

  const handleSelectChannel = useCallback((channelId: string) => {
    setShowChannelSelector(false)
    loadChannel(channelId)
  }, [loadChannel])

  const handleOpenChannelSelector = useCallback(async () => {
    // First, show the modal with current channels
    setShowChannelSelector(true)

    // Then, try to refresh channels from API
    try {
      const res = await clientFetchWithAuth('https://api.deeniinfotech.com/api/tv-channels')
      if (res?.data?.length) {
          const freshChannels: ApiChannel[] = res.data
          const storedChannels: ApiChannel[] = getStoredApiChannels()
        // Check if there are differences
        const hasChanges = freshChannels.length !== storedChannels.length ||
          freshChannels.some((fresh, index) => {
            const stored = storedChannels[index]
            return !stored || fresh.id !== stored.id || fresh.title !== stored.title
          })

        if (hasChanges) {
          saveApiChannels(freshChannels)
          setApiChannels(freshChannels)
        }
      }
    } catch (error) {
      // Ignore API failure and keep stored channels
      console.error('Failed to refresh channels', error)
    }
  }, [])

  const syncWithServer = useCallback(async () => {
    if (!playerReady || !mountedRef.current || !currentChannelId) return
    
    try {
      console.log('🔄 Syncing with server (5-minute interval)...')

      // ── Ping our own server so we have a server-side timestamp for verifying the interval ──
      fetch('/api/sync-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: currentChannelId, source: 'browser-sync' })
      }).catch(() => {}) // fire-and-forget, don't block main sync
      
      // 1️⃣ Try external API directly from browser
      let result = await fetchFromBrowserAPI(currentChannelId)
      
      // 2️⃣ Fallback to local API route
      if (!result) {
        const response = await fetch(`/api/current-video?channel=${currentChannelId}`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (!response.ok) return
        result = await response.json()
      }
      
      if (!result) return
      
      // Update server time offset
      if (result.serverTime) {
        const offset = result.serverTime - Date.now()
        setServerTimeOffset(offset)
      }
      
      // ── Previous videos: always use localStorage order (real user history) ──
      const latestPrevious = getPreviousVideos(currentChannelId)
      if (latestPrevious.length > 0) {
        setPreviousVideos(latestPrevious)
      }
      
      // ── Upcoming queue: smart update — DO NOT blast the whole list every sync ──
      // Only update if:
      //   A) The server's current video differs from what's locally playing (drift), OR
      //   B) The local queue is empty (exhausted)
      // Otherwise leave the queue alone — it shifts naturally one-at-a-time via playNextVideo()
      if (result.upcomingPrograms && Array.isArray(result.upcomingPrograms)) {
        const apiCurrentId  = result.currentProgram?.ytVideoId
        const localCurrentId = currentProgramRef.current?.videoId
        // ── DRIFT DETECTION TEMPORARILY DISABLED ──
        // The drift logic forcefully replaces the current video when the API returns a
        // different ytVideoId. Re-enable when ready to allow mid-session resyncs.
        // Original condition: !!(apiCurrentId && localCurrentId && apiCurrentId !== localCurrentId)
        const hasDrifted    = false
        const queueEmpty    = upcomingVideosRef.current.length === 0

        // Helper: map + filter out the currently-playing video to prevent duplicates
        const mapAndFilter = () => {
          return result.upcomingPrograms
            .map((prog: { ytVideoId: string; title: string; duration: number }) => ({
              id: prog.ytVideoId,
              videoId: prog.ytVideoId,
              title: prog.title,
              description: prog.title,
              duration: prog.duration,
              category: 'Lecture',
              language: 'Bengali',
              channelId: currentChannelId,
              thumbnail: `https://img.youtube.com/vi/${prog.ytVideoId}/maxresdefault.jpg`
            }))
            .filter((p: VideoProgram) => p.videoId !== localCurrentId)
        }

        if (hasDrifted) {
          // Player has drifted from the broadcast schedule — hard-resync the current video
          console.log('⚠️ Player drifted from server schedule. Loading new current video and resyncing all sections...')

          // 1. Save the currently-playing video to previous history before replacing it
          if (currentProgramRef.current) {
            const updatedPrevious = addToPreviousVideos(currentChannelId, currentProgramRef.current)
            setPreviousVideos(updatedPrevious)
          }

          // 2. Build new current program object from API data
          const newCurrentProgram: VideoProgram = {
            id: apiCurrentId!,
            videoId: apiCurrentId!,
            title: result.currentProgram.title,
            description: result.currentProgram.title,
            duration: result.currentProgram.duration,
            category: 'Lecture',
            language: 'Bengali',
            channelId: currentChannelId,
            thumbnail: `https://img.youtube.com/vi/${apiCurrentId}/maxresdefault.jpg`
          }
          const seekOffset = result.currentProgram.seekTo || 0
          const remaining = result.currentProgram.duration - seekOffset

          // 3. Update all player state to reflect the new current program
          setCurrentProgram(newCurrentProgram)
          setCurrentTime(seekOffset)
          setDisplayTime(formatTime(seekOffset))
          setTimeRemaining(formatTime(remaining))
          setVideoDuration(newCurrentProgram.duration)
          lastVideoIdRef.current = apiCurrentId!

          // 4. Replace the iframe content immediately with the new video
          const loaded = loadVideo(apiCurrentId!, seekOffset)
          if (loaded) {
            setTimeout(() => { play() }, 200)
          }

          // 5. Update upcoming queue — filter out the NEW current video to prevent duplicates
          const upcoming = result.upcomingPrograms
            .map((prog: { ytVideoId: string; title: string; duration: number }) => ({
              id: prog.ytVideoId,
              videoId: prog.ytVideoId,
              title: prog.title,
              description: prog.title,
              duration: prog.duration,
              category: 'Lecture',
              language: 'Bengali',
              channelId: currentChannelId,
              thumbnail: `https://img.youtube.com/vi/${prog.ytVideoId}/maxresdefault.jpg`
            }))
            .filter((p: VideoProgram) => p.videoId !== apiCurrentId)
          setUpcomingVideos(upcoming)
          if (upcoming[0]) setNextProgram(upcoming[0])

          // 6. Notify parent so schedule modal and current program indicator reflect new state
          notifyParentScheduleChange(newCurrentProgram, upcoming)
        } else if (queueEmpty) {
          // Local queue is exhausted — refill from API so playback can continue
          console.log('📋 Queue exhausted — refilling from server...')
          const upcoming = mapAndFilter()
          setUpcomingVideos(upcoming)
          if (upcoming[0]) setNextProgram(upcoming[0])
          // Notify parent about the queue refill
          if (currentProgramRef.current) {
            notifyParentScheduleChange(currentProgramRef.current, upcoming)
          }
        } else {
          // In sync: local current video matches API — refresh upcoming + notify on every tick.
          // We always refresh from the API so the schedule modal shows authoritative data.
          console.log('✅ In sync with server — refreshing upcoming queue and notifying parent')
          const upcoming = mapAndFilter()
          if (upcoming.length > 0) {
            // Only replace the queue if the API returned a non-empty list.
            // This prevents accidentally wiping a valid queue on a transient empty response.
            setUpcomingVideos(upcoming)
            if (upcoming[0]) setNextProgram(upcoming[0])
          }
          // Always notify parent so schedule modal is up-to-date
          if (currentProgramRef.current) {
            notifyParentScheduleChange(
              currentProgramRef.current,
              upcoming.length > 0 ? upcoming : upcomingVideosRef.current
            )
          }
        }
      }
      
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [playerReady, currentChannelId, fetchFromBrowserAPI, notifyParentScheduleChange, loadVideo, play])

  const handleReload = useCallback(() => {
    if (!currentChannelId) return
    console.log('🔄 Reloading channel:', currentChannelId)
    
    // Save currently-playing video to history BEFORE reload so it appears in the list
    if (currentProgram) {
      const updated = addToPreviousVideos(currentChannelId, currentProgram)
      setPreviousVideos(updated)
    }
    
    // Reset player state only — do NOT touch previousVideos or localStorage
    setPlayerReady(false)
    setCurrentProgram(null)
    setApiError(null)
    setIframeVisible(false) // hide iframe until next real PLAYING event
    // destroy()
    
    // Reload same channel — previousVideos state and localStorage are preserved
    setTimeout(() => {
      loadChannel(currentChannelId)
    }, 200)
  }, [destroy, currentChannelId, currentProgram, loadChannel])

  // Trigger reload when parent increments the counter (e.g. Reload menu option)
  useEffect(() => {
    if (triggerReload > 0) {
      handleReload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerReload])

  // Handle playing from previous videos
  const handlePlayFromPrevious = useCallback((video: VideoProgram) => {
    if (!currentChannelId || !playerReady || isTransitioningRef.current) return
    
    isTransitioningRef.current = true
    
    console.log('▶️ Playing from previous list:', video.title)
    
    brandedOverlayProgramRef.current = video.title
    setShowBrandedOverlay(true)
    
    // Add current video to previous before switching
    if (currentProgram) {
      addToPreviousVideos(currentChannelId, currentProgram)
    }
    
    // Update state
    setCurrentProgram(video)
    setCurrentTime(0)
    setDisplayTime(formatTime(0))
    setVideoDuration(video.duration)
    
    // Find next program
    const programs = getChannelPrograms(currentChannelId)
    const currentIndex = programs.findIndex(p => p.id === video.id)
    const nextIndex = (currentIndex + 1) % programs.length
    setNextProgram(programs[nextIndex])
    
    // Update upcoming
    const upcoming: VideoProgram[] = []
    for (let i = 1; i <= 15; i++) {
      upcoming.push(programs[(currentIndex + i) % programs.length])
    }
    setUpcomingVideos(upcoming)
    
    // Update cycle info
    setCycleInfo({ current: currentIndex + 1, total: programs.length })
    
    // Load and play
    lastVideoIdRef.current = video.videoId
    loadVideo(video.videoId, 0)
    
    setTimeout(() => {
      play()
      isTransitioningRef.current = false
    }, 200)
    
  }, [currentChannelId, playerReady, currentProgram, loadVideo, play])

  // Fullscreen handlers
  const handleFullscreen = async () => {
    if (!playerRef.current) return
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await playerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Time update interval - runs every 100ms for smooth display
  useEffect(() => {
    if (!playerReady || !currentProgram || isTransitioningRef.current) return
    
    timeUpdateIntervalRef.current = setInterval(() => {
      updateTimeDisplay()
    }, 100)
    
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
    }
  }, [playerReady, currentProgram, updateTimeDisplay, isTransitioningRef.current])

  // 5-minute sync interval
  useEffect(() => {
    if (!playerReady) return
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }
    
    syncIntervalRef.current = setInterval(() => {
      syncWithServer()
    }, 300000) // 5 minutes
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [playerReady, syncWithServer])

  // When returning from background/lock screen, attempt to refresh schedule & resume live playback
  useEffect(() => {
    const resumeThresholdMs = 3000
    const minIntervalBetweenResumeMs = 7000

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
        // Ensure playback does not continue while the app is in the background
        pause()
        return
      }

      const now = Date.now()
      const hiddenAt = hiddenAtRef.current
      const hiddenDuration = hiddenAt ? now - hiddenAt : 0

      // Ignore quick tab switches / app toggles
      if (hiddenDuration < resumeThresholdMs) return
      if (now - lastResumeAtRef.current < minIntervalBetweenResumeMs) return
      lastResumeAtRef.current = now
      hiddenAtRef.current = null

      if (!playerReady || !currentChannelId) return

      // Show the branded loading wrapper while we refresh schedule and reload
      setShowBrandedOverlay(true)
      setIframeVisible(false)

      // Try to refresh schedule and the current program (will also load the
      // correct live video segment). This helps avoid resuming from the old
      // playback position after returning from background.
      void loadChannel(currentChannelId)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [playerReady, currentChannelId, loadChannel, pause])

  // Program Overlay - Shows every 2-3 minutes for a few seconds
  useEffect(() => {
    if (!playerReady || !currentProgram || showStartScreen) return
    
    // Show overlay every 2.5 minutes (150 seconds)
    const overlayInterval = setInterval(() => {
      setShowProgramOverlay(true)
      // Hide after 8-10 seconds
      const hideDelay = 8000 + Math.random() * 2000 // Random 8-10 seconds
      setTimeout(() => {
        setShowProgramOverlay(false)
      }, hideDelay)
    }, 150000) // 2.5 minutes
    
    // Show initial overlay after 10 seconds
    const initialTimeout = setTimeout(() => {
      setShowProgramOverlay(true)
      // Hide after 8-10 seconds
      const hideDelay = 8000 + Math.random() * 2000 // Random 8-10 seconds
      setTimeout(() => {
        setShowProgramOverlay(false)
      }, hideDelay)
    }, 10000)
    
    return () => {
      clearInterval(overlayInterval)
      clearTimeout(initialTimeout)
    }
  }, [playerReady, currentProgram, showStartScreen])

  // Cleanup
  useEffect(() => {
    mountedRef.current = true
    
    return () => {
      mountedRef.current = false
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current)
      }
      if (videoEndTimeoutRef.current) {
        clearTimeout(videoEndTimeoutRef.current)
      }
      //destroy()
    }
  }, [destroy])

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setShowVolumeTooltip(true)
    setYouTubeVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      setYouTubeMuted(false)
    }
    setTimeout(() => setShowVolumeTooltip(false), 1000)
  }, [isMuted, setYouTubeVolume, setYouTubeMuted])

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    setYouTubeMuted(newMuted)
    if (!newMuted) setYouTubeVolume(volume)
  }, [isMuted, setYouTubeMuted, setYouTubeVolume, volume])

  const handleActivity = useCallback(() => {
    setControlsVisible(true)
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false)
      setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    const el = playerRef.current
    if (el) {
      el.addEventListener('mousemove', handleActivity)
      el.addEventListener('touchstart', handleActivity)
      return () => {
        el.removeEventListener('mousemove', handleActivity)
        el.removeEventListener('touchstart', handleActivity)
      }
    }
  }, [handleActivity])

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    if (volume < 30) return <Volume className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    if (volume < 70) return <Volume1 className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
    return <Volume2 className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
  }

  const isLastInCycle = currentProgram && cycleInfo.total ? cycleInfo.current === cycleInfo.total : false

  // Derived program info for loading/buffering UI
  const currentProgramTitle = brandedOverlayProgramRef.current || currentProgram?.title || 'Live broadcast'
  const currentProgramStartTime = programStartTime

  return (
    <div className="relative flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black min-h-screen w-full overflow-hidden">
      <div className={`relative w-full ${
        isDesktop ? 'md:w-[70vw] md:max-w-[1400px]' :
        isTablet ? 'w-[90vw]' :
        'w-full'
      }`}>
        <div 
          ref={playerRef}
           className={`relative w-full aspect-video bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl border border-white/10 border-b-0 transition-all duration-300 rounded-t-2xl md:rounded-t-3xl rounded-b-none'
          }`}
          // className={`relative w-full aspect-video bg-black/50 backdrop-blur-sm overflow-hidden shadow-2xl border border-white/10 border-b-0 transition-all duration-300 ${
          //   isFullscreen ? 'rounded-none border-0' : 'rounded-t-2xl md:rounded-t-3xl rounded-b-none'
          // }`}
        >
          {/* YouTube iframe container — stays opacity:0 until the real video fires
              its first PLAYING event (iframeVisible).  This hides the primer video
              AND the brief blank iframe during player init.  Subsequent video
              transitions are covered by BrandedLoadingOverlay instead. */}
          <div
            ref={youtubeContainerRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: iframeVisible ? 1 : 0 }}
          />
          <div className="absolute inset-0 w-full h-full pointer-events-auto" />
          
          {/* Branded Loading Overlay - Shows while the iframe is still loading and hides when the video starts playing */}
          <BrandedLoadingOverlay
            isVisible={showBrandedOverlay && !showStartScreen}
            programName={brandedOverlayProgramRef.current || currentProgram?.title || ''}
            startTime={currentProgramStartTime}
          />
          
          {/* Time/Date Display REMOVED - per requirements */}
          
          {/* START SCREEN */}
          {showStartScreen && !isLoading && !apiError && (
            <StartScreen onPlayClick={handleFirstTimeStart} />
            // TODO: Load iframe muted with default video
          )}

          {/* Tap-to-Unmute Screen */}
          {/* Full-screen overlay (like StartScreen) — shown whenever player is ready */}
          {/* but audio is muted. Condition: isMuted && playerReady (works on both    */}
          {/* iOS and non-iOS; on iOS this appears right after the player starts).    */}
          {/* {isMuted && playerReady && (
            <TapToUnmuteScreen onUnmuteClick={toggleMute} />
          )} */}
          
          {/* Loading overlay */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-40 p-4"
            >
              <div className="text-center w-full max-w-xs mx-auto">
                <div className={`relative flex items-center justify-center mb-6 ${
                  isMobile ? 'w-20 h-20' : 'w-24 h-24'
                } mx-auto`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
                    <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative flex items-center justify-center"
                    >
                      <Tv className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-primary relative z-10`} />
                    </motion.div>
                    <motion.div
                      animate={{ y: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm pointer-events-none"
                    />
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-white ${isMobile ? 'text-base' : 'text-lg'} mb-2 font-medium`}
                >
                  {currentProgramTitle}
                </motion.p>
                {currentProgramStartTime && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'} mb-2`}
                  >
                    Starts at {currentProgramStartTime}
                  </motion.p>
                )}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}
                >
                  Please wait while we connect
                </motion.p>

                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mt-6 h-1 w-48 bg-primary/20 rounded-full overflow-hidden mx-auto"
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Error overlay */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-xl z-40"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center max-w-md px-6"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-6"
                >
                  <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
                </motion.div>
                <h3 className="text-white text-xl font-bold mb-2">Failed to Load</h3>
                <p className="text-white/60 text-sm mb-6">{apiError}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleReload} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-full px-6 py-3">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Try Again
                  </Button>
                  <Button onClick={handleOpenChannelSelector} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-6 py-3">
                    Change Channel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Player UI */}
          {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && (
            <>
              {/* TOP LEFT SECTION - Deeni.tv Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 left-4 z-30 flex items-center gap-3"
              >
              </motion.div>
              
              {/* Program Overlay - Shows every 2-3 minutes */}
              <ProgramOverlay
                currentProgram={currentProgram}
                nextProgram={nextProgram}
                isVisible={showProgramOverlay}
                isMobile={isMobile}
              />

              {/* BOTTOM TICKER - Commented out per requirements */}
              {false && showTicker && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", damping: 20, delay: 0.1 }}
                  className="absolute bottom-0 left-0 right-0 z-30"
                >
                  <div className={`relative overflow-hidden bg-gradient-to-r from-black/95 via-black/90 to-black/95 backdrop-blur-xl border-t border-white/10 ${
                    isMobile ? 'h-10' : 'h-20'
                  }`}>
                    <div className="relative h-full flex items-center px-2 md:px-4">
                      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                      </div>

                      {!isMobile && (
                        <>
                          <div className="flex-1 min-w-0 overflow-hidden mx-4">
                            <DesktopTicker 
                              key={currentProgram?.id}
                              videos={upcomingVideos} 
                              currentIndex={cycleInfo.current - 1}
                              totalPrograms={cycleInfo.total}
                              currentProgramId={currentProgram?.id ?? ''}
                            />
                          </div>
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span className="text-white font-black text-xs whitespace-nowrap">
                                {displayTime} / {formatTime(videoDuration)}
                              </span>
                            </div>
                            
                            {timeRemaining && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                                <Hourglass className="h-3.5 w-3.5 text-primary" />
                                <span className="text-primary font-black text-xs whitespace-nowrap">
                                  {timeRemaining}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      
                      {isMobile && (
                        <>
                          <div className="flex-1 min-w-0 overflow-hidden ml-1">
                            <MobileTicker 
                              key={currentProgram?.id}
                              videos={upcomingVideos} 
                              currentIndex={cycleInfo.current - 1}
                              totalPrograms={cycleInfo.total}
                              currentProgramId={currentProgram?.id ?? ''}
                            />
                          </div>
                          
                          <div className="flex items-center gap-0 ml-1 flex-shrink-0">
                            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-black/70 backdrop-blur-sm rounded-l border border-white/20">
                              <Clock className="h-2 w-2 text-primary" />
                              <span className="text-white font-black text-[7px] whitespace-nowrap">
                                {displayTime}
                              </span>
                            </div>
                            {nextProgram && (
                              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-yellow-500/20 backdrop-blur-sm rounded-r border border-yellow-500/30 border-l-0">
                                <ArrowRight className="h-2 w-2 text-yellow-300" />
                                <span className="text-yellow-300 font-black text-[7px] whitespace-nowrap">
                                  {formatTime(nextProgram?.duration ?? 0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Bottom Controls - OUTSIDE video frame - ALWAYS VISIBLE - Unified with iframe */}
        {/* {!showStartScreen && !isLoading && !apiError && playerReady && currentProgram && ( */}
          <div className="w-full">
                <div className={`bg-black/60 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl md:rounded-b-3xl ${
                  isMobile ? 'px-3 py-2' : 'px-6 py-4'
                }`}>
                  <div className="flex items-center justify-between gap-2 md:gap-4">
                    {/* Logo Section - Replaces sound bar */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <img 
                        src="/DeeniTV-V-2.png" 
                        alt="Deeni.tv"
                        className={isMobile ? 'h-5' : 'h-7'}
                      />
                    </div>

                    {/* Action Buttons - Order: Schedule, History, Channel, Refresh, Menu */}
                    <div className="flex items-center gap-1 md:gap-2">
                      {[
                        { icon: Calendar, onClick: () => onOpenSchedule?.(), title: "Programs Schedule" },
                        { icon: History, onClick: () => setShowPreviousModal(true), title: 'Watched Program' },
                        { icon: Globe, onClick: () => handleOpenChannelSelector(), title: 'Channel' },
                        { icon: RefreshCw, onClick: handleReload, title: 'Refresh' },
                        { icon: MoreHorizontal, onClick: onMenuOpen, title: 'Menu' },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={item.onClick}
                            className={`text-white/90 hover:bg-white/20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 ${
                              isMobile ? 'h-7 w-7' : 'h-10 w-10'
                            }`}
                            title={item.title}
                          >
                            <item.icon className={isMobile ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
        {/* )} */}

        {/* Program Info Section - REMOVED to match web style (no extra content below iframe) */}
      </div>

      {/* Channel Selector Modal */}
      <ChannelSelectorModal
        isOpen={showChannelSelector}
        onClose={() => { setShowChannelSelector(false); onChannelSelectorModalClose?.() }}
        channels={apiChannels}
        onSelectChannel={handleSelectChannel}
        currentChannelId={currentChannelId}
      />

      {/* Previous Videos Modal - Mute main player when watching, unmute when done */}
      <PreviousVideosModal
        isOpen={showPreviousModal}
        onClose={() => {
          setShowPreviousModal(false)
          onHistoryModalClose?.()
        }}
        videos={previousVideos}
        onPlayVideo={handlePlayFromPrevious}
        currentChannelId={currentChannelId}
        onPauseMainPlayer={() => {
          // MUTE main player when watching from history (don't destroy)
          setYouTubeMuted(true)
          setIsMuted(true)
          setMainPlayerPaused(true)
        }}
        onResumeMainPlayer={() => {
          // UNMUTE main player when history video closes
          setYouTubeMuted(false)
          setIsMuted(false)
          setMainPlayerPaused(false)
          // Do NOT close the Previous Programs modal - it stays open
          // Do NOT reload or restart the live TV
        }}
      />
    </div>
  )
}
