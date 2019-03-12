import axios from '@/libs/api.request'

const CONTRACT_PREFIX = '/contract/'

export const getContractList = ({ query }) => {
  query = query || {}
  return axios.request({
    url: CONTRACT_PREFIX + 'get_contract_list',
    method: 'get',
    params: {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      field: query.field || 'createTime',
      order: query.order || 'desc',
      search: query.search || ''
    }
  })
}

export const getContract = (contractId) => {
  return axios.request({
    url: CONTRACT_PREFIX + 'get_contract',
    method: 'get',
    params: { contractId }
  })
}

export const addContract = ({ contract }) => {
  let data = contract
  return axios.request({
    url: CONTRACT_PREFIX + 'add_contract',
    method: 'post',
    data
  })
}

export const modifyContract = ({ contract }) => {
  let data = contract
  return axios.request({
    url: CONTRACT_PREFIX + 'modify_contract',
    method: 'put',
    data
  })
}

export const deleteContract = ({ contractIds }) => {
  let data = contractIds
  return axios.request({
    url: CONTRACT_PREFIX + 'delete_contract',
    method: 'delete',
    data
  })
}

export const exportContract = (contractIds) => {
  let data = contractIds
  return axios.request({
    url: CONTRACT_PREFIX + 'export_contract',
    method: 'get',
    responseType: 'blob',
    params: {
      contractIds
    }
  })
}

export const getContractDetailList = ({ query }) => {
  return axios.request({
    url: CONTRACT_PREFIX + 'get_contract_detail_list',
    method: 'get',
    params: {
      contractId: query.contractId || '',
      page: query.page || '',
      pageSize: query.pageSize || ''
    }
  })
}

export const addContractDetail = ({ contractDetail }) => {
  let data = contractDetail

  return axios.request({
    url: CONTRACT_PREFIX + 'add_contract_detail',
    method: 'post',
    data
  })
}

export const modifyContractDetail = ({ contractDetail }) => {
  let data = contractDetail

  return axios.request({
    url: CONTRACT_PREFIX + 'modify_contract_detail',
    method: 'put',
    data
  })
}

export const deleteContractDetail = ({ contractDetail }) => {
  let data = contractDetail

  return axios.request({
    url: CONTRACT_PREFIX + 'delete_contract_detail',
    method: 'delete',
    data
  })
}

const CONFIG_PREFIX = '/config/'

export const getConfigItem = (configItemKey) => {
  return axios.request({
    url: CONFIG_PREFIX + 'get_config_item',
    params: {
      configItemKey
    },
    method: 'get'
  })
}

export const addConfigItem = ({ configItemKey, itemValue, itemDescription }) => {
  return axios.request({
    url: CONFIG_PREFIX + 'add_config_item',
    data: {
      configItemKey,
      itemValue,
      itemDescription
    },
    method: 'post'
  })
}

export const deleteConfigItem = ({ deleteItems }) => {
  let data = deleteItems

  return axios.request({
    url: CONFIG_PREFIX + 'delete_config_item',
    data,
    method: 'delete'
  })
}

export const modifyPassword = ({ password }) => {
  let data = password

  return axios.request({
    url: '/user/modify_password',
    method: 'put',
    data
  })
}
