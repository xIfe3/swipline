"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface ShipmentStatus {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface ShipmentDetails {
  trackingNumber: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  weight: string;
  dimensions: string;
  service: string;
  estimatedDelivery: string;
  currentStatus: string;
  history: ShipmentStatus[];
}

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentTrackings] = useState([
    "ST123456789",
    "ST987654321",
    "ST456789123",
  ]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in transit":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "out for delivery":
        return <MapPin className="w-5 h-5 text-purple-500" />;
      case "exception":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in transit":
        return "bg-blue-100 text-blue-800";
      case "out for delivery":
        return "bg-purple-100 text-purple-800";
      case "exception":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    setLoading(true);

    // Simulate API call to your tracking endpoint
    setTimeout(() => {
      // Mock data - replace with actual API call
      const mockShipment: ShipmentDetails = {
        trackingNumber,
        sender: "John Smith",
        recipient: "Sarah Johnson",
        origin: "New York, USA",
        destination: "Toronto, Canada",
        weight: "5.2 kg",
        dimensions: "30 × 25 × 15 cm",
        service: "Express International",
        estimatedDelivery: "Dec 28, 2024",
        currentStatus: "In Transit",
        history: [
          {
            status: "Package Received",
            location: "New York Sorting Center",
            timestamp: "Dec 20, 2024 09:30 AM",
            description: "Package scanned at origin facility",
          },
          {
            status: "Customs Clearance",
            location: "US-Canada Border",
            timestamp: "Dec 21, 2024 02:15 PM",
            description: "Cleared customs inspection",
          },
          {
            status: "In Transit",
            location: "Buffalo Distribution Center",
            timestamp: "Dec 22, 2024 11:45 AM",
            description: "Departed for destination",
          },
          {
            status: "Arrived at Facility",
            location: "Toronto Gateway",
            timestamp: "Dec 23, 2024 03:20 PM",
            description: "Arrived at destination city",
          },
        ],
      };

      setShipment(mockShipment);
      setLoading(false);
      toast.success("Tracking information found!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Shipment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your SwiftTrack tracking number to get real-time updates on
            your package location and estimated delivery
          </p>
        </div>

        {/* Tracking Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleTrack} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) =>
                  setTrackingNumber(e.target.value.toUpperCase())
                }
                placeholder="Enter tracking number (e.g., ST123456789)"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-xl text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Tracking..." : "Track"}
            </button>
          </form>

          {/* Recent Tracking Numbers */}
          <div className="mt-6">
            <p className="text-gray-600 mb-2">Recently tracked:</p>
            <div className="flex flex-wrap gap-2">
              {recentTrackings.map((trackNum) => (
                <button
                  key={trackNum}
                  onClick={() => {
                    setTrackingNumber(trackNum);
                    // Auto-track when clicked
                    const event = new Event("submit", {
                      bubbles: true,
                      cancelable: true,
                    });
                    document.querySelector("form")?.dispatchEvent(event);
                  }}
                  className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {trackNum}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        {shipment && (
          <div className="max-w-6xl mx-auto">
            {/* Status Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Shipment Details
                  </h2>
                  <p className="text-gray-600">
                    Tracking: {shipment.trackingNumber}
                  </p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full ${getStatusColor(
                    shipment.currentStatus
                  )} font-medium`}
                >
                  {shipment.currentStatus}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Sender</p>
                  <p className="font-medium">{shipment.sender}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Recipient</p>
                  <p className="font-medium">{shipment.recipient}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Service</p>
                  <p className="font-medium">{shipment.service}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Est. Delivery</p>
                  <p className="font-medium">{shipment.estimatedDelivery}</p>
                </div>
              </div>

              {/* Route Visualization */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-medium">{shipment.origin}</p>
                    <p className="text-sm text-gray-600">Origin</p>
                  </div>
                  <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-medium">{shipment.destination}</p>
                    <p className="text-sm text-gray-600">Destination</p>
                  </div>
                </div>
              </div>

              {/* Shipment History */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Tracking History
                </h3>
                <div className="space-y-6">
                  {shipment.history.map((event, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {getStatusIcon(event.status)}
                        </div>
                        {index < shipment.history.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {event.status}
                            </h4>
                            <p className="text-gray-600">{event.location}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {event.timestamp}
                          </p>
                        </div>
                        <p className="text-gray-700">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Download Shipping Label
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Share Tracking
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Request Proof of Delivery
              </button>
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                Report Issue
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!shipment && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-2xl shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Need Help?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Find Tracking Number
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Check your email confirmation or shipping label for your
                    tracking number
                  </p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    No Tracking Info?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    It may take up to 24 hours for new shipments to appear in
                    our system
                  </p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    International Shipments
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Cross-border shipments may have additional customs clearance
                    updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
