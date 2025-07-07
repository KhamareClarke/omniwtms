"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, MessageCircle, Clock, CheckCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DemoSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 29,
    seconds: 37,
  });

  const [demoSlots, setDemoSlots] = useState(12);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    needs: "",
  });

  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Demo slots counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && demoSlots > 5) {
        setDemoSlots((prev) => prev - 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [demoSlots]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.needs,
          phone: formData.phone || "Not provided",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Redirect to thank you page or show success message
      router.push("/thank-you");
    } catch (error) {
      console.error("Form submission error:", error);
      // Handle error (show error message to user)
    }
  };

  const handleDemoClick = () => {
    const form = document.getElementById("demo-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="py-20 bg-white">
      <div
        id="demo-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to See OmniWTMS in Action?
            <br />
            Book Your Demo Today
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sign up for a personalized walkthrough of the platform. We'll show
            you exactly how OmniWTMS can solve your specific logistics
            challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Demo Benefits */}
          <div>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {[
                { icon: Clock, label: "Quick Setup", desc: "24-48 hours" },
                { icon: Zap, label: "Easy to Use", desc: "No Training" },
                { icon: CheckCircle, label: "UK Support", desc: "Real Humans" },
                { icon: MessageCircle, label: "24h", desc: "Response Time" },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-4 bg-gray-50 rounded-lg "
                  >
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-bold text-gray-900">
                      {benefit.label}
                    </div>
                    <div className="text-sm text-gray-600">{benefit.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 ">
              <div className="text-red-600 font-medium mb-2">
                🔴 See Real Results
              </div>
              <p className="text-gray-700 text-sm">
                Our demos show you real-world examples of how courier firms and
                warehouse operations use OmniWTMS to streamline their business.
              </p>
            </div>

            {/* Limited Time Offer */}
            <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Book Your Free Demo</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {timeLeft.days.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm opacity-80">Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm opacity-80">Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm opacity-80">Minutes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm opacity-80">Seconds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Form */}
          <Card className="shadow-2xl border-0 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Get Started with OmniWTMS
              </CardTitle>
              <div className="text-center text-sm text-orange-600 font-medium animate-pulse">
                <span className="font-semibold">URGENT:</span> Only {demoSlots}{" "}
                onboarding slots remaining this month
              </div>
              <div className="flex justify-center mt-1 mb-1">
                <div className="h-1.5 w-1/3 bg-red-500 rounded-full animate-pulse-slow"></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="needs">What do you need help with?</Label>
                  <Textarea
                    id="needs"
                    name="needs"
                    placeholder="Tell us about your courier/delivery business and what you need help with..."
                    value={formData.needs}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white group"
                  size="lg"
                  onClick={handleDemoClick}
                >
                  Submit Your Request
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                We'll be in touch within 24 hours to discuss how OmniWTMS can
                help your business.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alternative Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="text-center p-6">
            <Phone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Prefer to Talk?
            </h3>
            <p className="text-gray-600 mb-4">
              Speak directly with our support team
            </p>
            <div className="text-xl font-bold text-blue-600">
              +44 (0) 20 7946 0958
            </div>
          </Card>

          <Card className="text-center p-6">
            <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Questions?
            </h3>
            <p className="text-gray-600 mb-4">Chat with our team instantly</p>
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-2 px-6 py-3"
            >
              <span className="flex items-center">
                Start Chat
                <MessageCircle className="ml-2 w-4 h-4 group-hover:scale-110 transition-all" />
              </span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
