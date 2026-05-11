const VIDEO_ID  = 'UlGUYT_zk5o'
const START_SEC = 63
const DIV_ID    = 'operator-yt-audio'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let player: any = null

function initPlayer() {
  if (player) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player = new (window as any).YT.Player(DIV_ID, {
    videoId: VIDEO_ID,
    playerVars: {
      autoplay: 1, start: START_SEC,
      controls: 0, disablekb: 1, fs: 0,
      rel: 0, iv_load_policy: 3, modestbranding: 1,
    },
    events: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onReady: (e: any) => e.target.playVideo(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onStateChange: (e: any) => {
        if (e.data === 0) { e.target.seekTo(START_SEC, true); e.target.playVideo() }
      },
    },
  })
}

export const audioManager = {
  start() {
    if (player) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT?.Player) {
      initPlayer()
    } else {
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(script)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).onYouTubeIframeAPIReady = initPlayer
    }
  },
  stop() {
    if (player) {
      player.stopVideo()
      player.destroy()
      player = null
    }
  },
}
