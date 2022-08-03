# readerManager

该项目为一个基于Element-UI组件库和Express搭建的图书管理中后台项目。在本项目前端部分采用了知名开源库vue-element-admin简化了开发，在此开源库的基础上增加了许多功能；在后端部分采用简易灵活的Express框架配合Node.js进行实现。

## 技术栈
Vue + Node + MySQL + Nginx

## 项目功能
1. 利用JWT生成Token,对路由进行校验
2. 实现动态路由与权限校验
3. 利用MD5+SALT实现用户密码加密
4. 通过multer实现文件上传
5. 通过adm-zip和epub库实现电子书解压与解析，同时通过自定义修改方法获取电子书图片以及目录
6. 实现分页与排序，图书的增删改查
7. ...
