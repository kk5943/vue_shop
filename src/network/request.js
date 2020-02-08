import axios from 'axios'
export const request = (config) => {
  const instance = axios.create({
    baseURL: 'https://www.liulongbin.top:8888/api/private/v1',
    timeout: 10000
  })
  instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  })
  return instance(config)
}
