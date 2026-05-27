"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  Loader2,
  LogOut,
  Shield,
  Layout,
} from "lucide-react"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"

import {
  bottomMenu,
  generalMenu,
  mainNavigation,
  prodiMenu,
} from "./navigation.config"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  const [loading, setLoading] =
    useState(false)

  const [expanded, setExpanded] =
    useState<"general" | "prodi" | null>(
      null
    )

  const canAccess = (roles?: string[]) => {
    if (!roles) return true

    return roles.includes(user?.role || "")
  }

  const toggle = (
    value: "general" | "prodi"
  ) => {
    setExpanded(
      expanded === value ? null : value
    )
  }

  useEffect(() => {
    const generalActive = generalMenu.some(
      (item) =>
        pathname.startsWith(item.href)
    )

    const prodiActive = prodiMenu.some(
      (item) =>
        pathname.startsWith(item.href)
    )

    if (generalActive) {
      setExpanded("general")
    } else if (prodiActive) {
      setExpanded("prodi")
    }
  }, [pathname])

  const itemClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"

  const activeClass =
    "bg-gray-900 text-white shadow-sm"

  const inactiveClass =
    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"

  const accordionButtonClass =
    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200"

  const accordionActiveClass =
    "bg-blue-600 text-white shadow-sm"

  const accordionInactiveClass =
    "bg-gray-50 text-gray-700 hover:bg-gray-100"

  const submenuClass =
    "ml-4 mt-2 space-y-1 border-l border-gray-200 pl-3"

  const logout = async () => {
    setLoading(true)

    try {
      localStorage.removeItem(
        "access_token"
      )

      localStorage.removeItem(
        "accessToken"
      )

      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="flex h-screen flex-col bg-white">
      
    {/* Brand */}
    <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <Link
            href={
            user?.role === "SUPER_ADMIN" ||
            user?.role === "PIMPINAN"
                ? "/dashboard"
                : "/prodi-saya"
            }
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            S
            </div>

            <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                Portal STEI
            </h1>

            <p className="text-xs text-gray-500">
                Sistem Akreditasi Terpusat
            </p>
            </div>
        </Link>
    </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        {/* Main Navigation */}
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            if (!canAccess(item.roles))
              return null

            const Icon = item.icon

            const active =
              pathname === item.href ||
              pathname.startsWith(
                item.href + "/"
              )

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  itemClass,
                  active
                    ? activeClass
                    : inactiveClass
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Menu Umum */}
        {generalMenu.some((item) =>
          canAccess(item.roles)
        ) && (
          <div className="mt-6">

            <button
              onClick={() =>
                toggle("general")
              }
              className={cn(
                accordionButtonClass,
                expanded === "general"
                  ? accordionActiveClass
                  : accordionInactiveClass
              )}
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                <span>Menu Umum</span>
              </div>

              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  expanded === "general" &&
                    "rotate-180"
                )}
              />
            </button>

            {expanded === "general" && (
              <div className={submenuClass}>
                {generalMenu.map((item) => {
                  if (
                    !canAccess(item.roles)
                  )
                    return null

                  const Icon = item.icon

                  const active =
                    pathname.startsWith(
                      item.href
                    )

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        itemClass,
                        active
                          ? activeClass
                          : inactiveClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Menu Prodi */}
        <div className="mt-4">

          <button
            onClick={() =>
              toggle("prodi")
            }
            className={cn(
              accordionButtonClass,
              expanded === "prodi"
                ? accordionActiveClass
                : accordionInactiveClass
            )}
          >
            <div className="flex items-center gap-3">
              <Layout className="h-4 w-4" />
              <span>Menu Prodi</span>
            </div>

            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expanded === "prodi" &&
                  "rotate-180"
              )}
            />
          </button>

          {expanded === "prodi" && (
            <div className={submenuClass}>
              {prodiMenu.map((item) => {
                if (!canAccess(item.roles))
                  return null

                const Icon = item.icon

                const active =
                  pathname.startsWith(
                    item.href
                  )

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      itemClass,
                      active
                        ? activeClass
                        : inactiveClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-4 space-y-2">

        {bottomMenu.map((item) => {
          if (!canAccess(item.roles))
            return null

          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                itemClass,
                inactiveClass
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        <button
          onClick={logout}
          disabled={loading}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}

          {loading
            ? "Keluar..."
            : "Log Out"}
        </button>
      </div>
    </aside>
  )
}