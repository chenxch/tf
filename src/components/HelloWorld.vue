<script setup>
import { ref, onMounted } from 'vue'
import { Toast, Dialog } from 'vant';
import { isPhone, isObjEmpty } from './utils'
import { Camera } from './Camera'
const camera = ref()
const width = ref(document.documentElement.clientWidth || window.innerWidth)
const height = ref(document.documentElement.clientHeight || window.innerHeight)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const actionShow = ref(false)
const deviceList = ref([])
const isCameraOpen = ref(false)
const task = null
const model = null
const modelLoad = true
const deviceId = ref(localStorage.getItem('deviceId') || 'user')
let flipHorizontal = false
let scene = null
let threeCamera = null
let renderer = null
let geometry = null
let background = null
let mesh = null
let Object3D = null
let morphTarget = null
let meshPopup = false
let meshIndex = true
const meshListAll = ref([
{
    "name": "敬过往祈新年",
    "src": "https://dcdn.it120.cc/2022/12/14/cb57d900-8597-4c70-b34d-2966dc428bc7.png",
    "srcX": "https://dcdn.it120.cc/2022/12/14/3f1e0c82-3455-4896-9ea3-d19541db52be.png"
},
{
    "name": "彩色贴纸",
    "src": "https://dcdn.it120.cc/2022/12/06/795dea0b-76e9-48b8-a162-20b29d2731a7.png"
},
{
    "name": "3D面部贴纸",
    "src": "https://dcdn.it120.cc/2022/12/09/770e9c62-2fb6-4899-8b3e-93437cbaddfb.png"
},

{
    "name": "小可爱",
    "src": "https://dcdn.it120.cc/2022/12/06/58158efb-6138-4df8-9986-bc0bdea4de08.png"
},
{
    "name": "小雀斑",
    "src": "https://dcdn.it120.cc/2022/12/06/ce3bf4bc-311f-49f4-82ff-96f9a045557e.png"
},
{
    "name": "掘金",
    "src": "https://dcdn.it120.cc/2022/12/07/6e3fb315-fbbd-4cba-8102-2744161cfb50.png"
},
{
    "name": "大红唇+睫毛膏",
    "src": "https://dcdn.it120.cc/2022/12/07/9a31a6ac-ac04-40df-b890-af64ca3ae33a.png"
},
{
    "name": "眼影",
    "src": "https://dcdn.it120.cc/2022/12/07/fb96a09a-0d58-4365-b3f8-57054168517c.png"
},
{
    "name": "中国国旗",
    "src": "https://dcdn.it120.cc/2022/12/07/dac52247-8c04-420f-84e6-26fc4b430b5e.png"
},
{
    "name": "眼镜",
    "src": "https://dcdn.it120.cc/2022/12/09/62fcfd9a-191e-4a9d-9c6a-b99e92ef7512.png"
},
{
    "name":"猪头",
    "type": "model",
    "src":"https://dcdn.it120.cc/2022/12/07/e64174b8-a96c-4f36-9b70-9ed5c952f4df.png",
    "model":"https://dcdn.it120.cc/2022/12/07/55607c9c-1aaa-494a-b332-6a5360933c4a.glb"
},
{
    "name":"大象",
    "type": "model",
    "src":"https://dcdn.it120.cc/2022/12/07/208ccc82-94db-4aab-a431-c7531ec190a3.png",
    "model":"https://dcdn.it120.cc/2022/12/07/4c4096b0-fd19-4a1b-886c-7b263c35dfe9.glb"
},
{
    "name":"小狗",
    "type": "model",
    "src":"https://dcdn.it120.cc/2022/12/07/bb97bbff-3799-4a16-88f9-527495859e0d.png",
    "model":"https://dcdn.it120.cc/2022/12/07/2204b6c9-e334-4e56-b056-2fe19ca7a578.glb"
},
{
    "name":"猴子",
    "type": "model",
    "src":"https://dcdn.it120.cc/2022/12/07/38c7776f-8604-45fc-bc4e-60435bc03f6e.png",
    "model":"https://dcdn.it120.cc/2022/12/07/92fbd0de-9d5f-449e-999f-709e7eb0cc63.glb"
},
{
    "name":"爱心眼镜",
    "calculateFun":"Heartglasses",
    "type": "model",
    "src":"https://dcdn.it120.cc/2022/12/07/e6fa3b86-863c-4d6e-844c-0e1cd03bf32c.png",
    "model":"https://dcdn.it120.cc/2022/12/07/752de96c-bc3f-4fab-b73f-12626dad8977.glb"
},
{
    "name": "防护眼镜(test)",
    "calculateFun":"Heartglasses",
    "type": "model",
    "src": "https://dcdn.it120.cc/2022/12/13/cf78108d-3511-4c65-9502-3c92e7d4a312.png",
    "model": "https://dcdn.it120.cc/2022/12/13/40e7af5b-97a5-45a1-8944-f172f6e04fa3.glb"
}
])
let meshList = []
let helpTextModel =['0']
let tabsActive = 'stickers'
const video = ref()
const wrapper = ref()

const isEmpty = (e) => {
  return isObjEmpty(e)
}

const getMediaDevices = async() => {
      let e = await camera.getMediaDevices()
      deviceList.value = e.map(
        e => ((e.name = e.label || e.deviceId), (e.color = e.deviceId == deviceId.value ? '#1989fa' : '#323233'), e)
      )
    }
