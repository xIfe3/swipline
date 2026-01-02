"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  User,
  MapPin,
  DollarSign,
  Scale,
  Ruler,
  FileText,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface SenderInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface RecipientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface PackageInfo {
  description: string;
  weight: number;
  weightUnit: "kg" | "lb";
  length: number;
  width: number;
  height: number;
  dimensionUnit: "cm" | "in";
  value: number;
  currency: "USD" | "CAD" | "EUR";
  category: string;
}

interface ServiceInfo {
  serviceType: "standard" | "express" | "priority";
  insurance: boolean;
  signatureRequired: boolean;
  customsDeclaration: boolean;
}

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [sender, setSender] = useState<SenderInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "United States",
    postalCode: "",
  });

  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Canada",
    postalCode: "",
  });

  const [packageInfo, setPackageInfo] = useState<PackageInfo>({
    description: "",
    weight: 1,
    weightUnit: "kg",
    length: 30,
    width: 20,
    height: 15,
    dimensionUnit: "cm",
    value: 100,
    currency: "USD",
    category: "documents",
  });

  const [service, setService] = useState<ServiceInfo>({
    serviceType: "express",
    insurance: true,
    signatureRequired: true,
    customsDeclaration: true,
  });

  const handleSenderChange = (field: keyof SenderInfo, value: string) => {
    setSender({ ...sender, [field]: value });
  };

  const handleRecipientChange = (field: keyof RecipientInfo, value: string) => {
    setRecipient({ ...recipient, [field]: value });
  };

  const handlePackageChange = (field: keyof PackageInfo, value: any) => {
    setPackageInfo({ ...packageInfo, [field]: value });
  };

  const handleServiceChange = (field: keyof ServiceInfo, value: any) => {
    setService({ ...service, [field]: value });
  };

  const calculatePrice = () => {
    // Simple pricing calculation
    let basePrice = 25;

    // Weight-based pricing
    if (packageInfo.weight > 5) basePrice += (packageInfo.weight - 5) * 2;

    // Service type multiplier
    if (service.serviceType === "express") basePrice *= 1.5;
    if (service.serviceType === "priority") basePrice *= 2;

    // Insurance
    if (service.insurance) basePrice += packageInfo.value * 0.01;

    // International premium
    if (sender.country !== recipient.country) basePrice += 15;

    return basePrice.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step
    if (
      step === 1 &&
      (!sender.name || !sender.address || !recipient.name || !recipient.address)
    ) {
      toast.error(
        "Please fill in all required sender and recipient information"
      );
      return;
    }

    if (step === 2 && (!packageInfo.description || packageInfo.value <= 0)) {
      toast.error("Please provide package description and value");
      return;
    }

    // Move to next step or submit
    if (step < 4) {
      setStep(step + 1);
    } else {
      setLoading(true);

      // Simulate API call to your create shipment endpoint
      setTimeout(() => {
        const trackingNumber = `ST${Math.floor(
          100000000 + Math.random() * 900000000
        )}`;

        toast.success(`Shipment created! Tracking number: ${trackingNumber}`);
        setLoading(false);
        router.push(`/track?number=${trackingNumber}`);
      }, 2000);
    }
  };

  const serviceOptions = [
    {
      id: "standard",
      name: "Standard",
      price: "$25",
      eta: "5-7 business days",
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: "express",
      name: "Express",
      price: "$38",
      eta: "2-3 business days",
      icon: <ChevronRight className="w-5 h-5" />,
    },
    {
      id: "priority",
      name: "Priority",
      price: "$50",
      eta: "1-2 business days",
      icon: <DollarSign className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      stepNum === step
                        ? "bg-blue-600 text-white"
                        : stepNum < step
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stepNum === step
                        ? "text-blue-600"
                        : stepNum < step
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {stepNum === 1
                      ? "Addresses"
                      : stepNum === 2
                      ? "Package"
                      : stepNum === 3
                      ? "Service"
                      : "Review"}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Addresses */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sender & Recipient Information
                </h2>
                <p className="text-gray-600 mb-8">
                  Enter the pickup and delivery addresses
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Sender Form */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Sender Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={sender.name}
                          onChange={(e) =>
                            handleSenderChange("name", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John Smith"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={sender.email}
                            onChange={(e) =>
                              handleSenderChange("email", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={sender.phone}
                            onChange={(e) =>
                              handleSenderChange("phone", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1 234 567 8900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={sender.address}
                          onChange={(e) =>
                            handleSenderChange("address", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="123 Main St"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={sender.city}
                            onChange={(e) =>
                              handleSenderChange("city", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="New York"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={sender.postalCode}
                            onChange={(e) =>
                              handleSenderChange("postalCode", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="10001"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          value={sender.country}
                          onChange={(e) =>
                            handleSenderChange("country", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Form */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Recipient Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={recipient.name}
                          onChange={(e) =>
                            handleRecipientChange("name", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Sarah Johnson"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) =>
                              handleRecipientChange("email", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="sarah@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={recipient.phone}
                            onChange={(e) =>
                              handleRecipientChange("phone", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1 234 567 8900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={recipient.address}
                          onChange={(e) =>
                            handleRecipientChange("address", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="456 Oak Ave"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={recipient.city}
                            onChange={(e) =>
                              handleRecipientChange("city", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Toronto"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={recipient.postalCode}
                            onChange={(e) =>
                              handleRecipientChange(
                                "postalCode",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="M5H 2N2"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          value={recipient.country}
                          onChange={(e) =>
                            handleRecipientChange("country", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Canada">Canada</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Germany">Germany</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Package Details */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Package Details
                </h2>
                <p className="text-gray-600 mb-8">
                  Describe what you're shipping
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Description *
                    </label>
                    <textarea
                      value={packageInfo.description}
                      onChange={(e) =>
                        handlePackageChange("description", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                      placeholder="Describe the contents of your package (e.g., Documents, Electronics, Clothing, etc.)"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Declared Value *
                      </label>
                      <div className="flex">
                        <select
                          value={packageInfo.currency}
                          onChange={(e) =>
                            handlePackageChange(
                              "currency",
                              e.target.value as any
                            )
                          }
                          className="px-4 py-3 border border-gray-300 border-r-0 rounded-l-xl bg-gray-50"
                        >
                          <option value="USD">USD</option>
                          <option value="CAD">CAD</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <input
                          type="number"
                          value={packageInfo.value}
                          onChange={(e) =>
                            handlePackageChange(
                              "value",
                              parseFloat(e.target.value)
                            )
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        For insurance and customs purposes
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={packageInfo.category}
                        onChange={(e) =>
                          handlePackageChange("category", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="documents">Documents</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight *
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          value={packageInfo.weight}
                          onChange={(e) =>
                            handlePackageChange(
                              "weight",
                              parseFloat(e.target.value)
                            )
                          }
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1.0"
                          min="0.1"
                          step="0.1"
                          required
                        />
                        <select
                          value={packageInfo.weightUnit}
                          onChange={(e) =>
                            handlePackageChange(
                              "weightUnit",
                              e.target.value as any
                            )
                          }
                          className="px-4 py-3 border border-gray-300 border-l-0 rounded-r-xl bg-gray-50"
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={packageInfo.length}
                          onChange={(e) =>
                            handlePackageChange(
                              "length",
                              parseFloat(e.target.value)
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="L"
                          min="1"
                          required
                        />
                        <span className="self-center text-gray-400">×</span>
                        <input
                          type="number"
                          value={packageInfo.width}
                          onChange={(e) =>
                            handlePackageChange(
                              "width",
                              parseFloat(e.target.value)
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="W"
                          min="1"
                          required
                        />
                        <span className="self-center text-gray-400">×</span>
                        <input
                          type="number"
                          value={packageInfo.height}
                          onChange={(e) =>
                            handlePackageChange(
                              "height",
                              parseFloat(e.target.value)
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="H"
                          min="1"
                          required
                        />
                        <select
                          value={packageInfo.dimensionUnit}
                          onChange={(e) =>
                            handlePackageChange(
                              "dimensionUnit",
                              e.target.value as any
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        >
                          <option value="cm">cm</option>
                          <option value="in">in</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Service Options */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Shipping Service
                </h2>
                <p className="text-gray-600 mb-8">
                  Choose your shipping options
                </p>

                <div className="space-y-6">
                  {/* Service Type Selection */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Service Type
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {serviceOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                            service.serviceType === option.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            handleServiceChange("serviceType", option.id)
                          }
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`p-2 rounded-lg ${
                                service.serviceType === option.id
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              {option.icon}
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                service.serviceType === option.id
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {option.price}
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            {option.name}
                          </h4>
                          <p className="text-sm text-gray-600">{option.eta}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Services */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Additional Services
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Insurance Coverage
                            </p>
                            <p className="text-sm text-gray-600">
                              Protect your shipment up to ${packageInfo.value}
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={service.insurance}
                          onChange={(e) =>
                            handleServiceChange("insurance", e.target.checked)
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Signature Required
                            </p>
                            <p className="text-sm text-gray-600">
                              Recipient must sign for delivery
                            </p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={service.signatureRequired}
                          onChange={(e) =>
                            handleServiceChange(
                              "signatureRequired",
                              e.target.checked
                            )
                          }
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>

                      {sender.country !== recipient.country && (
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Customs Declaration
                              </p>
                              <p className="text-sm text-gray-600">
                                Required for international shipments
                              </p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={service.customsDeclaration}
                            onChange={(e) =>
                              handleServiceChange(
                                "customsDeclaration",
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            disabled
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Price Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base shipping</span>
                        <span>$25.00</span>
                      </div>
                      {service.serviceType === "express" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Express service</span>
                          <span>+$12.50</span>
                        </div>
                      )}
                      {service.serviceType === "priority" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Priority service
                          </span>
                          <span>+$25.00</span>
                        </div>
                      )}
                      {service.insurance && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance</span>
                          <span>+${(packageInfo.value * 0.01).toFixed(2)}</span>
                        </div>
                      )}
                      {sender.country !== recipient.country && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            International fee
                          </span>
                          <span>+$15.00</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${calculatePrice()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Review & Submit
                </h2>
                <p className="text-gray-600 mb-8">
                  Review your shipment details before submitting
                </p>

                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Sender</h3>
                      <div className="space-y-2">
                        <p className="font-medium">{sender.name}</p>
                        <p className="text-gray-600">{sender.address}</p>
                        <p className="text-gray-600">
                          {sender.city}, {sender.country} {sender.postalCode}
                        </p>
                        <p className="text-gray-600">{sender.email}</p>
                        <p className="text-gray-600">{sender.phone}</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Recipient
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-gray-600">{recipient.address}</p>
                        <p className="text-gray-600">
                          {recipient.city}, {recipient.country}{" "}
                          {recipient.postalCode}
                        </p>
                        <p className="text-gray-600">{recipient.email}</p>
                        <p className="text-gray-600">{recipient.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Package Details
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{packageInfo.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dimensions</p>
                        <p className="font-medium">
                          {packageInfo.length} × {packageInfo.width} ×{" "}
                          {packageInfo.height} {packageInfo.dimensionUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-medium">
                          {packageInfo.weight} {packageInfo.weightUnit}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Value</p>
                      <p className="font-medium">
                        {packageInfo.currency} {packageInfo.value.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Shipping Service
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Service Type</p>
                        <p className="font-medium capitalize">
                          {service.serviceType} Shipping
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Additional Services
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {service.insurance && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              Insurance
                            </span>
                          )}
                          {service.signatureRequired && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              Signature Required
                            </span>
                          )}
                          {service.customsDeclaration && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              Customs Declaration
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Total Cost
                        </h3>
                        <p className="text-gray-600">
                          Including all taxes and fees
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          ${calculatePrice()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          Terms & Conditions
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          I agree to the SwiftTrack Terms of Service and confirm
                          that all information provided is accurate. I
                          understand that customs duties and taxes may apply for
                          international shipments and are the responsibility of
                          the recipient.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className={`px-8 py-3 rounded-xl font-medium ${
                  step === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {step === 4 ? "Creating Shipment..." : "Processing..."}
                  </span>
                ) : step === 4 ? (
                  "Create Shipment"
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
