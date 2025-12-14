"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string, confirmPassword: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    const checkAuth = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/check-auth", {
                credentials: "include",
            });
            const data = await res.json();

            if (data.authenticated) {
                setUser({ username: data.user });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
        return null;
    };

    const login = async (username: string, password: string) => {
        try {
            const res = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken") || "",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setUser({ username: data.user });
                router.push("/");
            } else {
                throw new Error(data.error || "Erro ao fazer login");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    };

    const signup = async (username: string, password: string, confirmPassword: string) => {
        try {
            const res = await fetch("http://localhost:8000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken") || "",
                },
                credentials: "include",
                body: JSON.stringify({ username, password, confirmPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setUser({ username: data.user });
                router.push("/");
            } else {
                throw new Error(data.error || "Erro ao criar conta");
            }
        } catch (error) {
            console.error("Erro no signup:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch("http://localhost:8000/api/logout", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken") || "",
                },
                credentials: "include",
            });

            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, isLoading, login, signup, logout, checkAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
}
