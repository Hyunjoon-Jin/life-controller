"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 relative">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">테마 변경</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className={theme === 'light' ? 'bg-accent text-accent-foreground' : ''}>
                    <Sun className="w-4 h-4 mr-2" />
                    라이트 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className={theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}>
                    <Moon className="w-4 h-4 mr-2" />
                    다크 모드
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("gray")} className={theme === 'gray' ? 'bg-accent text-accent-foreground' : ''}>
                    <Palette className="w-4 h-4 mr-2" />
                    그레이 모드 (눈 보호)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className={theme === 'system' ? 'bg-accent text-accent-foreground' : ''}>
                    <Monitor className="w-4 h-4 mr-2" />
                    시스템 설정
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
