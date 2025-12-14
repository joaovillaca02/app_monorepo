"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfilePage() {
    const { user, updateProfile, updatePassword } = useAuth();

    // State for Profile Update
    const [email, setEmail] = useState(user?.email || "");
    const [username, setUsername] = useState(user?.username || "");
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [emailError, setEmailError] = useState("");

    // State for Password Update
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleUpdateProfile = async () => {
        setIsProfileLoading(true);
        setProfileMessage(null);
        setEmailError("");

        if (!validateEmail(email)) {
            setEmailError("Formato de email inválido");
            setIsProfileLoading(false);
            return;
        }

        try {
            await updateProfile(username, email);
            setProfileMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });
        } catch (err: any) {
            setProfileMessage({ type: 'error', text: err.message || "Erro ao atualizar perfil." });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const validatePassword = (password: string) => {
        if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
        if (!/[A-Z]/.test(password)) return "A senha deve ter pelo menos uma letra maiúscula.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "A senha deve ter pelo menos um caractere especial.";
        return null;
    };

    const handleUpdatePassword = async () => {
        setPasswordMessage(null);

        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: "As novas senhas não coincidem." });
            return;
        }

        const validationError = validatePassword(newPassword);
        if (validationError) {
            setPasswordMessage({ type: 'error', text: validationError });
            return;
        }

        setIsPasswordLoading(true);
        try {
            await updatePassword(currentPassword, newPassword, confirmNewPassword);
            setPasswordMessage({ type: 'success', text: "Senha atualizada com sucesso!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err: any) {
            setPasswordMessage({ type: 'error', text: err.message || "Erro ao atualizar senha." });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Configurações da Conta</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Atualize suas informações pessoais.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {profileMessage && (
                        <Alert variant={profileMessage.type === 'error' ? "destructive" : "default"} className={profileMessage.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : ""}>
                            <AlertTitle>{profileMessage.type === 'success' ? "Sucesso" : "Erro"}</AlertTitle>
                            <AlertDescription>{profileMessage.text}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="username">Nome de usuário</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Nome de usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError("");
                            }}
                            className={emailError ? "border-red-500" : ""}
                        />
                        {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={isProfileLoading}>
                        {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Atualizar dados
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Altere sua senha de acesso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {passwordMessage && (
                        <Alert variant={passwordMessage.type === 'error' ? "destructive" : "default"} className={passwordMessage.type === 'success' ? "border-green-500 text-green-700 bg-green-50" : ""}>
                            <AlertTitle>{passwordMessage.type === 'success' ? "Sucesso" : "Erro"}</AlertTitle>
                            <AlertDescription>{passwordMessage.text}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Senha atual</Label>
                        <Input
                            id="current-password"
                            type="password"
                            placeholder="Sua senha atual"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova senha</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="Nova senha"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground p-1">
                            A senha deve ter pelo menos:
                            <ul className="list-disc list-inside mt-1">
                                <li className={newPassword.length >= 8 ? "text-green-500" : ""}>8 caracteres</li>
                                <li className={/[A-Z]/.test(newPassword) ? "text-green-500" : ""}>1 letra maiúscula</li>
                                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-green-500" : ""}>1 caractere especial</li>
                            </ul>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirme a nova senha"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleUpdatePassword} disabled={isPasswordLoading}>
                        {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Atualizar senha
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
