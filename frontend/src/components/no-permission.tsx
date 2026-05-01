import { Lock } from "lucide-react"

export function NoPermission({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <Lock className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {message ?? "No tienes permiso para ver esta información"}
      </p>
    </div>
  )
}
