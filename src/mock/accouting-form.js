import Mock from 'mockjs'
import { doCustomTimes, getParams } from '@/libs/util'

const Random = Mock.Random

const contract_list = []
const contract_detail_map = {}

const config_items = {}

Date.prototype.format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  return fmt
}

function getConfigItemValue (itemKey, id) {
  /* let item_config_list = config_items[itemKey || ''] || [];

  for(let i = 0; i < item_config_list.length; ++i){
    if(item_config_list[i].id === id){
      return item_config_list[i].name;
    }
  } */

  return id
}

function addConfigItemValue (itemKey, value) {
  let configItem = config_items[itemKey]

  if (!configItem) {
    configItem = new Set()
    config_items[itemKey] = configItem
  }

  configItem.add(value)
}

export const getContractList = req => {
  let params = getParams(req.url)

  let page = parseInt(params.page) ? parseInt(params.page) : 1
  let pageSize = parseInt(params.pageSize) ? parseInt(params.pageSize) : 20

  let filtered_list = contract_list.slice((page - 1) * pageSize, page * pageSize)
  let format_list = []

  for (let i = 0; i < filtered_list.length; ++i) {
    let format_contract = JSON.parse(JSON.stringify(filtered_list[i]))
    format_contract.operator = getConfigItemValue('operator', format_contract.operator)
    format_contract.goodsUnit = getConfigItemValue('goodsUnit', format_contract.goodsUnit)
    format_contract.deliveryDate = new Date(format_contract.deliveryDate).format('yyyy-MM-dd')
    format_contract.createTime = new Date(format_contract.createTime).format('yyyy-MM-dd hh:mm:ss')
    format_contract.updateTime = new Date(format_contract.updateTime).format('yyyy-MM-dd hh:mm:ss')

    format_list.push(format_contract)
  }
  return {
    total: contract_list.length,
    contracts: format_list
  }
}

export const getContract = req => {
  debugger
  let params = getParams(req.url)

  let contractId = params.contractId
  if (!contractId) {
    return {
      contract: null
    }
  }

  for (let i = 0; i < contract_list.length; ++i) {
    if (contract_list[i].contractId === contractId) {
      return {
        contract: contract_list[i]
      }
    }
  }

  return {
    contract: null
  }
}

export const addContract = req => {
  let params = JSON.parse(req.body)

  let currentMillis = Date.now()
  contract_list.push(Mock.mock({
    contractId: '@guid',
    contractNo: params.contractNo,
    operator: params.operator,
    deliveryDate: params.deliveryDate,
    goodsUnit: params.goodsUnit,
    createTime: currentMillis,
    updateTime: currentMillis
  }))

  addConfigItemValue('operator', params.operator)
  addConfigItemValue('goodsUnit', params.goodsUnit)
}

export const modifyContract = req => {
  let params = JSON.parse(req.body)

  let currentMillis = Date.now()
  for (let i = 0; i < contract_list.length; ++i) {
    if (contract_list[i].contractId === params.contractId) {
      contract_list[i].operator = params.operator
      contract_list[i].deliveryDate = params.deliveryDate
      contract_list[i].goodsUnit = params.goodsUnit
      contract_list[i].updateTime = currentMillis

      addConfigItemValue('operator', params.operator)
      addConfigItemValue('goodsUnit', params.goodsUnit)

      return {
        contract: contract_list[i]
      }
    }
  }

  return {
    contract: null
  }
}

export const deleteContract = req => {
  let params = JSON.parse(req.body)

  let contractIds = []
  if (Array.isArray(params)) {
    contractIds = params
  } else {
    contractIds.push(params)
  }

  for (let i = 0; i < contractIds.length; ++i) {
    for (let index = 0; index < contract_list.length; ++index) {
      if (contract_list[index].contractId === contractIds[i]) {
        contract_list.splice(index, 1)
        break
      }
    }
  }
}

