<template>
  <div>
    <Card>
      <div slot="title" style="margin-bottom: 15px">
        <ul>
          <li><b>合同号: </b>{{contract.contractNo}}</li>
          <li><b>交货经办人: </b>{{contract.operator}}</li>
          <li><b>配送日期: </b>{{contract.deliveryDate}}</li>
          <li><b>单位：</b>{{contract.goodsUnit}}</li>
        </ul>
      </div>
      <div class="btn-region">
        <Button type="primary" icon="md-add-circle" size="large" @click="createContractDetail(false)">增加</Button>
        <Button type="error" icon="md-close-circle" size="large" @click="deleteContractsDetail">删除</Button>
        <Button icon="md-refresh-circle" size="large" @click="refreshContractDetail">刷新</Button>
        <Button icon="md-arrow-back" size="large" @click="back">返回</Button>
      </div>
      <Table ref="contractDetail" border :columns="tableProps.columns" :data="tableProps.data" :row-class-name="rowClassName" height="480" style="overflow: auto"></Table>
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
      <Modal v-model="showCreateDetailModel" width="600" :title="modalTitle" :mask-closable="false">
        <Form ref="createContractDetail" :model="detailModel" :label-width="90" inline :rules="createContractDetailRules">
          <FormItem label="货物名称：" style="padding-right: 40px" prop="goodsName">
            <AutoComplete
              v-model="detailModel.goodsName"
              :data="innerDetailModel.goodsNameOptions"
              :filter-method="filterOptions"
              placeholder="请输入货物名称" style="max-height: 280px">
            </AutoComplete>
          </FormItem>
          <FormItem label="规格型号：" prop="specificationModel">
            <!--<Select v-model="detailModel.specificationModel" style="width:141px">
              <Option v-for="item in innerDetailModel.specificationModelOptions" :value="item.id">{{ item.name }}</Option>
            </Select>
            <Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('specificationModel')">配置</Button>-->
            <AutoComplete
              v-model="detailModel.specificationModel"
              :data="innerDetailModel.specificationModelOptions"
              :filter-method="filterOptions"
              placeholder="请输入规格型号" style="max-height: 280px">
            </AutoComplete>
          </FormItem>
          <FormItem label="实发数量：" style="padding-right: 40px" prop="actualSendQuantity">
            <Input v-model="detailModel.actualSendQuantity" placeholder=""></Input>
          </FormItem>
          <FormItem label="外购单价：" prop="purchasedPrice">
            <Input v-model="detailModel.purchasedPrice" placeholder=""></Input>
          </FormItem>
          <FormItem label="实收数量：" style="padding-right: 40px" prop="actualReceivedQuantity">
            <Input v-model="detailModel.actualReceivedQuantity" placeholder=""></Input>
          </FormItem>
          <FormItem label="配送单价：" prop="deliveryPrice">
            <Input v-model="detailModel.deliveryPrice" placeholder=""></Input>
          </FormItem>
          <FormItem label="供货单位：" style="padding-right: 40px" prop="supplier">
            <!--<Select v-model="detailModel.supplier" style="width:141px">
              <Option v-for="item in innerDetailModel.supplierOptions" :value="item.id">{{ item.name }}</Option>
            </Select>
            <Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('supplier')">配置</Button>-->
            <AutoComplete
              v-model="detailModel.supplier"
              :data="innerDetailModel.supplierOptions"
              :filter-method="filterOptions"
              placeholder="请输入供货单位" style="max-height: 280px">
            </AutoComplete>
          </FormItem>
          <FormItem label="送达地点：" prop="destination">
            <!--<Select v-model="detailModel.destination" style="width:141px">
              <Option v-for="item in innerDetailModel.destinationOptions" :value="item.id">{{ item.name }}</Option>
            </Select>
            <Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('destination')">配置</Button>-->
            <AutoComplete
              v-model="detailModel.destination"
              :data="innerDetailModel.destinationOptions"
              :filter-method="filterOptions"
              placeholder="请输入送达地点" style="max-height: 280px">
            </AutoComplete>
          </FormItem>
          <FormItem label="运费：" style="padding-right: 40px" prop="transportCost">
            <Input v-model="detailModel.transportCost" placeholder=""></Input>
          </FormItem>
          <FormItem label="装车费：" prop="loadCost">
            <Input v-model="detailModel.loadCost" placeholder=""></Input>
          </FormItem>
          <FormItem label="生产厂商：" prop="manufacturer">
            <AutoComplete
              v-model="detailModel.manufacturer"
              :data="innerDetailModel.manufacturerOptions"
              :filter-method="filterOptions"
              placeholder="请输入生产厂商" style="width: 422px">
            </AutoComplete>
          </FormItem>
          <FormItem label="备注：" prop="remark">
            <Input v-model="detailModel.remark" placeholder="" style="width: 422px"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" size="large" @click="confirmAndNext" v-show="modalConfirmAndNextEnabled">确认并继续增加</Button>
          <Button size="large" @click="confirmAdd(false)">确认</Button>
          <Button type="text" size="large" @click="cancelAdd">取消</Button>
        </div>
        <Spin fix v-if="modalSpinShow" size="large" style="background-color: rgba(255, 255, 255, 0.6)">
        </Spin>
      </Modal>
    </Card>
  </div>
