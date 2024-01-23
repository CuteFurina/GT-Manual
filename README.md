# GT-Manual服务端
 
* Miao-Yunzai版本GTest插件：[GT-Manual-plugin](https://static.hlhs-nb.cn/upload/GT-Manual-plugin.zip)  
若您不想部署demo或没有公网地址可以使用他人提供的接口
 
* 值得一提的是QQ不允许直接访问IP地址  
需要添加域名解析或复制地址到浏览器访问  
 
* 若外部网络无法访问地址需要前往防火墙放行对应端口，具体操作请自行百度

## 使用方法

### 1.克隆项目

```
# 克隆项目
git clone https://gitee.com/QQ1146638442/GT-Manual.git
cd GT-Manual

# 安装pnpm ，已安装的可以跳过
npm install pnpm -g
# 使用pnpm安装依赖
pnpm install -P
```

### 2.运行服务

```
# 前台运行
node app

# 后台运行
npm start
# 显示日志
npm run log
```

### 3.修改配置

首次运行会在config目录生成配置文件 ，根据说明修改完成后重启服务
