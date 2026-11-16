'use client'

import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode
}

/**
 * Label + password input with a show/hide toggle. Styled by the surrounding form
 * (`.register-form label`, `.simple-login-form label`) plus `.password-field` in globals.css.
 *
 * The toggle sits outside the <label> on purpose: a label may contain only one
 * labelable element, and nesting the button would also leak "Tampilkan password"
 * into the input's accessible name.
 */
export function PasswordField({ label, className, disabled, ...inputProps }: PasswordFieldProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)

  // Hide the password again when the form is submitted. Browsers only treat
  // type="password" as secret; a visible field could end up in plain-text form history.
  useEffect(() => {
    const input = inputRef.current
    const form = input?.form
    if (!input || !form) return

    const hide = () => {
      input.type = 'password' // immediately, before the browser handles the submission
      setVisible(false)
    }
    form.addEventListener('submit', hide)
    return () => form.removeEventListener('submit', hide)
  }, [])

  const toggleLabel = visible ? 'Sembunyikan password' : 'Tampilkan password'

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          {...inputProps}
          ref={inputRef}
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn('input', className)}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={toggleLabel}
          aria-controls={id}
          title={toggleLabel}
          disabled={disabled}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
