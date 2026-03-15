import { VideoProgram, CurrentVideoData, Channel } from '@/types/schedule'

// Bengali Channel - Updated API data
const BENGALI_VIDEOS: VideoProgram[] = [
  // Current Program
  {
    id: 'b1',
    videoId: 'wlTnG3PvBG8',
    title: 'জুমুআর খুতবাহ্‌ - আল্লাহ কোথায় ? ।। Dr. Imam Hossain',
    description: 'জুমুআর খুতবাহ্‌ - আল্লাহ কোথায় - Dr. Imam Hossain এর আলোচনা',
    duration: 3633,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/wlTnG3PvBG8/maxresdefault.jpg'
  },
  // Previous Programs
  {
    id: 'b2',
    videoId: 'hABN2uy36v8',
    title: 'হিজরতের বিবেক জাগানিয়া শিক্ষা: ঈমান প্রশ্নে আপস নয়',
    description: 'হিজরতের বিবেক জাগানিয়া শিক্ষা সম্পর্কে আলোচনা',
    duration: 1800,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/hABN2uy36v8/maxresdefault.jpg'
  },
  {
    id: 'b3',
    videoId: 'NTtDNHKr-zk',
    title: 'বর্তমান আলেম সমাজের অবস্থা আমাদের করণীয়- ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর রাহিমাহুল্লাহ',
    description: 'বর্তমান আলেম সমাজের অবস্থা সম্পর্কে ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর এর আলোচনা',
    duration: 1043,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/NTtDNHKr-zk/maxresdefault.jpg'
  },
  {
    id: 'b4',
    videoId: 'mT5HfBlIbKM',
    title: '20.3 সূরা ত্ব-হা ২য় পর্ব (অংশ - ১/৩) ।। Dr. Imam Hossain',
    description: 'সূরা ত্ব-হা ২য় পর্ব - Dr. Imam Hossain এর তাফসীর',
    duration: 1233,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/mT5HfBlIbKM/maxresdefault.jpg'
  },
  {
    id: 'b5',
    videoId: '2C8rGnSyeVA',
    title: 'জেনে নিন ড. খোন্দকার আব্দুল্লাহ জাহঙ্গীর রাহ. ইসলামিক টিভির প্রোগ্রাম দৈনন্দিন জীবনে ইসলাম',
    description: 'দৈনন্দিন জীবনে ইসলাম - ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর এর প্রোগ্রাম',
    duration: 1911,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/2C8rGnSyeVA/maxresdefault.jpg'
  },
  {
    id: 'b6',
    videoId: 'EBmlXo-lgcU',
    title: 'আপনার জিজ্ঞাসা ২০২৪ | Apnar Jiggasa | EP 3206 | NTV Islamic Show',
    description: 'আপনার জিজ্ঞাসা - এনটিভি ইসলামিক শো',
    duration: 1362,
    category: 'Q&A',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/EBmlXo-lgcU/maxresdefault.jpg'
  },
  // Upcoming Programs
  {
    id: 'b7',
    videoId: 't0Xici9CVZo',
    title: '১০. কিতাবুল আদাব। শাইখ শাহীদুল্লাহ খান মাদানী। পিস টিভি বাংলা',
    description: 'কিতাবুল আদাব - শাইখ শাহীদুল্লাহ খান মাদানী এর আলোচনা',
    duration: 1800,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/t0Xici9CVZo/maxresdefault.jpg'
  },
  {
    id: 'b8',
    videoId: 'XTs0pbt0RBw',
    title: '৪.৪ জন্মনিয়ন্ত্রণ ও তার অশুভ পরিণাম। জ্ঞানগর্ভ আলোচনার মঞ্চ। গ্রুপ আলোচনা। পিস টিভি বাংলা',
    description: 'জন্মনিয়ন্ত্রণ ও তার পরিণাম সম্পর্কে জ্ঞানগর্ভ আলোচনা',
    duration: 1799,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/XTs0pbt0RBw/maxresdefault.jpg'
  },
  {
    id: 'b9',
    videoId: 's3B-9ZHhNdM',
    title: 'করোনা পরিস্থিতিতে আকিদা বিশুদ্ধ রাখতে ৫টি বিষয় মাথায় রাখুন',
    description: 'করোনা পরিস্থিতিতে আকিদা বিশুদ্ধ রাখার উপায়',
    duration: 1019,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/s3B-9ZHhNdM/maxresdefault.jpg'
  },
  {
    id: 'b10',
    videoId: 'x04S5VXWL9Q',
    title: 'নির্বাচিত প্রশ্নোত্তর \'শরয়ী সমাধান\'। পর্ব-২৮৫',
    description: 'শরয়ী সমাধান - নির্বাচিত প্রশ্নোত্তর',
    duration: 4022,
    category: 'Q&A',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/x04S5VXWL9Q/maxresdefault.jpg'
  },
  {
    id: 'b11',
    videoId: 'pOo8X-GQNV8',
    title: 'Live:Tafseerul Quran Surah # 17, AL-ISRA Part-3(Ayat:31-55)',
    description: 'তাফসীরুল কুরআন - সূরা আল-ইসরা (আয়াত ৩১-৫৫)',
    duration: 5923,
    category: 'Tafseer',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/pOo8X-GQNV8/maxresdefault.jpg'
  },
  {
    id: 'b12',
    videoId: 'alRKQczhJpM',
    title: 'লাইভ : সীরাতে রহমাতুল্লিল আলামিন - ধারাবাহিক আলোচনা - পর্ব -৩',
    description: 'সীরাতে রহমাতুল্লিল আলামিন - ধারাবাহিক আলোচনা',
    duration: 4144,
    category: 'Seerah',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/alRKQczhJpM/maxresdefault.jpg'
  },
  {
    id: 'b13',
    videoId: 'muYIj4KAIy8',
    title: 'রমাদান বিষয়ক প্রশ্নোত্তরের ধারাবাহিক অনুষ্ঠান (পর্ব-১০)',
    description: 'রমাদান বিষয়ক প্রশ্নোত্তর - পর্ব ১০',
    duration: 2191,
    category: 'Q&A',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/muYIj4KAIy8/maxresdefault.jpg'
  },
  {
    id: 'b14',
    videoId: 'OxoIOfeTB80',
    title: '।। Dr. Imam Hossain',
    description: 'Dr. Imam Hossain এর আলোচনা',
    duration: 4581,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/OxoIOfeTB80/maxresdefault.jpg'
  },
  {
    id: 'b15',
    videoId: 'UCn1v4ME2tc',
    title: 'জুম\'আর খুতবাহ্ : জিল-হজ্জ মাসের প্রথম দশ দিনের করনীয় আমল সমূহ',
    description: 'জুমআর খুতবাহ - জিল-হজ্জ মাসের আমল সমূহ',
    duration: 3655,
    category: 'Lecture',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/UCn1v4ME2tc/maxresdefault.jpg'
  },
  {
    id: 'b16',
    videoId: 'FZ8Zy4IW6MA',
    title: 'আল কুরআনের আলো । পর্ব ৩০১। শাইখ মতিউর রহমান মাদানী । পিস টিভি বাংলা',
    description: 'আল কুরআনের আলো - শাইখ মতিউর রহমান মাদানী',
    duration: 1316,
    category: 'Quran',
    language: 'Bengali',
    channelId: 'bangla-1',
    thumbnail: 'https://img.youtube.com/vi/FZ8Zy4IW6MA/maxresdefault.jpg'
  }
]

