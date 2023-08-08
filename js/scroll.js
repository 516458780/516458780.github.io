const DIRECTION = {
  UP: 'up',
  DOWN: 'down'
}

const AREA = {
  TOP: 'top',
  CENTER: 'center',
  BOTTOM: 'bottom'
}

class scrollUtil {
  constructor(options) {
    const that = this
    that.options = Object.assign(
      {
        topSize: 10,
        bottomSize: 10,

        onScroll: (data) => {},
        onScrollTop: () => {},
        onScrollBottom: () => {}
      },
      options
    )

    that.isSetting = false

    const el = (that.el = options.el)

    that.lastScrollTop = el.scrollTop
    that.lastDirection = ''
    that.lastArea = ''

    that.savedScrollInfo = null

    that.settingTimeout = null

    that.isScrolling = false

    el.addEventListener('scroll', (e) => {
      that.onScroll(e)
    })
  }

  onScroll(e) {
    const that = this
    const el = that.el

    let direction = ''
    let scrollTop = el.scrollTop

    if (that.isSetting) {
      el.scrollTop = that.lastScrollTop
      return
    }

    that.options.onScroll({
      el: el,
      scrollTop
    })

    if (scrollTop > that.lastScrollTop) {
      // console.log('向下滚动')
      direction = DIRECTION.DOWN
    } else {
      // console.log('向上滚动')
      direction = DIRECTION.UP
    }
    that.lastDirection = direction

    let area = ''
    // 判断是否触顶，或者触底
    if (scrollTop <= that.options.topSize) {
      area = AREA.TOP
      // scrollTop = that.options.topSize
    } else if (el.scrollHeight - el.scrollTop - el.clientHeight <= that.options.bottomSize) {
      area = AREA.BOTTOM
      // scrollTop = el.scrollHeight - el.clientHeight - that.options.bottomSize
    } else {
      area = AREA.CENTER
    }

    that.lastScrollTop = el.scrollTop

    if (area && area !== that.lastArea) {
      switch (area) {
        case AREA.TOP:
          that.options.onScrollTop()
          break
        case AREA.BOTTOM:
          that.options.onScrollBottom()
          break
      }
    }

    that.lastArea = area

    that.isScrolling = true
    setTimeout(() => {
      that.isScrolling = false
    }, 300)
  }

  setScrollTop(val) {
    const that = this
    const el = that.el

    that.isSetting = true
    that.lastScrollTop = el.scrollTop = val

    clearTimeout(that.settingTimeout)
    that.settingTimeout = setTimeout(() => {
      that.isSetting = false
    }, 200)
  }

  saveScroll() {
    const that = this
    const el = that.el

    that.savedScrollInfo = {
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
      offsetHeight: el.offsetHeight
    }
  }

  loadScroll() {
    const that = this
    const el = that.el
    const savedScrollInfo = that.savedScrollInfo

    const setTop = () => {
      requestAnimationFrame(() => {
        if (!savedScrollInfo) {
          return
        }

        const scrollTop = el.scrollHeight - savedScrollInfo.scrollHeight + savedScrollInfo.scrollTop

        that.setScrollTop(scrollTop)
        if (!that.isScrolling) {
          return
        }
        setTop()
      })
    }
    setTop()
  }

  unableScroll() {
    this.el.style.overflow = 'hidden'
  }

  allowScroll() {
    this.el.style.overflow = 'auto'
  }
}
export default scrollUtil
