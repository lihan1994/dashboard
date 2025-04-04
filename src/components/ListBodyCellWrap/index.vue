<template>
  <div v-on="events" class="d-flex align-items-center list-body-cell-wrap" :title="message || row[field] || '-'">
    <span
      v-if="!hideField"
      :class="{ 'text-weak': field.includes('description'), [titleClass]: titleClass, 'text-truncate': overflow ==='ellipsis' }">{{ l.get(row, field) || '-' }}</span>
    <div class="text-truncate slot-wrap" v-if="$scopedSlots.default"><slot /></div>
    <template v-if="showDeleteLock">
      <a-icon class="ml-1" type="lock" :title="$t('common.text00008')" />
    </template>
    <template v-if="showEncryptionLock">
      <a-icon class="ml-1" type="safety-certificate" :title="$t('common.text.encrption_enable')" />
    </template>
    <template v-if="addBackup && row.backup_host_id">
      <icon type="gaokeyong" class="ml-1" :title="$t('common.text00009')" />
    </template>
    <template v-if="addAutoReset">
      <icon class="ml-1" type="auto-set" :title="$t('compute.shutdown_auto_reset')" />
    </template>
    <slot name="append" />
    <slot name="appendActions" v-if="showAppendActions && !inBaseDialog && inList" />
    <edit
      slot="edit"
      class="ml-1"
      v-if="showEdit && isOwner.validate"
      @update="update"
      :label="labelCn"
      :inputType="inputType"
      :formRules="formRulesComputer"
      :visible.sync="editVisible"
      :defaultValue="defaultValue"
      :numberMin="numberMin"
      :showSuccessMessage="showSuccessMessage"
      :customEdit="customEdit"
      :customEditCallback="customEditCallback" />
    <copy
      slot="copy"
      class="ml-1"
      v-if="showCopy"
      :message="copyMessage" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'

export default {
  name: 'ListBodyCellWrap',
  props: {
    resource: {
      type: String,
      default: '',
      required: false,
    },
    alwaysShowCopyBtn: {
      type: Boolean,
      default: false,
    },
    alwaysShowEditBtn: {
      type: Boolean,
      default: false,
    },
    row: { // 当前行数据
      type: Object,
    },
    message: String,
    field: {
      type: String,
      default: 'name',
    },
    label: {
      type: String,
    },
    steadyStatus: {
      type: [Array, Object, String],
    },
    onManager: {
      type: Function,
    },
    copy: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    hideField: {
      type: Boolean,
      default: false,
    },
    formRules: {
      type: [Array, Function],
    },
    titleClass: String,
    addLock: Boolean,
    addEncrypt: Boolean,
    addBackup: Boolean,
    addAutoReset: Boolean,
    // 自定义确定事件，如果传递了此事件，则不会执行默认的确定事件
    ok: Function,
    // 是否需要显示成功信息
    showSuccessMessage: {
      type: Boolean,
      default: true,
    },
    overflow: {
      type: String,
      default: 'ellipsis',
    },
    customEdit: {
      type: Boolean,
      default: false,
    },
    customEditCallback: {
      type: Function,
    },
    inputType: {
      type: String,
      default: 'input',
    },
    numberMin: {
      type: Number,
      default: 0,
    },
  },
  inject: {
    // 是否处于BaseDialog中
    inBaseDialog: {
      default: false,
    },
    // 是否处于PageList中
    inList: {
      default: false,
    },
  },
  data () {
    return {
      // 是否在弹框里
      showBtn: false,
      editVisible: false, // edit form 的显隐
      l: _,
    }
  },
  computed: {
    defaultValue () {
      return _.get(this.row, this.field) || ''
    },
    copyMessage () {
      if (this.message) {
        return this.message
      }
      return _.get(this.row, this.field) || '-'
    },
    labelCn () {
      if (this.label) return this.label
      const fieldMap = {
        name: this.$t('common.name'),
        description: this.$t('common.description'),
      }
      const field = this.field === '_i18n.description' ? 'description' : this.field
      if (fieldMap[field]) {
        return fieldMap[field]
      }
      return ''
    },
    showCopy () {
      if (this.alwaysShowCopyBtn) return true
      if (this.copy && this.showBtn) return true
      return false
    },
    showEdit () {
      if (this.inBaseDialog) return false
      if (this.alwaysShowEditBtn) return true
      if (this.editVisible) return true
      if (this.edit && this.showBtn) return true
      if (this.customEdit && this.showBtn) return true
      return false
    },
    showAppendActions () {
      if (this.showBtn) return true
      return false
    },
    formRulesComputer () {
      if (R.is(Function, this.formRules)) {
        return this.formRules(this.row)
      }
      if (this.formRules && this.formRules.length) {
        return this.formRules
      }
      if (this.field === 'description') return []
      return null
    },
    showDeleteLock () {
      if (this.addLock) {
        if (R.is(Boolean, this.row.disable_delete)) {
          return this.row.disable_delete
        }
        if (R.is(String, this.row.disable_delete)) {
          return this.row.disable_delete === 'true'
        }
        if (R.is(Boolean, this.row.can_delete)) {
          return this.row.can_delete
        }
        if (R.is(String, this.row.can_delete)) {
          return this.row.can_delete === 'true'
        }
      }
      return false
    },
    showEncryptionLock () {
      if (this.addEncrypt) {
        if (R.is(String, this.row.encrypt_key_id) && this.row.encrypt_key_id) {
          return true
        }
      }
      return false
    },
    isOwner () {
      return this.$isOwner(this.row, this.resource)
    },
  },
  created () {
    this.events = {}
    this.events.mouseenter = this.handleMouseenter
    this.events.mouseleave = this.handleMouseleave
  },
  methods: {
    update (formData) {
      if (this.ok) {
        this.ok(formData.input)
      } else {
        if (this.onManager) {
          const field = this.field === '_i18n.description' ? 'description' : this.field
          this.onManager('update', {
            id: this.row.id,
            steadyStatus: this.steadyStatus,
            managerArgs: {
              id: this.row.id,
              data: {
                [field]: formData.input,
              },
            },
          })
        } else {
          console.warn('no manager')
        }
      }
    },
    handleMouseenter (e) {
      e.stopPropagation()
      e.preventDefault()
      if (!this.showBtn) this.showBtn = true
    },
    handleMouseleave (e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.showBtn) this.showBtn = false
    },
  },
}
</script>
