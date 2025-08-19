[한국어](/README.md) | [English](/docs/en/README.md) | [**简体字**](/docs/zh/README.md)

<img width="3212" height="1793" alt="리드미표지" src="https://github.com/user-attachments/assets/7515348e-4e38-42c9-a7c3-96c45524a490" />

## 目录

- [概述](#概述)
- [主要功能](#主要功能)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [详细功能](#详细功能)
- [性能优化](#性能优化)
- [团队成员及职责分工](#团队成员及职责分工)
- [故障排除](#故障排除)
- [后端文件夹结构](#后端文件夹结构)

## 概述

> Moving 是一个智能搬家比较平台，帮助用户轻松比较多个搬家公司的报价，并选择最适合自己需求的专业人士。它简化了之前复杂且不透明的搬家报价流程，让用户能够快速找到符合期望条件（搬家类型、地区、日程等）的专家。此外，从搬家公司的角度来看，也能实现高效的客户匹配，提供透明的交易环境和便捷的服务体验。
>
> 项目期间: 2025.07.01 ~ 2025.08.18 <br />
> 测试账户: <table >

    <tr>
      <td>id</td>
      <td>client1@test.com</td>
    </tr>
    <tr>
      <td>pw</td>
      <td>password1!</td>
    </tr> </table>

- [前端仓库](https://github.com/az0319h/6th-Moving-4Team-FE)
- [前端部署网站](https://moving-web.site/ko)
- [后端部署网站](https://api.moving-web.site/)
- [Swagger API](https://api.moving-web.site/docs/)

## 主要功能

<table>
  <thead>
    <tr>
      <th align="center">落地页及咨询</th>
      <th align="center">寻找搬家公司</th>
      <th align="center">资料注册</th>
      <th align="center">报价请求</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/a7dc306f-fd4a-49a5-a78c-88b7523cf19b" alt="落地页及咨询" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/77e85b0f-6da1-4ffb-8e18-e5e86ca4c0b1" alt="寻找搬家公司" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/6ff5b0ac-916e-4657-b865-1cf31c72daaf" alt="资料注册" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/6ae0fa3a-43b6-4fd5-b5f0-4363d3be046b" alt="报价请求" width="200">
      </td>
    </tr>
  </tbody>
</table>
<table>
  <thead>
    <tr>
      <th align="center">撰写评价</th>
      <th align="center">报价计算器</th>
      <th align="center">实时聊天</th>
      <th align="center">社区</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/07c810ea-87c8-4b07-a80a-e16b3fcfd602" alt="撰写评价" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/97374679-cf21-487b-ac21-29191689936a" alt="报价计算器" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/c3a96807-55bf-4328-9b05-549f6e6f2f39" alt="实时聊天" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/8ff7abca-d4e5-4fca-8a39-5431a0587e2a" alt="社区" width="200">
      </td>
    </tr>
  </tbody>
</table>

## 系统架构

<img width="3212" height="2023" alt="fa68b90569ee2253" src="https://github.com/user-attachments/assets/b271e73e-7096-412c-8cfa-a7b8318607f2" />

## 技术栈

### 前端

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

### 后端

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![RDS](https://img.shields.io/badge/AWS_RDS-527FFF?style=flat-square&logo=amazon-rds&logoColor=white)
![S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=amazon-s3&logoColor=white)

### 库

![date-fns](https://img.shields.io/badge/date--fns-770C56?style=flat-square&logo=date-fns&logoColor=white)
![react-icons](https://img.shields.io/badge/react--icons-E91E63?style=flat-square&logo=react&logoColor=white)
![react-hook-form](https://img.shields.io/badge/react--hook--form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white)
![Cookie-Parser](https://img.shields.io/badge/Cookie--Parser-8A2BE2?style=flat-square&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-00BFFF?style=flat-square&logo=lock&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=flat-square&logo=passport&logoColor=white)

### 托管和部署

![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=white)
![EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat-square&logo=amazon-ec2&logoColor=white)
![Route 53](https://img.shields.io/badge/Route_53-8C4FFF?style=flat-square&logo=amazon-route-53&logoColor=white)

### CI/CD

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

### 其他

![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white)
![DeepL](https://img.shields.io/badge/DeepL-0F2B46?style=flat-square&logo=deepl&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)

## 详细功能

- **寻找搬家公司**: 基于位置、服务类型、评分的筛选和排序
- **社交登录**: 支持 Google、Kakao、Naver 社交登录
- **个人资料**: 个人信息、搬家类型、地区信息管理
- **报价请求**: 基于聊天的报价请求系统
- **报价管理**: 查看收到的报价、批准/拒绝、跟踪进度
- **收藏夹**: 保存和管理偏好的搬家公司
- **评价**: 搬家完成后撰写评价和查看评分
- **多语言支持**: 完全支持韩语（默认）、英语、中文
- **实时通知**: 基于 SSE 的实时通知系统
- **社区**: 用户交流和信息共享空间
- **客户支持**: 咨询提交和文件上传支持
- **实时聊天**: 基于 Firebase 的客户与搬家公司的实时聊天功能
- **报价计算器**: 基础报价和基于 OpenAI GPT-4 的报价计算系统

## 性能优化

- 基于**Next.js App Router**的服务器组件
- **React Suspense**和**懒加载**
- **TanStack Query**缓存策略
- **图像优化**（Next.js Image 组件）
- **代码分割**和**包优化**

## 团队成员及职责分工

<table align="center">
  <tbody>
    <tr>
      <th>团队负责人</th>
      <th>成员</th>
      <th>成员</th>
      <th>成员</th>
      <th>成员</th>
      <th>成员</th>
      <th>成员</th>
    </tr>
    <tr>
      <td align="center">
        <a href="https://github.com/az0319h">
          <img src="https://github.com/az0319h.png?size=100" width="100px" alt="洪成勋"/>
          <br />
          <b>洪成勋</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/fiivxyxxng">
          <img src="https://github.com/fiivxyxxng.png?size=100" width="100px" alt="吴河英"/>
          <br />
          <b>吴河英</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/writing-sky">
          <img src="https://github.com/writing-sky.png?size=100" width="100px" alt="杨成京"/>
          <br />
          <b>杨成京</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/suKyoung25">
          <img src="https://github.com/suKyoung25.png?size=100" width="100px" alt="金秀京"/>
          <br />
          <b>金秀京</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/jbinyim">
          <img src="https://github.com/jbinyim.png?size=100" width="100px" alt="林正彬"/>
          <br />
          <b>林正彬</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Shinmilli">
          <img src="https://github.com/Shinmilli.png?size=100" width="100px" alt="申秀敏"/>
          <br />
          <b>申秀敏</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/shimyubin">
          <img src="https://github.com/shimyubin.png?size=100" width="100px" alt="沈有彬"/>
          <br />
          <b>沈有彬</b>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="https://pointed-afternoon-24b.notion.site/2173fde0e19480728178dce120cbdabb" target="_blank">个人报告</a>
      </td>
      <td align="center">
        <a href="https://immediate-conga-b1b.notion.site/217fb120f2ad80ea85b2e44377f62a58" target="_blank">个人报告</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/3-21788b3cb86180698299f89f0ee4ff53" target="_blank">个人报告</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/21783b8d694c801db314d01f63cd68c4" target="_blank">个人报告</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/217e8b00d07a8036a583ddb33c62345d" target="_blank">个人报告</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/2177a895c9ac8039a81fc7aad5fdbaed" target="_blank">个人报告</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/1c4c0886ab1380968ff8febb837182c7" target="_blank">个人报告</a>
      </td>
    </tr>
  </tbody>
</table>

- **洪成勋**

  - 拒绝请求和已发送报价列表 API
  - 报价请求和拒绝 API
  - 收到请求查询 API
  - 收到请求和拒绝请求详情 API
  - 报价请求和拒绝取消 API

- **吴河英**

  - 报价请求 API
  - 收到请求查询 API
  - 通知 API
  - AWS RDS、S3 设置和 EC2 部署
  - S3 图像上传实现

- **杨成京**

  - 普通用户登录/注册 API
  - 普通用户资料注册/修改 API
  - 社交登录 API
  - express-rate-limit 中间件

- **金秀京**

  - 搬家公司登录/注册 API
  - 搬家公司资料注册/修改 API
  - 搬家公司基本信息修改 API
  - 社交登录初始设置
  - 账户注销功能

- **林正彬**

  - 待处理报价查询 API
  - 收到报价查询 API
  - 报价详情查询 API
  - 报价确认 API
  - 社区帖子和评论创建、查询、删除 API

- **申秀敏**

  - 会员/非会员认证中间件
  - 搬家公司列表查询 API
  - 搬家公司详情查询 API
  - 搬家公司资料查询 API
  - 搬家公司收藏切换 API

- **沈有彬**
  - 可撰写评价列表 API
  - 评价 CRUD
  - 收藏搬家公司列表 API
  - DeepL API

## 故障排除

<details>
<summary><strong> 韩语输入聊天重复发送问题（Mac / Safari / macOS环境） </strong></summary>
<div markdown="1">

#### 问题情况

- Windows 环境中，聊天通过一次 Enter 键正常发送
- Mac / Safari / macOS 环境中，韩语组合输入完成后按 Enter 键时，相同消息被发送两次
- 主要在使用组合输入（IME，输入法编辑器）时发生

#### 原因分析

- macOS 中韩语输入事件流程如下：
  `keydown → compositionstart → compositionupdate → compositionend → keydown`
- compositionend 后 keydown 事件再次发生，导致 Enter 事件被调用两次
- 当前消息发送逻辑仅检测 Enter 键事件，因此组合完成后 Enter 被调用两次导致重复发送

#### 解决方法

- 在韩语输入组合期间（`compositionstart` ~ `compositionend`）忽略 Enter 事件
- 在`onKeyDown`事件处理程序中检查`isComposing`状态以确定消息发送
- 在 Windows / Mac / 移动环境中测试相同行为

```typescript
const [isComposing, setIsComposing] = useState(false);

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey && !isComposing) {
    e.preventDefault();
    sendMessage();
  }
};

<textarea
  onCompositionStart={() => setIsComposing(true)}
  onCompositionEnd={() => setIsComposing(false)}
  onKeyDown={handleKeyDown}
/>;
```

</div>
</details>

<details>
<summary><strong> 报价请求表单草稿保存和同步问题 </strong></summary>
<div markdown="1">

#### 问题情况

- 在报价请求期间实现了表单中间状态自动保存到服务器，设计为从服务器加载初始保存的草稿，并在表单状态更新时通过`saveDraft`逻辑更新服务器
- 但是，尽管`savedDraft`反映了最新状态，再次检索草稿时返回的是之前的状态，导致刷新或页面导航时最新保存状态未被反映

#### 原因分析

- 使用`debouncedSave`导致时间问题，最新状态未完全反映到服务器
- React Query 应用导致新请求时之前的草稿缓存持续存在，阻止最新数据反映
- `currentStep`值在上下文中未初始化并设置回之前的状态，导致服务器草稿和本地状态不匹配

#### 解决方案

- **移除 debouncedSave**: 通过改为立即保存来消除时间问题
- **应用双重保存结构**: 表单状态更新时同时更新`localStorage`和服务器草稿 → 即使在刷新/页面导航时也保持相同状态
- **初始加载优先级**: 如果存在`localStorage`值则优先反映，否则加载服务器草稿作为初始状态
- **改进 currentStep 同步**: 基于服务器草稿的`currentStep`初始化，确保客户端更新时本地/服务器两侧都更新

</div>
</details>

## 后端文件夹结构

```
6th-Moving-4Team-BE
├─ .prettierrc              # 代码格式化设置
├─ README.md
├─ jest.config.ts           # Jest测试配置
├─ package-lock.json
├─ package.json             # 项目依赖/脚本
├─ prisma
│  ├─ migrations            # 数据库迁移记录
│  ├─ schema.prisma         # Prisma ORM模式
├─ src
│  ├─ app.ts                # Express应用初始化
│  ├─ configs               # 环境/库配置
│  ├─ constants             # 常量集合
│  ├─ controllers           # 请求处理控制器
│  ├─ dtos                  # 请求/响应DTO定义
│  ├─ instrument.ts         # 监控配置
│  ├─ integration-test      # 集成测试
│  ├─ middlewares           # Express中间件
│  ├─ mocks                 # 测试用Mock数据
│  ├─ repositories          # 数据库访问层
│  ├─ routers               # 路由器定义
│  ├─ schedule              # 调度器任务
│  ├─ server.ts             # 服务器执行入口点
│  ├─ services              # 业务逻辑
│  ├─ swagger.ts            # Swagger UI配置
│  ├─ swagger.yaml          # API规范
│  ├─ types                 # 通用类型定义
│  └─ utils                 # 工具函数
└─ tsconfig.json            # TypeScript配置

```
