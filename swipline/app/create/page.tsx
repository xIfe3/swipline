"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  User,
  MapPin,
  Scale,
  Ruler,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService, CreateParcelRequest } from "@/lib/api";

// Types matching your FastAPI schemas
interface ContentItem {
  description: string;
  quantity: number;
  value: number;
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: "cm" | "in";
}

interface ParcelFormData {
  // Sender info
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address?: string;

  // Recipient info
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  recipient_address: string;
  destination_country: string;

  // Package details
  weight: number;
  dimensions: Dimensions;
  contents: ContentItem[];
}

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeContentIndex, setActiveContentIndex] = useState<number | null>(
    null
  );

  // Form state matching your CreateParcel schema
  const [formData, setFormData] = useState<ParcelFormData>({
    // Sender info
    sender_name: "",
    sender_email: "",
    sender_phone: "",
    sender_address: "",

    // Recipient info
    recipient_name: "",
    recipient_email: "",
    recipient_phone: "",
    recipient_address: "",
    destination_country: "CA", // Default to Canada

    // Package details
    weight: 1,
    dimensions: {
      length: 30,
      width: 20,
      height: 15,
      unit: "cm" as const,
    },
    contents: [
      {
        description: "",
        quantity: 1,
        value: 0,
      },
    ],
  });

  const handleInputChange = (field: keyof ParcelFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionsChange = (field: keyof Dimensions, value: number) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value,
      },
    }));
  };

  const handleUnitChange = (unit: "cm" | "in") => {
    // Convert dimensions when unit changes
    const conversionFactor = unit === "cm" ? 2.54 : 1 / 2.54;
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        length: parseFloat(
          (prev.dimensions.length * conversionFactor).toFixed(2)
        ),
        width: parseFloat(
          (prev.dimensions.width * conversionFactor).toFixed(2)
        ),
        height: parseFloat(
          (prev.dimensions.height * conversionFactor).toFixed(2)
        ),
        unit,
      },
    }));
  };

  const handleContentChange = (
    index: number,
    field: keyof ContentItem,
    value: any
  ) => {
    const newContents = [...formData.contents];
    newContents[index] = {
      ...newContents[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      contents: newContents,
    }));
  };

  const addContentItem = () => {
    setFormData((prev) => ({
      ...prev,
      contents: [...prev.contents, { description: "", quantity: 1, value: 0 }],
    }));
  };

  const removeContentItem = (index: number) => {
    if (formData.contents.length > 1) {
      const newContents = formData.contents.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        contents: newContents,
      }));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        // Validate sender and recipient info
        if (
          !formData.sender_name.trim() ||
          !formData.sender_email.trim() ||
          !formData.sender_phone.trim() ||
          !formData.recipient_name.trim() ||
          !formData.recipient_email.trim() ||
          !formData.recipient_phone.trim() ||
          !formData.recipient_address.trim()
        ) {
          toast.error(
            "Please fill in all required sender and recipient information"
          );
          return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (
          !emailRegex.test(formData.sender_email) ||
          !emailRegex.test(formData.recipient_email)
        ) {
          toast.error("Please enter valid email addresses");
          return false;
        }

        // Validate phone (basic validation)
        const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
        if (
          !phoneRegex.test(formData.sender_phone.replace(/\D/g, "")) ||
          !phoneRegex.test(formData.recipient_phone.replace(/\D/g, ""))
        ) {
          toast.error("Please enter valid phone numbers");
          return false;
        }
        return true;

      case 2:
        // Validate package details
        if (formData.weight <= 0) {
          toast.error("Weight must be greater than 0");
          return false;
        }

        if (
          formData.dimensions.length <= 0 ||
          formData.dimensions.width <= 0 ||
          formData.dimensions.height <= 0
        ) {
          toast.error("All dimensions must be greater than 0");
          return false;
        }

        // Validate contents
        for (const content of formData.contents) {
          if (!content.description.trim()) {
            toast.error("Please provide description for all items");
            return false;
          }
          if (content.quantity <= 0) {
            toast.error("Quantity must be greater than 0");
            return false;
          }
          if (content.value < 0) {
            toast.error("Value cannot be negative");
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) return;

    if (step < 3) {
      handleNextStep();
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const parcelData: CreateParcelRequest = {
        sender_name: formData.sender_name,
        sender_email: formData.sender_email,
        sender_phone: formData.sender_phone,
        sender_address: formData.sender_address || undefined,
        recipient_name: formData.recipient_name,
        recipient_email: formData.recipient_email,
        recipient_phone: formData.recipient_phone,
        recipient_address: formData.recipient_address,
        destination_country: formData.destination_country,
        weight: formData.weight,
        dimensions: formData.dimensions,
        contents: formData.contents,
      };

      console.log("Submitting parcel:", parcelData);

      // Call your FastAPI backend
      const response = await apiService.createParcel(parcelData);

      toast.success(
        `Shipment created! Tracking number: ${response.tracking_id}`
      );

      // Redirect to payment page for border fee
      router.push(`/pay?tracking_id=${response.tracking_id}`);
    } catch (error: any) {
      console.error("Error creating parcel:", error);
      toast.error(
        error.message || "Failed to create shipment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate total declared value
  const totalDeclaredValue = formData.contents.reduce(
    (sum, item) => sum + item.value * item.quantity,
    0
  );

  // List of supported destination countries
  const countries = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "UK", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" },
    { code: "SG", name: "Singapore" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((stepNum) => (
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
                      : "Review"}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
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
                          value={formData.sender_name}
                          onChange={(e) =>
                            handleInputChange("sender_name", e.target.value)
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
                            value={formData.sender_email}
                            onChange={(e) =>
                              handleInputChange("sender_email", e.target.value)
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
                            value={formData.sender_phone}
                            onChange={(e) =>
                              handleInputChange("sender_phone", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1 234 567 8900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.sender_address || ""}
                          onChange={(e) =>
                            handleInputChange("sender_address", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="123 Main St, New York, NY 10001"
                        />
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
                          value={formData.recipient_name}
                          onChange={(e) =>
                            handleInputChange("recipient_name", e.target.value)
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
                            value={formData.recipient_email}
                            onChange={(e) =>
                              handleInputChange(
                                "recipient_email",
                                e.target.value
                              )
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
                            value={formData.recipient_phone}
                            onChange={(e) =>
                              handleInputChange(
                                "recipient_phone",
                                e.target.value
                              )
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
                        <textarea
                          value={formData.recipient_address}
                          onChange={(e) =>
                            handleInputChange(
                              "recipient_address",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                          placeholder="456 Oak Ave, Toronto, ON M5H 2N2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination Country *
                        </label>
                        <select
                          value={formData.destination_country}
                          onChange={(e) =>
                            handleInputChange(
                              "destination_country",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
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

                <div className="space-y-8">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      <div className="flex items-center">
                        <Scale className="w-5 h-5 text-gray-400 mr-2" />
                        Weight (kg) *
                      </div>
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange(
                            "weight",
                            parseFloat(e.target.value)
                          )
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="w-32">
                        <input
                          type="number"
                          min="0.1"
                          max="100"
                          step="0.1"
                          value={formData.weight}
                          onChange={(e) =>
                            handleInputChange(
                              "weight",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <span className="text-gray-600">kg</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Minimum: 0.1kg, Maximum: 100kg
                    </p>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      <div className="flex items-center">
                        <Ruler className="w-5 h-5 text-gray-400 mr-2" />
                        Dimensions *
                      </div>
                    </label>
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Length
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            min="1"
                            step="0.1"
                            value={formData.dimensions.length}
                            onChange={(e) =>
                              handleDimensionsChange(
                                "length",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Width
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={formData.dimensions.width}
                          onChange={(e) =>
                            handleDimensionsChange(
                              "width",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Height
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="0.1"
                          value={formData.dimensions.height}
                          onChange={(e) =>
                            handleDimensionsChange(
                              "height",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Unit
                        </label>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleUnitChange("cm")}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium ${
                              formData.dimensions.unit === "cm"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            cm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnitChange("in")}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium ${
                              formData.dimensions.unit === "in"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            in
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Current dimensions: {formData.dimensions.length} ×{" "}
                      {formData.dimensions.width} × {formData.dimensions.height}{" "}
                      {formData.dimensions.unit}
                    </p>
                  </div>

                  {/* Contents */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-2" />
                          Package Contents *
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={addContentItem}
                        className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.contents.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">
                              Item {index + 1}
                            </h4>
                            {formData.contents.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeContentItem(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Description *
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleContentChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Documents, Electronics, etc."
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleContentChange(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                Value (USD) *
                              </label>
                              <div className="flex">
                                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.value}
                                  onChange={(e) =>
                                    handleContentChange(
                                      index,
                                      "value",
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">
                          Total Declared Value:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${totalDeclaredValue.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        This value will be used for customs declaration and
                        insurance purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Review Your Shipment
                </h2>
                <p className="text-gray-600 mb-8">
                  Please review all information before submitting
                </p>

                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Sender</h3>
                      <div className="space-y-2">
                        <p className="font-medium">{formData.sender_name}</p>
                        <p className="text-gray-600">{formData.sender_email}</p>
                        <p className="text-gray-600">{formData.sender_phone}</p>
                        {formData.sender_address && (
                          <p className="text-gray-600">
                            {formData.sender_address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Recipient
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium">{formData.recipient_name}</p>
                        <p className="text-gray-600">
                          {formData.recipient_email}
                        </p>
                        <p className="text-gray-600">
                          {formData.recipient_phone}
                        </p>
                        <p className="text-gray-600">
                          {formData.recipient_address}
                        </p>
                        <p className="text-gray-600">
                          Destination:{" "}
                          {countries.find(
                            (c) => c.code === formData.destination_country
                          )?.name || formData.destination_country}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Package Details
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-medium">{formData.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dimensions</p>
                        <p className="font-medium">
                          {formData.dimensions.length} ×{" "}
                          {formData.dimensions.width} ×{" "}
                          {formData.dimensions.height}{" "}
                          {formData.dimensions.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Declared Value
                        </p>
                        <p className="font-medium">
                          ${totalDeclaredValue.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Contents:
                      </h4>
                      <div className="space-y-3">
                        {formData.contents.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-100"
                          >
                            <div>
                              <p className="font-medium">{item.description}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              ${(item.value * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="font-medium text-yellow-900 mb-3">
                      <FileText className="w-5 h-5 inline mr-2" />
                      Important Information
                    </h3>
                    <ul className="space-y-2 text-sm text-yellow-800">
                      <li>
                        • Customs duties and taxes may apply for international
                        shipments
                      </li>
                      <li>
                        • The recipient is responsible for any customs fees
                      </li>
                      <li>• Insurance coverage is based on declared value</li>
                      <li>• Prohibited items cannot be shipped</li>
                      <li>• Delivery times are estimates and not guaranteed</li>
                    </ul>
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
                          Terms & Conditions Agreement
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          I agree to the SwiftTrack Terms of Service and confirm
                          that all information provided is accurate. I
                          understand that customs duties and taxes may apply for
                          international shipments and are the responsibility of
                          the recipient. I declare that the contents do not
                          include any prohibited items.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-8 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Back
                </button>
              )}

              <div className={`${step > 1 ? "ml-auto" : "w-full"}`}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    step === 1 ? "w-full" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {step === 3 ? "Creating Shipment..." : "Processing..."}
                    </span>
                  ) : step === 3 ? (
                    "Create Shipment"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
