<template>
  <div>
    <div class="btn-region">
      <div style="width: 50%; float: left">
        <Button type="primary" icon="md-add-circle" :size="buttonProps.buttonSize" @click="createContract">增加</Button>
        <Button type="error" icon="md-close-circle" :size="buttonProps.buttonSize" @click="deleteContracts">删除</Button>
        <Button icon="md-refresh-circle" :size="buttonProps.buttonSize" @click="refreshContract">刷新</Button>
        <Button icon="md-fastforward" :size="buttonProps.buttonSize" @click="exportContracts">导出</Button>
      </div>
      <div style="width: 50%; float: right">
        <Input v-model="buttonProps.search" @on-search="refreshContract" @on-enter="refreshContract" search enter-button placeholder="搜索合同号或经办人" style="width: 270px; float:right"/>
      </div>
    </div>
    <Table ref="selection" border :columns="tableProps.columns" :data="tableProps.data" height="440"></Table>
    <div style="margin: 10px;overflow: hidden">
      <div style="float: right;">
        <Page
          :total="tableProps.totalCount"
          :current="tableProps.currentPage"
          :page-size="tableProps.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize" show-elevator show-sizer show-total></Page>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  name: 'cost-accounting-form',
  data () {
    return {
      buttonProps: {
        buttonSize: 'large',
        search: ''
      },
      tableProps: {
        columns: this.getColumns(),
        data: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      }
    }
  },
  methods: {
    ...mapMutations([
      'addTag'
    ]),
    ...mapActions([
      'getContractList',
      'deleteContract',
      'exportContract'
    ]),
    getColumns: function () {
      const _this = this
      return [
        {
          type: 'selection',
          width: 50,
          align: 'center'
        },
        {
          title: '合同号',
          key: 'contractNo'
        },
        {
          title: '交货经办人',
          key: 'operator'
        },
        {
          title: '配送日期',
          key: 'deliveryDate'
        },
        {
          title: '单位',
          key: 'goodsUnit'
        },
        {
          title: '创建日期',
          key: 'createTime'
        },
        {
          title: '修改日期',
          key: 'updateTime'
        },
        {
          title: '操作',
          render: function (h, params) {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  shape: 'circle',
                  ghost: true
                },
                on: {
                  click: function () {
                    _this.modifyContract(params.row)
                  }
                },
                class: {
                  'custom-ivu-btn-ghost': true
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'primary',
                  shape: 'circle',
                  ghost: true
                },
                on: {
                  click: function () {
                    _this.modifyContractDetail(params.row)
                  }
                },
                class: {
                  'custom-ivu-btn-ghost': true
                }
              }, '详情'),
              h('Button', {
                props: {
                  type: 'error',
                  shape: 'circle',
                  ghost: true
                },
                on: {
                  click: function () {
                    _this.$Modal.confirm({
                      title: '删除',
                      content: '确认删除合同: ' + params.row.contractNo,
                      onOk: () => {
                        _this.delete(params.row)
                      },
                      onCancel: () => {
                        // do nothing
                      }
                    })
                  }
                },
                class: {
                  'custom-ivu-btn-ghost': true
                }
              }, '删除')
            ])
          }
        }
      ]
    },
    getData: function (page, pageSize) {
      page = page || 1
      pageSize = pageSize || 20
      let search = (this.$data.buttonProps.search || '').trim()
      let _this = this
      this.getContractList({
        page,
        pageSize,
        search
      }).then(function (resp) {
        _this.$data.tableProps.data = resp.data.contracts
        _this.$data.tableProps.totalCount = resp.data.total
      }, function (error) {
        if (error.response) {
          _this.$Modal.error({
            title: '异常',
            content: '获取合同列表异常'
          })
        } else {
          _this.$Modal.error({
            title: '异常',
            content: '系统内部异常'
          })
        }
      })
    },
    createContract: function () {
      const route = {
        name: 'add_contract',
        meta: {
          title: '增加合同'
        }
      }
      this.addTag({
        route: route,
        type: 'push'
      })
      this.$router.push(route)
    },
    deleteContracts: function () {
      let selections = this.$refs.selection.getSelection()
      if (!selections.length) {
        this.$Modal.warning({
          title: '删除',
          content: '请选择要删除的合同'
        })
        return
      }

      let _this = this
      this.$Modal.confirm({
        title: '删除',
        content: '确认删除所选合同？',
        onOk: () => {
          let rowIds = []
          for (let i = 0; i < selections.length; ++i) {
            rowIds.push(selections[i].contractId)
          }
          _this._deleteContract(rowIds)
        }
      })
    },
    exportContracts: function () {
      let selections = this.$refs.selection.getSelection()
      if (!selections.length) {
        this.$Modal.warning({
          title: '导出',
          content: '请选择要导出的合同'
        })
        return
      }

      let _this = this
      this.$Modal.confirm({
        title: '导出',
        content: '确认导出所选合同？',
        onOk: () => {
          let rowIds = []
          for (let i = 0; i < selections.length; ++i) {
            rowIds.push(selections[i].contractId)
          }
          _this._exportContract(rowIds)
        }
      })
    },
    delete: function (row) {
      let rowIds = []
      rowIds.push(row.contractId)

      this._deleteContract(rowIds)
    },
    _deleteContract: function (rowIds) {
      let _this = this
      this.deleteContract(rowIds).then(function (resp) {
        _this.refreshContract()
      }, function (error) {
        _this.refreshContract()
      })
    },
    _exportContract: function (rowIds) {
      let _this = this
      this.exportContract(rowIds.join(',')).then(function (response) {
        const blob = new Blob([response.data], {type: 'application/vnd.ms-excel'})
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const disposition = response.headers['content-disposition']
        let fileName = 'contract-' + new Date().format('yyyy-MM-dd-hh-mm-ss') + '.xlsx'
        if (disposition && disposition.indexOf('attachment') !== -1) {
          let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          let matches = filenameRegex.exec(disposition)
          if (matches && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '')
          }
        }
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }, function (error) {
        _this.refreshContract()
      })
    },
    refreshContract: function () {
      this.$data.tableProps.columns = this.getColumns()
      this.$data.tableProps.data = this.getData(this.$data.tableProps.currentPage, this.$data.tableProps.pageSize)
    },
    modifyContract: function (row) {
      const route = {
        name: 'modify_contract',
        meta: {
          title: '修改合同'
        },
        params: {
          contractId: row.contractId
        }
      }
      this.addTag({
        route: route,
        type: 'push'
      })
      this.$router.push(route)
    },
    modifyContractDetail: function (row) {
      const route = {
        name: 'modify_contract_detail',
        meta: {
          title: '合同详情'
        },
        params: {
          contractId: row.contractId
        }
      }
      this.addTag({
        route: route,
        type: 'push'
      })
      this.$router.push(route)
    },
    changePage: function (page) {
      this.$data.tableProps.currentPage = page
      this.getData(page, this.$data.tableProps.pageSize)
    },
    changePageSize: function (pageSize) {
      this.$data.tableProps.currentPage = 1
      this.$data.tableProps.pageSize = pageSize
      this.getData(this.$data.tableProps.currentPage, pageSize)
    }
  },
  mounted () {
    this.getData(this.$data.tableProps.currentPage, this.$data.tableProps.pageSize)
  }
}
</script>

<style scoped>
  button {
    margin-right: 10px;
  }

  .btn-region {
    margin-bottom: 10px;
    overflow: hidden;
  }
</style>

<style>
  .custom-ivu-btn-ghost {
    border: none
  }
</style>
