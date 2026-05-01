import { RouterProvider } from "react-router-dom"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/sonner"
import { router } from "@/router"

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}

export default App
