"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Building,
  Lock,
  CheckCircle,
  DollarSign,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet";
  lastFour?: string;
  bankName?: string;
  walletType?: string;
  isDefault: boolean;
}

interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export default function PayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("card");
  const [saveCard, setSaveCard] = useState(true);
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-8)}`);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "card1", type: "card", lastFour: "4242", isDefault: true },
    { id: "bank1", type: "bank", bankName: "Chase Bank", isDefault: false },
    { id: "wallet1", type: "wallet", walletType: "PayPal", isDefault: false },
  ]);

  const [invoiceItems] = useState<InvoiceItem[]>([
    {
      description: "Express International Shipping",
      amount: 45.99,
      quantity: 1,
    },
    { description: "Insurance Coverage", amount: 10.0, quantity: 1 },
    { description: "Customs Clearance Fee", amount: 25.0, quantity: 1 },
    { description: "Fuel Surcharge", amount: 5.5, quantity: 1 },
  ]);

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + item.amount * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCardChange = (field: keyof typeof cardDetails, value: string) => {
    setCardDetails({ ...cardDetails, [field]: value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate card details
    if (
      selectedMethod === "card" &&
      (!cardDetails.cardNumber ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name)
    ) {
      toast.error("Please fill in all card details");
      setLoading(false);
      return;
    }

    // Simulate API call to your payment endpoint
    setTimeout(() => {
      toast.success(
        "Payment successful! Your shipment is now being processed."
      );
      setLoading(false);
      router.push("/dashboard");
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

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
              {/* Invoice Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Invoice Summary
                  </h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice #</p>
                    <p className="font-medium">{invoiceNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {invoiceItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-4 border-b border-gray-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">${item.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-300">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Method
                </h2>

                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedMethod === method.id}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-4 flex items-center">
                          {method.type === "card" && (
                            <>
                              <CreditCard className="w-6 h-6 text-gray-600 mr-3" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Credit Card
                                </p>
                                <p className="text-sm text-gray-600">
                                  Ending in •••• {method.lastFour}
                                </p>
                              </div>
                            </>
                          )}
                          {method.type === "bank" && (
                            <>
                              <Building className="w-6 h-6 text-gray-600 mr-3" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Bank Transfer
                                </p>
                                <p className="text-sm text-gray-600">
                                  {method.bankName}
                                </p>
                              </div>
                            </>
                          )}
                          {method.type === "wallet" && (
                            <>
                              <Wallet className="w-6 h-6 text-gray-600 mr-3" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  Digital Wallet
                                </p>
                                <p className="text-sm text-gray-600">
                                  {method.walletType}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Add New Card Form */}
                {selectedMethod === "card" && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">
                      Enter Card Details
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) =>
                              handleCardChange(
                                "cardNumber",
                                formatCardNumber(e.target.value)
                              )
                            }
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) =>
                              handleCardChange("expiry", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                handleCardChange(
                                  "cvv",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="123"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card *
                        </label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) =>
                            handleCardChange("name", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John Smith"
                          required
                        />
                      </div>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">
                          Save this card for future payments
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Info */}
                {selectedMethod === "bank1" && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Bank Transfer Instructions
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Name:</span>
                        <span className="font-medium">Chase Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-medium">•••• 6789</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Routing Number:</span>
                        <span className="font-medium">021000021</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-medium">{invoiceNumber}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Please include the invoice number in the transfer
                      reference. Payment may take 1-2 business days to process.
                    </p>
                  </div>
                )}

                {/* Wallet Payment */}
                {selectedMethod === "wallet1" && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Pay with PayPal
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <p className="text-gray-600 mb-4">
                        You will be redirected to PayPal to complete your
                        payment securely.
                      </p>
                      <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                        Continue with PayPal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Summary & Actions */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">USD</p>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this payment, you agree to our Terms of Service
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
                        All payments are encrypted and processed securely
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
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        No Hidden Fees
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        The price you see is the price you pay
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

          {/* Payment Methods Logos */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              We accept all major payment methods
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
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
                <span className="font-bold text-gray-700">PP</span>
              </div>
              <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="font-bold text-gray-700">Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
