<template>
  <VChart :option="chartOption" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const props = defineProps<{
  paid: number
  unpaid: number
  partial: number
}>()

const total = computed(() => props.paid + props.unpaid + props.partial)

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    textStyle: { color: '#cbd5e1' },
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    bottom: 0,
    textStyle: { color: '#94a3b8' },
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16
  },
  animationDuration: 1000,
  animationEasing: 'cubicOut',
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#0f172a',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#cbd5e1' }
      },
      data: [
        { value: props.paid, name: '已支付', itemStyle: { color: '#34d399' } },
        { value: props.unpaid, name: '未支付', itemStyle: { color: '#f87171' } },
        { value: props.partial, name: '部分支付', itemStyle: { color: '#fbbf24' } }
      ]
    },
    {
      type: 'pie',
      radius: ['0%', '0%'],
      center: ['50%', '45%'],
      silent: true,
      label: {
        show: true,
        position: 'center',
        formatter: `{a|${total.value}}\n{b|总计}`,
        rich: {
          a: { fontSize: 28, fontWeight: 'bold', color: '#e2e8f0', lineHeight: 36 },
          b: { fontSize: 12, color: '#94a3b8', lineHeight: 20 }
        }
      },
      data: [{ value: 1 }]
    }
  ]
}) as any)
</script>
