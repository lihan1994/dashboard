<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_105')}}</div>
    <div slot="body">
      <dialog-selected-tips
        :count="params.data.length"
        :action="$t('common_105')"
        :name="params.tipName" />
      <template v-if="params.columns">
        <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      </template>
      <!-- 共有云标签
      <div class="tag-wrap" v-if="!isBatch">
        <a-divider orientation="left">
          <div class="font-weight-normal" style="font-size: 14px;">{{$t('common_106')}}</div>
        </a-divider>
        <div class="tag-list">
          <template v-if="extTags.length <= 0">
            <loader :no-data-text="$t('common_107')" />
          </template>
          <template v-else>
            <template v-for="item of extTags">
              <span
                class="tag mb-1 text-truncate d-inline-block"
                :title="item.title"
                :key="`${item.key}${item.value}`"
                :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
                {{ item.title }}
              </span>
            </template>
          </template>
        </div>
      </div>-->
      <!-- 标签 -->
      <div class="tag-wrap">
        <a-divider orientation="left">
          <div class="font-weight-normal" style="font-size: 14px;">{{ userTagTitle }}</div>
        </a-divider>
        <div class="tag-list">
          <template v-if="userTags.length <= 0">
            <loader :no-data-text="$t('common_108')" />
          </template>
          <template v-else>
            <template v-for="item of userTags">
              <a-popover
                trigger="click"
                v-model="checkedInfo[item.key].visible"
                :key="`${item.key}${item.value}`"
                destroyTooltipOnHide
                @visibleChange="visible => handleTagVisibleChange(item, visible)">
                <template #content>
                  <div class="tag-update-wrap">
                    <div class="mb-1">{{ $t('common_112') }}</div>
                    <div>
                      <div>
                        <a-input size="small" v-model="checkedInfo[item.key].title" />
                      </div>
                      <template v-if="checkedInfo[item.key].titleErrorMessage">
                        <div class="error-color mt-1">{{ checkedInfo[item.key].titleErrorMessage }}</div>
                      </template>
                    </div>
                    <div class="mt-2 mb-1">{{ $t('common_113') }}</div>
                    <div>
                      <a-input size="small" v-model="checkedInfo[item.key].value" />
                    </div>
                    <a-row :gutter="8" class="mt-2">
                      <a-col :span="12">
                        <a-button size="small" block @click="updateTag(item)">{{ $t('common.ok') }}</a-button>
                      </a-col>
                      <a-col :span="12">
                        <a-button
                          size="small"
                          block
                          @click="() => handleTagPopoverCancel(item)">{{ $t('common.cancel') }}</a-button>
                      </a-col>
                    </a-row>
                  </div>
                </template>
                <div
                  class="tag mb-1 d-inline-block"
                  :title="item.title"
                  :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
                  <div class="d-flex align-items-center">
                    <a-tooltip v-if="isSysTag(item.key)">
                      <template slot="title">{{ $t('common.tag.sys_tag_tooltip') }}</template>
                      <span class="flex-fill text-truncate">{{ item.title }}</span>
                    </a-tooltip>
                    <span v-else class="flex-fill text-truncate">{{ item.title }}</span>
                    <a-icon
                      v-if="!isSysTag(item.key)"
                      class="ml-1 remove-tag flex-grow-0 flex-shrink-0"
                      type="close"
                      @click.stop="removeTag(item)" />
                  </div>
                </div>
              </a-popover>
            </template>
          </template>
        </div>
        <div class="text-color-help mt-2">{{$t('common_109')}}</div>
      </div>
      <div class="mt-2 d-flex">
        <div style="line-height: 40px;">
          <tag-select
            global
            :button-text="$t('common_110')"
            resource="server"
            v-model="checked"
            @input="handleSelectInput"
            :params="params.params"
            :managerInstance="params.managerInstance"
            :allowNoValue="false" />
          <a-button
            class="ml-2"
            v-if="!showForm"
            @click="() => showForm = true">{{$t('common_111')}}</a-button>
        </div>
        <a-form class="ml-2" layout="inline" :form="form.fc" v-if="showForm">
          <a-form-item>
            <a-input v-decorator="decorators.key" :placeholder="$t('common_112')" />
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="decorators.value" :placeholder="$t('common_113')" />
          </a-form-item>
          <a-form-item>
            <a-button @click="addTag">{{$t('common_114')}}</a-button>
            <a-button @click="() => showForm = false" class="ml-2">{{$t('common_115')}}</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { filterUserTag, getTagColor, getTagTitle, isSysTag } from '@/utils/common/tag'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import TagSelect from '@/sections/TagSelect'

export default {
  name: 'SetTagDialog',
  components: {
    TagSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = filterUserTag({
      metadata: this.params.data[0].metadata || this.params.metadata,
      needExt: true,
    })
    const extTags = data.arr.filter(item => item.key.startsWith('ext:')).map(item => this.genTag(item))
    const checked = {}
    const checkedInfo = {}
    this.checkedIndex = 0
    // when single
    if (this.params.data.length === 1) {
      R.forEachObjIndexed((value, key) => {
        if (!key.startsWith('ext:')) {
          checked[key] = value
          checkedInfo[key] = {
            visible: false,
            title: getTagTitle(key),
            value: value[0],
            titleErrorMessage: '',
            index: ++this.checkedIndex,
          }
        }
      }, data.obj)
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        key: [
          'key',
          {
            rules: [
              { required: true, whitespace: true, message: this.$t('common_116') },
            ],
          },
        ],
        value: [
          'value',
          {
            rules: [
              { required: true, whitespace: true, message: this.$t('common.tips.input', [this.$t('common_113')]) },
            ],
          },
        ],
      },
      extTags,
      checked,
      checkedInfo,
      showForm: false,
    }
  },
  computed: {
    isBatch () {
      return this.params.data.length > 1
    },
    mode () {
      return this.params.mode || 'default'
    },
    isDefaultMode () {
      return this.mode === 'default'
    },
    isBatchAddMode () {
      return this.isBatch && this.mode === 'add'
    },
    userTagTitle () {
      return this.isBatchAddMode ? this.$t('common_117') : this.$t('common_118')
    },
    userTags () {
      let ret = []
      R.forEachObjIndexed((value, key) => {
        if (value.length > 0) {
          for (let i = 0, len = value.length; i < len; i++) {
            ret.push(this.genTag({ key, value: value[i], index: this.checkedInfo[key].index }))
          }
        } else {
          ret.push(this.genTag({ key, value: null, index: this.checkedInfo[key].index }))
        }
      }, this.checked)
      ret = R.sort((a, b) => a.index - b.index, ret)
      return ret
    },
  },
  methods: {
    async addTag () {
      try {
        const values = await this.form.fc.validateFields()
        const key = `user:${values.key}`
        const newValue = { ...this.checked }
        const newCheckedInfo = { ...this.checkedInfo }
        if (newValue[key]) {
          if (values.value) {
            if (!newValue[key].includes(values.value)) {
              newValue[key] = [values.value]
              newCheckedInfo[key] = {
                visible: false,
                title: getTagTitle(key),
                value: values.value,
                titleErrorMessage: '',
                index: ++this.checkedIndex,
              }
            }
          }
        } else {
          if (values.value) {
            newValue[key] = [values.value]
            newCheckedInfo[key] = {
              visible: false,
              title: getTagTitle(key),
              value: values.value,
              titleErrorMessage: '',
              index: ++this.checkedIndex,
            }
          } else {
            newValue[key] = []
            newCheckedInfo[key] = {
              visible: false,
              title: getTagTitle(key),
              value: '',
              titleErrorMessage: '',
              index: ++this.checkedIndex,
            }
          }
        }
        this.checked = newValue
        this.checkedInfo = newCheckedInfo
        this.form.fc.resetFields()
      } catch (error) {
        throw error
      }
    },
    removeTag (item) {
      const newValue = { ...this.checked }
      const newCheckedVisible = { ...this.checkedInfo }
      delete newValue[item.key]
      delete newCheckedVisible[item.key]
      this.checked = newValue
      this.checkedInfo = newCheckedVisible
    },
    async handleConfirm () {
      this.loading = true
      try {
        const data = {}
        let num = 0
        R.forEachObjIndexed((value, key) => {
          if (key.startsWith('user:')) {
            const _key = R.replace(/user:/, '', key)
            data[_key] = value[0] ? value[0] : ''
            num++
          }
        }, this.checked)
        if (num > 20) {
          this.$message.warning(this.$t('common_119'))
          return
        }
        const ids = this.params.data.map(item => item[this.params.idKey || 'id'])
        const action = this.isBatchAddMode ? 'user-metadata' : 'set-user-metadata'
        const { manager } = this.params
        if (manager) {
          await manager.batchPerformAction({
            ids,
            action,
            data,
          })
        } else {
          await this.params.onManager('batchPerformAction', {
            id: ids,
            steadyStatus: this.params.list?.steadyStatus || ['running', 'ready'],
            managerArgs: {
              action,
              data,
            },
          })
        }
        this.cancelDialog()
        R.is(Function, this.params.refresh) && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    genTag (item) {
      const rgb = getTagColor(item.key, item.value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        title: getTagTitle(item.key, item.value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
        ...item,
      }
    },
    updateTag (item) {
      const info = this.checkedInfo[item.key]
      const title = R.trim(info.title)
      const index = info.index
      if (R.isEmpty(title)) {
        info.titleErrorMessage = this.$t('common_116')
        return
      }
      const value = R.trim(info.value || '')
      const newKey = `user:${title}`
      const newCheckedInfo = { ...this.checkedInfo }
      delete newCheckedInfo[item.key]
      newCheckedInfo[newKey] = {
        visible: false,
        title: getTagTitle(newKey),
        value,
        titleErrorMessage: '',
        index,
      }
      this.checkedInfo = newCheckedInfo
      const newCheckedValues = { ...this.checked }
      delete newCheckedValues[item.key]
      newCheckedValues[newKey] = [value]
      this.checked = newCheckedValues
    },
    handleSelectInput (newChecked) {
      const newCheckedInfo = { ...this.checkedInfo }
      R.forEachObjIndexed((value, key) => {
        newCheckedInfo[key] = {
          visible: false,
          title: getTagTitle(key),
          value: value[0],
          titleErrorMessage: '',
          index: ++this.checkedIndex,
        }
      }, newChecked)
      this.checkedInfo = newCheckedInfo
      this.checked = newChecked
    },
    handleTagVisibleChange (item, visible) {
      let _visable = visible
      if (isSysTag(item.key)) {
        this.checkedInfo[item.key].visible = false
        _visable = false
        return
      }
      if (!_visable) {
        const newCheckedInfo = { ...this.checkedInfo }
        newCheckedInfo[item.key] = {
          visible: false,
          title: getTagTitle(item.key),
          value: item.value,
          titleErrorMessage: '',
          index: item.index,
        }
        this.checkedInfo = newCheckedInfo
      }
    },
    handleTagPopoverCancel (item) {
      this.checkedInfo[item.key].visible = false
      this.handleTagVisibleChange(item, false)
    },
    isSysTag,
  },
}
</script>

<style lang="less" scoped>
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
.tag-list {
  min-height: 96px;
  border: 2px dashed #ddd;
  padding: 8px;
  .wrap {
    margin: 0;
  }
  & ::v-deep .ant-empty-image {
    height: 46px;
    .data-empty {
      margin-top: 0;
    }
  }
}
.remove-tag {
  font-size: 12px;
  cursor: pointer;
}
.tag-update-wrap {
  width: 200px;
}
</style>
