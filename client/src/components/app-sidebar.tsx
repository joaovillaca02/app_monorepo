"use client";

import { Home, Settings, User, LogOut, Phone, Info, File, Lock, CreditCard, Bell, ChartBar, ChartLineIcon, SearchIcon, ChevronDown, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useState } from "react";
import { Button } from "./ui/button";

// Menu items.
const items = [
    {
        title: "Página Inicial",
        url: "#",
        icon: Home,
    },
    {
        title: "Meus Feeds",
        url: "#",
        icon: ChartBar,
    },
    {
        title: "Explorar Feeds",
        url: "#",
        icon: SearchIcon,
    },
    {
        title: "Métricas",
        url: "#",
        icon: ChartLineIcon,
    }
]

const accountItems = [
    {
        title: "Perfil",
        url: "#",
        icon: User,
    },
    {
        title: "Privacidade",
        url: "#",
        icon: Lock,
    },
    {
        title: "Pagamento",
        url: "#",
        icon: CreditCard,
    }
]

const settingsItems = [
    {
        title: "Preferências",
        url: "#",
        icon: Settings,
    },
    {
        title: "Notificações",
        url: "#",
        icon: Bell,
    },
    {
        title: "Contato",
        url: "#",
        icon: Phone,
    },
    {
        title: "Sobre",
        url: "#",
        icon: Info,
    },
    {
        title: "Termos e Condições",
        url: "#",
        icon: File,
    },
]

export function AppSidebar() {
    const { logout, user } = useAuth();

    const [isAccountExpanded, setIsAccountExpanded] = useState(true);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Aplicativo</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <div className="mt-auto">
                    <SidebarGroup>
                        <Button
                            variant="ghost"
                            className="flex items-center justify-between w-full p-2 text-sm font-semibold"
                            onClick={() => setIsAccountExpanded(!isAccountExpanded)}
                        >
                            <SidebarGroupLabel className="!p-0 !bg-transparent">Conta - {user && user.username}</SidebarGroupLabel>
                            {isAccountExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                        {isAccountExpanded && (
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {accountItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <a href="#">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                    <SidebarMenuItem>
                                        <SidebarMenuButton onClick={logout}>
                                            <LogOut />
                                            <span>Logout</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        )}
                    </SidebarGroup>
                    <SidebarGroup>
                        <Button
                            variant="ghost"
                            className="flex items-center justify-between w-full p-2 text-sm font-semibold"
                            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                        >
                            <SidebarGroupLabel className="!p-0 !bg-transparent">Configurações</SidebarGroupLabel>
                            {isSettingsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                        {isSettingsExpanded && (
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {settingsItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <a href="#">
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        )}
                    </SidebarGroup>
                </div>
            </SidebarContent>
        </Sidebar >
    );
}
