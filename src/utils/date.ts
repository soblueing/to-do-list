const pad = (n: number) => String(n).padStart(2, '0')

/** Date -> YYYY-MM-DD (로컬 기준) */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 오늘 날짜를 YYYY-MM-DD(로컬 기준)로 반환 */
export function todayISO(): string {
  return toISO(new Date())
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export type DueStatus = 'overdue' | 'today' | 'upcoming'

export function dueStatus(dueDate: string): DueStatus {
  const today = todayISO()
  if (dueDate < today) return 'overdue'
  if (dueDate === today) return 'today'
  return 'upcoming'
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 2026-10-20 -> 10/20 (화) */
export function formatDue(dueDate: string): string {
  const date = parseISO(dueDate)
  return `${date.getMonth() + 1}/${date.getDate()} (${WEEKDAYS[date.getDay()]})`
}

/** 2026-10-20 -> 10월 20일 화요일 */
export function formatLong(iso: string): string {
  const date = parseISO(iso)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`
}

export interface CalendarCell {
  iso: string
  day: number
  inMonth: boolean
  dow: number
}

/** 해당 월을 일요일 시작 7열 격자로 반환 (앞뒤 빈 칸은 이전/다음 달 날짜로 채움) */
export function monthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const rows = Math.ceil((first.getDay() + daysInMonth) / 7)
  const start = new Date(year, month, 1 - first.getDay())
  return Array.from({ length: rows * 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: toISO(d), day: d.getDate(), inMonth: d.getMonth() === month, dow: d.getDay() }
  })
}
