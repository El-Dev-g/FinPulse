
// src/app/contact/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";


export default function ContactPage() {
  return (
    <div className="space-y-12">
        <div className="text-center">
             <h1 className="text-4xl font-bold font-headline">Get in Touch</h1>
             <p className="mt-2 text-lg text-muted-foreground">We'd love to hear from you. Let us know how we can help.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold font-headline">Contact Information</h2>
                <p className="text-muted-foreground">
                    Have a question or a comment? Use the form to send us a message, or reach out to us using the details below.
                </p>
                <div className="space-y-4 not-prose text-sm">
                    <a href="mailto:support@finpulse.example.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                        <Mail className="h-5 w-5 text-primary"/>
                        <span>support@finpulse.example.com</span>
                    </a>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary"/>
                        <span>+1 (555) 123-4567</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary"/>
                        <span>123 Finance St, Moneyville, USA</span>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <Card className="not-prose">
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>We'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="your.email@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Write your message here..." className="min-h-32" />
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
