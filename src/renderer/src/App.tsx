import SalaryCalculator from './components/SalaryCalculator'

function App(): React.JSX.Element {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      <SalaryCalculator />
    </div>
  )
}

export default App
