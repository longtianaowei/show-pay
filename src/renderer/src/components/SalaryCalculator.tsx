import { useEffect, useState } from 'react'
import { useSalaryStore, PaymentType } from '../store/salaryStore'
import { formatTime, formatCurrency, calculateCountdown, calculateProgress } from '../utils/timerUtils'

const SalaryCalculator = () => {
  const {
    paymentType,
    hourlyRate,
    dailyRate,
    monthlyRate,
    workHoursPerDay,
    workDaysPerMonth,
    overtimeRate,
    workEndTime,
    currentWorkTime,
    targetWorkTime,
    currentIncome,
    isTimerRunning,
    setPaymentType,
    setHourlyRate,
    setDailyRate,
    setMonthlyRate,
    setWorkHoursPerDay,
    setWorkDaysPerMonth,
    setOvertimeRate,
    setWorkEndTime,
    startTimer,
    stopTimer,
    resetTimer,
    updateCurrentWorkTime
  } = useSalaryStore()

  const [countdown, setCountdown] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // 启动计时器
  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        updateCurrentWorkTime(currentWorkTime + 1)
      }, 1000)
      setTimerInterval(interval)
    } else if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [isTimerRunning, currentWorkTime])

  // 更新下班倒计时
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(calculateCountdown(workEndTime))
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [workEndTime])

  // 处理计时器控制
  const handleTimerControl = () => {
    if (isTimerRunning) {
      stopTimer()
    } else {
      startTimer()
    }
  }

  // 处理计时器重置
  const handleReset = () => {
    stopTimer()
    resetTimer()
  }

  // 处理薪资类型切换
  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentType(e.target.value as PaymentType)
  }

  // 计算进度条
  const progress = calculateProgress(currentWorkTime, targetWorkTime)

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">实时工资计算器</h1>
      
      {/* 薪资设置区域 */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">薪资设置</h2>
        
        <div className="mb-4">
          <label className="block mb-2">计算方式</label>
          <select 
            value={paymentType}
            onChange={handlePaymentTypeChange}
            className="w-full p-2 border rounded"
          >
            <option value="hourly">按小时</option>
            <option value="daily">按天</option>
            <option value="monthly">按月</option>
          </select>
        </div>
        
        {paymentType === 'hourly' && (
          <div className="mb-4">
            <label className="block mb-2">时薪 (元/小时)</label>
            <input 
              type="number" 
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        {paymentType === 'daily' && (
          <div className="mb-4">
            <label className="block mb-2">日薪 (元/天)</label>
            <input 
              type="number" 
              value={dailyRate}
              onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        {paymentType === 'monthly' && (
          <div className="mb-4">
            <label className="block mb-2">月薪 (元/月)</label>
            <input 
              type="number" 
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">每天工作小时</label>
            <input 
              type="number" 
              value={workHoursPerDay}
              onChange={(e) => setWorkHoursPerDay(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {paymentType === 'monthly' && (
            <div>
              <label className="block mb-2">每月工作天数</label>
              <input 
                type="number" 
                value={workDaysPerMonth}
                onChange={(e) => setWorkDaysPerMonth(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}
          
          <div>
            <label className="block mb-2">加班倍率</label>
            <input 
              type="number" 
              value={overtimeRate}
              onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2">下班时间</label>
            <input 
              type="time" 
              value={workEndTime}
              onChange={(e) => setWorkEndTime(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      {/* 收入显示区域 */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg text-center">
        <h2 className="text-lg font-semibold mb-3">实时收入</h2>
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {formatCurrency(currentIncome)}
        </div>
        <div className="text-sm text-gray-600">
          已工作时间: {formatTime(currentWorkTime)}
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>工作进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* 倒计时 */}
      <div className="mb-6 text-center">
        <h3 className="text-md font-medium mb-1">距离下班还有</h3>
        <div className="text-2xl font-bold">
          {formatTime(countdown)}
        </div>
      </div>
      
      {/* 控制按钮 */}
      <div className="flex space-x-4 justify-center">
        <button
          onClick={handleTimerControl}
          className={`px-6 py-2 rounded-lg font-medium ${
            isTimerRunning 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isTimerRunning ? '暂停' : '开始'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium"
        >
          重置
        </button>
      </div>
    </div>
  )
}

export default SalaryCalculator 