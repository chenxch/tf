<script>
// import { closeToast, showDialog, showLoadingToast, showToast } from 'vant'
import * as tf from '@tensorflow/tfjs'
import * as THREE from 'three'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import * as Kalidokit from 'kalidokit'
import { Camera } from './Camera'
import { GLTFLoader, TRIANGULATION, UVS, isObjEmpty, isPhone } from './utils'

export default {
  data: () => ({
    camera: null,
    width: document.documentElement.clientWidth || window.innerWidth,
    height: document.documentElement.clientHeight || window.innerHeight,
    canvasWidth: 0,
    canvasHeight: 0,
    actionShow: !1,
    deviceList: [],
    isCameraOpen: !1,
    task: null,
    model: null,
    modelLoad: !0,
    deviceId: localStorage.getItem('deviceId') || 'user',
    flipHorizontal: !1,
    scene: null,
    threeCamera: null,
    renderer: null,
    geometry: null,
    background: null,
    mesh: null,
    Object3D: null,
    morphTarget: null,
    meshPopup: !1,
    meshIndex: 0,
    meshListAll: [
      {
        name: 'IGG脸饰+眼镜',
        src: 'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68d3a08e5bb84cf1bd86c3d04124d4ea~tplv-k3u1fbpfcp-watermark.image?',
      },
      {
        name: 'IGG脸饰',
        src: 'https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a657feac71414b74967d205e8584b970~tplv-k3u1fbpfcp-watermark.image?',
      },
      {
        name: '圣诞树眼镜',
        src: 'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82ccebf7425943c9b259de3459edf145~tplv-k3u1fbpfcp-watermark.image?',
      },
      {
        name: '圣诞眼镜',
        src: 'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31bdecebd17247bb97b2d9d1df1c7e44~tplv-k3u1fbpfcp-watermark.image?',
      },
      {
        name: '圣诞眼镜2',
        src: 'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62e7922194344367a71bfaee1323e234~tplv-k3u1fbpfcp-watermark.image?',
      },
      {
        name: '敬过往祈新年',
        src: 'https://dcdn.it120.cc/2022/12/14/cb57d900-8597-4c70-b34d-2966dc428bc7.png',
        srcX: 'https://dcdn.it120.cc/2022/12/14/3f1e0c82-3455-4896-9ea3-d19541db52be.png',
      },
      {
        name: '大红唇+睫毛膏',
        src: 'https://dcdn.it120.cc/2022/12/07/9a31a6ac-ac04-40df-b890-af64ca3ae33a.png',
      },
      {
        name: '眼影',
        src: 'https://dcdn.it120.cc/2022/12/07/fb96a09a-0d58-4365-b3f8-57054168517c.png',
      },
      {
        name: '中国国旗',
        src: 'https://dcdn.it120.cc/2022/12/07/dac52247-8c04-420f-84e6-26fc4b430b5e.png',
      },
      {
        name: '眼镜',
        src: 'https://dcdn.it120.cc/2022/12/09/62fcfd9a-191e-4a9d-9c6a-b99e92ef7512.png',
      },
      {
        name: '猪头',
        type: 'model',
        src: 'https://dcdn.it120.cc/2022/12/07/e64174b8-a96c-4f36-9b70-9ed5c952f4df.png',
        model: 'https://dcdn.it120.cc/2022/12/07/55607c9c-1aaa-494a-b332-6a5360933c4a.glb',
      },
      {
        name: '大象',
        type: 'model',
        src: 'https://dcdn.it120.cc/2022/12/07/208ccc82-94db-4aab-a431-c7531ec190a3.png',
        model: 'https://dcdn.it120.cc/2022/12/07/4c4096b0-fd19-4a1b-886c-7b263c35dfe9.glb',
      },
      {
        name: '小狗',
        type: 'model',
        src: 'https://dcdn.it120.cc/2022/12/07/bb97bbff-3799-4a16-88f9-527495859e0d.png',
        model: 'https://dcdn.it120.cc/2022/12/07/2204b6c9-e334-4e56-b056-2fe19ca7a578.glb',
      },
      {
        name: '猴子',
        type: 'model',
        src: 'https://dcdn.it120.cc/2022/12/07/38c7776f-8604-45fc-bc4e-60435bc03f6e.png',
        model: 'https://dcdn.it120.cc/2022/12/07/92fbd0de-9d5f-449e-999f-709e7eb0cc63.glb',
      },
      {
        name: '爱心眼镜',
        calculateFun: 'Heartglasses',
        type: 'model',
        src: 'https://dcdn.it120.cc/2022/12/07/e6fa3b86-863c-4d6e-844c-0e1cd03bf32c.png',
        model: 'https://dcdn.it120.cc/2022/12/07/752de96c-bc3f-4fab-b73f-12626dad8977.glb',
      },
      {
        name: '防护眼镜(test)',
        calculateFun: 'Heartglasses',
        type: 'model',
        src: 'https://dcdn.it120.cc/2022/12/13/cf78108d-3511-4c65-9502-3c92e7d4a312.png',
        model: 'https://dcdn.it120.cc/2022/12/13/40e7af5b-97a5-45a1-8944-f172f6e04fa3.glb',
      },
    ],
    meshList: [],
    helpTextModel: ['0'],
    tabsActive: 'stickers',
  }),
  mounted() {
    if (isPhone())
      this.flipHorizontal = !0
    this.getData()
    this.$dialog.alert({
      message:
            '<div class="prompt-text">                   <h5>AR面部特效</h5>\n                    <ol>\n                        <li>首次模型加载模型可能需要1-2分钟，请耐心等待</li>\n                        <li>需要打开摄像头，（不会把您的摄像头信息上传到服务端）</li>\n                        <li>打开摄像头后如发现摄像头是镜像，可点击“切换镜像”。</li>\n                    </ol>\n                </div>',
      theme: 'round-button',
      className: 'helpdialog',
      confirmButtonText: '开始吧',
    })
      .then(() => {
        this.cameraInit()
        this.openCamera()
      })
  },
  async beforeUnmount() {
    (this.isCameraOpen = !1)
    window.cancelAnimationFrame(this.task)
    this.mesh && this.scene.remove(this.mesh)
    this.geometry && this.scene.remove(this.geometry)
    this.renderer && this.renderer.dispose()
    this.threeCamera = null
    this.camera && (await this.camera.stop())
  },
  methods: {
    isEmpty: e => isObjEmpty(e),
    tabsChange() {
      const e = this.tabsActive
      ;(this.meshIndex = -1)
      this.mesh && this.scene.remove(this.mesh)
      this.Object3D && (this.Object3D.visible = !1)
      this.geometry && this.scene.remove(this.geometry)
      e === 'stickers' && (this.meshList = this.meshListAll.filter(e => e.type !== 'model'))
      e === '3Dmodel' && (this.meshList = this.meshListAll.filter(e => e.type === 'model'))
    },
    async getData() {
      const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: '获取特效' })
      try {
        // const t = 'https://web-1254176432.cos.ap-shanghai.myqcloud.com/faceMesh/data.json'
        // const s = await fetch(`${t}?s=${new Date().getDate()}_${new Date().getHours()}`).then(e => e.json())
        // this.meshListAll = s
        this.tabsChange()
      }
      catch (e) {
        console.log('getData', e)
      }
      finally {
        t.clear()
      }
    },
    uploaderImage(e) {
      const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: 'loading' })
      s = window.URL && window.URL.createObjectURL(e)
      return (
        e.type.includes('image/')
          ? (this.meshList.push({ src: s, name: e.name }), this.meshListAll.push({ src: s, name: e.name }), t.clear())
          : (t.clear(), this.$toast(`图片格式错误-${e.type}`)),
        !1
      )
    },
    uploaderGlb(e) {
      const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: 'loading' })
      s = window.URL && window.URL.createObjectURL(e)
      return (
        e.name.includes('.glb')
          ? (this.meshListAll.push({ model: s, type: 'model', name: e.name }),
            this.meshList.push({ model: s, type: 'model', name: e.name }),
            t.clear())
          : (t.clear(), this.$toast(`格式错误-${e.type}`)),
        !1
      )
    },
    Create3dScene() {
      const e = this.canvasWidth
      const t = this.canvasHeight
      const s = this.$refs.video
      const n = this.$refs.canvas
      const i = new THREE.Scene()
      const r = new THREE.VideoTexture(s)
      const o = new THREE.Mesh(new THREE.PlaneGeometry(e, t), new THREE.MeshBasicMaterial({ map: r }))
      o.position.set(0, 0, -1e3)
      i.add(o)
      const a = new THREE.OrthographicCamera(e / -2, e / 2, t / 2, t / -2, 0, 2e3)
      a.position.set(0, 0, 1e3)
      a.lookAt(i.position)
      const c = new THREE.HemisphereLight(16777215, 16777215, 0.3)
      i.add(c)
      const l = new THREE.AmbientLight(16777215, 0.7)
      i.add(l)
      const h = new THREE.DirectionalLight(16777215, 0.7)
      h.position.set(0.5, 0, 0.866)
      i.add(h)
      const d = new THREE.WebGLRenderer({ canvas: n, alpha: !0, antialias: !0 })
      d.setPixelRatio(window.devicePixelRatio)
      d.setSize(e, t)
      this.scene = i
      this.threeCamera = a
      this.background = o
      this.renderer = d
      this.changeMesh()
    },
    changeMesh(e = 0) {
      if (e !== -1) {
        if (this.tabsActive === 'stickers') {
          const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: '加载贴图中' })
          try {
            this.mesh && this.scene.remove(this.mesh)
            this.geometry && this.scene.remove(this.geometry)
            const s = new THREE.BufferGeometry()
            s.setIndex(TRIANGULATION)
            s.setAttribute(
              'uv',
              new THREE.Float32BufferAttribute(
                UVS.map((e, t) => (t % 2 ? e : 1 - e)),
                2,
              ),
            )
            s.computeVertexNormals()
            this.geometry = s
            const n = new THREE.TextureLoader()
            const { src: i, srcX: r } = this.meshList[e]
            n.load(this.flipHorizontal ? i : r || i, (n) => {
              (n.encoding = THREE.sRGBEncoding)
              n.anisotropy = 16
              const i = new THREE.MeshBasicMaterial({
                map: n,
                transparent: !0,
                color: new THREE.Color(16777215),
                reflectivity: 0.5,
              })
              const r = new THREE.Mesh(s, i)
              this.scene.add(r)
              this.mesh = r
              this.meshIndex = e
              this.meshPopup = !1
              t.clear()
            })
          }
          catch (e) {
            console.log(e)
            t.clear()
            this.$toast('图片设置失败')
          }
        }
        if (this.tabsActive === '3Dmodel') {
          const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: '加载3D模型中' })
          try {
            const s = this.meshList[e].model
            const n = new GLTFLoader()
            const i = new THREE.Object3D()
            this.Object3D && this.scene.remove(this.Object3D)
            i.position.set(0, 0, 0)
            n.load(s, (s) => {
              const n = s.scene
              const r = new THREE.Box3().setFromObject(n)
              const o = (r.getSize(new THREE.Vector3()).length(), r.getCenter(new THREE.Vector3()))
              n.position.x += n.position.x - o.x
              n.position.y += n.position.y - o.y + 1
              n.position.z += n.position.z - o.z - 15
              i.add(n)
              this.scene.add(i)
              this.morphTarget = this.findMorphTarget(n)
              this.Object3D = i
              this.meshIndex = e
              this.meshPopup = false
              t.clear()
              console.log('面部动作', this.morphTarget)
            })
          }
          catch (e) {
            console.log(e)
            t.clear()
            this.$toast('图片设置失败')
          }
        }
      }
    },
    renderStickers(e) {
      e && this.updateGeometry(e)
      this.renderer.render(this.scene, this.threeCamera)
    },
    updateGeometry(e) {
      const t = this.canvasWidth
      const s = this.canvasHeight
      const n = this.resolveMesh(e.scaledMesh, t, s).reduce((e, t) => e.concat(t), [])
      this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(n, 3))
      this.geometry.attributes.position.needsUpdate = !0
    },
    track(e, t) {
      try {
        const s = t.midwayBetweenEyes[0]
        const n = this.getScale(t.scaledMesh, 234, 454)
        const i = this.getRotation(t.scaledMesh, 10, 50, 280)
        e.position.set(...s)
        e.scale.setScalar(n / 20)
        e.scale.x *= -1
        e.rotation.setFromRotationMatrix(i)
        e.rotation.y = -e.rotation.y
        e.rotateZ(Math.PI)
        e.rotateX(0.05 * -Math.PI)
        if (this.morphTarget) {
          this.morphTarget.leftEye && this.morphTarget.leftEye(1 - t.faceRig.eye.r)
          this.morphTarget.rightEye && this.morphTarget.rightEye(1 - t.faceRig.eye.l)
          this.morphTarget.mouth && this.morphTarget.mouth(t.faceRig.mouth.shape.A)
        }
      }
      catch (e) {}
    },
    trackHeartglasses(e, t) {
      try {
        const s = [168].map(e => t.faceMesh[e])[0]
        const n = this.getScale(t.scaledMesh, 234, 454)
        const i = this.getRotation(t.scaledMesh, 10, 50, 280)
        e.position.set(...s)
        e.scale.setScalar(n / 17)
        e.scale.x *= -1
        e.rotation.setFromRotationMatrix(i)
        e.rotation.y = -e.rotation.y
        e.rotateZ(Math.PI)
        e.rotateX(0.1 * -Math.PI)
      }
      catch (e) {
        console.log(e)
      }
    },
    findMorphTarget(e, t) {
      const s = {}
      const n = (e) => {
        if (e.type === 'Mesh' && e.morphTargetInfluences) {
          const t = e
          Object.keys(t.morphTargetDictionary).forEach((e) => {
            s[e] = (s) => {
              t.morphTargetInfluences[t.morphTargetDictionary[e]] = s
            }
          })
        }
        e.children.forEach(n)
      }
      n(e)
      return s
    },
    getScale(e, t = 0, s = 1) {
      const n = new THREE.Vector3(...e[t])
      const i = new THREE.Vector3(...e[s])
      return n.distanceTo(i)
    },
    getRotation(e, t = 0, s = 1, n = 2) {
      const i = new THREE.Vector3(...e[t])
      const r = new THREE.Vector3(...e[s])
      const o = new THREE.Vector3(...e[n])
      const a = new THREE.Matrix4()
      const c = r.clone().sub(o).normalize()
      const l = r.clone().add(o).multiplyScalar(0.5).sub(i).multiplyScalar(-1).normalize()
      const h = new THREE.Vector3().crossVectors(c, l).normalize()
      return a.makeBasis(c, l, h).invert()
    },
    render3D(e) {
      if (e) {
        const { calculateFun: t } = this.meshList[this.meshIndex] || {}
        this.isEmpty(t)
          ? this.track(this.Object3D, e)
          : t === 'Heartglasses' && this.trackHeartglasses(this.Object3D, e)
      }
      this.renderer.render(this.scene, this.threeCamera)
    },
    resolveMesh(e, t = this.canvasWidth, s = this.canvasHeight) {
      return e.map(e => [e[0] - t / 2, s / 2 - e[1], -e[2]])
    },
    async triggerToggleFlipHorizontal() {
      this.flipHorizontal = !this.flipHorizontal
      this.tabsActive === 'stickers' && this.changeMesh(this.meshIndex)
    },
    actionSelect(e) {
      const { deviceId: t } = e
      this.actionShow = !1
      if (isObjEmpty(t) || this.deviceId === t) {
        this.deviceId = t
        window.localStorage.setItem('deviceId', t)
        this.openCamera()
      }
    },
    async getMediaDevices() {
      const e = await this.camera.getMediaDevices()
      this.deviceList = e.map(
        e => ((e.name = e.label || e.deviceId), (e.color = e.deviceId == this.deviceId ? '#1989fa' : '#323233'), e),
      )
    },
    async cameraInit() {
      const e = this.$refs.video
      if (this.width > 960) {
        this.width = 960
        this.height = 540
      }
      this.camera = new Camera(e, {
        audio: !1,
        video: isPhone() ? { frameRate: 60 } : { width: this.width, height: this.height, frameRate: 60 },
      })
      await this.getMediaDevices()
    },
    openCamera() {
      const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: '打开摄像头' })
      this.isCameraOpen = !1
      this.camera.open(this.deviceId).then(async (e) => {
        const t = this.$refs.video
        const { videoWidth: s, videoHeight: n } = t
        const { clientWidth: i, clientHeight: r } = t
        this.canvasWidth = s
        this.canvasHeight = n
        t.style.width = `${s}px`
        t.style.height = `${n}px`
        this.$refs.wrapper.style.width = `${i}px`
        this.$refs.wrapper.style.height = `${(s / i) * r}px`
        this.isCameraOpen = !0
        if (e?.settings?.deviceId) {
          this.deviceId = e.settings.deviceId
          if (this.deviceList.filter(e => e.deviceId === this.deviceId).length === 0)
            this.deviceList.unshift({ color: '#1989fa', name: e.label || '[未知设备]', deviceId: this.deviceId })
          window.localStorage.setItem('deviceId', this.deviceId)
        }
        await this.createModel()
        this.Create3dScene()
        window.cancelAnimationFrame(this.task)
        this.task = window.requestAnimationFrame(this.recognition)
      })
        .catch((e) => {
          console.log(e)
          this.$dialog.alert({ title: '失败', message: `打开摄像头失败：${e.errMsg}`, theme: 'round-button' })
            .then(() => {
              // location.reload()
              this.openCamera()
            })
        })
        .finally(() => {
          t.clear()
        })
    },
    createModel() {
      return new Promise(async (resolve) => {
        this.modelLoad = !0
        const t = this.$toast.loading({ duration: 0, forbidClick: !0, message: '加载模型中' })
        await tf.setBackend('webgl')
        const s = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
        this.model = await faceLandmarksDetection.createDetector(s, {
          maxFaces: 1,
          refineLandmarks: !0,
          runtime: 'mediapipe',
          solutionPath: 'https://unpkg.com/@mediapipe/face_mesh',
        })
        t.clear()
        this.modelLoad = false
        resolve(this.model)
      })
    },
    async recognition() {
      try {
        if (this.isCameraOpen && !this.modelLoad && !this.isPause) {
          const s = this.$refs.video
          const n = await this.model.estimateFaces(s, { flipHorizontal: !1 })
          if (this.tabsActive === 'stickers') {
            if (n.length > 0) {
              const e = n[0].keypoints
              this.renderStickers({
                scaledMesh: e.reduce((e, t) => {
                  e.push([t.x, t.y, t.z])
                  return e
                }, []),
              })
            }
            else { this.renderStickers({ scaledMesh: [] }) }
          }
          if (this.tabsActive === '3Dmodel') {
            if (n.length > 0) {
              // eslint-disable-next-line vars-on-top, no-var
              var t = (e = n[0].keypoints).reduce((e, t) => (e.push([t.x, t.y, t.z]), e), [])
              const i = this.resolveMesh(t)
              const r = Kalidokit.Face.solve(e, {
                runtime: 'mediapipe',
                video: s,
                imageSize: { height: this.canvasHeight, width: this.canvasWidth },
                smoothBlink: !1,
                blinkSettings: [0.25, 0.75],
              })
              this.Object3D && (this.Object3D.visible = !0)
              this.render3D({ midwayBetweenEyes: [168].map(e => i[e]), scaledMesh: t, faceMesh: i, faceRig: r })
            }
            else {
              this.Object3D && (this.Object3D.visible = !1)
              this.renderer.render(this.scene, this.threeCamera)
            }
          }
        }
        this.task = window.requestAnimationFrame(this.recognition)
      }
      catch (e) {
        console.error(e)
        this.task = window.requestAnimationFrame(this.recognition)
      }
    },
  },
}
</script>

