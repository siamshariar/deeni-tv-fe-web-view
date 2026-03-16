import { useRef, useCallback, useEffect } from 'react'

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
} as const

interface YouTubePlayerOptions {
  videoId: string
  startSeconds?: number
  volume?: number
  muted?: boolean
  onReady?: (player: any) => void
  onStateChange?: (state: number) => void
  onError?: (errorCode: number, errorMessage: string) => void
  onDurationChange?: (duration: number) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// A short, publicly available YouTube video used as a silent placeholder to
// prime the iOS WKWebView autoplay context before the real content loads.
// Using a well-known short video (YouTube's own "YouTube" channel intro clip).
const IOS_PRIMER_VIDEO_ID = 'flt8T_0CD1A'

export function useYouTubePlayer() {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const apiReadyRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(true)
  const volumeRef = useRef<number>(75)
  const durationRef = useRef<number>(0)
  const videoIdRef = useRef<string>('')
  // Tracks whether we have a silently primed player that hasn't been swapped yet
  const isPrimedRef = useRef<boolean>(false)
  // ── Delegating event-handler refs ──
  // The primed player's YT.Player events are wired to these refs at construction
  // time.  Initially they are no-ops.  When the real video loads (iOS path), we
  // swap them to the real handlers via setPlayerCallbacks() — the same YT.Player
  // instance stays alive, preserving iOS's audio-unlock gesture context.
  const onStateChangeRef = useRef<((state: number) => void) | null>(null)
  const onErrorRef = useRef<((code: number, msg: string) => void) | null>(null)
  const onDurationChangeRef = useRef<((duration: number) => void) | null>(null)
  const onReadyRef = useRef<((player: any) => void) | null>(null)
  
  const loadYouTubeAPI = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        apiReadyRef.current = true
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('YouTube API failed to load'))
      }, 10000)
      
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
      
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout)
        apiReadyRef.current = true
        resolve()
      }
    })
  }, [])

  // ── Pre-load the YouTube iframe API as soon as the hook mounts ──
  // This ensures window.YT is ready before the user taps any button,
  // keeping player creation (new YT.Player) inside the user-gesture window
  // on iOS Safari, which blocks autoplay if triggered outside a gesture.
  useEffect(() => {
    loadYouTubeAPI().catch(() => {}) // fire-and-forget; errors handled per-init
  }, [loadYouTubeAPI])
  
  const initializePlayer = useCallback(async (options: YouTubePlayerOptions) => {
    if (!containerRef.current) return
    
    volumeRef.current = options.volume || 75
    isMutedRef.current = options.muted ?? true  // default muted; false is intentional
    videoIdRef.current = options.videoId
    
    try {
      await loadYouTubeAPI()
    } catch (err) {
      options.onError?.(0, 'Failed to load YouTube API')
      return
    }
    
    containerRef.current.innerHTML = ''
    
    try {
      const playerId = `youtube-player-${Date.now()}`
      const playerDiv = document.createElement('div')
      playerDiv.id = playerId
      playerDiv.style.width = '100%'
      playerDiv.style.height = '100%'
      playerDiv.style.position = 'absolute'
      playerDiv.style.top = '0'
      playerDiv.style.left = '0'
      containerRef.current.appendChild(playerDiv)
      
      playerRef.current = new window.YT.Player(playerId, {
        videoId: options.videoId,
        playerVars: {
          autoplay: 1,
          mute: 1, // always start muted — required for iOS autoplay; onReady unmutes if needed
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          start: options.startSeconds || 0,
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.setVolume(volumeRef.current)
              if (isMutedRef.current) {
                event.target.mute()
              } else {
                event.target.unMute()
              }
              
              // Get video duration from YouTube API
              const duration = event.target.getDuration()
              if (duration && !isNaN(duration) && duration > 0) {
                durationRef.current = duration
                options.onDurationChange?.(duration)
              }
            } catch (err) {}
            options.onReady?.(event.target)
          },
          onStateChange: (event: any) => {
            // When video is cued or playing, get duration
            if (event.data === YT_STATE.CUED || event.data === YT_STATE.PLAYING) {
              try {
                const duration = event.target.getDuration()
                if (duration && !isNaN(duration) && duration > 0 && duration !== durationRef.current) {
                  durationRef.current = duration
                  options.onDurationChange?.(duration)
                }
              } catch (err) {}
            }
            options.onStateChange?.(event.data)
          },
          onError: (event: any) => {
            options.onError?.(event.data, `Error ${event.data}`)
          }
        }
      })
      // ── iOS Safari iframe attribute patch ──
      // The YT iFrame API creates the iframe asynchronously; iOS requires several
      // attributes to be present on the <iframe> element itself for autoplay and
      // inline playback to work.  We patch them as soon as the iframe appears.
      // Run immediately AND retry up to 3 times to cover slow iframe creation.
      const patchIframeForIOS = (attempt = 0) => {
        try {
          const iframe = containerRef.current?.querySelector('iframe')
          if (iframe) {
            // Inline playback — mandatory for iOS (prevents fullscreen takeover)
            iframe.setAttribute('playsinline', 'true')
            iframe.setAttribute('webkit-playsinline', 'webkit-playsinline')
            iframe.setAttribute('x-webkit-airplay', 'allow')
            // Allow list — must include autoplay for iOS WKWebView / Safari
            iframe.setAttribute(
              'allow',
              'autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope; clipboard-write; web-share'
            )
            iframe.setAttribute('allowfullscreen', 'true')
            iframe.setAttribute('allowtransparency', 'true')
            iframe.style.border = 'none'
            iframe.style.pointerEvents = 'none' // keep custom controls active
          } else if (attempt < 3) {
            // iframe not yet injected by YT API — retry
            setTimeout(() => patchIframeForIOS(attempt + 1), 300)
          }
        } catch (_) {}
      }
      setTimeout(() => patchIframeForIOS(), 100)
    } catch (err) {
      options.onError?.(0, 'Failed to create player')
    }
  }, [loadYouTubeAPI])

  // ── primePlayer ──────────────────────────────────────────────────────────────
  // Creates a MUTED, HIDDEN YouTube player on mount — no user gesture required.
  //
  // iOS Safari (WKWebView) permits muted autoplay without a gesture.  By creating
  // the player early, the browser's "this document has interacted with video"
  // flag is set, so when the user later taps "Start Watching" we can call
  // player.unMute() + player.setVolume() synchronously inside that gesture, then
  // swap the video with loadVideoById() — all without triggering the autoplay
  // restriction again.
  //
  // The container element is visually hidden via CSS (opacity-0 / pointer-events-none
  // applied by the caller) — the primer video never appears on screen.
  const primePlayer = useCallback(async (): Promise<void> => {
    if (!containerRef.current || isPrimedRef.current) return

    try {
      await loadYouTubeAPI()
    } catch {
      return // API failed — graceful degradation; normal init path will try again
    }

    try {
      containerRef.current.innerHTML = ''

      const playerId = `yt-primer-${Date.now()}`
      const playerDiv = document.createElement('div')
      playerDiv.id = playerId
      playerDiv.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;'
      containerRef.current.appendChild(playerDiv)

      playerRef.current = new window.YT.Player(playerId, {
        videoId: IOS_PRIMER_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,           // muted — iOS allows this without gesture
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,    // mandatory for iOS inline playback
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            isPrimedRef.current = true
            isMutedRef.current = true
            // Patch iframe attributes so iOS respects playsinline / autoplay allow-list
            const patchPrimer = (attempt = 0) => {
              try {
                const iframe = containerRef.current?.querySelector('iframe')
                if (iframe) {
                  iframe.setAttribute('playsinline', 'true')
                  iframe.setAttribute('webkit-playsinline', 'webkit-playsinline')
                  iframe.setAttribute('allow',
                    'autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope'
                  )
                  iframe.style.border = 'none'
                  iframe.style.pointerEvents = 'none'
                } else if (attempt < 4) {
                  setTimeout(() => patchPrimer(attempt + 1), 250)
                }
              } catch (_) {}
            }
            setTimeout(() => patchPrimer(), 50)
            // Delegate to ref (if swapped by setPlayerCallbacks before onReady fires)
            onReadyRef.current?.(playerRef.current)
          },
          // Delegate through refs — initially no-ops; swapped by setPlayerCallbacks
          // when the real video loads, so we keep the same YT.Player instance.
          onStateChange: (event: any) => {
            if (onStateChangeRef.current) {
              onStateChangeRef.current(event.data)
            }
            // Also track duration on PLAYING/CUED like initializePlayer does
            if (event.data === YT_STATE.CUED || event.data === YT_STATE.PLAYING) {
              try {
                const dur = event.target.getDuration()
                if (dur && !isNaN(dur) && dur > 0 && dur !== durationRef.current) {
                  durationRef.current = dur
                  onDurationChangeRef.current?.(dur)
                }
              } catch (_) {}
            }
          },
          onError: (event: any) => {
            onErrorRef.current?.(event.data, `Error ${event.data}`)
          },
        },
      })
    } catch (_) {
      // Silently swallow — worst case the normal initializePlayer path runs on tap
    }
  }, [loadYouTubeAPI])

  // ── unmuteAndResume ──────────────────────────────────────────────────────────
  // Call this SYNCHRONOUSLY inside a user-gesture handler (e.g. button onClick).
  // Unmutes the primed (or active) player and sets the desired volume level so
  // iOS grants audio permission for the current player instance.
  // Must be called before any async work (fetch, etc.) to stay inside the gesture.
  const unmuteAndResume = useCallback((targetVolume: number = 75) => {
    if (!playerRef.current) return
    try {
      isMutedRef.current = false
      volumeRef.current = targetVolume
      if (typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute()
      }
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(targetVolume)
      }
    } catch (_) {}
  }, [])

  // ── setPlayerCallbacks ──────────────────────────────────────────────────────
  // Swap the delegating-ref event handlers that the primed player calls.
  // Call this BEFORE loadVideoById so that state-change events from the real
  // video reach the caller's handlers (onReady, onStateChange, etc.).
  // This avoids destroying the primed YT.Player (which would lose the iOS
  // audio-unlock gesture context).
  const setPlayerCallbacks = useCallback((callbacks: {
    onReady?: (player: any) => void
    onStateChange?: (state: number) => void
    onError?: (code: number, msg: string) => void
    onDurationChange?: (duration: number) => void
  }) => {
    onReadyRef.current = callbacks.onReady ?? null
    onStateChangeRef.current = callbacks.onStateChange ?? null
    onErrorRef.current = callbacks.onError ?? null
    onDurationChangeRef.current = callbacks.onDurationChange ?? null
  }, [])

  const loadVideo = useCallback((videoId: string, startSeconds?: number) => {
    if (!playerRef.current) return false
    
    try {
      videoIdRef.current = videoId
      if (typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId,
          startSeconds: startSeconds || 0
        })
        
        // Try to get duration after load
        // setTimeout(() => {
        //   try {
        //     const duration = playerRef.current.getDuration()
        //     if (duration && !isNaN(duration) && duration > 0) {
        //       durationRef.current = duration
        //     }
        //   } catch (err) {}
        // }, 500)
        // TODO: Is this delay mandatory??
        try {
          const duration = playerRef.current.getDuration()
          if (duration && !isNaN(duration) && duration > 0) {
            durationRef.current = duration
          }
        } catch (err) {}
        
        return true
      }
    } catch (err) {
      console.error('Error loading video:', err)
    }
    return false
  }, [])
  
  const getDuration = useCallback((): number => {
    if (!playerRef.current) return 0
    try {
      const duration = playerRef.current.getDuration()
      return typeof duration === 'number' && !isNaN(duration) ? duration : 0
    } catch (err) {
      return durationRef.current
    }
  }, [])
  
  const setVolume = useCallback((volume: number) => {
    if (!playerRef.current) return
    
    try {
      const safeVolume = Math.max(0, Math.min(100, volume))
      volumeRef.current = safeVolume
      
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(safeVolume)
      }
    } catch (err) {}
  }, [])
  
  const setMuted = useCallback((muted: boolean) => {
    if (!playerRef.current) return
    
    try {
      isMutedRef.current = muted
      
      if (muted) {
        if (typeof playerRef.current.mute === 'function') {
          playerRef.current.mute()
        }
      } else {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute()
        }
      }
    } catch (err) {}
  }, [])
  
  const play = useCallback(() => {
    if (!playerRef.current) return false
    try {
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo()
        return true
      }
    } catch (err) {}
    return false
  }, [])
  
  const seekTo = useCallback((seconds: number, allowSeekAhead: boolean = true) => {
    if (!playerRef.current) return false
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seconds, allowSeekAhead)
        return true
      }
    } catch (err) {}
    return false
  }, [])
  
  const getCurrentTime = useCallback((): number => {
    if (!playerRef.current) return 0
    try {
      const time = playerRef.current.getCurrentTime()
      return typeof time === 'number' && !isNaN(time) ? time : 0
    } catch (err) {}
    return 0
  }, [])
  
  const destroy = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy()
      } catch (err) {}
    }
    playerRef.current = null
    apiReadyRef.current = false
    durationRef.current = 0
  }, [])
  
  useEffect(() => {
    return () => { destroy() }
  }, [destroy])
  
  return {
    containerRef,
    initializePlayer,
    primePlayer,
    unmuteAndResume,
    setPlayerCallbacks,
    isPrimedRef,
    loadVideo,
    getDuration,
    setVolume,
    setMuted,
    play,
    seekTo,
    getCurrentTime,
    destroy
  }
}
