import { useEffect, useState } from 'react'

const Widget = () => {
  const [salaryData, setSalaryData] = useState({
    currentIncome: 0,
    currentWorkTime: 0,
    targetWorkTime: 1,
    workEndTime: '18:00'
  })
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    const handler = (_event: any, data: any) => {
      setSalaryData(data)
    }
    window.electron?.ipcRenderer?.on('salary-data', handler)
    return () => {
      window.electron?.ipcRenderer?.removeListener('salary-data', handler)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const [h, m] = salaryData.workEndTime.split(':').map(Number)
      const end = new Date()
      end.setHours(h, m, 0, 0)
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
      const hStr = String(Math.floor(diff / 3600)).padStart(2, '0')
      const mStr = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
      const sStr = String(diff % 60).padStart(2, '0')
      setCountdown(`${hStr}:${mStr}:${sStr}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [salaryData.workEndTime])

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
      userSelect: 'none',
      WebkitAppRegion: 'drag'
    }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>实时收入：￥{salaryData.currentIncome.toFixed(2)}</div>
      <div style={{ fontSize: 14, margin: '8px 0' }}>进度：{((salaryData.currentWorkTime / salaryData.targetWorkTime) * 100).toFixed(1)}%</div>
      <div style={{ fontSize: 14 }}>距离下班：{countdown}</div>
    </div>
  )
}

export default Widget
