module.exports = {
    // 运行 jest 的时候寻找测试文件的路径
    testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
    // 测试文件中导入文件的后缀，配置.vue
    moduleFileExtensions: [
      'js',
      'json',
      // 告诉 Jest 处理 `*.vue` 文件
      'vue'
    ],
    // 转换：通过正则配置匹配的文件，交给哪个模块处理
    transform: {
      // 用 `vue-jest` 处理 `*.vue` 文件
      '.*\\.(vue)$': 'vue-jest',
      // 用 `babel-jest` 处理 js
      '.*\\.(js)$': 'babel-jest'
    }
  }
  