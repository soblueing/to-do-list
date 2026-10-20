import { useEffect, useState } from 'react'

/**
 * useState와 같지만 값이 바뀔 때마다 localStorage에 저장하고,
 * 첫 렌더 시 저장된 값을 읽어온다. migrate가 있으면 읽은 값에 한 번 적용한다.
 */
export function useLocalStorage<T>(key: string, initialValue: T, migrate?: (stored: T) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return initialValue
      const parsed = JSON.parse(raw) as T
      return migrate ? migrate(parsed) : parsed
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 저장 실패(용량 초과, 프라이빗 모드 등)는 조용히 무시
    }
  }, [key, value])

  return [value, setValue] as const
}
