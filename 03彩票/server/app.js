// server/app.js
// Node.js 后端服务器，用于代理福彩网站请求

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()
const port = 3000

// 中间件
app.use(cors())
app.use(express.json())

// 福彩数据获取接口
app.get('/api/lottery', async (req, res) => {
  try {
    const { period, game } = req.query
    
    if (!period) {
      return res.json({
        success: false,
        message: '期数参数不能为空'
      })
    }

    if (game !== 'ssq') {
      return res.json({
        success: false,
        message: '暂只支持双色球查询'
      })
    }

    // 请求广东福彩网站
    const lotteryData = await fetchGdLotteryData(period)
    
    if (lotteryData) {
      res.json({
        success: true,
        data: lotteryData
      })
    } else {
      res.json({
        success: false,
        message: '未找到该期开奖数据'
      })
    }

  } catch (error) {
    console.error('获取福彩数据失败:', error)
    res.json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

// 历史开奖数据接口
app.get('/api/lottery/history', async (req, res) => {
  try {
    const { game, count = 10 } = req.query
    
    if (game !== 'ssq') {
      return res.json({
        success: false,
        message: '暂只支持双色球查询'
      })
    }

    const historyData = await fetchHistoryData(count)
    
    res.json({
      success: true,
      data: historyData
    })

  } catch (error) {
    console.error('获取历史数据失败:', error)
    res.json({
      success: false,
      message: '服务器内部错误'
    })
  }
})

/**
 * 从广东福彩网站获取开奖数据
 */
async function fetchGdLotteryData(period) {
  try {
    // 广东福彩网站URL
    const url = 'https://www.gdfc.org.cn/play_list_game_5.html'
    
    // 发送请求
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    })

    // 解析HTML
    const $ = cheerio.load(response.data)
    const lotteryData = parseLotteryHtml($, period)
    
    return lotteryData

  } catch (error) {
    console.error('请求广东福彩网站失败:', error.message)
    
    // 网络请求失败时返回null，不再使用模拟数据
    return null
  }
}

/**
 * 解析福彩网站HTML
 */
function parseLotteryHtml($, targetPeriod) {
  try {
    // 根据实际网站结构调整选择器
    // 这里需要根据广东福彩网站的实际HTML结构来写
    
    // 查找开奖数据表格或列表
    const lotteryRows = $('.lottery-table tr, .result-list li').toArray()
    
    for (let row of lotteryRows) {
      const $row = $(row)
      
      // 提取期数
      const periodText = $row.find('.period, .qihao').text().trim()
      const periodMatch = periodText.match(/(\d{7})/)
      
      if (periodMatch && periodMatch[1] === targetPeriod) {
        // 提取红球号码
        const redBalls = []
        $row.find('.red-ball, .hongqiu').each((i, el) => {
          const ball = $(el).text().trim().padStart(2, '0')
          if (ball && ball.length === 2) {
            redBalls.push(ball)
          }
        })
        
        // 提取蓝球号码
        const blueBallText = $row.find('.blue-ball, .lanqiu').text().trim()
        const blueBall = blueBallText.padStart(2, '0')
        
        // 提取开奖日期
        const dateText = $row.find('.date, .riqi').text().trim()
        
        if (redBalls.length === 6 && blueBall) {
          return {
            period: targetPeriod,
            redBalls: redBalls,
            blueBall: blueBall,
            date: dateText || new Date().toISOString().split('T')[0]
          }
        }
      }
    }
    
    return null
    
  } catch (error) {
    console.error('解析HTML失败:', error)
    return null
  }
}

/**
 * 获取历史开奖数据
 */
async function fetchHistoryData(count) {
  try {
    // 这里可以实现获取多期历史数据的逻辑
    // 真实的历史数据应该从数据库或API获取
    
    // 示例：返回固定的2025080期数据
    const historyData = [{
      period: '2025080',
      redBalls: ['03', '07', '08', '10', '16', '19'],
      blueBall: '05',
      date: '2025-07-15',
      poolAmount: '25.02亿元',
      sales: '3.51亿元'
    }]
    
    return historyData
    
  } catch (error) {
    console.error('获取历史数据失败:', error)
    throw error
  }
}

/**
 * 查询真实开奖数据
 * 应该连接到真实的数据库或数据源
 */
function queryRealLotteryData(period) {
  // 真实开奖数据，应该从数据库查询
  const realData = {
    '2025080': {
      period: '2025080',
      redBalls: ['03', '07', '08', '10', '16', '19'],
      blueBall: '05',
      date: '2025-07-15',
      poolAmount: '25.02亿元',
      sales: '3.51亿元'
    }
    // 可以添加更多期数的真实数据
  }
  
  return realData[period] || null
}

// 启动服务器
app.listen(port, () => {
  console.log(`福彩代理服务器运行在 http://localhost:${port}`)
  console.log('API 接口:')
  console.log(`- GET /api/lottery?period=2024001&game=ssq`)
  console.log(`- GET /api/lottery/history?game=ssq&count=10`)
})

module.exports = app 