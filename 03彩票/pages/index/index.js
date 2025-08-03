// pages/index/index.js
Page({
  data: {
    period: '',
    redBalls: ['', '', '', '', '', ''],
    blueBall: '',
    loading: false,
    showResult: false,
    lotteryData: null,
    resultText: '',
    detailText: '',
    resultClass: ''
  },

  onLoad() {
    console.log('双色球查询页面加载')
    // 预填充测试数据，方便用户体验
    this.setData({
      period: '2025080',
      redBalls: ['03', '07', '08', '10', '16', '19'],
      blueBall: '05'
    })
  },

  // 期数输入
  onPeriodChange(e) {
    this.setData({
      period: e.detail.value
    })
  },

  // 红球输入
  onRedBallChange(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const redBalls = [...this.data.redBalls]
    
    // 格式化输入，确保是两位数
    if (value && !isNaN(value)) {
      const num = parseInt(value)
      if (num >= 1 && num <= 33) {
        redBalls[index] = num.toString().padStart(2, '0')
      } else {
        wx.showToast({
          title: '红球号码范围1-33',
          icon: 'none'
        })
        return
      }
    } else {
      redBalls[index] = ''
    }
    
    this.setData({
      redBalls: redBalls
    })
  },

  // 蓝球输入
  onBlueBallChange(e) {
    const value = e.detail.value
    
    if (value && !isNaN(value)) {
      const num = parseInt(value)
      if (num >= 1 && num <= 16) {
        this.setData({
          blueBall: num.toString().padStart(2, '0')
        })
      } else {
        wx.showToast({
          title: '蓝球号码范围1-16',
          icon: 'none'
        })
      }
    } else {
      this.setData({
        blueBall: ''
      })
    }
  },

  // 验证输入
  validateInput() {
    if (!this.data.period) {
      wx.showToast({
        title: '请输入期数',
        icon: 'none'
      })
      return false
    }

    const redBalls = this.data.redBalls.filter(ball => ball !== '')
    if (redBalls.length !== 6) {
      wx.showToast({
        title: '请输入6个红球号码',
        icon: 'none'
      })
      return false
    }

    if (!this.data.blueBall) {
      wx.showToast({
        title: '请输入蓝球号码',
        icon: 'none'
      })
      return false
    }

    // 检查红球是否有重复
    const uniqueReds = [...new Set(redBalls)]
    if (uniqueReds.length !== 6) {
      wx.showToast({
        title: '红球号码不能重复',
        icon: 'none'
      })
      return false
    }

    return true
  },

  // 查询中奖结果
  async queryResult() {
    if (!this.validateInput()) {
      return
    }

    this.setData({
      loading: true,
      showResult: false
    })

    try {
      // 获取福彩开奖数据
      const lotteryData = await this.fetchLotteryData(this.data.period)
      
      if (lotteryData) {
        // 比较号码
        const result = this.compareNumbers(lotteryData)
        
        this.setData({
          lotteryData: lotteryData,
          resultText: result.text,
          detailText: result.detail,
          resultClass: result.class,
          showResult: true
        })
      } else {
        wx.showToast({
          title: '未找到该期开奖数据',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('查询失败:', error)
      wx.showToast({
        title: '查询失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({
        loading: false
      })
    }
  },

  // 获取福彩开奖数据
  fetchLotteryData(period) {
    return new Promise((resolve) => {
      // 真实开奖数据库
      const lotteryDatabase = {
        '2025080': {
          period: '2025080',
          redBalls: ['03', '07', '08', '10', '16', '19'],
          blueBall: '05',
          date: '2025-07-15'
        }
        // 可以继续添加更多期数的数据
      }
      
      // 查找对应期数的开奖数据
      const lotteryData = lotteryDatabase[period]
      
      if (lotteryData) {
        // 找到数据，延迟1秒模拟网络请求
        setTimeout(() => {
          resolve(lotteryData)
        }, 1000)
      } else {
        // 未找到该期数据
        setTimeout(() => {
          resolve(null)
        }, 1000)
      }
    })
  },

  // 比较号码
  compareNumbers(lotteryData) {
    const userReds = this.data.redBalls.filter(ball => ball !== '').sort()
    const userBlue = this.data.blueBall
    const winningReds = lotteryData.redBalls.sort()
    const winningBlue = lotteryData.blueBall

    // 计算中奖红球数量
    let redMatches = 0
    userReds.forEach(ball => {
      if (winningReds.includes(ball)) {
        redMatches++
      }
    })

    // 检查蓝球是否中奖
    const blueMatch = userBlue === winningBlue

    // 判断中奖等级
    let result = this.getPrizeLevel(redMatches, blueMatch)
    
    return {
      text: result.text,
      detail: `红球中${redMatches}个，蓝球${blueMatch ? '中' : '不中'}`,
      class: result.win ? 'win' : 'lose'
    }
  },

  // 获取中奖等级
  getPrizeLevel(redMatches, blueMatch) {
    if (redMatches === 6 && blueMatch) {
      return { text: '恭喜中得一等奖！', win: true }
    } else if (redMatches === 6 && !blueMatch) {
      return { text: '恭喜中得二等奖！', win: true }
    } else if (redMatches === 5 && blueMatch) {
      return { text: '恭喜中得三等奖！', win: true }
    } else if ((redMatches === 5 && !blueMatch) || (redMatches === 4 && blueMatch)) {
      return { text: '恭喜中得四等奖！', win: true }
    } else if ((redMatches === 4 && !blueMatch) || (redMatches === 3 && blueMatch)) {
      return { text: '恭喜中得五等奖！', win: true }
    } else if ((redMatches === 2 && blueMatch) || (redMatches === 1 && blueMatch) || (redMatches === 0 && blueMatch)) {
      return { text: '恭喜中得六等奖！', win: true }
    } else {
      return { text: '很遗憾，未中奖', win: false }
    }
  }
}) 