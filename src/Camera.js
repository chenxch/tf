class Camera {
  constructor(video, options) {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
    // 默认配置
    const defalultOptions = {
      audio: false,
      video: {
        // width: 400,
        // height: 400,
        frameRate: {
          ideal: 100,
          max: 150,
        },
      },
    }
    this.opts = { ...defalultOptions, ...options }
    this.isOpen = false // 是否打开摄像头
    this.isOpenLoading = false // 是否打开摄像头中
    this.video = video
    this.isPhone = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
    )
  }

  // 打开摄像头
  open(deviceId) {
    return new Promise(async (resolve, reject) => {
      if (!this.isVideo(this.video)) {
        this.isOpen = false
        this.isOpenLoading = false
        const errMsg = 'video not HTMLElement'
        reject({ errMsg })
      }
      else {
        this.isOpenLoading = true
        this.isOpen = false
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await this.getMediaDevices()
          const mediaOpts = {
            audio: this.opts.audio,
            video: this.opts.video,
          }
          if (deviceId === 'user' || deviceId === 'environment')
            mediaOpts.video.facingMode = deviceId

          else if (deviceId)
            mediaOpts.video.deviceId = deviceId

          else
            mediaOpts.video.facingMode = 'user'

          navigator.mediaDevices
            .getUserMedia(mediaOpts)
            .then((stream) => {
              const VideoTracks = stream.getVideoTracks()
              if (VideoTracks.length > 0) {
                this.stream = stream
                this.video.pause()
                this.video.setAttribute('playsinline', true)
                if ('srcObject' in this.video)
                  this.video.srcObject = stream

                else
                  this.video.src = stream

                this.video.onloadedmetadata = async () => {
                  await this.video.play()
                  this.isOpen = true
                  this.isOpenLoading = false
                  const tracks = VideoTracks[0]
                  tracks.constraints = tracks.getConstraints()
                  tracks.settings = tracks.getSettings()
                  if (this.isPhone) {
                    if (tracks.settings && tracks.settings.deviceId)
                      tracks.settings.deviceId = deviceId
                  }
                  console.log(tracks)
                  this.tracks = tracks
                  resolve(this.tracks)
                }
                this.video.onError = (err) => {
                  const error = {
                    errMsg: `video Error-${err}`,
                    opts: this.opts,
                  }
                  reject(error)
                }
              }
              else {
                const error = {
                  errMsg: 'No VideoTracks',
                  opts: this.opts,
                }
                reject(error)
              }
            })
            .catch((err) => {
              const error = {
                errMsg: `Failed to acquire camera feed: ${err}`,
                opts: this.opts,
              }
              reject(error)
            })
        }
        else {
          const error = {
            errMsg: 'No navigator.mediaDevices.getUserMedia exists',
            opts: this.opts,
          }
          reject(error)
        }
      }
    })
  }

  // 关闭
  stop() {
    return new Promise((resolve) => {
      this.isOpen
        && this.stream
        && this.stream.getVideoTracks().forEach(async (track) => {
          await track.stop()
        })
      resolve(this)
    })
  }

  // 获取设备
  getMediaDevices() {
    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        if (this.isPhone) {
          resolve([
            {
              label: '前置摄像头',
              deviceId: 'user',
            },
            {
              label: '后置摄像头',
              deviceId: 'environment',
            },
          ])
        }
        else {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            const devicesList = (devices || []).filter(e => e.kind === 'videoinput' && e.deviceId)
            this.devicesList = devicesList
            resolve(devicesList)
          })
        }
      }
      else {
        const error = {
          errMsg: 'No navigator.mediaDevices.enumerateDevices exists',
          opts: this.opts,
        }
        reject(error)
      }
    })
  }

  // 是否是个DOM && HTMLElement
  isVideo(obj) {
    return obj instanceof HTMLElement && obj.nodeName === 'VIDEO'
  }
}

export { Camera }
