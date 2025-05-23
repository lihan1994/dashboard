<template>
  <a v-if="isLink && !inBaseDialog" @click="clickHandle"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
import * as R from 'ramda'
import { hasPermission } from '@/utils/auth'
import config from './config/index.js'

export default {
  name: 'SidePageTrigger',
  props: {
    vm: {
      type: Object,
    },
    list: {
      type: Object,
    },
    name: {
      type: String,
    },
    id: {
      type: String,
    },
    tab: {
      type: String,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    permission: {
      type: String,
    },
    noStore: {
      type: Boolean,
    },
    init: Boolean,
  },
  inject: {
    // 是否处于List中
    inList: {
      default: false,
    },
    // 是否处于SidePage中
    inBaseSidePage: {
      default: false,
    },
    // 是否处于Dialog中
    inBaseDialog: {
      default: false,
    },
  },
  computed: {
    isLink () {
      if (this.noStore) return true // 兼容在http.js那的notification里面调用此组件，会有获取不到this.$store的报错
      const { globalSidePages } = this.$store.state.common
      return hasPermission({ key: this.permission }) && (globalSidePages.names.indexOf(this.name) > -1 || !this.name)
    },
  },
  methods: {
    handlePropsTrigger () {
      this.$emit('trigger')
    },
    clickHandle () {
      if (this.$listeners.trigger) {
        this.updateSidepageLeft()
        this.handlePropsTrigger()
        return
      }

      if (this.name && this.id && this.vm) {
        this.updateSidepageLeft()
        const { name, id, vm, options, list, tab, params, init } = this
        vm.sidePageTriggerHandle(vm, name, {
          id,
          ...config[name],
          ...options,
        }, {
          list,
          ...params,
          tab,
        })

        if (!init && tab) {
          vm.initSidePageTab(tab)
        }
      }
    },
    findPageListTableByParent (vm) {
      if (vm.$options._componentTag === 'vxe-table') {
        return vm
      }
      if (vm.$parent) {
        return this.findPageListTableByParent(vm.$parent)
      }
    },
    updateSidepageLeft () {
      if (!this.inBaseSidePage && this.inList && this.$parent.field) {
        // column 的 right 值只需查找一次，查找后进行缓存，后续直接使用缓存
        if (!this.columnRightTemp) {
          const table = this.findPageListTableByParent(this.$parent)
          if (table) {
            const columns = table.getColumns()
            const minWidth = 800
            const firstColumn = columns.length > 1 ? columns[1] : null
            const fieldColumn = R.find(R.propEq('property', this.$parent.field))(columns)
            const colId = fieldColumn.id
            const $column = table.$el.querySelector(`.vxe-table--main-wrapper .vxe-table--body-wrapper .vxe-body--column[data-colid=${colId}]`)
            const columnRect = $column.getBoundingClientRect()
            let rightTemp = columnRect.right
            // 如果列宽超过150，则抽屉展开的位置定位在距离列150的位置
            if (columnRect.width > 150) {
              rightTemp = columnRect.left + 150
            }
            // 避免sidepage宽度太窄
            if (window.innerWidth - rightTemp < minWidth && firstColumn) {
              const colId = firstColumn.id
              const $firstColumn = table.$el.querySelector(`.vxe-table--main-wrapper .vxe-table--body-wrapper .vxe-body--column[data-colid=${colId}]`)
              const firstRect = $firstColumn.getBoundingClientRect()
              rightTemp = firstRect.left + 150
            }
            this.columnRightTemp = rightTemp
          }
        }
        this.$store.dispatch('sidePage/updateSidepageLeft', this.columnRightTemp)
      }
    },
  },
}
</script>
