
// src/app/contact/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export default function ContactPage() {
  return (
    <article>
      <h1>Contact Us</h1>
      <p>
        We'd love to hear from you! Whether you have a question about our features, a suggestion for improvement, or just want to say hello, please feel free to reach out.
      </p>

      <div className="mt-8 not-prose">
        <form className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
           </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What is your message about?" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Write your message here..." className="min-h-32" />
            </div>
            <Button type="submit">Send Message</Button>
        </form>
      </div>
       <div className="mt-12">
        <h2>Other Ways to Reach Us</h2>
        <p>
            <strong>Support Email:</strong> <a href="mailto:support@finpulse.example.com">support@finpulse.example.com</a>
        </p>
         <p>
            <strong>Business Inquiries:</strong> <a href="mailto:business@finpulse.example.com">business@finpulse.example.com</a>
        </p>
      </div>
    </article>
  );
}
