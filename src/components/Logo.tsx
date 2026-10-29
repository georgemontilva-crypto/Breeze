interface Props {
  variant?: 'navy' | 'silver' | 'white' | 'ink'
  className?: string
  title?: string
}

/** Breeze wordmark (vector extracted from the label artwork), colored through a CSS mask. */
export default function Logo({ variant = 'ink', className = '', title = 'Breeze' }: Props) {
  return <span role="img" aria-label={title} className={`logo logo--${variant} ${className}`} />
}
