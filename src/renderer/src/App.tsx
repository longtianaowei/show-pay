import SalaryCalculator from './components/SalaryCalculator'

function App(): React.JSX.Element {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      <SalaryCalculator onStart={() => {
        window.electron?.ipcRenderer?.send('open-widget-window')
      }} />
    </div>
  )
}

export default App
