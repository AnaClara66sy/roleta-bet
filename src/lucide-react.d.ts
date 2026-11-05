declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react'
  type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
  export const ArrowLeft: Icon
  export const ArrowRight: Icon
  export const BarChart3: Icon
  export const Gift: Icon
  export const RotateCcw: Icon
  export const Trash2: Icon
  export const X: Icon
}