// English Channel - no static fallback; content served entirely via live API
const ENGLISH_VIDEOS: VideoProgram[] = []

// Arabic Channel - no static fallback; content served entirely via live API
const ARABIC_VIDEOS: VideoProgram[] = []

// Define channels - No flags, only channel names
// Channel IDs map to API lid (language/channel IDs)
export const CHANNELS: Channel[] = [
  {
    id: 'bangla-1',
    name: 'বাংলা',
    language: 'Bengali',
    icon: '📺',
    programs: BENGALI_VIDEOS,
  },
  {
    id: 'english-1',
    name: 'English',
    language: 'English',
    icon: '📺',
    programs: ENGLISH_VIDEOS,
  },
  {
    id: 'arabic-1',
    name: 'العربية',
    language: 'Arabic',
    icon: '📺',
    programs: ARABIC_VIDEOS,
  },
  {
    id: 'urdu-1',
    name: 'اردو',
    language: 'Urdu',
    icon: '📺',
    programs: [],
  },
  {
    id: 'chinese-1',
    name: '中文',
    language: 'Chinese',
    icon: '📺',
    programs: [],
  },
  {
    id: 'quran-bangla',
    name: 'কুরআন বাংলা',
    language: 'Bengali',
    icon: '📖',
    programs: [],
  },
  {
    id: 'quran-english',
    name: 'Quran English',
    language: 'English',
    icon: '📖',
    programs: [],
  },
  {
    id: 'quran-arabic',
    name: 'القرآن العربي',
    language: 'Arabic',
    icon: '📖',
    programs: [],
  },
  {
    id: 'quran-chinese',
    name: '古兰经中文',
    language: 'Chinese',
    icon: '📖',
    programs: [],
  },
]

