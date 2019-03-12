import Mock from 'mockjs'
import { login, logout, getUserInfo } from './login'
import { getTableData, getDragList } from './data'
import {
  getContractList,
  getContract,
  addContract,
  modifyContract,
  deleteContract,
  getContractDetailList,
  addContractDetail,
  deleteContractDetail,
  getConfigItem,
  addConfigItem,
  deleteConfigItem } from './accouting-form'

// 登录相关和获取用户信息
Mock.mock(/\/login/, login)
Mock.mock(/\/get_info/, getUserInfo)
Mock.mock(/\/logout/, logout)
Mock.mock(/\/get_table_data/, getTableData)
Mock.mock(/\/get_drag_list/, getDragList)

Mock.mock(/\/get_contract_detail_list/, getContractDetailList)
Mock.mock(/\/add_contract_detail/, addContractDetail)
Mock.mock(/\/delete_contract_detail/, deleteContractDetail)

Mock.mock(/\/get_contract_list/, getContractList)
Mock.mock(/\/get_contract/, getContract)
Mock.mock(/\/add_contract/, addContract)
Mock.mock(/\/modify_contract/, modifyContract)
Mock.mock(/\/delete_contract/, deleteContract)

Mock.mock(/\/get_config_item/, getConfigItem)
Mock.mock(/\/add_config_item/, addConfigItem)
Mock.mock(/\/delete_config_item/, deleteConfigItem)

export default Mock
