import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { Send, Loader2, Mail, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  company: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, "El mensaje es obligatorio").max(1000),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", message: "" },
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      const { error } = await supabase.functions.invoke("send-contact-notification", {
        body: {
          type: "contact_notification",
          data: {
            name: data.name,
            email: data.email,
            company: data.company || undefined,
            message: data.message,
          },
        },
      });
      if (error) throw error;
      toast.success("¡Mensaje enviado!", { description: "Nos pondremos en contacto contigo pronto." });
      form.reset();
    } catch (err) {
      console.error("Failed to send contact form:", err);
      toast.error("Error al enviar", { description: "Inténtalo de nuevo más tarde." });
    }
  };

  return (
    <section id="contacto" className="px-4 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bento relative flex flex-col justify-between overflow-hidden p-8 md:col-span-5 md:p-10"
        >
          <div className="neon-blob-pink -right-10 -top-10 opacity-60" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">Contacto</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              ¿Listo para <span className="gradient-text">escalar</span> en TikTok Shop?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Cuéntanos sobre tu proyecto y un especialista te contactará en menos de 24h.
            </p>
          </div>
          <div className="relative mt-10 space-y-4">
            {[
              { icon: Clock, text: "Respuesta en <24h" },
              { icon: Mail, text: "Asesoría sin compromiso" },
              { icon: MessageSquare, text: "Estrategia personalizada" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15">
                  <f.icon className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-foreground/80">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bento-solid p-8 md:col-span-7 md:p-10"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" className="rounded-xl border-white/10 bg-white/5 h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@email.com" type="email" className="rounded-xl border-white/10 bg-white/5 h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu empresa" className="rounded-xl border-white/10 bg-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje</FormLabel>
                    <FormControl>
                      <Textarea placeholder="¿En qué podemos ayudarte?" rows={5} className="rounded-xl border-white/10 bg-white/5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full gap-2 rounded-full glow-pink" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>Enviando... <Loader2 className="h-4 w-4 animate-spin" /></>
                ) : (
                  <>Enviar mensaje <Send className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
