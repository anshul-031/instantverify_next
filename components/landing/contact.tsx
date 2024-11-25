import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MessageSquare } from "lucide-react";

export function ContactSection() {
  return (
    <section className="container space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Contact Us
        </h2>
        <p className="mt-4 text-muted-foreground">
          Get in touch with our team
        </p>
      </div>
      <div className="mx-auto max-w-[600px]">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <a href="tel:+919808494950" className="text-lg hover:text-primary">
              +91-9808494950
            </a>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <a 
              href="https://wa.me/919808494950" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg hover:text-primary"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
        <form className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="Your phone number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="How can we help you?"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}