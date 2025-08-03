// utils/lottery-service.js
// 福彩数据服务

/**
 * 广东福彩网站数据抓取服务
 * 注意：由于微信小程序的跨域限制，直接请求外部网站会被阻止
 * 实际使用时需要搭建后端服务器作为代理
 */

class LotteryService {
  constructor() {
    this.baseUrl = 'https://www.gdfc.org.cn'
    this.apiEndpoint = '/play_list_game_5.html'
  }

  /**
   * 获取双色球开奖数据
   * @param {string} period 期数
   * @returns {Promise} 开奖数据
   */
  async fetchLotteryData(period) {
    try {
      // 由于小程序限制，这里提供两种方案：

      // 方案1：通过后端代理服务（推荐）
      return await this.fetchViaProxy(period)

      // 方案2：使用云函数
      // return await this.fetchViaCloudFunction(period)

    } catch (error) {
      console.error('获取福彩数据失败:', error)
      throw error
    }
  }

  /**
   * 通过后端代理获取数据（推荐方案）
   */
  async fetchViaProxy(period) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://your-backend-server.com/api/lottery', // 替换为你的后端服务地址
        method: 'GET',
        data: {
          period: period,
          game: 'ssq' // 双色球
        },
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve(this.parseLotteryData(res.data.data))
          } else {
            reject(new Error('获取数据失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }

  /**
   * 通过云函数获取数据
   */
  async fetchViaCloudFunction(period) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getLotteryData',
        data: {
          period: period,
          game: 'ssq'
        },
        success: (res) => {
          if (res.result.success) {
            resolve(this.parseLotteryData(res.result.data))
          } else {
            reject(new Error('获取数据失败'))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }

  /**
   * 解析福彩网站返回的数据
   */
  parseLotteryData(htmlData) {
    // 这里需要根据实际的网站结构来解析HTML
    // 以下是示例解析逻辑，需要根据实际网站调整

    try {
      // 假设后端已经解析好了数据
      if (typeof htmlData === 'object') {
        return {
          period: htmlData.period,
          redBalls: htmlData.redBalls,
          blueBall: htmlData.blueBall,
          date: htmlData.date,
          poolAmount: htmlData.poolAmount || '',
          sales: htmlData.sales || ''
        }
      }

      // 如果是HTML字符串，需要解析
      const data = this.parseHtmlData(htmlData)
      return data

    } catch (error) {
      console.error('解析福彩数据失败:', error)
      throw error
    }
  }

  /**
   * 解析HTML数据（示例）
   */
  parseHtmlData(html) {
    // 由于小程序环境限制，无法使用DOM解析
    // 这里使用正则表达式来提取数据（示例）
    
    const periodMatch = html.match(/期号：(\d+)/);
    const redBallsMatch = html.match(/红球：(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{2})/);
    const blueBallMatch = html.match(/蓝球：(\d{2})/);
    const dateMatch = html.match(/开奖日期：(\d{4}-\d{2}-\d{2})/);

    if (periodMatch && redBallsMatch && blueBallMatch) {
      return {
        period: periodMatch[1],
        redBalls: [
          redBallsMatch[1],
          redBallsMatch[2],
          redBallsMatch[3],
          redBallsMatch[4],
          redBallsMatch[5],
          redBallsMatch[6]
        ],
        blueBall: blueBallMatch[1],
        date: dateMatch ? dateMatch[1] : ''
      }
    }

    throw new Error('无法解析开奖数据')
  }

  /**
   * 获取历史开奖记录
   */
  async getHistoryData(count = 10) {
    try {
      return new Promise((resolve, reject) => {
        wx.request({
          url: 'https://your-backend-server.com/api/lottery/history',
          method: 'GET',
          data: {
            game: 'ssq',
            count: count
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.success) {
              resolve(res.data.data)
            } else {
              reject(new Error('获取历史数据失败'))
            }
          },
          fail: reject
        })
      })
    } catch (error) {
      console.error('获取历史数据失败:', error)
      throw error
    }
  }

  /**
   * 生成模拟数据（用于开发测试）
   */
  generateMockData(period) {
    // 生成随机的开奖号码
    const redBalls = []
    const usedNumbers = new Set()

    // 生成6个不重复的红球号码（1-33）
    while (redBalls.length < 6) {
      const num = Math.floor(Math.random() * 33) + 1
      if (!usedNumbers.has(num)) {
        usedNumbers.add(num)
        redBalls.push(num.toString().padStart(2, '0'))
      }
    }

    // 生成蓝球号码（1-16）
    const blueBall = (Math.floor(Math.random() * 16) + 1).toString().padStart(2, '0')

    return {
      period: period,
      redBalls: redBalls.sort(),
      blueBall: blueBall,
      date: new Date().toISOString().split('T')[0],
      poolAmount: '8.5亿元',
      sales: '3.2亿元'
    }
  }
}

module.exports = LotteryService 