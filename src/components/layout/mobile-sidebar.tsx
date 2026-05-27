"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  ChevronDown,
  Layout,
  Loader2,
  LogOut,
  Shield,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"

import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"

import {
  bottomMenu,
  generalMenu,
  mainNavigation,
  prodiMenu,
} from "./navigation.config"

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
}

export function MobileSidebar({
  open,
  setOpen,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  const [expanded, setExpanded] =
    useState<"general" | "prodi" | null>(
      null
    )

  const [isLoggingOut, setIsLoggingOut] =
    useState(false)

  const canAccess = (roles?: string[]) => {
    if (!roles) return true

    return roles.includes(user?.role || "")
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

  const toggle = (
    value: "general" | "prodi"
  ) => {
    setExpanded(
      expanded === value ? null : value
    )
  }

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

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      localStorage.removeItem(
        "access_token"
      )

      localStorage.removeItem(
        "accessToken"
      )

      router.push("/login")

      setOpen(false)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 md:hidden",
          open
            ? "translate-x-0"
            : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">

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
                    onClick={() =>
                      setOpen(false)
                    }
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

                    <span>
                      Menu Umum
                    </span>
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      expanded ===
                        "general" &&
                        "rotate-180"
                    )}
                  />
                </button>

                {expanded === "general" && (
                  <div className={submenuClass}>
                    {generalMenu.map(
                      (item) => {
                        if (
                          !canAccess(
                            item.roles
                          )
                        )
                          return null

                        const Icon =
                          item.icon

                        const active =
                          pathname.startsWith(
                            item.href
                          )

                        return (
                          <Link
                            key={
                              item.name
                            }
                            href={
                              item.href
                            }
                            onClick={() =>
                              setOpen(
                                false
                              )
                            }
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
                      }
                    )}
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

                  <span>
                    Menu Prodi
                  </span>
                </div>

                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    expanded ===
                      "prodi" &&
                      "rotate-180"
                  )}
                />
              </button>

              {expanded === "prodi" && (
                <div className={submenuClass}>
                  {prodiMenu.map((item) => {
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
                        onClick={() =>
                          setOpen(false)
                        }
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
                  onClick={() =>
                    setOpen(false)
                  }
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
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}

              {isLoggingOut
                ? "Keluar..."
                : "Log Out"}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}