"use client";

import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    // Enquanto está carregando, não mostra sidebar
    if (isLoading) {
        return <>{children}</>;
    }

    // Se não está autenticado, não mostra sidebar
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    // Se está autenticado, mostra sidebar
    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="w-full">
                <SidebarTrigger />
                {children}
            </div>
        </SidebarProvider>
    );
}
