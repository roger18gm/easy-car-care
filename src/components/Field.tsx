interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  error?: string
  multiline?: boolean
  onInput: (value: string) => void
}

export function Field({ id, label, type = 'text', value, error, multiline = false, onInput }: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined
  return (
    <div class="field">
      <label for={id}>{label}</label>
      {multiline ? (
        <textarea id={id} value={value} aria-describedby={describedBy} onInput={(event) => onInput((event.currentTarget as HTMLTextAreaElement).value)} />
      ) : (
        <input id={id} type={type} value={value} aria-describedby={describedBy} onInput={(event) => onInput((event.currentTarget as HTMLInputElement).value)} />
      )}
      {error ? <p id={`${id}-error`} class="error" role="alert">{error}</p> : null}
    </div>
  )
}