export const getContractDetailList = req => {
  debugger
  let params = getParams(req.url)

  let contractId = params.contractId
  let page = parseInt(params.page) ? parseInt(params.page) : 1
  let pageSize = parseInt(params.pageSize) ? parseInt(params.pageSize) : 20

  let contract = null
  let formatContractDetails = []
  let total = 0

  for (let index = 0; index < contract_list.length; ++index) {
    if (contract_list[index].contractId === contractId) {
      contract = contract_list[index]
      break
    }
  }

  if (contract != null) {
    let format_contract = JSON.parse(JSON.stringify(contract))
    format_contract.operator = getConfigItemValue('operator', format_contract.operator)
    format_contract.goodsUnit = getConfigItemValue('goodsUnit', format_contract.goodsUnit)
    format_contract.deliveryDate = new Date(format_contract.deliveryDate).format('yyyy-MM-dd')
    contract = format_contract

    let contractDetail = (contract_detail_map[contractId] || []).slice((page - 1) * pageSize, page * pageSize)
    total = contractDetail.length

    for (let index = 0; index < contractDetail.length; ++index) {
      let format_contract_detail = JSON.parse(JSON.stringify(contractDetail[index]))
      format_contract_detail.specificationModel = getConfigItemValue('specificationModel', format_contract_detail.specificationModel)
      format_contract_detail.supplier = getConfigItemValue('supplier', format_contract_detail.supplier)
      format_contract_detail.destination = getConfigItemValue('destination', format_contract_detail.destination)

      formatContractDetails.push(format_contract_detail)
    }
  }

  return {
    total,
    contract,
    contractDetails: formatContractDetails
  }
}

export const addContractDetail = req => {
  debugger
  let params = JSON.parse(req.body)

  let contractId = params.contractId
  let contractDetail = params.contractDetail
  if (!contractId) {
    return
  }

  let contract_exist = false
  for (let i = 0; i < contract_list.length; ++i) {
    if (contract_list[i].contractId === contractId) {
      contract_exist = true
      break
    }
  }
  if (!contract_exist) {
    return
  }

  let contractDetails = contract_detail_map[contractId] || []
  contract_detail_map[contractId] = contractDetails
  if (contractDetail) {
    let detailId = Mock.mock({
      id: '@guid'
    })
    contractDetail['detailId'] = detailId.id
    contractDetails.push(contractDetail)
    contract_detail_map[contractId] = contractDetails

    addConfigItemValue('specificationModel', contractDetail['specificationModel'])
    addConfigItemValue('supplier', contractDetail['supplier'])
    addConfigItemValue('destination', contractDetail['destination'])
  }
}

export const deleteContractDetail = req => {
  debugger
  let params = JSON.parse(req.body)

  let contractId = params.contractId
  if (!contractId) {
    return
  }

  let contract_exist = false
  for (let i = 0; i < contract_list.length; ++i) {
    if (contract_list[i].contractId === contractId) {
      contract_exist = true
      break
    }
  }
  if (!contract_exist) {
    return
  }

  let contractDetailIds = []
  if (Array.isArray(params.contractDetailIds)) {
    contractDetailIds = params.contractDetailIds
  } else {
    contractDetailIds.push(params.contractDetailIds)
  }

  let contractDetails = contract_detail_map[contractId] || []
  if (!contractDetails.length) {
    return
  }

  for (let index = 0; index < contractDetailIds.length; ++index) {
    for (let i = 0; i < contractDetails.length; ++i) {
      if (contractDetails[i].detailId === contractDetailIds[index]) {
        contractDetails.splice(i, 1)
        break
      }
    }
  }

  contract_detail_map[contractId] = contractDetails
}

export const getConfigItem = req => {
  let params = getParams(req.url)

  if (!params.configItemKey) {
    return []
  }

  return Array.from(config_items[params.configItemKey] || [])
}

export const addConfigItem = req => {
  let params = JSON.parse(req.body)

  if (!params.configItemKey || !params.itemValue) {
    return null
  }

  if (!(params.configItemKey in config_items) || !config_items[params.configItemKey]) {
    config_items[params.configItemKey] = []
  }

  for (let i = 0; i < config_items[params.configItemKey].length; ++i) {
    if (params.itemValue === config_items[params.configItemKey][i].value) {
      return null
    }
  }

  config_items[params.configItemKey].push(Mock.mock({
    id: '@guid',
    name: (params.itemValue || '').trim(),
    description: (params.itemDescription || '').trim()
  }))

  return null
}

export const deleteConfigItem = req => {
  let params = JSON.parse(req.body)

  for (let configItemKey in params) {
    if (!(configItemKey in config_items)) {
      continue
    }

    if (typeof params[configItemKey] === 'string' || typeof params[configItemKey] instanceof String) {
      for (let index = 0; index < config_items[configItemKey].length; ++index) {
        if (config_items[configItemKey][index].id === params[configItemKey]) {
          config_items[configItemKey].splice(index, 1)
          continue
        }
      }
    }

    if (Array.isArray(params[configItemKey])) {
      for (let deleteId in params[configItemKey]) {
        for (let index = 0; index < config_items[configItemKey].length; ++index) {
          if (config_items[configItemKey][index].id === String(params[configItemKey][deleteId])) {
            config_items[configItemKey].splice(index, 1)
            continue
          }
        }
      }
    }
  }
}
