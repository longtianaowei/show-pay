import { useEffect, useState } from 'react'
import { useSalaryStore, PaymentType } from '../store/salaryStore'
import { formatTime, calculateCountdown, calculateProgress } from '../utils/timerUtils'
import icon from '../assets/icon.png';

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
    workStartTime,
    lunchStartTime,
    lunchEndTime,
    currentWorkTime,
    targetWorkTime,
    currentIncome,
    isTimerRunning,
    isStarted,
    setPaymentType,
    setHourlyRate,
    setDailyRate,
    setMonthlyRate,
    setWorkHoursPerDay,
    setWorkDaysPerMonth,
    setOvertimeRate,
    setWorkEndTime,
    setWorkStartTime,
    setLunchStartTime,
    setLunchEndTime,
    startTimer,
    stopTimer,
    resetTimer,
    updateCurrentWorkTime,
    updateWorkTimeFromClock,
    overtimeHours,
    setOvertimeHours,
    calculateHourlyRate
  } = useSalaryStore()

  const [countdown, setCountdown] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isTimerRunning) {
      const interval = setInterval(() => {
        updateWorkTimeFromClock()
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
  }, [isTimerRunning, updateWorkTimeFromClock])

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

  const totalTargetTime = targetWorkTime + (overtimeHours * 3600)
  const progress = calculateProgress(currentWorkTime, totalTargetTime)
  const circleRadius = 70
  const circleCircumference = 2 * Math.PI * circleRadius
  const progressStroke = (progress / 100) * circleCircumference

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f7fa]">
      {/* 顶部栏 */}
      <div className="h-14 flex items-center justify-between px-3 bg-white shadow-sm select-none" style={{ WebkitAppRegion: 'drag' }}>
        <div className="flex items-center gap-3">
          <img src={icon} alt="logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-green-600 tracking-wide">牛马计薪器</span>
        </div>
        <div className="flex gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={() => window.api?.minimizeWindow?.()}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 transition-all duration-150 shadow focus:outline-none"
            title="最小化"
          >
            <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="6.25" width="8" height="1.5" rx="0.75" fill="#fff" /></svg>
          </button>
          <button
            onClick={() => window.api?.closeWindow?.()}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-400 transition-all duration-150 shadow focus:outline-none"
            title="关闭"
          >
            <svg width="14" height="14" viewBox="0 0 14 14"><line x1="4" y1="4" x2="10" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /><line x1="10" y1="4" x2="4" y2="10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      {/* 内容区 */}
      <div className="flex-1 flex flex-row gap-4 px-2 py-2 bg-[#f5f7fa]">
        {/* 左侧设置区 */}
        <div className="w-[360px] bg-white rounded-2xl p-6 flex flex-col shadow-sm h-full">
          {/* <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="inline-block text-green-500 text-2xl">￥</span> 薪资设置
          </h2> */}
          <p className="text-xs text-gray-400 mb-6">配置计算方式与工作时段，右侧将实时计算收入。</p>
          <div className="mb-2">
            <label className="block text-sm mb-1 font-medium">计算方式</label>
            <select
              value={paymentType}
              onChange={handlePaymentTypeChange}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
            >
              <option value="hourly">按小时</option>
              <option value="daily">按天</option>
              <option value="monthly">按月</option>
            </select>
          </div>
          {paymentType === 'hourly' && (
            <div className="mb-2">
              <label className="block text-sm mb-1 font-medium">时薪（元/小时）</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
          )}
          {paymentType === 'daily' && (
            <div className="mb-2">
              <label className="block text-sm mb-1 font-medium">日薪（元/天）</label>
              <input
                type="number"
                value={dailyRate}
                onChange={e => setDailyRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
          )}
          {paymentType === 'monthly' && (
            <div className="mb-2">
              <label className="block text-sm mb-1 font-medium">月薪（元/月）</label>
              <input
                type="number"
                value={monthlyRate}
                onChange={e => setMonthlyRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
          )}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium">上班时间</label>
              <input
                type="time"
                value={workStartTime}
                onChange={e => setWorkStartTime(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium">下班时间</label>
              <input
                type="time"
                value={workEndTime}
                onChange={e => setWorkEndTime(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium">午休开始</label>
              <input
                type="time"
                value={lunchStartTime}
                onChange={e => setLunchStartTime(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-medium">午休结束</label>
              <input
                type="time"
                value={lunchEndTime}
                onChange={e => setLunchEndTime(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1 font-medium">每天工作小时</label>
            <input
              type="number"
              value={workHoursPerDay}
              onChange={e => setWorkHoursPerDay(parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
            />
          </div>
          {paymentType === 'monthly' && (
            <div className="mb-2">
              <label className="block text-sm mb-1 font-medium">每月工作天数</label>
              <input
                type="number"
                value={workDaysPerMonth}
                onChange={e => setWorkDaysPerMonth(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
              />
            </div>
          )}
          <div className="mb-2">
            <label className="block text-sm mb-1 font-medium">每天加班小时</label>
            <input
              type="number"
              value={overtimeHours}
              onChange={e => setOvertimeHours(parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm mb-1 font-medium">加班倍率</label>
            <input
              type="number"
              value={overtimeRate}
              onChange={e => setOvertimeRate(parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 bg-gray-50"
            />
          </div>
          {/* <div className="flex items-center mt-2">
            <input type="checkbox" className="mr-2 rounded" disabled />
            <span className="text-xs text-gray-400">在上班时段自动开始</span>
          </div> */}
        </div>
        {/* 右侧数据区 */}
        <div className="flex-1 flex flex-col h-full min-w-[420px] ">
          <div className="flex-1 flex flex-col">
            {/* 金额和进度环 */}
            <div className="flex items-center gap-8 mb-6 bg-white rounded-2xl shadow-sm" >
              {/* 金额 */}
              <div className="flex-1 flex flex-col items-start justify-center pl-4">
                <span className="text-gray-500 text-base font-medium mb-1">当前累计</span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-green-600">
                    {isStarted ? `￥${currentIncome.toFixed(2)}` : '￥0.00'}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">税前</span>
                </div>
              </div>
              {/* 进度环（仪表盘） */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <svg width="180" height="180" className="block">
                  <circle
                    cx="90"
                    cy="90"
                    r={circleRadius}
                    stroke="#e5e7eb"
                    strokeWidth="18"
                    fill="none"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r={circleRadius}
                    stroke="#22c55e"
                    strokeWidth="18"
                    fill="none"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={circleCircumference - (isStarted ? progressStroke : 0)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                  {/* 起点圆点 */}
                  {isStarted && progress > 0 && (
                    <circle
                      cx={90 + circleRadius * Math.cos(-Math.PI / 2)}
                      cy={90 + circleRadius * Math.sin(-Math.PI / 2)}
                      r="7"
                      fill="#22c55e"
                      filter="drop-shadow(0 1px 4px #22c55e33)"
                    />
                  )}
                </svg>
                {/* 居中内容 */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center select-none pointer-events-none">
                  <div className="text-3xl font-extrabold text-black mb-1">
                    {isStarted ? `${Math.round(progress)}%` : '0%'}
                  </div>
                  <div className="text-base text-gray-500 font-medium">工作进度</div>
                  <div className="text-sm text-gray-400 mt-1">目标 {(workHoursPerDay + overtimeHours).toFixed(1)} 小时</div>
                </div>
              </div>
            </div>
            {/* 详细信息区块 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow-sm">
                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="text-green-500">⏱</span>已工作</span>
                <span className="text-base font-semibold text-gray-700">
                  {isStarted ? formatTime(currentWorkTime) : '00:00:00'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow-sm">
                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="text-orange-400">⏰</span>距离下班</span>
                <span className="text-base font-semibold text-gray-700">
                  {isStarted ? formatTime(countdown) : '00:00:00'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow-sm">
                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="text-green-500">￥</span>当前折算时薪</span>
                <span className="text-base font-semibold text-gray-700">￥{calculateHourlyRate().toFixed(2)}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow-sm">
                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="bg-green-100 text-green-600 rounded px-2 py-0.5 text-xs">模式</span></span>
                <span className="text-base font-semibold text-gray-700">{paymentType === 'hourly' ? '按小时' : paymentType === 'daily' ? '按天' : '按月'}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow-sm col-span-2">
                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="text-pink-400">⏳</span>加班时长</span>
                <span className="text-base font-semibold text-gray-700">
                  {isStarted ? `${overtimeHours.toFixed(2)} h` : '0.00 h'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center shadow-sm col-span-2">
                <span className="text-xs text-gray-400 flex items-center gap-1"><span className="text-blue-400">🕒</span>计划工时</span>
                <span className="text-base font-semibold text-gray-700">{workHoursPerDay} h</span>
              </div>
            </div>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1">
                <span>工作进度</span>
                <span>{isStarted ? progress.toFixed(1) : '0.0'}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${isStarted ? progress : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* 控制按钮区，始终在底部 */}
          <div className="flex gap-6 mt-auto pt-2 pb-1">
            <button
              onClick={handleTimerControl}
              className={`flex-1 py-3 rounded-lg font-medium text-lg transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 ${isTimerRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              <span className="text-xl">{isTimerRunning ? '⏸' : '▶️'}</span>
              {isTimerRunning ? '暂停' : '开始'}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-lg text-gray-700 shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-xl">🔄</span>重置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryCalculator 