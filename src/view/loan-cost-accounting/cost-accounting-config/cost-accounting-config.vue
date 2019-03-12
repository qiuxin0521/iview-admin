<template>
  <div>
    <Card>
      <p slot="title">配置</p>
      <Row>
        <Col span="11" style="width: 60px; height: 32px; line-height: 32px">
          <span>配置项：</span>
        </Col>
        <Col span="4">
          <Select ref="configItem" v-model="configItem" filterable label-in-value @on-change="configItemChange">
            <Option value="operator">交货经办人</Option>
            <Option value="goodsUnit">货物单位</Option>
            <Option value="specificationModel">货物规格型号</Option>
            <Option value="supplier">供货单位</Option>
            <Option value="destination">送达地点</Option>
          </Select>
        </Col>
      </Row>
      <div class="btn-region">
        <Button type="primary" icon="md-add-circle" size="large" @click="createItem">增加</Button>
        <Button type="error" icon="md-close-circle" size="large" @click="deleteItems">删除</Button>
        <Button icon="md-refresh-circle" size="large" @click="refreshItems">刷新</Button>
      </div>
      <Table ref="itemSelections" border :columns="tableProps.columns" :data="tableProps.data"></Table>
      <Modal v-model="showCreateItemModel" width="400" :title="title" :mask-closable="false" :closable="false">
        <Form :model="item" :label-width="80">
          <FormItem label="名称：">
            <Input v-model="item.name" placeholder=""></Input>
          </FormItem>
          <FormItem label="描述：">
            <Input v-model="item.description" placeholder=""></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" size="large" @click="confirmAndNext">确认并继续增加</Button>
          <Button size="large" @click="confirmAdd(false)">确认</Button>
          <Button type="text" size="large" @click="cancelAdd">取消</Button>
        </div>
      </Modal>
    </Card>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import { getNewTagList, getNextRoute, routeEqual } from '@/libs/util'
export default {
  name: 'cost-accounting-config',
  data () {
    return {
      _title: '增加配置项',
      title: '',
      configItem: this._getDefaultItem(),
      tableProps: {
        columns: this._getColumns(),
        data: []
      },
      item: {
        name: '',
        description: ''
      },
      showCreateItemModel: false,
      changeRouter: this._getChangeRouter()
    }
  },
  methods: {
    ...mapMutations([
      'setBreadCrumb',
      'setTagNavList',
      'addTag',
      'setLocal'
    ]),
    ...mapActions([
      'loadConfigItem',
      'addConfigItem',
      'deleteConfigItem'
    ]),
    configItemChange: function (item) {
      this.$data.title = this.$data._title + '(' + item.label + ')'
      this._loadData(item.value)
    },
    createItem: function () {
      this.$data.showCreateItemModel = true
    },
    deleteItems: function () {
      debugger
      let selections = this.$refs.itemSelections.getSelection()
      if (!selections.length) {
        this.$Modal.warning({
          title: '提示',
          content: '请选择要删除的配置'
        })
        return
      }

      let _this = this
      this.$Modal.confirm({
        title: '删除',
        content: '确认删除所选配置?',
        onOk: () => {
          let deleteItems = {}
          let deleteKeys = []
          for (let index in selections) {
            deleteKeys.push(selections[index].id)
          }
          deleteItems[this.$data.configItem] = deleteKeys

          this.deleteConfigItem(deleteItems).then(function (resp) {
            _this._loadData(_this.$data.configItem)
          }, function (error) {
            this._resetAddItem()
            if (error.response) {
              _this.$Modal.error({
                title: '异常',
                content: '增加配置项异常'
              })
            } else {
              _this.$Modal.error({
                title: '异常',
                content: '系统内部异常'
              })
            }
          })
        }
      })
    },
    refreshItems: function () {
      this._loadData(this.$data.configItem)
    },
    confirmAndNext: function () {
      this.confirmAdd(true)
    },
    confirmAdd: function (keepModal) {
      let _this = this
      this.$data.showCreateItemModel = keepModal || false
      if (this.$data.item.name) {
        this.addConfigItem({
          configItemKey: this.$data.configItem,
          itemValue: this.$data.item.name,
          itemDescription: this.$data.item.description
        }).then(function (resp) {
          _this._resetAddItem()
          _this._changeRouter(keepModal)
        }, function (error) {
          this._resetAddItem()
          if (error.response) {
            _this.$Modal.error({
              title: '异常',
              content: '增加配置项异常'
            })
          } else {
            _this.$Modal.error({
              title: '异常',
              content: '系统内部异常'
            })
          }
        })
      }
    },
    cancelAdd: function () {
      this.$data.showCreateItemModel = false
      this._resetAddItem()
      this._changeRouter()
    },
    _loadData: function (key) {
      let _this = this
      this.loadConfigItem(key).then(function (resp) {
        _this.$data.tableProps.data = resp.data
      }, function (error) {
        if (error.response) {
          _this.$Modal.error({
            title: '异常',
            content: '获取配置项异常'
          })
        } else {
          _this.$Modal.error({
            title: '异常',
            content: '系统内部异常'
          })
        }
      })
    },
    _getColumns: function () {
      return [
        {
          type: 'selection',
          width: 50,
          align: 'center'
        },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '描述',
          key: 'description'
        }
      ]
    },
    _resetAddItem: function () {
      this.$data.item = {
        name: '',
        description: ''
      }
    },
    _getDefaultItem: function () {
      let _configItem = this.$route.query.configItem || ''
      if (_configItem) {
        return _configItem
      }

      return 'operator'
    },
    _getChangeRouter: function () {
      return this.$route.query.changeRouter || false
    },
    _changeRouter: function (keepModal = false) {
      if (!this.$data.changeRouter || keepModal) {
        this._loadData(this.$data.configItem)
        return
      }

      let current = this.$route
      let tagNavList = this.$store.state.app.tagNavList

      let nextRoute = getNextRoute(tagNavList, current)
      if (current.meta.parentName) {
        let parentRoute = tagNavList.find(item => { return item.name == current.meta.parentName })
        if (parentRoute) {
          nextRoute = parentRoute
        }
      }

      let res = tagNavList.filter(item => !routeEqual(current, item))
      this.$router.push(nextRoute)
      this.setTagNavList(res)
      this.$refs.sideMenu.updateOpenName(nextRoute.name)
    }
  },
  mounted () {
    if (Array.isArray(this.$refs.configItem.values) && this.$refs.configItem.values.length) {
      this.$data.title = this.$data._title + '(' + this.$refs.configItem.values[0].label + ')'
    }
    this._loadData(this.$data.configItem)

    if (this.$data.changeRouter) {
      this.$data.showCreateItemModel = true
    }
  }
}
</script>

<style scoped>
  button {
    margin-right: 10px;
  }

  .btn-region {
    margin-bottom: 10px;
    margin-top: 10px;
  }
</style>
