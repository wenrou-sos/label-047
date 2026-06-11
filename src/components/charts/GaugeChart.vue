<template>
  <VChart :option="chartOption" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart as GaugeChartType } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'

use([CanvasRenderer, GaugeChartType, TitleComponent, TooltipComponent])

const props = withDefaults(defineProps<{
  value: number
  title: string
  color?: string
}>(), {
  color: '#22d3ee'
})

const chartOption = computed(() => ({
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '90%',
      progress: {
        show: true,
        width: 14,
        roundCap: true,
        itemStyle: { color: props.color }
      },
      pointer: {
        length: '55%',
        width: 5,
        itemStyle: { color: props.color }
      },
      axisLine: {
        lineStyle: {
          width: 14,
          color: [[1, '#1e293b']]
        },
        roundCap: true
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      anchor: {
        show: true,
        size: 12,
        itemStyle: { color: props.color, borderColor: '#0f172a', borderWidth: 2 }
      },
      title: {
        offsetCenter: [0, '70%'],
        fontSize: 13,
        color: '#94a3b8'
      },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, '35%'],
        fontSize: 32,
        fontWeight: 'bold',
        color: '#e2e8f0',
        formatter: '{value}%'
      },
      data: [{ value: props.value, name: props.title }]
    }
  ],
  animationDuration: 1500,
  animationEasing: 'cubicOut'
}) as any)
</script>
