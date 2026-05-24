import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, Zap } from 'lucide-react';
import SafeImage from '@/components/ui/safe-image';
import { useAdminLogin } from '../hooks/use-admin-login';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminLoginSchema, AdminLoginValues } from '../schemas/admin-login.schema';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export default function AdminLoginPage() {
  const {
    error,
    isLoading,
    isBootstrapping,
    bootstrapMessage,
    handleLogin,
    handleBootstrap,
  } = useAdminLogin();

  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 relative z-10"
      >
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 mb-4 shadow-lg">
              <SafeImage
                src="https://raiyansoft.com/wp-content/uploads/2024/05/cropped-App-Icon-1.png"
                className="w-10 h-10 object-contain"
                alt="Raiyansoft Logo"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to dashboard</p>
          </div>

          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      {...field}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 ps-10 pe-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="name@raiyansoft.com"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Password</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      {...field}
                      type="password"
                      aria-invalid={fieldState.invalid}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 ps-10 pe-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="••••••"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {error ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-xs"
              >
                <ShieldCheck size={14} />
                {error}
              </motion.div>
            ) : null}

            {bootstrapMessage ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-xs text-center"
              >
                {bootstrapMessage}
              </motion.div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(29,183,240,0.3)] hover:shadow-[0_0_25px_rgba(29,183,240,0.5)] transition-all duration-300 mt-1 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Secured Area • Raiyansoft® Admin</p>

            <button
              type="button"
              onClick={async () => {
                const values = await handleBootstrap();
                if (values) {
                  form.setValue('email', values.email);
                  form.setValue('password', values.password);
                }
              }}
              disabled={isBootstrapping}
              className="text-[10px] text-slate-700 hover:text-slate-500 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              {isBootstrapping ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
              Initialize / Recover Super Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
