import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { LoginScreen } from "@/features/auth/LoginScreen"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CashierLayout } from "@/features/cashier/CashierLayout"
import { ProductList } from "@/features/cashier/ProductList"
import { StorageLayout } from "@/features/storage/StorageLayout"
import { InventoryList } from "@/features/storage/InventoryList"
import { ProductDetails } from "@/features/storage/ProductDetails"
import { CourierLayout } from "@/features/courier/CourierLayout"
import { DeliveryList } from "@/features/courier/DeliveryList"
import { DeliveryDetails } from "@/features/courier/DeliveryDetails"
import { ManagerLayout } from "@/features/manager/ManagerLayout"
import { StatsDashboard } from "@/features/manager/StatsDashboard"
import { ManagerSettings } from "@/features/manager/ManagerSettings"
import { ManagerEmployees } from "@/features/manager/ManagerEmployees"
import { CashierHistory } from "@/features/manager/CashierHistory"
import { OrdersManagement } from "@/features/manager/OrdersManagement"
import { InventoryScreen } from "@/features/manager/InventoryScreen"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { AdminDashboard } from "@/features/admin/AdminDashboard"
import { Toaster } from 'sonner';

const queryClient = new QueryClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole && role !== 'admin') return <Navigate to="/" replace />; // Or unauthorized page

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
          <Routes>
            <Route path="/" element={<LoginScreen />} />

            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
            </Route>

            <Route path="/cashier" element={
              <ProtectedRoute allowedRole="cashier">
                <CashierLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ProductList />} />
            </Route>

            <Route path="/manager" element={
              <ProtectedRoute allowedRole="manager">
                <ManagerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StatsDashboard />} />
              <Route path="settings" element={<ManagerSettings />} />
              <Route path="employees" element={<ManagerEmployees />} />
              <Route path="employees/:id" element={<CashierHistory />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="inventory" element={<InventoryScreen />} />
            </Route>

            <Route path="/storage" element={
              <ProtectedRoute allowedRole="storage">
                <StorageLayout />
              </ProtectedRoute>
            }>
              <Route index element={<InventoryList />} />
              <Route path=":id" element={<ProductDetails />} />
            </Route>

            <Route path="/courier" element={
              <ProtectedRoute allowedRole="courier">
                <CourierLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DeliveryList />} />
              <Route path=":id" element={<DeliveryDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
