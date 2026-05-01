import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Identity Core</CardTitle>
          <CardDescription>Frontend operativo. shadcn/ui cargado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Funciona</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
