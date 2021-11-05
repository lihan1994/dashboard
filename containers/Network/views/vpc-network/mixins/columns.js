import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getPublicScopeTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'vpcNetwork' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'inter_vpc_networks', columns: () => this.columns }),
      {
        field: 'vpc_count',
        title: this.$t('network.text_243'),
        minWidth: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            return row.vpc_count || 0
          },
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'inter_vpc_networks' }),
      getBrandTableColumn(),
    ]
  },
}
