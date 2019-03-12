import axios from '@/libs/api.request'

export const login = ({ userName, password }) => {
  const data = {
    userName,
    password
  }
  return axios.request({
    url: 'session/login',
    data,
    method: 'post',
    params: data
  })
}

export const getUserInfo = (token) => {
  return axios.request({
    url: 'session/get_info',
    params: {
      token
    },
    method: 'get'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'session/logout',
    method: 'post'
  })
}
