import { useEffect, useState } from 'react'

const Widget = () => {
  useEffect(() => {
    // 设置挂件页面背景为透明
    document.body.style.backgroundColor = 'transparent'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.documentElement.style.backgroundColor = 'transparent'
    const root = document.getElementById('root')
    if (root) {
      root.style.backgroundColor = 'transparent'
    }
  }, [])
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
    <div 
      className="w-[280px] h-[120px] bg-gradient-to-br from-green-500/95 to-emerald-500/95 rounded-[20px] p-4 px-5 flex flex-col justify-between font-sans select-none backdrop-blur-sm border border-white/20"
      style={{ 
        // @ts-expect-error: WebkitAppRegion 不是标准属性，但 Electron 支持
        WebkitAppRegion: 'drag',
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3), 0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* 顶部收入显示 */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-white/80 font-medium uppercase tracking-wider">
          实时收入
        </div>
        <div className="text-xl font-bold text-white drop-shadow-sm">
          ￥{salaryData.currentIncome.toFixed(2)}
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="mb-2">
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 shadow-sm shadow-white/30"
            style={{ width: `${((salaryData.currentWorkTime / salaryData.targetWorkTime) * 100).toFixed(1)}%` }}
          />
        </div>
      </div>
      
      {/* 底部信息 */}
      <div className="flex justify-between items-center">
        <div className="text-[11px] text-white/90 font-medium">
          进度 {((salaryData.currentWorkTime / salaryData.targetWorkTime) * 100).toFixed(1)}%
        </div>
        <div className="text-[11px] text-white/90 font-medium">
          {countdown} 下班
        </div>
      </div>
    </div>
  )
}

export default Widget
