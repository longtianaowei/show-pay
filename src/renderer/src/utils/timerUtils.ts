/**
 * 工作时间计时器工具类
 */

/**
 * 将秒数转换为时:分:秒格式
 * @param seconds 秒数
 * @returns 格式化的时间字符串
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':')
}

/**
 * 计算下班倒计时
 * @param endTime 下班时间 (格式: "HH:MM")
 * @returns 剩余秒数，如果已经过了下班时间则返回0
 */
export const calculateCountdown = (endTime: string): number => {
  const now = new Date()
  const [hours, minutes] = endTime.split(':').map(Number)
  
  const endDate = new Date()
  endDate.setHours(hours, minutes, 0, 0)
  
  // 如果结束时间已经过了，返回0
  if (now > endDate) {
    return 0
  }
  
  return Math.floor((endDate.getTime() - now.getTime()) / 1000)
}

/**
 * 计算工作完成度百分比
 * @param currentTime 当前工作时间（秒）
 * @param targetTime 目标工作时间（秒）
 * @returns 完成度百分比
 */
export const calculateProgress = (currentTime: number, targetTime: number): number => {
  if (targetTime <= 0) return 0
  const progress = (currentTime / targetTime) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * 格式化货币
 * @param amount 金额
 * @returns 格式化后的金额字符串
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount)
} 