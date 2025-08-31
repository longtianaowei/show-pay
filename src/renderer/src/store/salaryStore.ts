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

// 计算从上班时间到当前时间的已工作时间（排除午休）
const calculateCurrentWorkTime = (workStart: string, lunchStart: string, lunchEnd: string): number => {
  const now = new Date()
  const [sh, sm] = workStart.split(':').map(Number)
  const [lsh, lsm] = lunchStart.split(':').map(Number)
  const [leh, lem] = lunchEnd.split(':').map(Number)
  
  const startOfDay = new Date()
  startOfDay.setHours(sh, sm, 0, 0)
  
  const lunchStartTime = new Date()
  lunchStartTime.setHours(lsh, lsm, 0, 0)
  
  const lunchEndTime = new Date()
  lunchEndTime.setHours(leh, lem, 0, 0)
  
  // 如果还没到上班时间，返回0
  if (now < startOfDay) return 0
  
  let workedSeconds = Math.floor((now.getTime() - startOfDay.getTime()) / 1000)
  
  // 如果已经过了午休开始时间，需要减去午休时间
  if (now > lunchStartTime) {
    const lunchDuration = Math.floor((lunchEndTime.getTime() - lunchStartTime.getTime()) / 1000)
    if (now > lunchEndTime) {
      // 已经过了午休结束时间，减去完整午休时间
      workedSeconds -= lunchDuration
    } else {
      // 正在午休中，减去已经午休的时间
      workedSeconds -= Math.floor((now.getTime() - lunchStartTime.getTime()) / 1000)
    }
  }
  
  return Math.max(0, workedSeconds)
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
  // 是否已开始（表单配置完成并点击开始）
  isStarted: boolean
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
  updateWorkTimeFromClock: () => void
  calculateCurrentIncome: () => number
  calculateHourlyRate: () => number
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
  isStarted: false,

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

  startTimer: () => set({ isTimerRunning: true, isStarted: true }),
  stopTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ currentWorkTime: 0, currentIncome: 0, isStarted: false }),

  updateCurrentWorkTime: (seconds) => {
    const state = get()
    if (!state.isStarted) return
    set(() => ({ 
      currentWorkTime: seconds,
      currentIncome: state.calculateCurrentIncome()
    }))
  },

  updateWorkTimeFromClock: () => {
    const state = get()
    if (!state.isStarted) return
    
    const realWorkTime = calculateCurrentWorkTime(state.workStartTime, state.lunchStartTime, state.lunchEndTime)
    const newState = { ...state, currentWorkTime: realWorkTime }
    
    set(() => ({
      currentWorkTime: realWorkTime,
      currentIncome: (() => {
        const { paymentType, hourlyRate, dailyRate, monthlyRate, workHoursPerDay, workDaysPerMonth, overtimeRate } = newState
        
        const workedHours = realWorkTime / 3600
        const regularHours = Math.min(workedHours, workHoursPerDay)
        const actualOvertimeHours = Math.max(0, workedHours - workHoursPerDay)
        
        let income = 0
        
        switch (paymentType) {
          case 'hourly':
            income = regularHours * hourlyRate + actualOvertimeHours * hourlyRate * overtimeRate
            break
          case 'daily':
            const hourlyFromDaily = dailyRate / workHoursPerDay
            income = regularHours * hourlyFromDaily + actualOvertimeHours * hourlyFromDaily * overtimeRate
            break
          case 'monthly':
            const hourlyFromMonthly = monthlyRate / (workDaysPerMonth * workHoursPerDay)
            income = regularHours * hourlyFromMonthly + actualOvertimeHours * hourlyFromMonthly * overtimeRate
            break
        }
        
        return parseFloat(income.toFixed(2))
      })()
    }))
  },

  calculateCurrentIncome: () => {
    const state = get()
    const { paymentType, hourlyRate, dailyRate, monthlyRate, currentWorkTime, workHoursPerDay, workDaysPerMonth, overtimeRate } = state
    
    const workedHours = currentWorkTime / 3600
    const regularHours = Math.min(workedHours, workHoursPerDay)
    const actualOvertimeHours = Math.max(0, workedHours - workHoursPerDay)
    
    let income = 0
    
    switch (paymentType) {
      case 'hourly':
        income = regularHours * hourlyRate + actualOvertimeHours * hourlyRate * overtimeRate
        break
      case 'daily':
        const hourlyFromDaily = dailyRate / workHoursPerDay
        income = regularHours * hourlyFromDaily + actualOvertimeHours * hourlyFromDaily * overtimeRate
        break
      case 'monthly':
        const hourlyFromMonthly = monthlyRate / (workDaysPerMonth * workHoursPerDay)
        income = regularHours * hourlyFromMonthly + actualOvertimeHours * hourlyFromMonthly * overtimeRate
        break
    }
    
    return parseFloat(income.toFixed(2))
  },

  calculateHourlyRate: () => {
    const { paymentType, hourlyRate, dailyRate, monthlyRate, workHoursPerDay, workDaysPerMonth, overtimeHours, overtimeRate } = get()
    
    let baseHourlyRate = 0
    
    switch (paymentType) {
      case 'hourly':
        baseHourlyRate = hourlyRate
        break
      case 'daily':
        baseHourlyRate = dailyRate / workHoursPerDay
        break
      case 'monthly':
        baseHourlyRate = monthlyRate / (workDaysPerMonth * workHoursPerDay)
        break
    }
    
    // 如果有加班时间，计算包含加班费的平均时薪
    if (overtimeHours > 0) {
      const totalHours = workHoursPerDay + overtimeHours
      const regularIncome = workHoursPerDay * baseHourlyRate
      const overtimeIncome = overtimeHours * baseHourlyRate * overtimeRate
      const totalIncome = regularIncome + overtimeIncome
      return parseFloat((totalIncome / totalHours).toFixed(2))
    }
    
    return parseFloat(baseHourlyRate.toFixed(2))
  }
})) 