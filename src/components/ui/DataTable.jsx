import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function DataTable({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = 'Search…',
  searchKeys = [],
  emptyMessage = 'No records found.',
  actions,
  pageSize = 10,
  onRowClick,
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] || '').toLowerCase().includes(q))
    )
  }, [data, search, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div>
      {/* Toolbar */}
      {(searchable || actions) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {searchable && (
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                className="search-input"
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearch}
              />
            </div>
          )}
          {actions && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.label} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <Search className="empty-state-icon" />
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : undefined }}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: '0 0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
