import { useMemo, useState } from 'react'

/** 날짜 칸은 최대 4줄. 5개 이상이면 3개만 보이고 네 번째 줄에 +n */
const MAX_ROWS = 4
import type { Todo } from '../types'
import { WEEKDAYS, monthGrid, parseISO, todayISO } from '../utils/date'

interface Props {
  todos: Todo[]
  /** 선택된 날짜(YYYY-MM-DD) */
  selected: string
  onSelect: (iso: string) => void
}

export function Calendar({ todos, selected, onSelect }: Props) {
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const d = parseISO(selected)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const byDate = useMemo(() => {
    const map = new Map<string, Todo[]>()
    for (const t of todos) {
      if (!t.dueDate) continue
      const list = map.get(t.dueDate) ?? []
      list.push(t)
      map.set(t.dueDate, list)
    }
    return map
  }, [todos])

  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor])

  function move(delta: number) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToday() {
    const d = parseISO(today)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    onSelect(today)
  }

  return (
    <section className="calendar card" aria-label="캘린더">
      <header className="calendar__header">
        <div className="calendar__nav">
          <button type="button" className="icon-btn" onClick={() => move(-1)} aria-label="이전 달">
            ‹
          </button>
          <h2 className="calendar__title">
            {cursor.year}년 {cursor.month + 1}월
          </h2>
          <button type="button" className="icon-btn" onClick={() => move(1)} aria-label="다음 달">
            ›
          </button>
        </div>
        <button type="button" className="chip-btn calendar__today" onClick={goToday}>
          오늘
        </button>
      </header>

      <div className="calendar__weekdays">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`calendar__weekday${i === 0 ? ' is-sun' : i === 6 ? ' is-sat' : ''}`}
          >
            {w}
          </span>
        ))}
      </div>

      <div className="calendar__grid" role="grid">
        {cells.map((c) => {
          const items = byDate.get(c.iso) ?? []
          const remaining = items.filter((t) => !t.completed).length
          const shown = items.length > MAX_ROWS ? items.slice(0, MAX_ROWS - 1) : items
          const hidden = items.length - shown.length
          const isSelected = c.iso === selected
          const cls = [
            'day',
            !c.inMonth && 'day--out',
            c.iso === today && 'day--today',
            isSelected && 'day--selected',
            c.dow === 0 && 'is-sun',
            c.dow === 6 && 'is-sat',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={c.iso}
              type="button"
              role="gridcell"
              className={cls}
              onClick={() => onSelect(c.iso)}
              aria-selected={isSelected}
              aria-label={`${c.iso}, 할 일 ${items.length}개`}
            >
              <span className="day__num">{c.day}</span>
              {items.length > 0 && (
                <>
                  <span className="day__dots" aria-hidden="true">
                    {shown.map((t) => (
                      <i
                        key={t.id}
                        className={`dot dot--${t.priority}${t.completed ? ' dot--done' : ''}`}
                      />
                    ))}
                  </span>
                  <span className="day__items" aria-hidden="true">
                    {shown.map((t) => (
                      <span
                        key={t.id}
                        className={`day__item day__item--${t.priority}${t.completed ? ' day__item--done' : ''}`}
                        title={t.title}
                      >
                        {t.title}
                      </span>
                    ))}
                    {hidden > 0 && <span className="day__more">+{hidden}</span>}
                  </span>
                  {remaining > 0 && <span className="day__badge">{remaining}</span>}
                </>
              )}
            </button>
          )
        })}
      </div>
      <p className="calendar__hint">날짜를 누르면 그날 할 일이 오른쪽에 보여요.</p>
    </section>
  )
}
