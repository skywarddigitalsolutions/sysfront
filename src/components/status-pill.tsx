import { cn } from "@/lib/utils"

type StatusPillProps = {
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'COMPLETADO'
}

export function StatusPill({ status }: StatusPillProps) {
  const statusConfig = {
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-200 text-yellow-800' },
    EN_PREPARACION: { label: 'En Preparación', color: 'bg-blue-200 text-blue-800' },
    COMPLETADO: { label: 'Completado', color: 'bg-green-200 text-green-800' },
  }

  const { label, color } = statusConfig[status]

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        color
      )}
    >
      {label}
    </span>
  )
}

