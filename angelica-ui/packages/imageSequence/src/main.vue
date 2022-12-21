<template>
  <div ref="canvasWrapRef">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    <slot></slot>
  </div>
</template>

<script>
import resizeDetector from "element-resize-detector";

const imgCache = {};
function loadImg(src, cb) {
  if (imgCache[src]) {
    cb(imgCache[src]);
    return;
  }
  const img = document.createElement("img");
  img.onerror = function () {
    delete imgCache[src];
    cb(null);
  };
  img.onload = function () {
    cb(img);
  };
  img.src = src;
  imgCache[src] = img;
}

/**
 * @file 渲染图片序列
 */
export default {
  name: "ImageSequence",
  props: {
    source: { type: Array, default: () => [] },
    immediate: { type: Boolean, default: true },
    resizeListener: { type: Boolean, default: true },
  },
  data: () => ({
    canvasWidth: null,
    canvasHeight: null,
    sequenceIdx: -1,
    sequenceTimer: 0,
    playCount: 0,
    toNext: true,
    timer: "",
  }),
  mounted() {
    const { immediate, resizeListener } = this;
    this.updateCanvasSize();
    immediate && this.startAnimation();
    if (resizeListener) {
      const rd = resizeDetector();
      rd.listenTo(
        this.$refs.canvasWrapRef,
        ({ offsetWidth, offsetHeight, ...args }) => {
          this.canvasWidth = offsetWidth;
          this.canvasHeight = offsetHeight;
        }
      );
      this.$once("hook:beforeDestroy", () => {
        rd.uninstall(this.$refs.canvasWrapRef);
      });
    }
  },
  beforeDestroy() {
    this.stopAnimation();
  },
  watch: {
    source() {
      this.sequenceIdx = -1;
      this.playCount = 0;
    },
  },
  methods: {
    /**
     * 更新 canvas 宽高
     */
    updateCanvasSize() {
      if (!this.$refs.canvasRef) return;
      const { width, height } = this.$refs.canvasRef.getBoundingClientRect();
      this.canvasWidth = width;
      this.canvasHeight = height;
    },
    /**
     * 开始动画
     * @param {boolean} anewFlag? 是否重新开始
     */
    startAnimation(anewFlag) {
      this.stopAnimation();
      let _this = this;
      anewFlag && (this.sequenceIdx = -1);
      const loop = () => {
        clearInterval(this.timer);
        this.updateSequenceImage();
        _this.timer = setInterval(() => {
          this.sequenceTimer = window.requestAnimationFrame(loop);
        }, 40);
      };
      loop();
    },
    /**
     * 停止动画
     */
    stopAnimation() {
      const { sequenceTimer } = this;
      sequenceTimer && window.cancelAnimationFrame(sequenceTimer);
    },
    /**
     * 更新图片序列
     */
    updateSequenceImage() {
      const { source, sequenceIdx, toNext } = this;
      // 等待图片加载完才能进入下一个张图片
      if (!toNext) return;
      const idx = (this.sequenceIdx = (sequenceIdx + 1) % source.length);
      if (sequenceIdx !== -1 && (this.sequenceIdx + 1) % source.length === 0) {
        this.playCount += 1;
        this.$emit("complete");
      }
      this.toNext = false;
      loadImg(source[idx], (img) => {
        this.toNext = true;
        if (img) {
          // 只渲染最新的
          // if (this.sequenceIdx === idx) {
          const canvasRef = this.$refs.canvasRef;
          if (!canvasRef) return;
          const { width, height } = canvasRef;

          const ctx = canvasRef.getContext("2d");
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // }
        } else {
          this.sequenceIdx && (this.sequenceIdx -= 1);
        }
      });
    },
  },
};
</script>
