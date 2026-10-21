export type Priority = 'high' | 'medium' | 'low'

export type Filter = 'all' | 'active' | 'completed'

export type SortKey = 'created' | 'dueDate' | 'priority'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  /** YYYY-MM-DD 형식. 없으면 undefined */
  dueDate?: string
  createdAt: number
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}