</template>

<script>
import { getNewTagList, getNextRoute, routeEqual } from '@/libs/util'
import { mapMutations, mapActions } from 'vuex'
import Decimal from 'decimal.js'
import contractDetailExpand from './contract-detail-expand'
export default {
  name: 'modify-contract-detail',
  data () {
    return {
      modalSpinShow: true,
      modalTitle: '',
      modalConfirmAndNextEnabled: true,
      contract: {
        contractId: '',
        contractNo: '',
        operator: '',
        deliveryDate: '',
        goodsUnit: ''
      },
      tableProps: {
        columns: this.getColumns(),
        data: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 20
      },
      showCreateDetailModel: false,
      innerDetailModel: {
        detailId: '',
        goodsName: '',
        goodsNameOptions: [],
        specificationModel: '',
        specificationModelOptions: [],
        actualSendQuantity: '0',
        purchasedPrice: '0',
        purchasedSum: 0,
        supplier: '',
        supplierOptions: [],
        actualReceivedQuantity: '0',
        deliveryPrice: '0',
        deliverySum: 0,
        destination: '',
        destinationOptions: [],
        transportCost: '0',
        loadCost: '0',
        manufacturer: '',
        manufacturerOptions: [],
        remark: ''
      },
      detailModel: {},
      createContractDetailRules: {
        goodsName: [
          {required: true, message: '货物名称不能为空', trigger: 'blur'},
          {type: 'string', min: 1, max: 256, message: '长度1到256个字符，1个中文占两个字符', trigger: 'change'}
        ],
        specificationModel: [
          {type: 'string', min: 0, max: 256, message: '最长256个字符，1个中文占两个字符', trigger: 'change'}
        ],
        actualSendQuantity: [
          {type: 'string', pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'change'}
        ],
        purchasedPrice: [
          {type: 'string', pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'change'}
        ],
        actualReceivedQuantity: [
          {type: 'string', pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'change'}
        ],
        deliveryPrice: [
          {type: 'string', pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'change'}
        ],
        supplier: [
          {type: 'string', min: 0, max: 256, message: '最长256个字符，1个中文占两个字符', trigger: 'change'}
        ],
        destination: [
          {type: 'string', min: 0, max: 256, message: '最长256个字符，1个中文占两个字符', trigger: 'change'}
        ],
        transportCost: [
          {type: 'string', pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'change'}
        ],
        loadCost: [
          {type: 'string', pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'change'}
        ],
        manufacturer: [
          {type: 'string', min: 0, max: 1024, message: '最长1024个字符，1个中文占两个字符', trigger: 'change'}
        ],
        remark: [
          {type: 'string', min: 0, max: 1024, message: '最长1024个字符，1个中文占两个字符', trigger: 'change'}
        ]
      }
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
      'getContractDetailList',
      'addContractDetail',
      'modifyContractDetail',
      'deleteContractDetail',
      'loadConfigItem'
    ]),
    rowClassName: function (row, index) {
      if (row.add) {
        return 'demo-table-info-row'
      }
      return ''
    },
    back: function () {
      this._changeRouter()
    },
    createContractDetail: function (row) {
      this.$data.detailModel = row || JSON.parse(JSON.stringify(this.$data.innerDetailModel))
      this.$data.modalTitle = row ? '修改外购货物清单项' : '增加外购货物清单项'
      this.$data.modalConfirmAndNextEnabled = !row

      this.$data.showCreateDetailModel = true
      this.$data.modalSpinShow = true
      let specificationModelPromise = this.loadConfigItem('specificationModel')
      let supplierPromise = this.loadConfigItem('supplier')
      let destinationPromise = this.loadConfigItem('destination')
      let goodsNamePromise = this.loadConfigItem('goodsName')
      let manufacturerPromise = this.loadConfigItem('manufacturer')

      let _this = this
      Promise.all([specificationModelPromise, supplierPromise, destinationPromise, goodsNamePromise, manufacturerPromise]).then((values) => {
        let specificationModel = values[0]
        let supplier = values[1]
        let destination = values[2]
        let goodsName = values[3]
        let manufacturer = values[4]

        let containsError = false
        for (let index = 0; index < values.length; ++index) {
          if (values[index] instanceof Error) {
            containsError = true
            break
          }
        }

        if (containsError) {
          _this.$Modal.error({
            title: '提示',
            content: '获取配置信息错误'
          })
          _this.$data.showCreateDetailModel = false
          return
        }

        _this.$data.innerDetailModel.specificationModelOptions = specificationModel.data
        _this.$data.innerDetailModel.supplierOptions = supplier.data
        _this.$data.innerDetailModel.destinationOptions = destination.data
        _this.$data.innerDetailModel.goodsNameOptions = goodsName.data
        _this.$data.innerDetailModel.manufacturerOptions = manufacturer.data

        _this.$data.modalSpinShow = false
      })
    },
    updateContractDetail: function (row) {
      let rowCopy = JSON.parse(JSON.stringify(row))
      rowCopy['actualSendQuantity'] = '' + rowCopy['actualSendQuantity']
      rowCopy['purchasedPrice'] = '' + rowCopy['purchasedPrice']
      rowCopy['actualReceivedQuantity'] = '' + rowCopy['actualReceivedQuantity']
      rowCopy['deliveryPrice'] = '' + rowCopy['deliveryPrice']
      rowCopy['transportCost'] = '' + rowCopy['transportCost']
      rowCopy['loadCost'] = '' + rowCopy['loadCost']

      this.createContractDetail(rowCopy)
    },
    deleteContractsDetail: function () {
      let selections = this.$refs.contractDetail.getSelection()
      if (!selections.length) {
        this.$Modal.warning({
          title: '删除',
          content: '请选择要删除的合同详情项'
        })
        return
      }

      let _this = this
      this.$Modal.confirm({
        title: '删除',
        content: '确认删除所选合同详情项？',
        onOk: () => {
          let rowIds = []
          for (let i = 0; i < selections.length; ++i) {
            rowIds.push(selections[i].detailId)
          }
          _this.deleteContractDetail({
            contractId: _this.$route.params.contractId,
            contractDetailIds: rowIds
          }).then(function (resp) {
            _this.refreshContractDetail()
          }, function (error) {
            _this.refreshContractDetail()
          })
        }
      })
    },
    refreshContractDetail: function () {
      this.getData(this.$data.tableProps.currentPage, this.$data.tableProps.pageSize)
    },
    confirmAndNext: function () {
      this.confirmAdd(true)
    },
    confirmAdd: function (keepModal) {
      let _this = this
      let validateResult = this.$refs.createContractDetail.validate()
      validateResult.then((result) => {
        if (!result) {
          return
        }

        let operateDetail = _this.$data.detailModel['detailId'] ? _this.modifyContractDetail : _this.addContractDetail

        operateDetail({
          contractId: _this.$route.params.contractId,
          contractDetail: {
            detailId: _this.$data.detailModel['detailId'],
            goodsName: _this.$data.detailModel['goodsName'],
            specificationModel: _this.$data.detailModel['specificationModel'],
            actualSendQuantity: parseFloat(_this.$data.detailModel['actualSendQuantity'] || '0'),
            purchasedPrice: parseFloat(_this.$data.detailModel['purchasedPrice'] || '0'),
            supplier: _this.$data.detailModel['supplier'],
            actualReceivedQuantity: parseFloat(_this.$data.detailModel['actualReceivedQuantity'] || '0'),
            deliveryPrice: parseFloat(_this.$data.detailModel['deliveryPrice'] || '0'),
            destination: _this.$data.detailModel['destination'],
            transportCost: parseFloat(_this.$data.detailModel['transportCost'] || '0'),
            loadCost: parseFloat(_this.$data.detailModel['loadCost'] || '0'),
            manufacturer: _this.$data.detailModel['manufacturer'],
            remark: _this.$data.detailModel['remark']
          }
        }).then(function (resp) {
          if (keepModal) {
            _this.$data.innerDetailModel.specificationModelOptions = _this._addOptionLocal(_this.$data.innerDetailModel.specificationModelOptions, _this.$data.detailModel['specificationModel'])
            _this.$data.innerDetailModel.supplierOptions = _this._addOptionLocal(_this.$data.innerDetailModel.supplierOptions, _this.$data.detailModel['supplier'])
            _this.$data.innerDetailModel.destinationOptions = _this._addOptionLocal(_this.$data.innerDetailModel.destinationOptions, _this.$data.detailModel['destination'])
            _this.$data.innerDetailModel.goodsNameOptions = _this._addOptionLocal(_this.$data.innerDetailModel.goodsNameOptions, _this.$data.detailModel['goodsName'])
            _this.$data.innerDetailModel.manufacturerOptions = _this._addOptionLocal(_this.$data.innerDetailModel.manufacturerOptions, _this.$data.detailModel['manufacturer'])
          }

          _this.$data.detailModel = JSON.parse(JSON.stringify(_this.$data.innerDetailModel))
          _this.$data.showCreateDetailModel = keepModal || false
          if (!keepModal) {
            _this.getData(_this.$data.tableProps.currentPage, _this.$data.tableProps.pageSize)
          }
        }, function (error) {
        })
      })
    },
    _addOptionLocal: function (option, value) {
      if (!Array.isArray(option)) {
        return
      }
      value = (value || '').trim()

      if (value === '') {
        return option
      }

      let optionSet = new Set(option)
      if (optionSet.has(value)) {
        return
      }

      optionSet.add(value)
      return Array.from(optionSet)
    },
    cancelAdd: function () {
      this.$data.showCreateDetailModel = false
    },
    getColumns: function () {
      let _render = (h, params) => {
        return h('p', params.row[params.column.key])
      }
      let _this = this
      return [
        {
          type: 'expand',
          width: 20,
          render: (h, params) => {
            return h(contractDetailExpand, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          type: 'selection',
          width: 50,
          align: 'center'
        },
        {
          title: '#',
          width: 60,
          align: 'center',
          render: (h, params) => {
            debugger
            return h('p', _this.$data.tableProps.totalCount - (params.index + ((_this.$data.tableProps.currentPage - 1) * _this.$data.tableProps.pageSize)))
          }
        },
        {
          title: '货物名称',
          key: 'goodsName',
          render: _render
        },
        {
          title: '规格型号',
          key: 'specificationModel',
          render: _render
        },
        {
          title: '实发数量',
          key: 'actualSendQuantity',
          render: _render
        },
        {
          title: '外购单价',
          key: 'purchasedPrice',
          render: _render
        },
        {
          title: '外购金额',
          key: 'purchasedSum',
          render: (h, params) => {
            let result = _this.$decimal(params.row.actualSendQuantity).mul(params.row.purchasedPrice)
            return h('p', result.toNumber())
          }
        },
        {
          title: '供货单位',
          key: 'supplier',
          dataType: 'select',
          render: _render
        },
        {
          title: '实收数量',
          key: 'actualReceivedQuantity',
          render: _render
        },
        {
          title: '配送单价',
          key: 'deliveryPrice',
          render: _render
        },
        {
          title: '配送金额',
          key: 'deliverySum',
          render: (h, params) => {
            debugger
            let result = _this.$decimal(params.row.actualReceivedQuantity).mul(params.row.deliveryPrice)
            return h('p', result.toNumber())
          }
        },
        {
          title: '送达地点',
          key: 'destination',
          dataType: 'select',
          render: _render
        },
        {
          title: '操作',
          fixed: 'right',
          width: 120,
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
                    _this.updateContractDetail(params.row)
                  }
                },
                class: {
                  'custom-ivu-btn-ghost': true
                }
              }, '修改')
            ])
          }
        }
      ]
    },
    getData: function (page, pageSize) {
      page = page || 1
      pageSize = pageSize || 20

      let _this = this
      this.getContractDetailList({
        contractId: this.$route.params.contractId,
        page,
        pageSize

      }).then(function (resp) {
        if (!resp.data.contract) {
          _this.$Modal.error({
            title: '异常',
            content: '该合同已不存在',
            onOk: function () {
              _this._changeRouter()
            }
          })
          return
        }

        _this.$data.contract = resp.data.contract
        _this.$data.tableProps.data = resp.data.contractDetails
        _this.$data.tableProps.totalCount = resp.data.total
      }, function (error) {
        if (error.response) {
          _this.$Modal.error({
            title: '异常',
            content: '获取合同详情列表异常',
            onOk: function () {
              _this._changeRouter()
            }
          })
        } else {
          _this.$Modal.error({
            title: '异常',
            content: '系统内部异常',
            onOk: function () {
              _this._changeRouter()
            }
          })
        }
      })
    },
    addConfig: function (configItem) {
      this.showCreateDetailModel = true

      const route = {
        name: 'cost_accounting_config',
        meta: {
          title: '配置'
        },
        query: {
          configItem: configItem,
          changeRouter: true
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
    },
    _changeRouter: function () {
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
    },
    filterOptions: function (value, option) {
      debugger
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1 ||
          value.toUpperCase().startsWith(option.toUpperCase()) ||
          option.toUpperCase().startsWith(value.toUpperCase())
    }
  },
  mounted () {
    this.getData(this.$data.tableProps.currentPage, this.$data.tableProps.pageSize)
  }
}
</script>

<style scoped>
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  li {
    float: left;
    padding-right: 40px;
  }

  .btn-region {
    margin-bottom: 10px;
  }

  .btn-region button {
    margin-right: 10px;
  }

  .add-operation {
    overflow: auto;
  }

  .add-operation i {
    float: right;
  }

  .ivu-table .custom-table-row td{
    background-color: #2db7f5;
  }
</style>

<style>
  /*
  .ivu-table .demo-table-info-row td{
    background-color: #2db7f5;
    color: #fff;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  }*/
  .ivu-auto-complete.ivu-select-dropdown {
    max-height: 280px!important;
  }

  .ivu-btn-text-config span{
    color: #5cadff;
  }
</style>
