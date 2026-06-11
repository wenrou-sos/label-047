<template>
  <VChart :option="chartOption" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent])

interface RepairData {
  month: string
  count: number
}

const props = defineProps<{
  data: RepairData[]
}>()

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    textStyle: { color: '#cbd5e1' },
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(34, 211, 238, 0.06)' } }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '8%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.month),
    axisLine: { lineStyle: { color: '#334155' } },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    axisLabel: { color: '#94a3b8', fontSize: 11 }
  },
  animationDuration: 1200,
  animationEasing: 'cubicOut',
  animationDelay: (idx: number) => idx * 80,
  series: [
    {
      type: 'bar',
      data: props.data.map(d => d.count),
      barWidth: '50%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#22d3ee' },
            { offset: 1, color: '#0891b2' }
          ]
        }
      },
      emphasis: {
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#67e8f9' },
              { offset: 1, color: '#22d3ee' }
            ]
          }
        }
      }
    }
  ]
}) as any)
</script>
