import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

export const ThemeChanger = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <Button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      variant="ghost"
      className="w-full justify-start"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <>
          <SunIcon className="mr-2 h-4 w-4" />
          <span>Cambiar a modo claro</span>
        </>
      ) : (
        <>
          <MoonIcon className="mr-2 h-4 w-4" />
          <span>Cambiar a modo oscuro</span>
        </>
      )}
    </Button>
  )
}