const cameraInit = async()=> {
      const e = video.value
      if(width.value > 960){
        width.value === 960
        height.value = 540
      }
      camera.value = new Camera(e, {
          audio: !1,
          video: isPhone() ? { frameRate: 60 } : { width: width.value, height: height.value, frameRate: 60 }
        })
      await getMediaDevices()
}

function openCamera() {
      const e = this.$toast.loading({ duration: 0, forbidClick: !0, message: '打开摄像头' })
      isCameraOpen.value = false
      camera.value
          .open(deviceId.value)
          .then(async e => {
            const t = vidoe.value
            const  { videoWidth: s, videoHeight: n } = t
            const  { clientWidth: i, clientHeight: r } = t
            canvasWidth.value = s
            canvasHeight.value = n
            t.style.width = s + 'px'
            t.style.height = n + 'px'
              wrapper.value.style.width = i + 'px'
              wrapper.value.style.height = (s / i) * r + 'px'
            isCameraOpen.value = true
              if(deviceId.value === e?.settings?.deviceId) {
                if(0 === deviceList.value.filter(e => e.deviceId == deviceId.value).length)
                  deviceList.value.unshift({ color: '#1989fa', name: e.label || '[未知设备]', deviceId: this.deviceId }),
                window.localStorage.setItem('deviceId', deviceId.value)
              }
              await this.createModel(),
              this.Create3dScene(),
              window.cancelAnimationFrame(this.task),
              (this.task = window.requestAnimationFrame(this.recognition))
          })
          .catch(e => {
            console.log(e),
            Dialog
                .alert({ title: '失败', message: `打开摄像头失败：${e.errMsg}`, theme: 'round-button' })
                .then(() => {
                  location.reload()
                })
          })
          .finally(() => {
            e.clear()
          })
    }

onMounted(async ()=>{
  if(isPhone() && flipHorizontal === true){
    Dialog
        .alert({
          message:
            '\n                <div class="prompt-text">\n                    <h5>AR面部特效</h5>\n                    <ol>\n                        <li>首次模型加载模型可能需要1-2分钟，请耐心等待</li>\n                        <li>需要打开摄像头，（不会把您的摄像头信息上传到服务端）</li>\n                        <li>打开摄像头后如发现摄像头是镜像，可点击“切换镜像”。</li>\n                    </ol>\n                </div>',
          theme: 'round-button',
          className: 'helpdialog',
          confirmButtonText: '开始吧'
        })
        .then(() => {
          cameraInit()
          openCamera()
        })
  }
      
})
</script>

<template>
  <div class="faceMesh">
    <div class="canvas-wrapper" ref="wrapper">
      <video ref="video"
        :style="{ 'transform': flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
        webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
      <canvas ref="canvas"
        :style="{ 'transform': flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
        :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
    <!-- 切换摄像头 -->
    <van-action-sheet v-model="actionShow" :actions="deviceList" description="请选择设备" @select="actionSelect"
      cancel-text="取消" close-on-click-action>
    </van-action-sheet>
    <!-- 切换摄像头 -->

    <div class="btn-group">
      <van-button type="default" native-type="button" size="small" icon="photograph" @click="actionShow = true">切换摄像头
      </van-button>
      <van-button type="default" native-type="button" size="small" icon="smile" @click="meshPopup = true">选择特效
      </van-button>
      <van-button type="default" native-type="button" size="small" :icon="flipHorizontal?'ascending':'descending'"
        @click="triggerToggleFlipHorizontal" class="flipHorizontalBut">切换镜像</van-button>
    </div>

    <!-- 选择特效 -->
    <van-popup class="meshPopup" v-model="meshPopup" position="bottom" :style="{ height: '80%',width:'100%' }" round
      closeable>
      <h2 class="meshPopup-title van-hairline--bottom">选择特效</h2>
      <van-tabs type="card" v-model="tabsActive" @change="tabsChange">
        <van-tab name="stickers" title="贴纸"></van-tab>
        <van-tab name="3Dmodel" title="3D模型"></van-tab>
      </van-tabs>
      <div class="scrollbar-y" style="height: calc(100% - 55px - 30px);background-color: #f7f8fa;">
        <div class="meshList">
          <div class="meshList-item" v-for="(item,index) in meshList" :key="index"
            :class="{meshAction:meshIndex===index}" @click="meshIndex!=index && changeMesh(meshIndex=index)">
            <van-image :src="item.src" fit="cover"></van-image>
            <div class="meshName van-ellipsis" v-if="item.name" v-text="item.name"></div>
          </div>
          <div class="meshList-item" v-if="tabsActive==='stickers'">
            <van-uploader :before-read="uploaderImage" preview-size="100px" accept="image/*">
            </van-uploader>
            <div class="uploader-text">
              <div>
                <van-icon name="photograph" />
                <p>上传图片</p>
              </div>
            </div>
          </div>
          <div class="meshList-item" v-if="tabsActive==='3Dmodel'">
            <van-uploader :before-read="uploaderGlb" preview-size="100px" accept="*"></van-uploader>
            <div class="uploader-text">
              <div>
                <van-icon name="photograph" />
                <p>上传glb模型</p>
              </div>
            </div>
          </div>
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
