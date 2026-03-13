import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Mail, ArrowRight, KeyRound, Loader2 } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDevCode("");
    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/auth/send-code", { email });
      const data = await res.json();
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("POST", "/api/auth/verify-code", { email, code });
      onLogin();
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">
            Weekly Workflow
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Sign in to manage your weekly tasks
          </p>
        </div>

        <div className="glassmorphic rounded-[22px] border border-border p-6 shadow-md">
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    data-testid="input-email"
                  />
                </div>
              </div>

              {error && (
                <p className="text-[12px] text-destructive" data-testid="text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  (loading || !email) && "opacity-50 cursor-not-allowed"
                )}
                data-testid="button-send-code"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-muted-foreground/60 text-center">
                We'll send a 6-digit code to your email
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-[12px] text-muted-foreground">
                  Code sent to <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              {devCode && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-center" data-testid="text-dev-code">
                  <p className="text-[10px] uppercase tracking-widest text-primary/70 mb-0.5">Your verification code</p>
                  <p className="text-[20px] font-mono font-bold text-primary tracking-[0.3em]">{devCode}</p>
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground block mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all tracking-[0.3em] text-center font-mono"
                    data-testid="input-code"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-[12px] text-destructive" data-testid="text-error">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  (loading || code.length !== 6) && "opacity-50 cursor-not-allowed"
                )}
                data-testid="button-verify-code"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
                className="w-full text-[12px] text-muted-foreground hover:text-foreground transition-colors py-1"
                data-testid="button-back-to-email"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
