import { create } from 'zustand'

export type PaymentType = 'hourly' | 'daily' | 'monthly'

// 计算工作小时数（排除午休时间）
const calculateWorkHours = (startTime: string, endTime: string, lunchStart: string, lunchEnd: string): number => {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const [lsh, lsm] = lunchStart.split(':').map(Number)
  const [leh, lem] = lunchEnd.split(':').map(Number)
  
  let start = sh * 60 + sm
  let end = eh * 60 + em
  let lunchStartMin = lsh * 60 + lsm
  let lunchEndMin = leh * 60 + lem
  
  if (end < start) end += 24 * 60
  if (lunchEndMin < lunchStartMin) lunchEndMin += 24 * 60
  
  let totalWorkMin = end - start
  
  // 如果午休时间在工作时间内，则减去午休时间
  if (lunchStartMin >= start && lunchEndMin <= end) {
    totalWorkMin -= (lunchEndMin - lunchStartMin)
  }
  
  return parseFloat((totalWorkMin / 60).toFixed(2))
}

interface SalaryState {
  // 计算方式
  paymentType: PaymentType
  // 薪资基础数据
  hourlyRate: number
  dailyRate: number
  monthlyRate: number
  // 工作时长
  workHoursPerDay: number
  workDaysPerMonth: number
  // 加班参数
  overtimeRate: number
  overtimeHours: number
  // 下班倒计时
  workEndTime: string
  // 午休时间
  lunchStartTime: string
  lunchEndTime: string
  // 当前工作时间（秒）
  currentWorkTime: number
  // 目标工作时间（秒）
  targetWorkTime: number
  // 实时收入
  currentIncome: number
  // 是否正在计时
  isTimerRunning: boolean
  // 方法
  setPaymentType: (type: PaymentType) => void
  setHourlyRate: (rate: number) => void
  setDailyRate: (rate: number) => void
  setMonthlyRate: (rate: number) => void
  setWorkHoursPerDay: (hours: number) => void
  setWorkDaysPerMonth: (days: number) => void
  setOvertimeRate: (rate: number) => void
  setOvertimeHours: (hours: number) => void
  setWorkEndTime: (time: string) => void
  setWorkStartTime: (time: string) => void
  setLunchStartTime: (time: string) => void
  setLunchEndTime: (time: string) => void
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  updateCurrentWorkTime: (seconds: number) => void
  calculateCurrentIncome: () => number
  workStartTime: string
}

export const useSalaryStore = create<SalaryState>((set, get) => ({
  paymentType: 'hourly',
  hourlyRate: 100,
  dailyRate: 800,
  monthlyRate: 15000,
  workHoursPerDay: 8,
  workDaysPerMonth: 22,
  overtimeRate: 1.5,
  overtimeHours: 0,
  workEndTime: '18:00',
  workStartTime: '09:00',
  lunchStartTime: '12:00',
  lunchEndTime: '13:00',
  currentWorkTime: 0,
  targetWorkTime: 8 * 3600, // 默认8小时工作制
  currentIncome: 0,
  isTimerRunning: false,

  setPaymentType: (type) => set({ paymentType: type }),
  setHourlyRate: (rate) => set({ hourlyRate: rate }),
  setDailyRate: (rate) => set({ dailyRate: rate }),
  setMonthlyRate: (rate) => set({ monthlyRate: rate }),
  setWorkHoursPerDay: (hours) => set({ workHoursPerDay: hours, targetWorkTime: hours * 3600 }),
  setWorkDaysPerMonth: (days) => set({ workDaysPerMonth: days }),
  setOvertimeRate: (rate) => set({ overtimeRate: rate }),
  setOvertimeHours: (hours) => set({ overtimeHours: hours }),
  setWorkStartTime: (time) => set((state) => {
    // 自动计算每天工作小时（排除午休时间）
    const hours = calculateWorkHours(time, state.workEndTime, state.lunchStartTime, state.lunchEndTime)
    return { workStartTime: time, workHoursPerDay: hours, targetWorkTime: hours * 3600 }
  }),
  setWorkEndTime: (time) => set((state) => {
    // 自动计算每天工作小时（排除午休时间）
    const hours = calculateWorkHours(state.workStartTime, time, state.lunchStartTime, state.lunchEndTime)
    return { workEndTime: time, workHoursPerDay: hours, targetWorkTime: hours * 3600 }
  }),
  setLunchStartTime: (time) => set((state) => {
    const hours = calculateWorkHours(state.workStartTime, state.workEndTime, time, state.lunchEndTime)
    return { lunchStartTime: time, workHoursPerDay: hours, targetWorkTime: hours * 3600 }
  }),
  setLunchEndTime: (time) => set((state) => {
    const hours = calculateWorkHours(state.workStartTime, state.workEndTime, state.lunchStartTime, time)
    return { lunchEndTime: time, workHoursPerDay: hours, targetWorkTime: hours * 3600 }
  }),

  startTimer: () => set({ isTimerRunning: true }),
  stopTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ currentWorkTime: 0, currentIncome: 0 }),

  updateCurrentWorkTime: (seconds) => {
    set((state) => ({ 
      currentWorkTime: seconds,
      currentIncome: state.calculateCurrentIncome()
    }))
  },

  calculateCurrentIncome: () => {
    const state = get()
    const { paymentType, hourlyRate, dailyRate, monthlyRate, currentWorkTime, workHoursPerDay, workDaysPerMonth, overtimeRate, overtimeHours } = state
    
    const regularHours = Math.min(currentWorkTime / 3600, workHoursPerDay)
    // const overtime = Math.max(0, currentWorkTime / 3600 - workHoursPerDay)
    const overtime = overtimeHours // 由用户输入
    
    let income = 0
    
    switch (paymentType) {
      case 'hourly':
        income = regularHours * hourlyRate + overtime * hourlyRate * overtimeRate
        break
      case 'daily':
        const hourlyFromDaily = dailyRate / workHoursPerDay
        income = regularHours * hourlyFromDaily + overtime * hourlyFromDaily * overtimeRate
        break
      case 'monthly':
        const hourlyFromMonthly = monthlyRate / (workDaysPerMonth * workHoursPerDay)
        income = regularHours * hourlyFromMonthly + overtime * hourlyFromMonthly * overtimeRate
        break
    }
    
    return parseFloat(income.toFixed(2))
  }
})) 