import type { SVGProps } from "react"

/**
 * Brand marks, inlined.
 *
 * lucide-react v1 removed every brand icon, so `Linkedin` disappeared and the
 * contact detail page stopped compiling. There is no lucide replacement and
 * there should not be: brand marks are trademarks carrying their own usage
 * terms, so dropping them upstream is correct.
 *
 * The props signature matches what lucide exported, so call sites keep passing
 * `className="h-5 w-5"` and nothing else had to change. These are filled paths
 * rather than lucide's stroke style -- that is how the marks are specified --
 * but they take `currentColor` the same way, so they still inherit text colour.
 */
export function LinkedinIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
