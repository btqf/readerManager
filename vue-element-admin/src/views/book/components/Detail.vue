<template>
  <div class="detail">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar ' + postForm.status">
        <el-button v-if="!isEdit" @click.prevent.stop="showGuide">显示帮助</el-button>
        <el-button
          v-loading="loading"
          style="margin-left: 10px;"
          type="success"
          @click="submitForm">
          {{ isEdit ? '编辑电子书' : '新增电子书' }}
        </el-button>
      </sticky>
      <div class="detail-container">
        <el-row>
          <Warning />
          <el-col :span="24">
            <el-form-item prop="image_uri" style="margin-bottom: 0">
              <ebook-upload
                v-model="postForm.image_uri"
                :file-list="fileList"
                :disabled="isEdit"
                @onSuccess="onUploadSuccess"
                @onRemove="onUploadRemove"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <!-- 编写具体表单控件 -->
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                书名
              </MDinput>
            </el-form-item>
            <div>
              <el-row>
                <el-col :span="12" class="form-item-author">
                  <el-form-item :label-width="labelWidth" label="作者：" prop="author">
                    <el-input
                      v-model="postForm.author"
                      placeholder="作者"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="出版社：" prop="publisher">
                    <el-input
                      v-model="postForm.publisher"
                      placeholder="出版社"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="语言：" prop="language">
                    <el-input
                      v-model="postForm.language"
                      placeholder="语言"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="根文件：" prop="rootFile">
                    <el-input
                      v-model="postForm.rootFile"
                      placeholder="根文件"
                      style="width: 100%"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="文件路径：" prop="filePath">
                    <el-input
                      v-model="postForm.filePath"
                      placeholder="文件路径"
                      style="width: 100%"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="解压路径：" prop="unzipPath">
                    <el-input
                      v-model="postForm.unzipPath"
                      placeholder="解压路径"
                      style="width: 100%"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="封面路径：" prop="coverPath">
                    <el-input
                      v-model="postForm.coverPath"
                      placeholder="封面路径"
                      style="width: 100%"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label-width="labelWidth" label="文件名称：" prop="fileName">
                    <el-input
                      v-model="postForm.fileName"
                      placeholder="文件名称"
                      style="width: 100%"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label-width="60px" label="封面：">
                    <a v-if="postForm.cover" :href="postForm.cover" target="_blank" prop="cover">
                      <img :src="postForm.cover" class="preview-img">
                    </a>
                    <span v-else>无</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label-width="60px" label="目录：">
                    <div
                      v-if="contentsTree && contentsTree.length > 0"
                      class="contents-wrapper"
                    >
                      <el-tree :data="contentsTree" @node-click='onContentClick'/>
                    </div>
                    <span v-else>无</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from '../../../components/Sticky'
import Warning from '../components/Warning.vue'
import EbookUpload from '../../../components/EbookUpload'
import MDinput from '../../../components/MDinput'
import { createBook, getBook, updateBook } from '../../../api/book'

const defaultForm = {
  title: '', // 书名
  author: '', // 作者
  publisher: '', // 出版社
  language: '', // 语种
  rootFile: '', // 根文件路径
  cover: '', // 封面图片URL
  coverPath: '', // 封面图片路径
  fileName: '', // 文件名
  originalName: '', // 文件原始名称
  filePath: '', // 文件所在路径
  unzipPath: '', // 解压文件所在路径
  contents: [] // 目录
}

// 当提交表单时，出现部分内容未填写，报错的映射
const fields = {
  title: '标题',
  author: '作者',
  publisher: '出版社',
  language: '语言'
}
export default {
  components: {
    Sticky,
    Warning,
    EbookUpload,
    MDinput
  },
  props: {
    isEdit: {
      type: Boolean
    }
  },
  data() {
    const validatorRequire = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      postForm: {
        status: 'draft'
      },
      fileList: [],
      contentsTree: [],
      rules: {
        title: [{ validator: validatorRequire }],
        author: [{ validator: validatorRequire }],
        publisher: [{ validator: validatorRequire }],
        language: [{ validator: validatorRequire }]
      },
      labelWidth: '120px'
    }
  },
  created() {
    if (this.isEdit) {
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  methods: {
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        originalName,
        url,
        contents,
        contentsTree,
        fileName,
        coverPath,
        filePath,
        unzipPath
      } = data
      this.postForm = {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contents,
        fileName,
        coverPath,
        filePath,
        unzipPath,
        updateType: 0
      }
      this.fileList = [{ name: originalName, url }]
      this.contentsTree = contentsTree
    },
    setDefault() {
      this.postForm = Object.assign({}, defaultForm)
      this.fileList = []
      this.contentsTree = []
      this.$refs.postForm.resetFields()
    },
    submitForm() {
      // if (!this.loading) {
      this.loading = true
      this.$refs.postForm.validate((valid, fields) => {
        if (valid) {
          const book = Object.assign({}, this.postForm)
          // delete book.contents
          delete book.contentsTree
          if (!this.isEdit) {
            createBook(book).then(response => {
              const { msg } = response
              // 上传成功后显示信息
              this.$notify({
                title: '操作成功',
                message: msg,
                type: 'success',
                duration: 2000
              })
              this.loading = false
              // 上传成功后清空解析信息
              this.setDefault()
            }).catch(() => {
              this.loading = false
            })
          } else {
            updateBook(book).then(response => {
              // console.log('updateBook', response)
              this.loading = false
              this.$notify({
                title: '成功',
                message: response.msg,
                type: 'success',
                duration: 2000
              })
            }).catch(() => {
              this.loading = false
            })
          }
          // console.log(book)
        } else {
          const message = fields[Object.keys(fields)[0]][0].message
          this.$message({ message, type: 'error' })
          this.loading = false
        }
      })
      // }
    },
    showGuide() {},
    onUploadSuccess(data) {
      this.setData(data)
    },
    // 当取消上传书籍时，删除被解析出来的信息
    onUploadRemove(data) {
      this.setDefault()
    },
    // 根据解析出来的目录，点击后进行跳转
    onContentClick(data) {
      if (data.text) {
        window.open(data.text)
      }
    },
    getBookData(fileName) {
      getBook(fileName).then(response => {
        this.setData(response.data)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";

  .detail {
    position: relative;
    .detail-container {
      padding: 40px 45px 20px 50px;
      .preview-img {
        width: 200px;
        height: 270px;
      }
      .contents-wrapper {
        padding: 5px 0;
      }
    }
  }
</style>
