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
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation State
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password: string) => {
        if (password.length < 8) return "Mínimo de 8 caracteres";
        if (!/[A-Z]/.test(password)) return "Mínimo de 1 letra maiúscula";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Mínimo de 1 caractere especial";
        return null;
    };

    const [verificationSent, setVerificationSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setEmailError("");
        setPasswordError("");
        setIsSubmitting(true);

        try {
            if (mode === "login") {
                await login(username, email, password);
            } else {
                // Validações no frontend antes de enviar
                if (!validateEmail(email)) {
                    setEmailError("Format de email inválido");
                    throw new Error("Verifique o email informado");
                }

                const passErr = validatePassword(password);
                if (passErr) {
                    setPasswordError(passErr);
                    throw new Error(passErr);
                }

                if (password !== confirmPassword) {
                    throw new Error("As senhas não coincidem");
                }

                if (username.length < 3) {
                    throw new Error("O nome de usuário deve ter no mínimo 3 caracteres");
                }

                const response = await signup(username, email, password, confirmPassword);
                if (response && response.pending) {
                    setVerificationSent(true);
                }
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
        setEmailError("");
        setPasswordError("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setVerificationSent(false);
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
                {verificationSent ? (
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                            Verifique seu Email
                        </CardTitle>
                        <CardDescription className="text-base">
                            Enviamos um link de confirmação para <strong>{email}</strong>.
                            <br /><br />
                            Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.
                        </CardDescription>
                        <div className="pt-4">
                            <Button variant="outline" onClick={() => setVerificationSent(false)} className="w-full">
                                Voltar para Login
                            </Button>
                        </div>
                    </CardHeader>
                ) : (
                    <>
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Digite seu email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError("");
                                        }}
                                        required
                                        disabled={isSubmitting}
                                        autoComplete="email"
                                        className={emailError ? "border-red-500" : ""}
                                    />
                                </div>
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
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) setPasswordError("");
                                        }}
                                        required
                                        disabled={isSubmitting}
                                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                                        className={passwordError ? "border-red-500" : ""}
                                    />
                                    {mode === "signup" && (
                                        <div className="text-xs text-muted-foreground pt-1">
                                            <p className="mb-1">Requisitos:</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li className={password.length >= 8 ? "text-green-500" : ""}>8 caracteres</li>
                                                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>1 letra maiúscula</li>
                                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : ""}>1 especial</li>
                                            </ul>
                                        </div>
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
                    </>
                )}
            </Card>
        </div>
    );
}
