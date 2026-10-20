import type { Filter, SortKey } from '../types'

interface Props {
  filter: Filter
  sort: SortKey
  counts: { all: number; active: number; completed: number }
  onFilter: (f: Filter) => void
  onSort: (s: SortKey) => void
  onClearCompleted: () => void
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '모두' },
  { key: 'active', label: '진행중' },
  { key: 'completed', label: '완료' },
]

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'created', label: '등록순' },
  { key: 'dueDate', label: '마감일순' },
  { key: 'priority', label: '우선순위순' },
]

export function FilterBar({ filter, sort, counts, onFilter, onSort, onClearCompleted }: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__tabs" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            type="button"
            aria-selected={filter === f.key}
            className={`tab${filter === f.key ? ' tab--active' : ''}`}
            onClick={() => onFilter(f.key)}
          >
            {f.label} <span className="tab__count">{counts[f.key]}</span>
          </button>
        ))}
      </div>
      <div className="filter-bar__right">
        <label className="sort">
          <span>정렬</span>
          <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onClearCompleted}
          disabled={counts.completed === 0}
        >
          완료 항목 삭제
        </button>
      </div>
    </div>
  )
}
