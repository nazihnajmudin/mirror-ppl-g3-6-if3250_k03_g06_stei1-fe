import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
export function Header() {
  return (
    <div className="flex justify-end items-center gap-6 mb-8">
      <button className="text-black hover:text-gray-700 transition-colors">
        <Bell className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-bold text-gray-900 leading-tight">John Michael</span>
          <span className="text-[13px] text-gray-500">Kaprodi</span>
        </div>
        <Avatar className="w-10 h-10 border border-gray-100 shadow-sm">
          <AvatarImage src="" alt="Profile" />
          <AvatarFallback className="bg-blue-50 text-blue-600 text-[13px] font-bold">JM</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}