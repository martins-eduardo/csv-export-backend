type  Value = string | number | boolean | null | undefined

const SEPARATOR = ';'
const LINE_BREAK = '\r\n'
const GOOD = '\uFEFF'

function escapeValue(value: Value): string {
  if (value === null || value === undefined) return ''

  let text = String(value)

  // Proteção contra CSV injection (só em textos, para não afetar números negativos)
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) {
    text = `'${text}`
  }

  const needsQuotationMarks =
    text.includes(SEPARATOR) || text.includes('"') || text.includes('\n') || text.includes('\r')

  if (needsQuotationMarks) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function generateCsv(header: string[], rows: Value[][]): string {
  const registers = [header, ...rows].map((linha) =>
    linha.map(escapeValue).join(SEPARATOR),
  )

  return GOOD + registers.join(LINE_BREAK)
}