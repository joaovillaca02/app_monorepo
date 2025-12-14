"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { checkAuth } = useAuth(); // To update auth state after verification

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verificando seu email...");

    useEffect(() => {
        const verify = async () => {
            if (!uid || !token) {
                setStatus("error");
                setMessage("Link de confirmação inválido ou incompleto.");
                return;
            }

            try {
                // Get CSRF Token
                const getCookie = (name: string) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
                    return null;
                };

                const res = await fetch("http://localhost:8000/api/verify-email/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken") || "",
                    },
                    credentials: "include",
                    body: JSON.stringify({ uid, token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Email verificado com sucesso! Você será redirecionado em instantes.");

                    // Update auth context
                    await checkAuth();

                    // Redirect after 5 seconds
                    setTimeout(() => {
                        router.push("/");
                    }, 5000);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Falha na verificação do email.");
                }
            } catch (error) {
                console.error(error);
                setStatus("error");
                setMessage("Ocorreu um erro ao verificar o email.");
            }
        };

        verify();
    }, [uid, token, router, checkAuth]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                        {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
                        {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === "loading" && "Verificando..."}
                        {status === "success" && "Email Confirmado!"}
                        {status === "error" && "Erro na Verificação"}
                    </CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "success" && (
                        <p className="text-sm text-muted-foreground">
                            Redirecionando para a página inicial...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
