import { cn } from "@/lib/utils"

type StatusPillProps = {
  status: "pending" | "in_progress" | "completed" | "delivered"
}

export function StatusPill({ status }: StatusPillProps) {
  const statusConfig = {
    pending: {
      label: "No Preparado",
      color: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    },
    in_progress: {
      label: "En Preparación",
      color:
        "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
    },
    completed: {
      label: "Listo para Retirar",
      color:
        "bg-green-100 text-green-800 border border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
    },
    delivered: {
      label: "Entregado",
      color:
        "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    },
  }

  const { label, color } = statusConfig[status]

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", color)}>{label}</span>
  )
}
