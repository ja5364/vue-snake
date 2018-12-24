// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    "arrow-parens": 0, //箭头函数用小括号括起来
    'generator-star-spacing': 0, //生成器函数*的前后空格
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 验证加分号
    'semi': [2, 'always'],
    // 数组和对象键值对最后一个逗号， never参数：不能带末尾的逗号, always参数：必须带末尾的逗号，
    // always-multiline：多行模式必须带逗号，单行模式不能带逗号
    "comma-dangle": [2, "never"],
    // 指定数组的元素之间要以空格隔开(,后面)， never参数：[ 之前和 ] 之后不能带空格，always参数：[ 之前和 ] 之后必须带空格
    "array-bracket-spacing": [2, "never"],
    "key-spacing": [0, { "beforeColon": false, "afterColon": true }],//对象字面量中冒号的前后空格
  }
}
