"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { useAsync } from "react-use"; // Optional, or use useEffect

// Mock client key for Toss Payments (User should replace with real one)
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
// Customer key should be unique to the user
const customerKey = "test_customer_key";

export function PricingTable() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const handleSubscribe = async () => {
        try {
            // In a real implementation, you would:
            // 1. Initialize Toss Payments Widget
            // 2. Request Payment
            alert("Toss Payments integration would trigger here. Please configure your Client Key.");

            // Example code for Toss Payments Widget initialization (commented out until keys are set)
            /*
            const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
            await paymentWidget.renderPaymentMethods('#payment-widget', { value: 9900 });
            */
        } catch (error) {
            console.error("Payment error", error);
        }
    };

    return (
        <div className="py-12 px-4 md:px-6">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Simple, Transparent Pricing</h2>
                <p className="text-muted-foreground">Choose the plan that fits your productivity needs.</p>

                <div className="flex items-center justify-center mt-6 space-x-4">
                    <Button
                        variant={billingCycle === "monthly" ? "default" : "outline"}
                        onClick={() => setBillingCycle("monthly")}
                        className="w-32"
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={billingCycle === "yearly" ? "default" : "outline"}
                        onClick={() => setBillingCycle("yearly")}
                        className="w-32"
                    >
                        Yearly <span className="ml-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">Save 20%</span>
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <Card className="flex flex-col border-2 border-border/50 shadow-sm hover:border-primary/20 transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl">Basic</CardTitle>
                        <CardDescription>Essential tools for personal organization</CardDescription>
                        <div className="mt-4">
                            <span className="text-4xl font-bold">Free</span>
                            <span className="text-muted-foreground ml-1">/ forever</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-3">
                            {[
                                "Up to 3 Projects",
                                "Basic Task Management",
                                "Simple Habit Tracker",
                                "Daily Journal",
                                "Standard Calendar View"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className="flex flex-col border-2 border-primary shadow-lg relative overflow-hidden transform md:-translate-y-2">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                        <CardDescription>Unlock your full potential with AI & Analytics</CardDescription>
                        <div className="mt-4">
                            <span className="text-4xl font-bold">
                                {billingCycle === "monthly" ? "₩9,900" : "₩99,000"}
                            </span>
                            <span className="text-muted-foreground ml-1">
                                / {billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                        </div>
                        {billingCycle === "yearly" && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                                Calculated as ₩8,250/mo (2 months free)
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-3">
                            {[
                                "Unlimited Projects & Habits",
                                "Gantt Chart & Advanced Timeline",
                                "AI Diet Analysis & Vocab Quiz",
                                "InBody & Financial Analytics",
                                "Priority Support",
                                "Custom Themes & Fonts"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                    <span className="text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" className="w-full" onClick={handleSubscribe}>
                            Start 14-Day Free Trial
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>Payments processed securely by <strong>Toss Payments</strong>.</p>
                <div id="payment-widget" className="mt-4 max-w-md mx-auto"></div>
            </div>
        </div>
    );
}
