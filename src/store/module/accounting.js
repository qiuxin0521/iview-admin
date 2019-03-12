import Vue from 'vue'
import {
  getContractList,
  getContract,
  addContract,
  modifyContract,
  deleteContract,
  exportContract,
  getContractDetailList,
  addContractDetail,
  modifyContractDetail,
  deleteContractDetail,
  getConfigItem,
  addConfigItem,
  deleteConfigItem,
  modifyPassword } from '@/api/accounting-form'

const proto = Vue.prototype

export default {
  state: {
    configItem: {
      operator: [],
      goodsUnit: [],
      specificationModel: [],
      supplier: [],
      destination: [],
      defaultItem: []
    }
  },
  getters: {
    getConfigItem: (state) => (configItem) => { return state.configItem[configItem || 'defaultItem'] || [] }
  },
  mutations: {
    setConfigItem (state, payload) {
      if (!payload || !payload.configItem || !payload.value) {
        return
      }

      if (!state.configItem[payload.configItem]) {
        return
      }

      if (!Array.isArray(payload.value)) {
        return
      }

      state.configItem[payload.configItem] = value
    }
  },
  actions: {
    getContractList ({ state, commit }, query) {
      return new Promise((resolve, reject) => {
        getContractList({ query }).then((resp) => {
          resolve(resp)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    getContract ({ state, commit }, contractId) {
      return new Promise((resolve, reject) => {
        getContract(contractId).then((resp) => {
          resolve(resp)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    addContract ({ state, commit }, contract) {
      return new Promise((resolve, reject) => {
        addContract({ contract }).then((resp) => {
          proto.$Message.success('创建成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('创建失败')
          reject(error)
        })
      })
    },
    modifyContract ({ state, commit }, contract) {
      return new Promise((resolve, reject) => {
        modifyContract({ contract }).then((resp) => {
          proto.$Message.success('修改成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('修改失败')
          reject(error)
        })
      })
    },
    deleteContract ({ state, commit }, contractIds) {
      return new Promise((resolve, reject) => {
        deleteContract({ contractIds }).then((resp) => {
          proto.$Message.success('删除成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('删除失败')
          reject(error)
        })
      })
    },
    exportContract ({ state, commit }, contractIds) {
      return new Promise((resolve, reject) => {
        exportContract(contractIds).then((resp) => {
          proto.$Message.success('导出成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('导出失败')
          reject(error)
        })
      })
    },
    getContractDetailList ({ state, commit }, query) {
      return new Promise((resolve, reject) => {
        getContractDetailList({ query }).then((resp) => {
          resolve(resp)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    addContractDetail ({ state, commit }, contractDetail) {
      return new Promise((resolve, reject) => {
        addContractDetail({ contractDetail }).then((resp) => {
          proto.$Message.success('创建成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('创建失败')
          reject(error)
        })
      })
    },
    modifyContractDetail ({ state, commit }, contractDetail) {
      return new Promise((resolve, reject) => {
        modifyContractDetail({ contractDetail }).then((resp) => {
          proto.$Message.success('修改成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.success('修改失败')
          reject(error)
        })
      })
    },
    deleteContractDetail ({ state, commit }, contractDetail) {
      return new Promise((resolve, reject) => {
        deleteContractDetail({ contractDetail }).then((resp) => {
          proto.$Message.success('删除成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('删除失败')
          reject(error)
        })
      })
    },
    loadConfigItem ({ commit, state }, configItem) {
      return new Promise((resolve, reject) => {
        getConfigItem(configItem).then((resp) => {
          resolve(resp)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    addConfigItem ({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        addConfigItem({
          configItemKey: payload.configItemKey,
          itemValue: payload.itemValue,
          itemDescription: payload.itemDescription
        }).then((resp) => {
          resolve(resp)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    deleteConfigItem ({ commit, state }, deleteItems) {
      return new Promise((resolve, reject) => {
        deleteConfigItem({deleteItems}).then((resp) => {
          resolve(resp)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    modifyPassword ({ commit, state }, password) {
      return new Promise((resolve, reject) => {
        modifyPassword({ password }).then((resp) => {
          proto.$Message.success('修改成功')
          resolve(resp)
        }).catch((error) => {
          proto.$Message.error('修改失败')
          reject(error)
        })
      })
    }
  }
}
