import type { Todo } from '../types'
import { TodoItem } from './TodoItem'

interface Props {
  todos: Todo[]
  emptyMessage: string
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
}

export function TodoList({ todos, emptyMessage, onToggle, onDelete, onUpdate }: Props) {
  if (todos.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }
  return (
    <ul className="todo-list">
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </ul>
  )
}
