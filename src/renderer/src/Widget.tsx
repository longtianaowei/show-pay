import { useEffect, useState } from 'react'
import { useSalaryStore } from './store/salaryStore'

const Widget = () => {
  const { currentIncome, currentWorkTime, targetWorkTime, workEndTime } = useSalaryStore()
  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const [h, m] = workEndTime.split(':').map(Number)
      const end = new Date()
      end.setHours(h, m, 0, 0)
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
      const hStr = String(Math.floor(diff / 3600)).padStart(2, '0')
      const mStr = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
      const sStr = String(diff % 60).padStart(2, '0')
      setCountdown(`${hStr}:${mStr}:${sStr}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [workEndTime])
  return (
    <div style={{
      width: 240,
      height: 100,
      background: 'rgba(255,255,255,0.85)',
      borderRadius: 16,
      boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      userSelect: 'none'
    }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>实时收入：￥{currentIncome.toFixed(2)}</div>
      <div style={{ fontSize: 14, margin: '8px 0' }}>进度：{((currentWorkTime / targetWorkTime) * 100).toFixed(1)}%</div>
      <div style={{ fontSize: 14 }}>距离下班：{countdown}</div>
    </div>
  )
}

export default Widget
