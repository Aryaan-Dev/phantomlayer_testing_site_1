'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function AccountSearchFilter({ defaultSearch = '' }: { defaultSearch?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultSearch)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (value) params.set('search', value)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search transactions..."
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        Search
      </button>
      {defaultSearch && (
        <button
          type="button"
          onClick={() => { setValue(''); router.push(pathname) }}
          className="rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  )
}
