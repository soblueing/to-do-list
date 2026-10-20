import { useMemo, useState } from 'react'
import { Calendar } from './components/Calendar'
import { FilterBar } from './components/FilterBar'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { useLocalStorage } from './hooks/useLocalStorage'
import { PRIORITY_ORDER, type Filter, type Priority, type SortKey, type Todo } from './types'
import { formatDue, formatLong, toISO, todayISO } from './utils/date'
import './App.css'

const STORAGE_KEY = 'todos.v1'

/** 목록 범위: 캘린더에서 고른 하루만 / 전체 기간 */
type Scope = 'day' | 'all'

/** 예전 데이터처럼 마감일이 없는 항목은 등록한 날짜로 올려 캘린더에 보이게 한다 */
function withDates(todos: Todo[]): Todo[] {
  return todos.map((t) => (t.dueDate ? t : { ...t, dueDate: toISO(new Date(t.createdAt)) }))
}

const EMPTY_MESSAGE: Record<Filter, string> = {
  all: '아직 할 일이 없어요. 위에서 추가해보세요.',
  active: '진행중인 할 일이 없어요.',
  completed: '완료한 할 일이 없어요.',
}

function sortTodos(todos: Todo[], sort: SortKey): Todo[] {
  const list = [...todos]
  switch (sort) {
    case 'dueDate':
      // 마감일 없는 항목은 뒤로, 같은 날이면 우선순위 높은 순
      return list.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      })
    case 'priority':
      return list.sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.createdAt - b.createdAt,
      )
    case 'created':
    default:
      return list.sort((a, b) => b.createdAt - a.createdAt)
  }
}

/** 전체 기간 보기에서 날짜 묶음 제목: 오늘 / 내일 / 어제 / 10/23 (금) */
function groupLabel(iso: string, today: string): string {
  const diff = Math.round((+new Date(iso) - +new Date(today)) / 86_400_000)
  if (diff === 0) return '오늘'
  if (diff === 1) return '내일'
  if (diff === -1) return '어제'
  return formatDue(iso)
}

export default function App() {
  const today = todayISO()
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEY, [], withDates)
  const [scope, setScope] = useLocalStorage<Scope>('todos.scope', 'day')
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useLocalStorage<SortKey>('todos.sort', 'created')

  // 1) 범위(하루/전체) → 2) 상태 필터 → 3) 정렬
  const scoped = useMemo(
    () => (scope === 'day' ? todos.filter((t) => t.dueDate === selectedDate) : todos),
    [todos, scope, selectedDate],
  )

  const counts = useMemo(
    () => ({
      all: scoped.length,
      active: scoped.filter((t) => !t.completed).length,
      completed: scoped.filter((t) => t.completed).length,
    }),
    [scoped],
  )

  const visible = useMemo(() => {
    const filtered = scoped.filter((t) =>
      filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
    )
    return sortTodos(filtered, sort)
  }, [scoped, filter, sort])

  // 전체 기간일 때는 날짜별로 묶어서 보여준다 (날짜 오름차순, 묶음 안은 선택한 정렬)
  const groups = useMemo(() => {
    if (scope !== 'all') return null
    const map = new Map<string, Todo[]>()
    for (const t of visible) {
      const key = t.dueDate ?? ''
      map.set(key, [...(map.get(key) ?? []), t])
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([iso, items]) => ({ iso, label: groupLabel(iso, today), items }))
  }, [visible, scope, today])

  const remainingAll = useMemo(() => todos.filter((t) => !t.completed).length, [todos])

  function selectDate(iso: string) {
    setSelectedDate(iso)
    setScope('day')
  }

  function addTodo(title: string, priority: Priority, dueDate?: string) {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      // 날짜를 안 고르면 선택한 날로. 모든 할 일이 캘린더에 뜨도록 한다
      dueDate: dueDate || selectedDate,
      createdAt: Date.now(),
    }
    setTodos((prev) => [todo, ...prev])
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function updateTodo(id: string, patch: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function clearCompleted() {
    // 보고 있는 범위 안의 완료 항목만 지운다
    const ids = new Set(scoped.filter((t) => t.completed).map((t) => t.id))
    setTodos((prev) => prev.filter((t) => !ids.has(t.id)))
  }

  const emptyMessage =
    scope === 'day' && filter === 'all'
      ? '이 날은 할 일이 없어요. 위에서 추가하면 이 날짜로 들어가요.'
      : EMPTY_MESSAGE[filter]

  const dayLabel = selectedDate === today ? '오늘' : formatDue(selectedDate)

  return (
    <main className="app">
      <header className="app__header">
        <h1>할 일</h1>
        <p className="app__summary">
          {remainingAll > 0
            ? `${remainingAll}개 남았어요`
            : todos.length > 0
              ? '할 일을 모두 끝냈어요 🎉'
              : '가볍게 시작해볼까요?'}
        </p>
      </header>

      <div className="layout">
        <aside className="layout__calendar">
          <Calendar todos={todos} selected={selectedDate} onSelect={selectDate} />
        </aside>

        <section className="layout__list" aria-label="할 일 목록">
          <TodoForm onAdd={addTodo} defaultDueDate={selectedDate} />

          <div className="list-card card">
            <div className="scope-bar">
              <div className="segmented" role="tablist" aria-label="목록 범위">
                <button
                  type="button"
                  role="tab"
                  aria-selected={scope === 'day'}
                  className={`segmented__btn${scope === 'day' ? ' is-active' : ''}`}
                  onClick={() => setScope('day')}
                >
                  {dayLabel}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={scope === 'all'}
                  className={`segmented__btn${scope === 'all' ? ' is-active' : ''}`}
                  onClick={() => setScope('all')}
                >
                  전체 기간
                </button>
              </div>
              {scope === 'day' && (
                <span className="scope-bar__date">{formatLong(selectedDate)}</span>
              )}
            </div>

            <FilterBar
              filter={filter}
              sort={sort}
              counts={counts}
              onFilter={setFilter}
              onSort={setSort}
              onClearCompleted={clearCompleted}
            />

            <div className="list-scroll">
              {groups ? (
                groups.length === 0 ? (
                  <p className="empty">{emptyMessage}</p>
                ) : (
                  groups.map((g) => (
                    <section key={g.iso} className="group" aria-label={g.label}>
                      <h3
                        className={`group__title${g.iso === today ? ' is-today' : g.iso < today ? ' is-past' : ''}`}
                      >
                        {g.label}
                        <span className="group__count">{g.items.length}</span>
                      </h3>
                      <TodoList
                        todos={g.items}
                        emptyMessage=""
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        onUpdate={updateTodo}
                      />
                    </section>
                  ))
                )
              ) : (
                <TodoList
                  todos={visible}
                  emptyMessage={emptyMessage}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
