<template>
  <div class="content-edit">
    <div
      class="content-edit-content"
      ref="reply-content"
      contenteditable="true"
      @paste="onPaste"
      @click="saveLastRange"
      @keyup="saveLastRange"
      @keydown="onContentInput($event)"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'ContentEdit',
  props: {
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      lastEditRange: null
    }
  },
  methods: {
    html2Text(text) {
      const div = document.createElement('div')
      div.innerHTML = val
      return div.textContent || div.innerText
    },
    htmlToDiyKeys(html) {
      // 替换图片标签为特殊标识
      let result = html.replace(/<img(.*?)src\="\/emoticons\/(.*?)">/g, '{{{image:$2}}}')
      return result
    },
    diyKeysToHtml(content) {
      // 替换图片标签为特殊标识
      let result = content.replace(/\{\{\{image:(.*?)\}\}\}/g, '<img src="/emoticons/$1" />')
      return result
    },
    reset() {
      this.lastEditRange = null
    },
    saveLastRange() {
      const selection = window.getSelection()
      this.lastEditRange = selection.getRangeAt(0)
    },
    onContentInput(e) {
      const that = this
      const content = that.$refs['reply-content']

      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('只按回车', content.innerHTML)
        that.$emit('enter', content.innerHTML)
        content.innerHTML = ''
        e.preventDefault()
      }
    },
    addContentAtLastRange(ele) {
      const that = this
      const lastRange = that.lastEditRange
      let edit = that.$refs['reply-content']
      let selection = window.getSelection()
      if (lastRange) {
        selection.removeAllRanges()
        selection.addRange(lastRange)
        selection.deleteFromDocument()
        lastRange.insertNode(ele)
      } else {
        edit.appendChild(ele)
      }

      edit.focus()
      selection.removeAllRanges()
      const newRange = document.createRange()
      newRange.setStartAfter(ele)
      selection.addRange(newRange)
      that.lastEditRange = newRange
    },
    onPaste() {
      const that = this
      const pasteText = that.diyKeysToHtml(
        that.html2Text(that.htmlToDiyKeys(e.clipboardData.getData('Text')))
      )
      const div = document.createElement('div')
      div.innerHTML = pasteText

      const nodes = div.childNodes
      const length = nodes.length

      e.preventDefault()
      e.stopPropagation()

      setTimeout(() => {
        let lastRange = that.lastEditRange
        let edit = that.$refs['reply-content']
        let selection = window.getSelection()
        const newRange = document.createRange()

        if (lastRange) {
          for (let n = 0; n < length; n++) {
            const item = nodes[0]
            lastRange.insertNode(item)

            selection.removeAllRanges()
            newRange.setStartAfter(item)
            selection.addRange(newRange)
            lastRange = newRange
          }
        } else {
          for (let n = 0; n < length; n++) {
            const item = nodes[0]
            edit.appendChild(item)

            selection.removeAllRanges()
            newRange.setStartAfter(item)
            selection.addRange(newRange)
            lastRange = newRange
          }
        }
        that.lastEditRange = newRange
      }, 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.content-edit-content {
  width: 100%;
  height: 100%;
  max-height: 200px;
  overflow: auto;
  outline: none;

  ::v-deep {
    img {
      width: 20px;
      display: inline;
    }
  }
}
</style>
