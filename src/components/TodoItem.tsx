import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { PRIORITY_LABEL, type Priority, type Todo } from '../types'
import { dueStatus, formatDue } from '../utils/date'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.title) onUpdate(todo.id, { title: trimmed })
    else setDraft(todo.title)
    setEditing(false)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') {
      setDraft(todo.title)
      setEditing(false)
    }
  }

  const status = todo.dueDate && !todo.completed ? dueStatus(todo.dueDate) : null

  return (
    <li className={`todo-item${todo.completed ? ' todo-item--done' : ''}`}>
      <input
        type="checkbox"
        className="todo-item__check"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`${todo.title} 완료`}
      />

      <div className="todo-item__body">
        {editing ? (
          <input
            ref={inputRef}
            className="todo-item__edit"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            aria-label="할 일 수정"
          />
        ) : (
          <span className="todo-item__title" onDoubleClick={() => setEditing(true)}>
            {todo.title}
          </span>
        )}

        <div className="todo-item__meta">
          <select
            className={`badge badge--${todo.priority}`}
            value={todo.priority}
            onChange={(e) => onUpdate(todo.id, { priority: e.target.value as Priority })}
            aria-label="우선순위 변경"
          >
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>

          <label className={`due${status ? ` due--${status}` : ''}`}>
            <span className="due__text">
              {todo.dueDate ? formatDue(todo.dueDate) : '마감일 없음'}
              {status === 'overdue' && ' · 지남'}
              {status === 'today' && ' · 오늘'}
            </span>
            <input
              type="date"
              className="due__input"
              value={todo.dueDate ?? ''}
              onChange={(e) => {
                if (e.target.value) onUpdate(todo.id, { dueDate: e.target.value })
              }}
              aria-label="마감일 변경"
            />
          </label>
        </div>
      </div>

      <div className="todo-item__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setEditing(true)}
          aria-label="수정"
          title="수정"
        >
          ✎
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--danger"
          onClick={() => onDelete(todo.id)}
          aria-label="삭제"
          title="삭제"
        >
          ✕
        </button>
      </div>
    </li>
  )
}