// Map channel IDs to external API lid values
export const CHANNEL_LID_MAP: Record<string, number> = {
  'bangla-1': 5,
  'english-1': 6,
  'arabic-1': 7,
  'urdu-1': 8,
  'chinese-1': 9,
  'quran-bangla': 5,
  'quran-english': 6,
  'quran-arabic': 7,
  'quran-chinese': 9,
}

// Check if channel is a Quran channel
export function isQuranChannel(channelId: string): boolean {
  return channelId.startsWith('quran-')
}

// Get API lid for a channel
export function getChannelLid(channelId: string): number {
  return CHANNEL_LID_MAP[channelId] || 5
}

// Export SCHEDULE for backward compatibility
export const SCHEDULE: VideoProgram[] = BENGALI_VIDEOS

// Types for scheduled preloads
export interface ScheduledPreload {
  programId: string
  preloadTime: number
  videoId: string
}

export interface UpcomingProgramsResult {
  upcoming: VideoProgram[]
  nextStartTimes: number[]
  nextStartAbsolute: number[]
  programIndices: number[]
  scheduledPreloads: ScheduledPreload[]
}

// Master epoch start
export const MASTER_EPOCH_START = Date.UTC(2024, 0, 1, 0, 0, 0)
export const SCHEDULE_VERSION = '1.1.0'

// Local storage keys
export const STORAGE_KEY = 'deeni-tv-channel'
export const PREVIOUS_VIDEOS_KEY_PREFIX = 'deeni-tv-previous-'

// Get saved channel from localStorage
export function getSavedChannel(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

// Save channel to localStorage
export function saveChannel(channelId: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, channelId)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Get previous videos from localStorage for specific channel
export function getPreviousVideos(channelId: string): VideoProgram[] {
  if (typeof window === 'undefined') return []
  try {
    const key = `${PREVIOUS_VIDEOS_KEY_PREFIX}${channelId}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error reading previous videos:', error)
    return []
  }
}

// Save previous videos to localStorage for specific channel
export function savePreviousVideos(channelId: string, videos: VideoProgram[]): void {
  if (typeof window === 'undefined') return
  try {
    const key = `${PREVIOUS_VIDEOS_KEY_PREFIX}${channelId}`
    // Keep only last 30 videos
    const recentVideos = videos.slice(0, 30)
    localStorage.setItem(key, JSON.stringify(recentVideos))
  } catch (error) {
    console.error('Error saving previous videos:', error)
  }
}

// Add video to previous list for specific channel
export function addToPreviousVideos(channelId: string, video: VideoProgram): VideoProgram[] {
  const previous = getPreviousVideos(channelId)
  
  // Add watched timestamp
  const watchedVideo = {
    ...video,
    watchedAt: Date.now()
  }
  
  // Remove if already exists
  const filtered = previous.filter(v => v.id !== video.id)
  
  // Add to beginning
  const updated = [watchedVideo, ...filtered].slice(0, 30)
  
  // Save to localStorage
  savePreviousVideos(channelId, updated)
  
  return updated
}

// Clear previous videos for a channel (for testing)
export function clearPreviousVideos(channelId: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = `${PREVIOUS_VIDEOS_KEY_PREFIX}${channelId}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing previous videos:', error)
  }
}

// Returns a list of preloads that are due now or in the past. This is a lightweight
// helper for ScheduleService and doesn't affect the main schedule logic.
export function checkScheduledPreloads(): ScheduledPreload[] {
  // For now, this is a no-op placeholder. Returning an empty list keeps the
  // scheduling service from triggering any preloads.
  return []
}

// Get channel programs (falls back to Bangla if channel has no programs)
export function getChannelPrograms(channelId: string): VideoProgram[] {
  const channel = CHANNELS.find(c => c.id === channelId)
  const programs = channel?.programs
  // Fall back to Bangla programs if this channel has none yet
  if (!programs || programs.length === 0) {
    return CHANNELS[0].programs
  }
  return programs
}

// Get total duration for a channel
export function getTotalScheduleDuration(channelId: string): number {
  const programs = getChannelPrograms(channelId)
  return programs.reduce((sum, prog) => sum + prog.duration, 0)
}

/**
 * Calculate current program for a specific channel
 */
export function getCurrentProgram(channelId: string): CurrentVideoData & { 
  nextProgramStartTime: number
  scheduleVersion: string
  totalPrograms: number
  channelId: string
} {
  const now = Date.now()
  const programs = getChannelPrograms(channelId)
  const totalDuration = programs.reduce((sum, prog) => sum + prog.duration, 0)
  
  const elapsedSinceEpoch = Math.floor((now - MASTER_EPOCH_START) / 1000)
  const cyclePosition = elapsedSinceEpoch % totalDuration
  
  let accumulatedTime = 0
  let currentProgram = programs[0]
  let currentTime = 0
  let programIndex = 0
  
  for (let i = 0; i < programs.length; i++) {
    const program = programs[i]
    if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + program.duration) {
      currentProgram = program
      currentTime = cyclePosition - accumulatedTime
      programIndex = i
      break
    }
    accumulatedTime += program.duration
  }
  
  const nextProgram = programs[(programIndex + 1) % programs.length]
  
  const currentCycleStart = MASTER_EPOCH_START + 
    Math.floor((now - MASTER_EPOCH_START) / totalDuration / 1000) * totalDuration * 1000
  
  const nextProgramStartTime = currentCycleStart + 
    (accumulatedTime + currentProgram.duration) * 1000
  
  const timeRemaining = currentProgram.duration - currentTime
  
  return {
    program: currentProgram,
    currentTime,
    timeRemaining,
    nextProgram,
    serverTime: now,
    programIndex,
    epochStart: MASTER_EPOCH_START,
    nextProgramStartTime,
    scheduleVersion: SCHEDULE_VERSION,
    totalPrograms: programs.length,
    channelId
  }
}

