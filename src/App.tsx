import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from './components/layout/AppLayout'

const Home = lazy(() => import('./pages/Home'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Add = lazy(() => import('./pages/Add'))
const Statistics = lazy(() => import('./pages/Statistics'))
const Settings = lazy(() => import('./pages/Settings'))
const TransactionDetail = lazy(() => import('./pages/TransactionDetail'))
const Wallets = lazy(() => import('./pages/Wallets'))
const AddWallet = lazy(() => import('./pages/AddWallet'))
const Categories = lazy(() => import('./pages/Categories'))
const Budget = lazy(() => import('./pages/Budget'))
const AddBudget = lazy(() => import('./pages/AddBudget'))
const BudgetDetail = lazy(() => import('./pages/BudgetDetail'))
const GoalPage = lazy(() => import('./pages/Goal'))
const AddGoal = lazy(() => import('./pages/AddGoal'))
const GoalDetail = lazy(() => import('./pages/GoalDetail'))
const StatisticsCategoryDetail = lazy(() => import('./pages/StatisticsCategoryDetail'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#7F77DD', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: 'transactions', element: <Suspense fallback={<PageLoader />}><Transactions /></Suspense> },
      { path: 'transactions/:id', element: <Suspense fallback={<PageLoader />}><TransactionDetail /></Suspense> },
      { path: 'add', element: <Suspense fallback={<PageLoader />}><Add /></Suspense> },
      { path: 'statistics', element: <Suspense fallback={<PageLoader />}><Statistics /></Suspense> },
      { path: 'statistics/category/:categoryId', element: <Suspense fallback={<PageLoader />}><StatisticsCategoryDetail /></Suspense> },
      { path: 'settings', element: <Suspense fallback={<PageLoader />}><Settings /></Suspense> },
      { path: 'wallets', element: <Suspense fallback={<PageLoader />}><Wallets /></Suspense> },
      { path: 'wallets/add', element: <Suspense fallback={<PageLoader />}><AddWallet /></Suspense> },
      { path: 'categories', element: <Suspense fallback={<PageLoader />}><Categories /></Suspense> },
      { path: 'budget', element: <Suspense fallback={<PageLoader />}><Budget /></Suspense> },
      { path: 'budget/add', element: <Suspense fallback={<PageLoader />}><AddBudget /></Suspense> },
      { path: 'budget/:id', element: <Suspense fallback={<PageLoader />}><BudgetDetail /></Suspense> },
      { path: 'goal', element: <Suspense fallback={<PageLoader />}><GoalPage /></Suspense> },
      { path: 'goal/add', element: <Suspense fallback={<PageLoader />}><AddGoal /></Suspense> },
      { path: 'goal/:id', element: <Suspense fallback={<PageLoader />}><GoalDetail /></Suspense> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}