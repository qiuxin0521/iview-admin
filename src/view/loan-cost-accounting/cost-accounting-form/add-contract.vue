<template>
  <div>
    <Card class="custom-card-margin">
      <p slot="title">增加合同</p>
      <Form ref="addContractForm" :model="formItem" :label-width="90" :rules="addContractValidateRules">
        <FormItem label="合同号" style="padding-right: 40px" prop="contractNo">
          <Input v-model="formItem.contractNo" placeholder="请输入合同号"></Input>
        </FormItem>
        <FormItem label="交货经办人" style="padding-right: 40px" prop="operator">
          <!--<Select v-model="formItem.operator" filterable style="width:245px">
            <Option v-for="item in formItem.operatorOptions" :value="item.id">{{ item.name }}</Option>
          </Select>-->
          <AutoComplete
            v-model="formItem.operator"
            :data="formItem.operatorOptions"
            :filter-method="filterOptions"
            placeholder="请输入交货经办人" style="max-height: 280px">
          </AutoComplete>
          <!--<Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('operator')">配置</Button>-->
        </FormItem>
        <FormItem label="配送日期" prop="deliveryDate">
          <DatePicker type="date" placeholder="请选择日期" v-model="formItem.deliveryDate"></DatePicker>
        </FormItem>
        <FormItem label="单位" prop="goodsUnit">
          <!--<Select v-model="formItem.goodsUnit" filterable style="width:245px">
            <Option v-for="item in formItem.goodsUnitOptions" :value="item.id">{{ item.name }}</Option>
          </Select>-->
          <AutoComplete
            v-model="formItem.goodsUnit"
            :data="formItem.goodsUnitOptions"
            :filter-method="filterOptions"
            placeholder="请输入单位" style="max-height: 280px">
          </AutoComplete>
          <!--<Button size="small" type="text" class="ivu-btn-text-config" @click="addConfig('goodsUnit')">配置</Button>-->
        </FormItem>
      </Form>
    </Card>
    <Button type="primary" @click="add" class="custom-button-margin" size="large">确定</Button>
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
        contractNo: '',
        operator: '',
        operatorOptions: [],
        deliveryDate: '',
        goodsUnit: '',
        goodsUnitOptions: []
      },
      addContractValidateRules: {
        contractNo: [
          {required: true, message: '合同号不能为空', trigger: 'blur'},
          {type: 'string', pattern: /[A-Za-z0-9_\-]+/, min: 1, max: 256, message: '长度1到256个字符，支持大小写英文、数字下划线以及中划线', trigger: 'change'}
        ],
        operator: [
          {required: true, message: '交货经办人不能为空', trigger: 'blur'},
          {type: 'string', min: 1, max: 256, message: '长度1到256个字符, 一个中文占两个字符', trigger: 'change'}
        ],
        deliveryDate: [
          {required: true, type: 'date', message: '配送日期不能为空', trigger: 'change'}
        ],
        goodsUnit: [
          {required: true, message: '单位不能为空', trigger: 'blur'},
          {type: 'string', min: 1, max: 64, message: '长度1到64个字符, 一个中文占两个字符', trigger: 'change'}
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
      'loadConfigItem',
      'addContract'
    ]),
    filterOptions: function (value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1
    },
    add: function () {
      let _this = this
      let validateResult = this.$refs.addContractForm.validate()
      validateResult.then(function (result) {
        if (!result) {
          return
        }

        _this.addContract({
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

    let _this = this
    this.loadConfigItem('operator').then(function (resp) {
      _this.$data.formItem.operatorOptions = resp.data
    }, function (error) {
      if (error.response) {
        _this.$Modal.error({
          title: '异常',
          content: '获取交货经办人配置信息失败'
        })
      } else {
        _this.$Modal.error({
          title: '异常',
          content: '系统内部异常'
        })
      }
    })

    this.loadConfigItem('goodsUnit').then(function (resp) {
      _this.$data.formItem.goodsUnitOptions = resp.data
    }, function (error) {
      if (error.response) {
        _this.$Modal.error({
          title: '异常',
          content: '获取单位配置信息失败'
        })
      } else {
        _this.$Modal.error({
          title: '异常',
          content: '系统内部异常'
        })
      }
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
