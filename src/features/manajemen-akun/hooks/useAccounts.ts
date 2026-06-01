import { useState, useCallback, useEffect } from "react"
import apiClient from "@/lib/api-client"
import { getErrorMessage } from "@/lib/errors"
import type { ApiResponse, User } from "@/types/api.types"

export function useAccounts() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<ApiResponse<User[]>>("/accounts")
      setUsers(response.data?.data ?? [])
    } catch (err: unknown) {
      const message = getErrorMessage(err) || "Gagal memuat data akun."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return { users, loading, error, loadUsers }
}