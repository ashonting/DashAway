export default function RefundPolicy() {
    return (
        <main className="container mx-auto px-4 py-8 bg-background text-text">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Refund & Cancellation Policy</h1>
                <div className="space-y-4">
                    <p>Last updated: July 8, 2025</p>
                    
                    <h2 className="text-2xl font-bold pt-4">Cancellation Policy</h2>
                    <p>Users may cancel their monthly or annual DashAway subscription at any time via their account dashboard or by contacting support@dashaway.app.</p>
                    <p>Upon cancellation, your subscription will remain active until the end of your current billing period (monthly or annual). You will not be charged again.</p>
                    <p>After your current billing period ends, your account will be downgraded to the free tier (if available) or access will be suspended.</p>

                    <h2 className="text-2xl font-bold pt-4">Refund Policy</h2>
                    <p>No prorated refunds are issued for unused time unless a technical issue, unresolved within 7 days of reporting, qualifies you for a discretionary refund.</p>
                    <p>If you believe you are eligible for a refund, please contact us at support@dashaway.app.</p>
                </div>
            </div>
        </main>
    );
}