/**
 * Get upcoming programs for a channel
 */
export function getUpcomingPrograms(channelId: string, count: number = 15): UpcomingProgramsResult {
  const current = getCurrentProgram(channelId)
  const programs = getChannelPrograms(channelId)
  const currentIndex = current.programIndex
  
  const upcoming: VideoProgram[] = []
  const nextStartTimes: number[] = []
  const nextStartAbsolute: number[] = []
  const programIndices: number[] = []
  const scheduledPreloads: ScheduledPreload[] = []

  let offset = current.timeRemaining
  let absoluteTime = current.nextProgramStartTime

  for (let i = 1; i <= count; i++) {
    const index = (currentIndex + i) % programs.length
    const prog = programs[index]
    
    upcoming.push(prog)
    programIndices.push(index)

    nextStartTimes.push(offset)
    nextStartAbsolute.push(absoluteTime)

    offset += prog.duration
    absoluteTime += prog.duration * 1000
  }

  return {
    upcoming,
    nextStartTimes,
    nextStartAbsolute,
    programIndices,
    scheduledPreloads
  }
}

/**
 * Get previous programs from localStorage for a channel
 */
export function getPreviousPrograms(channelId: string, count: number = 15): VideoProgram[] {
  const previous = getPreviousVideos(channelId)
  return previous.slice(0, count)
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return `0:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} secs`
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}m`
    }
    return `${hours}h`
  }
  
  if (mins === 1) return `${mins} min`
  return `${mins} mins`
}

// ── API Channel ──
// Exact shape returned by https://api.deeniinfotech.com/api/tv-channels

export interface ApiChannel {
  id: number
  title: string
  localizationId: string
  isQuran: boolean | null
}

export const API_CHANNELS_STORAGE_KEY = 'deeni-tv-channels'

/** Read stored channel list from localStorage (as-is from API) */
export function getStoredApiChannels(): ApiChannel[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(API_CHANNELS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/** Persist channel list to localStorage exactly as received from the API */
export function saveApiChannels(channels: ApiChannel[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(API_CHANNELS_STORAGE_KEY, JSON.stringify(channels))
  } catch (error) {
    console.error('Error saving API channels:', error)
  }
}
