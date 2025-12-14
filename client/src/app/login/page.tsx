"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

type AuthMode = "login" | "signup";

export default function LoginPage() {
    const router = useRouter();
    const { login, signup, isAuthenticated, isLoading } = useAuth();
    const [mode, setMode] = useState<AuthMode>("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            if (mode === "login") {
                await login(username, password);
            } else {
                // Validações no frontend antes de enviar
                if (password !== confirmPassword) {
                    throw new Error("As senhas não coincidem");
                }
                if (password.length < 8) {
                    throw new Error("A senha deve ter no mínimo 8 caracteres");
                }
                if (username.length < 3) {
                    throw new Error("O nome de usuário deve ter no mínimo 3 caracteres");
                }
                await signup(username, password, confirmPassword);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao processar requisição");
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        setError("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl">Carregando...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return null; // Vai redirecionar no useEffect
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
            <div className="absolute top-4 right-4">
                <ModeToggle />
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
                    </CardTitle>
                    <CardDescription>
                        {mode === "login"
                            ? "Entre com suas credenciais para acessar o sistema"
                            : "Preencha os dados abaixo para criar sua conta"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuário</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Digite seu usuário"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isSubmitting}
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isSubmitting}
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                            />
                            {mode === "signup" && (
                                <p className="text-xs text-muted-foreground">
                                    Mínimo de 8 caracteres
                                </p>
                            )}
                        </div>

                        {mode === "signup" && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirme sua senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-900">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting
                                ? (mode === "login" ? "Entrando..." : "Criando conta...")
                                : (mode === "login" ? "Entrar" : "Criar conta")
                            }
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="text-primary font-medium hover:underline focus:outline-none"
                                disabled={isSubmitting}
                            >
                                {mode === "login" ? "Criar conta" : "Fazer login"}
                            </button>
                        </p>
                    </div>

                    {mode === "login" && (
                        <div className="mt-6 p-4 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground mb-2">
                                <strong>💡 Dica:</strong>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Se ainda não tem uma conta, clique em "Criar conta" acima ou crie um superusuário via Django:
                                <br />
                                <code className="bg-background px-1 py-0.5 rounded mt-1 inline-block">
                                    python manage.py createsuperuser
                                </code>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
