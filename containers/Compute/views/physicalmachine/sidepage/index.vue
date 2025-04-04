<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_112')"
    icon="res-physicalmachine"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      source="physicalmachine"
      :is="params.windowData.currentTab"
      :id="listId"
      :res-id="data.id"
      :hostInfo="detailData"
      :on-manager="onManager"
      :getParams="getParams"
      :columns="columns"
      taskResource="compute-tasks"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import StorageList from '../../host/sidepage/Storage'
import GpuList from '../../host/sidepage/Gpu'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import BaremetalList from './Baremetal'
import PhysicalmachineDetail from './Detail'
import NetworkList from './Network'
import BmcLog from './BMCLog'

export default {
  name: 'PhysicalmachineSidePage',
  components: {
    PhysicalmachineDetail,
    BaremetalList,
    NetworkList,
    StorageList,
    GpuList,
    BmcLog,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'physicalmachine-detail' },
        { label: this.$t('compute.text_864'), key: 'baremetal-list' },
        { label: this.$t('compute.text_104'), key: 'network-list' },
        { label: this.$t('compute.text_99'), key: 'storage-list' },
        { label: this.$t('compute.text_607'), key: 'gpu-list' },
        { label: this.$t('compute.text_865'), key: 'bmc-log' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'baremetal-list') {
        return {
          host: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'storage-list') {
        return {
          details: true,
          with_meta: true,
          limit: 20,
          host_id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'gpu-list') {
        return {
          show_baremetal_isolated_devices: true,
        }
      } else if (this.params.windowData.currentTab === 'bmc-log') {
        return {
          host_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForPhysicalmachineSidePage'
        case 'baremetal-list':
          return 'BaremetalListForPhysicalmachineSidePage'
        case 'network-list':
          return 'NetworkListForPhysicalmachineSidePage'
        case 'storage-list':
          return 'StorageListForPhysicalmachineSidePage'
        case 'gpu-list':
          return 'GpuListForPhysicalmachineSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
