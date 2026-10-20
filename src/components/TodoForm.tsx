import { useState, type FormEvent } from 'react'
import { PRIORITY_LABEL, type Priority } from '../types'
import { todayISO } from '../utils/date'

interface Props {
  onAdd: (title: string, priority: Priority, dueDate?: string) => void
  /** 캘린더에서 선택한 날짜. 없으면 오늘 */
  defaultDueDate?: string
}

export function TodoForm({ onAdd, defaultDueDate }: Props) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const fallback = defaultDueDate ?? todayISO()
  const [dueDate, setDueDate] = useState(fallback)

  // 캘린더에서 날짜를 바꾸면 폼의 마감일도 따라가도록, 렌더 중에 상태를 맞춘다
  const [prevDefault, setPrevDefault] = useState(defaultDueDate)
  if (prevDefault !== defaultDueDate) {
    setPrevDefault(defaultDueDate)
    setDueDate(fallback)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, priority, dueDate || fallback)
    setTitle('')
    setPriority('medium')
    setDueDate(fallback)
  }

  return (
    <form className="todo-form card" onSubmit={handleSubmit}>
      <input
        className="todo-form__title"
        type="text"
        placeholder="무엇을 해야 하나요?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="할 일"
        autoFocus
      />
      <div className="todo-form__row">
        <label className="todo-form__field">
          <span>우선순위</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="todo-form__field">
          <span>마감일</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={!title.trim()}>
          추가하기
        </button>
      </div>
    </form>
  )
}
