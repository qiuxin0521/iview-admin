<template>
  <div>
    <Card class="custom-card-margin">
      <p slot="title">修改合同</p>
      <Form ref="modifyContractForm" :model="formItem" :label-width="90" :rules="modifyContractValidateRules">
        <FormItem label="合同号" style="padding-right: 40px" prop="contractNo">
          <Input v-model="formItem.contractNo" placeholder="请输入合同号" disabled></Input>
        </FormItem>
        <FormItem label="交货经办人" prop="operator">
          <!--<Select v-model="formItem.operator" filterable style="width:245px">
            <Option v-for="item in formItem.operatorOptions" :value="item.id">{{ item.name }}</Option>
          </Select>
          <Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('operator')">配置</Button>-->
          <AutoComplete
            v-model="formItem.operator"
            :data="formItem.operatorOptions"
            :filter-method="filterOptions"
            placeholder="请输入交货经办人" style="max-height: 280px">
          </AutoComplete>
        </FormItem>
        <FormItem label="配送日期" prop="deliveryDate">
          <DatePicker type="date" placeholder="请选择日期" v-model="formItem.deliveryDate"></DatePicker>
        </FormItem>
        <FormItem label="单位" prop="goodsUnit">
          <!--<Select v-model="formItem.goodsUnit" filterable style="width:245px">
            <Option v-for="item in formItem.goodsUnitOptions" :value="item.id">{{ item.name }}</Option>
          </Select>
          <Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('goodsUnit')">配置</Button>-->
          <AutoComplete
            v-model="formItem.goodsUnit"
            :data="formItem.goodsUnitOptions"
            :filter-method="filterOptions"
            placeholder="请输入单位" style="max-height: 280px">
          </AutoComplete>
        </FormItem>
      </Form>
      <Spin fix v-if="spinShow" size="large" style="background-color: rgba(255, 255, 255, 0.6)">
      </Spin>
    </Card>
    <Button type="primary" @click="modify" class="custom-button-margin" size="large">确定</Button>
    <Button type="error" @click="cancel" class="custom-button-margin" size="large">取消</Button>
  </div>
</template>

<script>
import { getNewTagList, getNextRoute, routeEqual } from '@/libs/util'
import { mapMutations, mapActions } from 'vuex'
export default {
  name: 'add-contract',
  data () {
    return {
      formItem: {
        contractId: '',
        contractNo: '',
        operator: '',
        operatorOptions: [],
        deliveryDate: '',
        goodsUnit: '',
        goodsUnitOptions: []
      },
      modifyContractValidateRules: {
        contractNo: [
          {required: true, message: '合同号不能为空', trigger: 'blur'},
          {type: 'string', pattern: /[A-Za-z0-9_\-]+/, min: 1, max: 256, message: '长度1到256个字符，支持大小写英文、数字下划线以及中划线', trigger: 'change'}
        ],
        operator: [
          {required: true, message: '交货经办人不能为空', trigger: 'blur'},
          {type: 'string', min: 1, max: 256, message: '长度1到256个字符，一个中文占两个字符', trigger: 'change'}
        ],
        deliveryDate: [
          {required: true, type: 'date', message: '配送日期不能为空', trigger: 'change'}
        ],
        goodsUnit: [
          {required: true, message: '单位不能为空', trigger: 'blur'},
          {type: 'string', min: 1, max: 64, message: '长度1到64个字符，一个中文占两个字符', trigger: 'change'}
        ]
      },
      spinShow: true
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
      'getContract',
      'modifyContract'
    ]),
    filterOptions: function (value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1
    },
    modify: function () {
      let _this = this
      let validateResult = this.$refs.modifyContractForm.validate()
      validateResult.then(function (result) {
        if (!result) {
          return
        }

        _this.modifyContract({
          contractId: _this.$data.formItem.contractId,
          contractNo: _this.$data.formItem.contractNo,
          operator: _this.$data.formItem.operator,
          deliveryDate: new Date(_this.$data.formItem.deliveryDate).getTime(),
          goodsUnit: _this.$data.formItem.goodsUnit
        }).then(function (resp) {
          _this._changeRouter()
        }, function (error) {
          _this._changeRouter()
        })
      })
    },
    cancel: function () {
      this._changeRouter()
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
    addConfig: function (configItem) {
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
    }
  },
  mounted () {
    this.setBreadCrumb(this.$route.matched)

    let operatorPromise = this.loadConfigItem('operator')
    let goodsUnitPromise = this.loadConfigItem('goodsUnit')
    let _this = this
    Promise.all([operatorPromise, goodsUnitPromise]).then((values) => {
      let operators = values[0]
      let goodsUnit = values[1]

      if (operators instanceof Error || goodsUnit instanceof Error) {
        _this.$Modal.error({
          title: '提示',
          content: '获取配置信息错误',
          onOk: () => {
            _this._changeRouter()
          }
        })
        return
      }

      _this.$data.formItem.operatorOptions = operators.data
      _this.$data.formItem.goodsUnitOptions = goodsUnit.data

      _this.getContract(_this.$route.params.contractId).then(function (resp) {
        if (resp.data == null || resp.data === 'null' || resp.data.contract == null) {
          _this.$Modal.error({
            title: '提示',
            content: '该合同已不存在',
            onOk: () => {
              _this._changeRouter()
            }
          })
          return
        }

        let contract = resp.data.contract
        _this.$data.formItem.contractId = contract.contractId
        _this.$data.formItem.contractNo = contract.contractNo
        _this.$data.formItem.deliveryDate = contract.deliveryDate
        _this.$data.formItem.operator = contract.operator
        _this.$data.formItem.goodsUnit = contract.goodsUnit

        _this.$data.spinShow = false
      }, function (error) {
        _this.$Modal.error({
          title: '提示',
          content: '获取合同信息错误',
          onOk: () => {
            _this._changeRouter()
          }
        })
      })
    })
  }
}
</script>

<style scoped>
  .custom-card-margin {
    margin-bottom: 10px;
    width: 410px;
  }

  .custom-button-margin {
    margin-right: 10px;
  }
</style>

<style>
  .ivu-btn-text-config span{
  color: #5cadff;
  }

  .ivu-auto-complete.ivu-select-dropdown {
    max-height: 280px!important;
  }
</style>