<template>
  <div class="faceMesh">
    <div ref="wrapper" class="canvas-wrapper">
      <video
        ref="video"
        :style="{ transform: flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
        webkit-playsinline="true" playsinline="true" preload autoplay loop muted
      />
      <canvas
        ref="canvas"
        :style="{ transform: flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
        :width="canvasWidth" :height="canvasHeight"
      />
    </div>
    <!-- 切换摄像头 -->
    <van-action-sheet
      v-model="actionShow" :actions="deviceList" description="请选择设备" cancel-text="取消"
      close-on-click-action @select="actionSelect"
    />
    <!-- 切换摄像头 -->

    <div class="btn-group">
      <van-button type="default" native-type="button" size="small" icon="photograph" @click="actionShow = true">
        切换摄像头
      </van-button>
      <van-button type="default" native-type="button" size="small" icon="smile" @click="meshPopup = true">
        选择特效
      </van-button>
      <van-button
        type="default" native-type="button" size="small" :icon="flipHorizontal ? 'ascending' : 'descending'"
        class="flipHorizontalBut" @click="triggerToggleFlipHorizontal"
      >
        切换镜像
      </van-button>
    </div>

    <!-- 选择特效 -->
    <van-popup
      v-model:show="meshPopup" class="meshPopup" position="bottom" :style="{ height: '80%', width: '100%' }" round
      closeable
    >
      <h2 class="meshPopup-title van-hairline--bottom">
        选择特效
      </h2>
      <van-tabs v-model="tabsActive" type="card" @change="tabsChange">
        <van-tab name="stickers" title="贴纸" />
        <!-- <van-tab name="3Dmodel" title="3D模型" /> -->
      </van-tabs>
      <div class="scrollbar-y" style="height: calc(100% - 55px - 30px);background-color: #f7f8fa;">
        <div class="meshList">
          <div
            v-for="(item, index) in meshList" :key="index" class="meshList-item"
            :class="{ meshAction: meshIndex === index }" @click="meshIndex !== index && changeMesh(meshIndex = index)"
          >
            <van-image :src="item.src" fit="cover" />
            <div v-if="item.name" class="meshName van-ellipsis" v-text="item.name" />
          </div>
          <div v-if="tabsActive === 'stickers'" class="meshList-item">
            <van-uploader :before-read="uploaderImage" preview-size="100px" accept="image/*" />
            <div class="uploader-text">
              <div>
                <van-icon name="photograph" />
                <p>上传图片</p>
              </div>
            </div>
          </div>
          <!-- <div v-if="tabsActive === '3Dmodel'" class="meshList-item">
            <van-uploader :before-read="uploaderGlb" preview-size="100px" accept="*" />
            <div class="uploader-text">
              <div>
                <van-icon name="photograph" />
                <p>上传glb模型</p>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </van-popup>
    <!-- 选择特效 -->
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
