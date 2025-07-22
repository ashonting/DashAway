export default function RefundPolicy() {
    return (
        <main className="container mx-auto px-4 py-8 bg-background text-text">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Refund & Cancellation Policy</h1>
                <div className="space-y-4">
                    <p>Last updated: July 8, 2025</p>
                    
                    <h2 className="text-2xl font-bold pt-4">Cancellation Policy</h2>
                    <p>Users may cancel their monthly or annual DashAway subscription at any time via their account dashboard or by contacting support@dashaway.io.</p>
                    <p>Upon cancellation, your subscription will remain active until the end of your current billing period (monthly or annual). You will not be charged again.</p>
                    <p>After your current billing period ends, your account will be downgraded to the free tier (if available) or access will be suspended.</p>

                    <h2 className="text-2xl font-bold pt-4">Refund Policy</h2>
                    <p><strong>Standard Refund Policy:</strong> No prorated refunds are issued for unused time or partial billing periods. When you cancel your subscription, you will continue to have access to Pro features until the end of your current billing period.</p>
                    
                    <p><strong>Technical Issues:</strong> If a technical issue prevents you from using the service and remains unresolved within 7 days of reporting to support@dashaway.io, you may be eligible for a discretionary refund at our sole discretion.</p>
                    
                    <p><strong>Billing Disputes:</strong> If you believe you have been charged incorrectly, please contact us immediately at support@dashaway.io. We will investigate all billing disputes promptly.</p>
                    
                    <p><strong>Refund Process:</strong> All refund requests must be submitted in writing to support@dashaway.io. Approved refunds will be processed through Paddle.com and may take 5-10 business days to appear in your account, depending on your payment method.</p>
                    
                    <p><strong>Free Trial Policy:</strong> Basic accounts are free and do not require payment. There is no trial period for Pro subscriptions - you are charged immediately upon upgrade.</p>
                    
                    <h2 className="text-2xl font-bold pt-4">Contact for Refunds</h2>
                    <p>If you believe you are eligible for a refund or have questions about our refund policy, please contact us at support@dashaway.io with:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Your account email address</li>
                        <li>Reason for refund request</li>
                        <li>Any relevant details or documentation</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
