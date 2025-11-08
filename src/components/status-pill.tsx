import { cn } from "@/lib/utils"

type StatusPillProps = {
  status: "pending" | "in_progress" | "completed" | "delivered"
}

export function StatusPill({ status }: StatusPillProps) {
  const statusConfig = {
    pending: {
      label: "No Preparado",
      color: " bg-red-950/30 text-red-400 border-red-800",
    },
    in_progress: {
      label: "En Preparación",
      color:
        " :bg-yellow-950/30 :text-yellow-400 :border-yellow-800",
    },
    completed: {
      label: "Listo para Retirar",
      color:
        " :bg-green-950/30 :text-green-400 :border-green-800",
    },
    delivered: {
      label: "Entregado",
      color:
        ":bg-blue-950/30 :text-blue-400 :border-blue-800",
    },
  }

  const { label, color } = statusConfig[status]

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", color)}>{label}</span>
  )
}
