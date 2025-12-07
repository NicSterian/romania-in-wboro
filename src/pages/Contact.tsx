import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, MessageCircle, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/logo.png';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, { message: t('contact.form.required') }),
    email: z.string().email({ message: t('contact.form.invalidEmail') }),
    phone: z.string().min(1, { message: t('contact.form.required') }),
    method: z.string().min(1, { message: t('contact.form.required') }),
    message: z.string().min(10, { message: t('contact.form.minLength') }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      method: '',
      message: '',
    },
  });

  const encode = (data: Record<string, string>) =>
    Object.keys(data)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const body = encode({
        'form-name': 'contact',
        name: data.name,
        email: data.email,
        phone: data.phone,
        method: data.method,
        message: data.message,
      });

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!response.ok) {
        throw new Error('Network error');
      }
      
      toast.success(t('contact.form.success'));
      form.reset();
    } catch (error) {
      toast.error(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <img 
            src={logo} 
            alt="Centrul de Cultură, Limbă și Tradiție Românească Wellingborough" 
            className="h-24 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('contact.hero')}
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            {t('contact.subtitle')}
          </p>
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link to="/enrolment">
                {t('home.cta.contactBtn')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                {t('contact.form.title')}
              </h2>
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form
                      name="contact"
                      data-netlify="true"
                      netlify-honeypot="bot-field"
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <input type="hidden" name="form-name" value="contact" />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.name')} *</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>{t('contact.form.email')} *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.phone')} *</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.method')} *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-card">
                                <SelectItem value="whatsapp">
                                  {t('contact.form.methodOptions.whatsapp')}
                                </SelectItem>
                                <SelectItem value="phone">
                                  {t('contact.form.methodOptions.phone')}
                                </SelectItem>
                                <SelectItem value="email">
                                  {t('contact.form.methodOptions.email')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.message')} *</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={5} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? '...' : t('contact.form.submit')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                {t('contact.info.title')}
              </h2>
              <div className="space-y-4">
                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {t('contact.info.email')}
                        </h3>
                        <a
                          href="mailto:ccltrwellingborough@gmail.com"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                        >
                          ccltrwellingborough@gmail.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MessageCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {t('contact.info.whatsapp')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('contact.info.whatsappValue')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {t('contact.info.location')}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          Wellingborough, Northamptonshire
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {t('contact.info.locationValue')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">
                          {t('contact.info.schedule')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('contact.info.scheduleValue')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://maps.google.com/maps?q=Glamis+Hall,+Goldsmith+Rd,+Wellingborough+NN8+3RU&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wellingborough Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 md:py-24 bg-section-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {t('contact.social.title')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('contact.social.coming')}
            </p>
            <div className="flex justify-center gap-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center opacity-50 cursor-not-allowed">
                <Facebook className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center opacity-50 cursor-not-allowed">
                <Instagram className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
