"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Lock,
  CheckCircle,
  DollarSign,
  Shield,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "@/lib/api";

// Import Stripe (you'll need to install @stripe/stripe-js)
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_..."
);

export default function PayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [parcelData, setParcelData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Get tracking ID from URL
  const trackingId = searchParams.get("tracking_id");

  useEffect(() => {
    if (trackingId) {
      fetchParcelDetails(trackingId);
    }
  }, [trackingId]);

  const fetchParcelDetails = async (trackingId: string) => {
    try {
      setLoading(true);
      const parcel = await apiService.getParcel(trackingId);
      setParcelData(parcel);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch parcel details");
      router.push("/track");
    } finally {
      setLoading(false);
    }
  };

  const handleBorderFeePayment = async () => {
    if (!trackingId || !parcelData) {
      toast.error("No tracking information found");
      return;
    }

    if (parcelData.border_fee_paid) {
      toast.error("Border fee already paid");
      router.push(`/track?number=${trackingId}`);
      return;
    }

    if (parcelData.status !== "at_border") {
      toast.error("Parcel is not at border yet");
      return;
    }

    try {
      setPaymentLoading(true);

      // Call your FastAPI payment endpoint
      const paymentResponse = await apiService.createPayment({
        tracking_id: trackingId,
      });

      setPaymentData(paymentResponse);

      // Initialize Stripe payment
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.confirmCardPayment(
        paymentResponse.client_secret,
        {
          payment_method: {
            card: (await stripe
              .createPaymentMethod({
                type: "card",
                card: document.getElementById("card-element") as any,
              })
              .then((result) => result.paymentMethod?.id)) as any,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Payment successful! Border fee has been paid.");

      // Redirect to tracking page
      setTimeout(() => {
        router.push(`/track?number=${trackingId}`);
      }, 2000);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleShippingFeePayment = async () => {
    if (!trackingId || !parcelData) {
      toast.error("No tracking information found");
      return;
    }

    // Implement shipping fee payment
    toast.error("Shipping fee payment not implemented yet");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!parcelData && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              No Parcel Found
            </h1>
            <p className="text-gray-600 mb-8">
              Please go back and create a shipment first.
            </p>
            <button
              onClick={() => router.push("/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl"
            >
              Create New Shipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Payment
            </h1>
            <p className="text-lg text-gray-600">
              Secure payment for your SwiftTrack shipment
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Invoice Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipment Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Shipment Summary
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tracking #</p>
                    <p className="font-medium">{parcelData?.tracking_id}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Sender</p>
                    <p className="font-medium">{parcelData?.sender_name}</p>
                    <p className="text-sm text-gray-600">
                      {parcelData?.sender_email}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Recipient</p>
                    <p className="font-medium">{parcelData?.recipient_name}</p>
                    <p className="text-sm text-gray-600">
                      {parcelData?.recipient_email}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Shipping Cost</p>
                      <p className="text-sm text-gray-600">
                        Based on weight and destination
                      </p>
                    </div>
                    <p className="font-medium text-2xl">
                      ${parcelData?.shipping_cost?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Border Fee</p>
                      <p className="text-sm text-gray-600">
                        Customs clearance fee
                      </p>
                      {parcelData?.border_fee_paid && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mt-2">
                          Already Paid
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-2xl">
                      ${parcelData?.border_fee?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-300">
                    <span>Total Due</span>
                    <span>
                      $
                      {(
                        (parcelData?.shipping_cost || 0) +
                        (parcelData?.border_fee_paid
                          ? 0
                          : parcelData?.border_fee || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Method
                </h2>

                {/* Card Element for Stripe */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                  </label>
                  <div className="border border-gray-300 rounded-xl p-4">
                    <div id="card-element" className="p-2"></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Your payment is securely processed by Stripe
                  </p>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-4">
                  {!parcelData?.border_fee_paid && (
                    <button
                      onClick={handleBorderFeePayment}
                      disabled={paymentLoading || parcelData?.border_fee_paid}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Processing Border Fee...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay Border Fee (${parcelData?.border_fee?.toFixed(2)})
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleShippingFeePayment}
                    disabled={paymentLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Pay Shipping Fee (${parcelData?.shipping_cost?.toFixed(2)})
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Summary & Actions */}
            <div className="space-y-8">
              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Cost</span>
                    <span>${parcelData?.shipping_cost?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Border Fee</span>
                    <span
                      className={
                        parcelData?.border_fee_paid ? "text-green-600" : ""
                      }
                    >
                      ${parcelData?.border_fee?.toFixed(2)}
                      {parcelData?.border_fee_paid && " (Paid)"}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>
                        $
                        {(
                          (parcelData?.shipping_cost || 0) +
                          (parcelData?.border_fee_paid
                            ? 0
                            : parcelData?.border_fee || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => router.push(`/track?number=${trackingId}`)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors"
                  >
                    Track Shipment Instead
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing payment, you agree to our Terms of Service
                </p>
              </div>

              {/* Security & Benefits */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Secure Payment
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Bank-Level Security
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        All payments are encrypted and processed securely by
                        Stripe
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Money-Back Guarantee
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Full refund if your shipment is not delivered on time
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Lock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        No Card Storage
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        We never store your credit card information
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-blue-50 rounded-2xl p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  Our customer support team is available 24/7 to assist you with
                  payment questions.
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>

          {/* Payment Security Footer */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
              <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-700">VISA</span>
              </div>
              <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-700">MC</span>
              </div>
              <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-700">AMEX</span>
              </div>
              <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-700">Discover</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Your payment is secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
