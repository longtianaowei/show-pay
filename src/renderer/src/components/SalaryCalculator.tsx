import { useEffect, useState } from 'react'
import { useSalaryStore, PaymentType } from '../store/salaryStore'
import { formatTime, formatCurrency, calculateCountdown, calculateProgress } from '../utils/timerUtils'

interface SalaryCalculatorProps {
  onStart?: () => void
}

const SalaryCalculator = ({ onStart }: SalaryCalculatorProps) => {
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

  // 监听store数据变化，并通过ipcRenderer.send('salary-data-update', data)把最新数据发给主进程。
  useEffect(() => {
    const data = {
      currentIncome,
      currentWorkTime,
      targetWorkTime,
      workEndTime
    }
    window.electron?.ipcRenderer?.send('salary-data-update', data)
  }, [currentIncome, currentWorkTime, targetWorkTime, workEndTime])

  // 处理计时器控制
  const handleTimerControl = () => {
    if (isTimerRunning) {
      stopTimer()
    } else {
      startTimer()
      onStart?.()
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

  // 窗口控制函数
  const handleMinimize = () => {
    window.api.minimizeWindow()
  }

  const handleClose = () => {
    window.api.closeWindow()
  }

  // 计算进度条
  const progress = calculateProgress(currentWorkTime, targetWorkTime)

  return (
    <div className="h-full p-4 bg-white relative">
      {/* 窗口控制按钮 */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button 
          onClick={handleMinimize}
          className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center"
        >
          <span className="w-3 h-0.5 bg-yellow-900"></span>
        </button>
        <button 
          onClick={handleClose}
          className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
        >
          <span className="w-3 h-0.5 bg-red-900 rotate-45 absolute"></span>
          <span className="w-3 h-0.5 bg-red-900 -rotate-45 absolute"></span>
        </button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-4">实时薪资计算器</h1>
      
      <div className="flex h-[calc(100%-3rem)]">
        {/* 左侧表单区域 */}
        <div className="w-1/2 pr-4 overflow-y-auto">
          <div className="bg-gray-50 p-4 rounded-lg h-full">
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
            
            <div className="mb-4">
              <label className="block mb-2">每天工作小时</label>
              <input 
                type="number" 
                value={workHoursPerDay}
                onChange={(e) => setWorkHoursPerDay(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            {paymentType === 'monthly' && (
              <div className="mb-4">
                <label className="block mb-2">每月工作天数</label>
                <input 
                  type="number" 
                  value={workDaysPerMonth}
                  onChange={(e) => setWorkDaysPerMonth(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block mb-2">加班倍率</label>
              <input 
                type="number" 
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
                step="0.1"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
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
        
        {/* 右侧显示区域 */}
        <div className="w-1/2 pl-4 flex flex-col">
          {/* 收入显示区域 */}
          <div className="mb-6 bg-blue-50 p-6 rounded-lg text-center flex-grow">
            <h2 className="text-xl font-semibold mb-4">实时收入</h2>
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {formatCurrency(currentIncome)}
            </div>
            <div className="text-lg text-gray-600 mb-6">
              已工作时间: {formatTime(currentWorkTime)}
            </div>
            
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>工作进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* 倒计时 */}
            <div className="mb-8 text-center">
              <h3 className="text-lg font-medium mb-2">距离下班还有</h3>
              <div className="text-3xl font-bold text-indigo-600">
                {formatTime(countdown)}
              </div>
            </div>
            
            {/* 控制按钮 */}
            <div className="flex space-x-6 justify-center mt-auto">
              <button
                onClick={handleTimerControl}
                className={`px-8 py-3 rounded-lg font-medium text-lg ${
                  isTimerRunning 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isTimerRunning ? '暂停' : '开始'}
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg font-medium text-lg"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryCalculator 