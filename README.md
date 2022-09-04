# 前端规范化 demo

> Vue 3 + TypeScript + Vite

### 配置 eslint

- vite 创建 ts 项目 `yarn create vite`
- 项目安装依赖 `yarn`
- eslint 安装 `yarn add eslint -D`
- eslint 初始化 `npx eslint --init`
  ![img_eKgznX](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_eKgznX.png)  
  得到 eslintrc.cjs

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["plugin:vue/vue3-essential", "standard-with-typescript"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["vue"],
  rules: {},
};
```

生成的这个`standard-with-typescript`非常难用，一直报各种错误，可能比较严格，我们换成`plugin:@typescript-eslint/recommended`，顺便我们也把 vue 的也换成`recommended`

```json
  extends: [
    //  'plugin:vue/vue3-essential',
    //  'standard-with-typescript'
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
```

- 执行`eslint src`， 把开始报的错，全都禁止掉
  ![img_jSzTL9](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_jSzTL9.png)
  说这两个`@typescript-eslint/no-explicit-any`、`@typescript-eslint/ban-types`规则没找到，我们点`error`跳进去,发现代码里面确实用了。
  ![img_Rpc7SV](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_Rpc7SV.png)
  报错原因是因为我们引入的规则，已经将这两个规则用`off`取消掉了，但我们这个文件里还局部用了一下，规则不存在了，还用，当然报错了，把局部使用删掉就可以了。
- 继续执行`eslint src`
  ![img_1_zq55Jb](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_1_zq55Jb.png)
- 还报错，直接把这两个规则`off`取消

```json
  rules: {
    "@typescript-eslint/ban-types":"off",
    "@typescript-eslint/no-explicit-any":"off"
  }
```

- 执行`eslint src` 恢复正常，我们去`package.json`配置`scripts`，

```json
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix"
  },
```

- 执行`yarn lint`
  ![img_2_EkdBau](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_2_EkdBau.png)  
  不能正常解析 vue，这里很有可能引入的 extends 两个冲突，将 parser 覆盖掉了，我们去查找原因。
  首先顺着`plugin:vue/vue3-recommended`查找，顺着内部的导入，最终引入了`node_modules/eslint-plugin-vue/lib/configs/base.js`,我们看到 parser 解析器用了`parser: require.resolve('vue-eslint-parser')`
  ![img_7Qc1bw](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_7Qc1bw.png)
  同样的方式，找到了`plugin:@typescript-eslint/recommended`，最终使用了`parser: '@typescript-eslint/parser'`
  ![img_y8olmU](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_y8olmU.png)
  所以问题找到了，eslint 不能正常解析 vue 的原因，是因为 vue 的 parser 解析器被覆盖了，那我们将两个 extend 调换下顺序。

```json
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended"
],
```

- 执行`yarn lint`  
  因为这样解析 typescript 的 parser 解析器又被覆盖了，所以又报 typescript 相关的错误了
  ![img_h8Zwr5](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_h8Zwr5.png)
  因为我们 vue 项目用的是 ts，所以要手动指定`parserOptions.parser`，至于为什么，文章`工具->eslint`中有写到。

```json
parserOptions: {
  ecmaVersion: 'latest',
  sourceType: 'module',
+ parser: "@typescript-eslint/parser"
},
```

- 再次执行`yarn lint`，都恢复正常了

### 配置 prettier

- `yarn add -D prettier eslint-config-prettier`安装
- 创建`.prettierrc`配置,下面是 element-plus 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "overrides": [
    {
      "files": ".prettierrc",
      "options": {
        "parser": "json"
      }
    }
  ]
}
```

- 执行`npx prettier --write src`，无报错，配置成功

### husky

- `yarn add husky -D`
- `package.json`配置`scripts`，增加`"prepare": "husky install"`

### lint-staged

