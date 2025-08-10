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

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(calculateCountdown(workEndTime))
    }, 1000)
    return () => clearInterval(countdownInterval)
  }, [workEndTime])

  useEffect(() => {
    const data = {
      currentIncome,
      currentWorkTime,
      targetWorkTime,
      workEndTime
    }
    window.electron?.ipcRenderer?.send('salary-data-update', data)
  }, [currentIncome, currentWorkTime, targetWorkTime, workEndTime])

  const handleTimerControl = () => {
    if (isTimerRunning) {
      stopTimer()
    } else {
      startTimer()
      onStart?.()
    }
  }

  const handleReset = () => {
    stopTimer()
    resetTimer()
  }

  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentType(e.target.value as PaymentType)
  }

  const progress = calculateProgress(currentWorkTime, targetWorkTime)

  // 进度环样式
  const circleRadius = 54
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressStroke = (progress / 100) * circleCircumference

  return (
    <div className="flex flex-row gap-6 h-full w-full p-6 relative">
      {/* 右上角窗口控制按钮（美化版） */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => window.api?.minimizeWindow?.()}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 transition-all duration-150 shadow-sm focus:outline-none"
          title="最小化"
        >
          <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="6.25" width="8" height="1.5" rx="0.75" fill="#fff"/></svg>
        </button>
        <button
          onClick={() => window.api?.closeWindow?.()}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-all duration-150 shadow-sm focus:outline-none"
          title="关闭"
        >
          <svg width="14" height="14" viewBox="0 0 14 14"><line x1="4" y1="4" x2="10" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/><line x1="10" y1="4" x2="4" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* 左侧设置卡片 */}
      <div className="w-[340px] bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2">￥</span>
          薪资设置
        </h2>
        <p className="text-xs text-gray-400 mb-6">配置计算方式与工作时段，右侧将实时计算收入。</p>
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">计算方式</label>
          <select
            value={paymentType}
            onChange={handlePaymentTypeChange}
            className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option value="hourly">按小时</option>
            <option value="daily">按天</option>
            <option value="monthly">按月</option>
          </select>
        </div>
        {paymentType === 'hourly' && (
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium">时薪（元/小时）</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
        )}
        {paymentType === 'daily' && (
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium">日薪（元/天）</label>
            <input
              type="number"
              value={dailyRate}
              onChange={e => setDailyRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
        )}
        {paymentType === 'monthly' && (
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium">月薪（元/月）</label>
            <input
              type="number"
              value={monthlyRate}
              onChange={e => setMonthlyRate(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">每天工作小时</label>
          <input
            type="number"
            value={workHoursPerDay}
            onChange={e => setWorkHoursPerDay(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        {paymentType === 'monthly' && (
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium">每月工作天数</label>
            <input
              type="number"
              value={workDaysPerMonth}
              onChange={e => setWorkDaysPerMonth(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">加班倍率</label>
          <input
            type="number"
            value={overtimeRate}
            onChange={e => setOvertimeRate(parseFloat(e.target.value) || 0)}
            step="0.1"
            className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">上班时间</label>
          <input
            type="time"
            value={workEndTime === '18:00' ? '09:30' : ''}
            onChange={() => {}}
            className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
            disabled
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">下班时间</label>
          <input
            type="time"
            value={workEndTime}
            onChange={e => setWorkEndTime(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div className="flex items-center mt-2">
          <input type="checkbox" className="mr-2" disabled />
          <span className="text-xs text-gray-400">在上班时段自动开始</span>
        </div>
      </div>
      {/* 右侧实时收入卡片 */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-green-600 font-bold text-lg flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">💰</span>
            实时收入
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">{isTimerRunning ? '工作中' : '未开始'}</span>
        </div>
        <div className="flex items-center gap-6 mb-4">
          {/* 金额大字 */}
          <div className="text-5xl font-bold text-green-600">￥{currentIncome.toFixed(2)}</div>
          {/* 进度环 */}
          <svg width="120" height="120" className="block">
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              stroke="#22c55e"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleCircumference - progressStroke}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s' }}
            />
            <text x="60" y="68" textAnchor="middle" fontSize="22" fill="#22c55e" fontWeight="bold">
              {Math.round(progress)}%
            </text>
          </svg>
        </div>
        {/* 详细信息卡片 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
            <span className="text-xs text-gray-400">已工作</span>
            <span className="text-base font-semibold text-gray-700">{formatTime(currentWorkTime)}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
            <span className="text-xs text-gray-400">距离下班</span>
            <span className="text-base font-semibold text-gray-700">{formatTime(countdown)}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
            <span className="text-xs text-gray-400">当前折算</span>
            <span className="text-base font-semibold text-gray-700">￥{hourlyRate.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center">
            <span className="text-xs text-gray-400">模式</span>
            <span className="text-base font-semibold text-gray-700">{paymentType === 'hourly' ? '按小时' : paymentType === 'daily' ? '按天' : '按月'}</span>
          </div>
        </div>
        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>工作进度</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        {/* 控制按钮 */}
        <div className="flex gap-4 mt-auto">
          <button
            onClick={handleTimerControl}
            className={`flex-1 py-3 rounded-lg font-medium text-lg transition-colors duration-200 shadow-sm ${isTimerRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {isTimerRunning ? '暂停' : '开始'}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-lg text-gray-700 shadow-sm"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalaryCalculator 