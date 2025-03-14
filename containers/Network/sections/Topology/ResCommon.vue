<template>
  <div class="res-container d-flex justify-content-center align-items-center" :class="{'is-exist': isExist, 'res-container-host': showSchedTag, 'res-last': isLast}">
    <span class="line" :class="{'full': multiple}" />
    <div :class="{'common-left-line': showLeftLine}" />
    <div class="res d-flex" :class="{'res-host': showSchedTag, 'res-running': type === 'vminstance' && ((resSource.status || resSource.status) === 'running')}">
      <a-tooltip placement="top" :get-popup-container="getPopupContainer">
        <template slot="title">
          <p class="title">{{ $t('network.topology.res_type.' + getType(resSource)) }}</p>
          <p>{{ $t('common.name') }}：{{ getName(resSource) }}</p>
          <p v-if="type !== 'gpu'">{{ $t('common.status') }}：{{ getStatus(resSource) }}</p>
          <template v-if="type === 'vminstance'">
            <p>{{ $t('network.waf.rule_ip') }}：{{ resSource.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'lb'">
            <p>{{ $t('network.text_248') }}：{{ resSource.ip_addr }}</p>
          </template>
          <template v-else-if="type === 'host'">
            <p v-for="(obj, idx) in resSource.networks" :key="idx">{{ $t('network.waf.rule_ip') }}：{{ obj.ip_addr }}</p>
            <div v-for="(obj, idx) in resSource.storages" :key="idx">
              <p>{{ `${$t('network.text_708')}${$t('common.name')}`}}：{{obj.name}}</p>
              <p>{{$t('storage.text_38')}}：{{getStorageType(obj.storage_type)}}</p>
              <p>{{$t('storage.text_155')}}：{{getStorageSize(obj.capacity_mb)}}</p>
            </div>
          </template>
          <template v-else-if="type === 'baremetal'">
            <p v-for="(obj, idx) in resSource.networks" :key="idx">{{ $t('network.waf.rule_ip') }}：{{ obj.ip_addr }}</p>
          </template>
          <template v-if="showSchedTag && resSchedTags.length">
            <p>{{ $t('dictionary.schedtag') }}：</p>
            <div class="tag-list d-flex align-items-center flex-wrap">
              <template v-for="(item,index) in resSchedTags">
                <div class="tag" :key="index" :style="{background: item.background}">{{item.name}}</div>
              </template>
            </div>
          </template>
          <p v-for="(obj, idx) in extraShowList" :key="idx">{{ obj.label }}：{{ obj.value }}</p>
        </template>
        <div class="d-flex">
          <icon v-if="!showSchedTag && !showStorage" :type="iconType" />
          <div v-else class="res-box;">
            <icon :type="iconType" class="mt-2 mb-1" style="border:none;font-size:40px;" />
            <div class="tag-list tag-list-limit d-flex align-items-center flex-wrap justify-content-center">
              <template v-if="showStorageTag">
                <div v-for="(item,index) in resStorages" class="tag storage-tag" :key="index" :style="{background: item.background}">{{item.name}}</div>
              </template>
              <template v-for="(item,index) in resSchedTags">
                <div class="tag" :key="index" :style="{background: item.background}" v-if="index<2">{{item.name}}</div>
              </template>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="name text-truncate ml-1 pt-2">{{ getName(resSource) }}</span>
          </div>
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import ResMixin from '@Network/sections/Topology/ResMixin'
import { sizestr } from '@/utils/utils'
import { STORAGE_TYPES } from '@Storage/constants/index.js'
import { STATUS_MAP, COLORS } from './constants'
export default {
  name: 'ResCommon',
  mixins: [ResMixin],
  props: {
    dataSource: Object,
    multiple: Boolean,
    type: String,
    isExist: Boolean,
    schedTagColorsMap: Object,
    showStorageTag: {
      type: Boolean,
      default: false,
    },
    isLast: {
      type: Boolean,
      default: false,
    },
    extraShowList: {
      type: Array,
      default: () => [],
    },
    showLeftLine: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {}
  },
  computed: {
    showSchedTag () {
      return this.type === 'host' || this.type === 'baremetal'
    },
    showStorage () {
      return this.type === 'host'
    },
    iconType () {
      return `res-${this.type}`
    },
    resSource () {
      return this.dataSource || {}
    },
    resSchedTags () {
      const tags = []
      const { schedtags = [] } = this.resSource
      schedtags.map((item, index) => {
        const tag = {
          name: item.name,
          background: '#ccc',
        }
        if (this.schedTagColorsMap && this.schedTagColorsMap[item.name]) {
          tag.background = this.schedTagColorsMap[item.name]
        }
        tags.push(tag)
      })
      tags.sort((a, b) => {
        return a.name.length - b.name.length
      })
      return tags
    },
    resStorages () {
      const { storages = [] } = this.resSource
      const localStorage = []
      storages.forEach((item, idx) => {
        if (item.storage_type === 'local') {
          localStorage.push({
            name: item.name,
            background: COLORS[idx % 8],
          })
        }
      })
      return localStorage
    },
  },
  methods: {
    getStatus ({ status, owner_status }) {
      if (!status && !owner_status) return this.$t('common.text00001')
      return this.$t(`status.${STATUS_MAP[this.type] || this.type}.${status || owner_status}`)
    },
    getName ({ owner, name }) {
      return owner || name
    },
    getType ({ owner_type, host_type }) {
      return owner_type || host_type
    },
    getStorageType (type) {
      return STORAGE_TYPES[type] || type
    },
    getStorageSize (size) {
      return sizestr(size, 'M', 1024)
    },
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
