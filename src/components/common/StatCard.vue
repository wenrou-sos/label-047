<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: any
  gradient?: string
}>()

const gradientClass = props.gradient || 'from-cyan-500/10 to-cyan-600/5'
const iconColorClass = props.gradient?.includes('emerald')
  ? 'text-emerald-400'
  : props.gradient?.includes('amber')
    ? 'text-amber-400'
    : props.gradient?.includes('rose')
      ? 'text-rose-400'
      : 'text-cyan-400'
</script>

<template>
  <div :class="['relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 transition-all duration-300 hover:border-slate-600/50 hover:shadow-lg hover:shadow-cyan-500/5 group']">
    <div :class="['absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', gradientClass]" />
    <div class="relative z-10">
      <div class="flex items-start justify-between">
        <div class="space-y-2">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">{{ title }}</p>
          <p class="text-2xl font-bold text-white font-mono">{{ value }}</p>
        </div>
        <div v-if="icon" :class="['p-2.5 rounded-lg bg-slate-800/80', iconColorClass]">
          <component :is="icon" class="w-5 h-5" />
        </div>
      </div>
      <div v-if="subtitle || trend" class="flex items-center gap-1.5 mt-3">
        <div v-if="trend === 'up'" class="flex items-center gap-0.5 text-emerald-400">
          <TrendingUp class="w-3.5 h-3.5" />
          <span class="text-xs font-medium">{{ trendValue }}</span>
        </div>
        <div v-else-if="trend === 'down'" class="flex items-center gap-0.5 text-rose-400">
          <TrendingDown class="w-3.5 h-3.5" />
          <span class="text-xs font-medium">{{ trendValue }}</span>
        </div>
        <div v-else-if="trend === 'neutral'" class="flex items-center gap-0.5 text-slate-400">
          <Minus class="w-3.5 h-3.5" />
          <span class="text-xs font-medium">{{ trendValue }}</span>
        </div>
        <span v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</span>
      </div>
    </div>
  </div>
</template>
