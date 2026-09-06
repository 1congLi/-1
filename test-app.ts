// 简单的应用功能测试脚本
// 用于验证主要功能是否正常工作

import { app } from 'electron'
import path from 'path'
import fs from 'fs'

async function testApp() {
  console.log('🧪 开始测试黑马记账应用...')

  // 1. 测试应用启动
  try {
    const dataPath = path.join(app.getPath('userData'), 'accounting-data.json')
    console.log(`✅ 应用数据路径: ${dataPath}`)
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
  }

  // 2. 测试数据存储
  try {
    const testData = {
      records: [
        {
          id: 'test-1',
          amount: 35.50,
          date: new Date().toISOString().split('T')[0],
          category1: '1',
          category2: '1-1',
          note: '测试记录',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'test-2',
          amount: 88.00,
          date: new Date().toISOString().split('T')[0],
          category1: '1',
          category2: '1-3',
          createdAt: new Date().toISOString(),
        },
      ],
      categories: [
        {
          id: '1',
          name: '餐饮美食',
          icon: '🍔',
          color: '#FF6B6B',
          children: [
            { id: '1-1', name: '早餐', icon: '🍳', color: '#FF8E8E' },
            { id: '1-2', name: '午餐', icon: '🍚', color: '#FF8E8E' },
          ],
        },
      ],
    }

    // 测试保存数据
    const dataPath = path.join(app.getPath('userData'), 'accounting-data.json')
    fs.writeFileSync(dataPath, JSON.stringify(testData, null, 2))
    console.log('✅ 数据保存测试通过')

    // 测试读取数据
    const savedData = fs.readFileSync(dataPath, 'utf-8')
    const parsedData = JSON.parse(savedData)
    console.log(`✅ 数据读取测试通过，共 ${parsedData.records.length} 条记录`)
  } catch (error) {
    console.error('❌ 数据存储测试失败:', error)
  }

  // 3. 测试数据统计
  try {
    const dataPath = path.join(app.getPath('userData'), 'accounting-data.json')
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
      const totalAmount = data.records.reduce((sum: number, record: any) => sum + record.amount, 0)
      console.log(`✅ 数据统计测试通过，总金额: ¥${totalAmount.toFixed(2)}`)
    }
  } catch (error) {
    console.error('❌ 数据统计测试失败:', error)
  }

  console.log('🎉 测试完成！')
}

testApp()