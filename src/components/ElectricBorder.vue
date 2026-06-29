<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: true },
  color: { type: String, default: '#7df9ff' },
  speed: { type: Number, default: 1 },
  chaos: { type: Number, default: 0.5 },
  thickness: { type: Number, default: 2 },
  borderRadius: { type: Number, default: 20 },
})

const container = ref(null)
const canvas = ref(null)
let frame = 0
let resizeObserver
let startedAt = 0

function noise(value, time) {
  return Math.sin(value * 2.17 + time) * 0.5 + Math.sin(value * 5.73 - time * 1.4) * 0.3 + Math.sin(value * 11.1 + time * 0.7) * 0.2
}

function roundedPoint(t, width, height, radius) {
  const straightW = width - radius * 2
  const straightH = height - radius * 2
  const arc = Math.PI * radius / 2
  const perimeter = straightW * 2 + straightH * 2 + arc * 4
  let distance = t * perimeter
  const corner = (cx, cy, start, progress) => ({ x: cx + radius * Math.cos(start + progress * Math.PI / 2), y: cy + radius * Math.sin(start + progress * Math.PI / 2) })
  if (distance <= straightW) return { x: radius + distance, y: 0 }
  distance -= straightW
  if (distance <= arc) return corner(width - radius, radius, -Math.PI / 2, distance / arc)
  distance -= arc
  if (distance <= straightH) return { x: width, y: radius + distance }
  distance -= straightH
  if (distance <= arc) return corner(width - radius, height - radius, 0, distance / arc)
  distance -= arc
  if (distance <= straightW) return { x: width - radius - distance, y: height }
  distance -= straightW
  if (distance <= arc) return corner(radius, height - radius, Math.PI / 2, distance / arc)
  distance -= arc
  if (distance <= straightH) return { x: 0, y: height - radius - distance }
  distance -= straightH
  return corner(radius, radius, Math.PI, distance / arc)
}

function draw(now) {
  if (!props.active || !container.value || !canvas.value) return
  const rect = container.value.getBoundingClientRect()
  const pad = 18
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = rect.width + pad * 2
  const height = rect.height + pad * 2
  if (canvas.value.width !== Math.round(width * dpr) || canvas.value.height !== Math.round(height * dpr)) {
    canvas.value.width = Math.round(width * dpr)
    canvas.value.height = Math.round(height * dpr)
    canvas.value.style.width = `${width}px`
    canvas.value.style.height = `${height}px`
  }
  const ctx = canvas.value.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  const time = ((now - startedAt) / 1000) * props.speed
  const borderW = rect.width
  const borderH = rect.height
  const samples = Math.max(160, Math.round((borderW + borderH) * 1.4))
  ctx.beginPath()
  for (let i = 0; i <= samples; i++) {
    const progress = i / samples
    const point = roundedPoint(progress, borderW, borderH, Math.min(props.borderRadius, borderW / 2, borderH / 2))
    const displacement = noise(progress * 26, time * 4) * props.chaos * 5
    const x = pad + point.x + displacement
    const y = pad + point.y + noise(progress * 26 + 9, time * 4) * props.chaos * 5
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  }
  ctx.closePath()
  ctx.strokeStyle = props.color
  ctx.lineWidth = props.thickness
  ctx.shadowColor = props.color
  ctx.shadowBlur = 10
  ctx.stroke()
  ctx.shadowBlur = 22
  ctx.globalAlpha = 0.55
  ctx.stroke()
  ctx.globalAlpha = 1
  frame = requestAnimationFrame(draw)
}

function restart() {
  cancelAnimationFrame(frame)
  if (!props.active) {
    canvas.value?.getContext('2d')?.clearRect(0, 0, canvas.value.width, canvas.value.height)
    return
  }
  startedAt = performance.now()
  frame = requestAnimationFrame(draw)
}

onMounted(() => {
  resizeObserver = new ResizeObserver(restart)
  resizeObserver.observe(container.value)
  restart()
})
watch(() => [props.active, props.color, props.speed, props.chaos], restart)
onBeforeUnmount(() => { cancelAnimationFrame(frame); resizeObserver?.disconnect() })
</script>

<template>
  <div ref="container" class="electric-border" :class="{ active }" :style="{ borderRadius: `${borderRadius}px`, '--electric-color': color }">
    <canvas ref="canvas" aria-hidden="true"></canvas>
    <div class="electric-content"><slot /></div>
  </div>
</template>

<style scoped>
.electric-border { position: relative; isolation: isolate; }
.electric-content { position: relative; z-index: 1; border-radius: inherit; }
canvas { position: absolute; z-index: 3; top: 50%; left: 50%; display: block; pointer-events: none; transform: translate(-50%, -50%); }
.active::before { content: ''; position: absolute; z-index: 0; inset: -2px; border-radius: inherit; background: var(--electric-color); opacity: .22; filter: blur(14px); animation: border-breathe 1.1s ease-in-out infinite alternate; }
@keyframes border-breathe { to { opacity: .52; filter: blur(20px); } }
</style>