- `yarn add -D lint-staged`
- `package.json`增加配置

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": ["prettier --write--parser json"],
  "package.json": ["prettier --write"],
  "*.vue": ["eslint --fix", "prettier --write"],
  "*.{scss,less,styl,html}": ["prettier --write"],
  "*.md": ["prettier --write"]
}
```

- 配置 git hooks
  `yarn husky add .husky/pre-commit "npx lint-staged"`
- 执行`git add`、`git commit`成功 ✌️  
  ![img_hSiBpE](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_hSiBpE.png)

### commitlint

- `yarn add @commitlint/cli -D`
- 添加 git hooks `npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'`
- 安装 commitizen `yarn add commitizen -D`
- commitizen 初始化,执行 `npx --no-install commitizen init cz-conventional-changelog --save-dev --save-exact`
- 自定义 commitlint 规则,执行`yarn add commitlint-config-cz cz-customizable -D`
- 创建`.cz-config.js`

```javascript
module.exports = {
  types: [
    { value: "feat", name: "feat: 一个新的特性" },
    { value: "fix", name: "fix: 修复一个Bug" },
    { value: "docs", name: "docs: 变更的只有文档" },
    { value: "style", name: "style: 代码风格,格式修复" },
    { value: "refactor", name: "refactor: 代码重构，注意和feat、fix区分开" },
    { value: "perf", name: "perf: 码优化,改善性能" },
    { value: "test", name: "test: 测试" },
    { alue: "chore", name: "chore: 变更构建流程或辅助工具" },
    { value: "revert", name: "revert: 代码回退" },
    { value: "init", name: "init: 项目初始化" },
    { value: "build", name: "build: 变更项目构建或外部依赖" },
    { value: "WIP", name: "WIP: 进行中的工作" },
  ],
  scopes: [],
  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: "TICKET-",
  ticketNumberRegExp: "\\d{1,5}",
  // it needs to match the value for field type. Eg.: 'fix'
  /*
  scopeOverrides: {
    fix: [
      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: "选择一种你的提交类型:",
    scope: "选择一个scope (可选):",
    // used if allowCustomScopes is true
    customScope: "Denote the SCOPE of this change:",
    subject: "简短说明(最多40个字):",
    body: '长说明，使用"|"换行(可选)：\n',
    breaking: "非兼容性说明 (可选):\n",
    footer: "关联关闭的issue，例如：#12, #34(可选):\n",
    confirmCommit: "确定提交?",
  },
  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix"],
  // skip any questions you want
  skipQuestions: ["scope", "body", "breaking"],
  // limit subject length
  subjectLimit: 100,
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};
```

- package.json,将 config.commitizen.path 更改为`"node_modules/cz-customizable"`

```javascript
// package.json
// ...
{
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    }
  }
}
// ...
```

- 创建 commitlint.config.js，为 commitlint 添加解析规则

```javascript
module.exports = {
  extends: ["cz"],
};
```

vite 创建的项目，`package.json`中指定了`"type": "module"`，说明 js 文件默认使用 ESM 模块规范，不支持 commonjs 规范，但是我们刚刚创建的几个配置文件`.cz-config.js`、`commitlint.config.js`都使用了`module.exports`语法。
![img_pUP3n2](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_pUP3n2.png)
所以在运行 `npx cz`时报错了
![img_1_u6wcaF](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_1_u6wcaF.png)
我们要将这两个配置文件后缀改为`.cjs`，再次执行`npx cz`，还是报错了
![img_2_AVn6nt](https://cdn.jsdelivr.net/gh/NeverStop1024/images-store@main/blog/img_2_AVn6nt.png)
由于我们改了`.cz-config.js`后缀，cz-customizable 找不到配置文件了，我们需要在`package.json`手动加入

```json
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-customizable"
    },
    + "cz-customizable": {
    +   "config": ".cz-config.cjs"
    +  }
  }
```

再次执行`npx cz`，成功了。完结撒花！！！🌸🌸🌸
