import SalaryCalculator from './components/SalaryCalculator'
import { useEffect } from 'react'

function App(): React.JSX.Element {
  useEffect(() => {
    window.electron?.ipcRenderer?.on('open-widget-window', () => {})
  }, [])
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      <SalaryCalculator onStart={() => {
        window.electron?.ipcRenderer?.send('open-widget-window')
      }} />
    </div>
  )
}

export default App
