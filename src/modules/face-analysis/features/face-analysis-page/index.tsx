import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { ComboBox } from "@/core/components/ui/combo-box";
import { Slider } from "@/core/components/ui/slider";
import { Badge } from "@/core/components/ui/badge";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Loader2, Upload, Camera, Search } from "lucide-react";
import type { Option } from "@/core/types";

interface AnalysisResult {
  success: boolean;
  analysis?: {
    [key: string]: {
      score: number;
      observation: string;
      recommendation: string;
    };
  };
  overall_score?: number;
  estimated_age?: number;
  estimated_skintype?: string;
  summary?: string;
  analysis_report?: string;
  timestamp?: string;
  error?: string;
}

interface FilterResult {
  success: boolean;
  filtered_image?: string;
  timestamp?: string;
  error?: string;
}

const FaceAnalysisPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recommendations, setRecommendations] = useState<{
    success: boolean;
    recommendations?: Array<{
      name: string;
      brand: string;
      category: string;
      price_inr: number;
      description: string;
      ingredients: string[];
      skin_types: string[];
      concerns: string[];
      reasoning: string;
      url: string;
    }>;
    budget_summary?: {
      total_cost: number;
      budget_used_percent: number;
      remaining: number;
      over_budget: boolean;
      products_count: number;
      target_count: number;
    };
    error?: string;
  } | null>(null);

  // User data - EXACTLY like Python version
  const [ethnicity, setEthnicity] = useState("Indian");
  const [gender, setGender] = useState("Female");
  const [budget, setBudget] = useState(3500); // Default budget like Python

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera functions
  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user", // Front camera
        },
      });
      console.log("Camera stream obtained:", stream);
      setCameraStream(stream);
      setShowCamera(true);

      // Wait for the video element to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Setting video srcObject");
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            videoRef.current?.play();
          };
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      console.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "camera-capture.jpg", {
                type: "image/jpeg",
              });
              setSelectedImage(file);
              setImagePreview(URL.createObjectURL(blob));
              stopCamera();
            }
          },
          "image/jpeg",
          0.8,
        );
      }
    }
  };

  // Get product recommendations
  const getRecommendations = async () => {
    if (!analysisResult || !analysisResult.success) {
      console.log("No analysis result or analysis failed");
      return;
    }

    try {
      console.log("Getting recommendations...");
      // Extract analysis keywords from the analysis results
      const analysisKeywords: string[] = [];
      const analysis = analysisResult.analysis || {};

      Object.entries(analysis).forEach(([_key, value]) => {
        if (typeof value === "object" && value !== null) {
          const observation =
            (value as { observation?: string }).observation?.toLowerCase() ||
            "";
          const recommendation =
            (
              value as { recommendation?: string }
            ).recommendation?.toLowerCase() || "";

          // Extract keywords based on content
          if (observation.includes("acne") || recommendation.includes("acne")) {
            analysisKeywords.push("acne");
          }
          if (
            observation.includes("dry") ||
            recommendation.includes("hydration")
          ) {
            analysisKeywords.push("hydration");
          }
          if (observation.includes("oil") || recommendation.includes("oil")) {
            analysisKeywords.push("oiliness");
          }
          if (observation.includes("dark") || recommendation.includes("dark")) {
            analysisKeywords.push("dark_circle");
          }
          if (
            observation.includes("wrinkle") ||
            recommendation.includes("wrinkle")
          ) {
            analysisKeywords.push("wrinkle");
          }
          if (
            observation.includes("uneven") ||
            recommendation.includes("tone")
          ) {
            analysisKeywords.push("uneven_skintone");
          }
        }
      });

      // Remove duplicates
      const uniqueKeywords = [...new Set(analysisKeywords)];
      console.log("Analysis keywords:", uniqueKeywords);

      const payload = {
        budget: budget,
        analysis_keywords: uniqueKeywords,
        skin_type: analysisResult.estimated_skintype || "Normal",
      };

      console.log("Recommendation payload:", payload);

      const response = await fetch(
        "http://localhost:8000/face-analysis/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      console.log("Recommendation result:", result);
      setRecommendations(result);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
  };

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // EXACT options from Python version
  const ethnicityOptions: Option[] = [
    { label: "Caucasian", value: "Caucasian" },
    { label: "African American", value: "African American" },
    { label: "Asian", value: "Asian" },
    { label: "Indian", value: "Indian" },
    { label: "Hispanic/Latino", value: "Hispanic/Latino" },
    { label: "Middle Eastern", value: "Middle Eastern" },
    { label: "Mixed", value: "Mixed" },
    { label: "Other", value: "Other" },
  ];

  const genderOptions: Option[] = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Non-binary", value: "Non-binary" },
    { label: "Prefer not to say", value: "Prefer not to say" },
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset previous results
      setAnalysisResult(null);
      setFilterResult(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const base64Image = await fileToBase64(selectedImage);

      const response = await fetch(
        "http://localhost:8000/face-analysis/analyze/json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            ethnicity,
            gender,
          }),
        },
      );

      const result = await response.json();
      setAnalysisResult(result);

      // Get recommendations after analysis
      if (result.success) {
        await getRecommendations();
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult({
        success: false,
        error: "Failed to analyze image. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyPrivacyFilter = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const formData = new FormData();
      // Create a proper file object with content type
      const file = new File([selectedImage], "image.jpg", {
        type: "image/jpeg",
      });
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:8000/face-analysis/privacy-filter",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await response.json();
      setFilterResult(result);
    } catch (error) {
      console.error("Filter failed:", error);
      setFilterResult({
        success: false,
        error: "Failed to apply privacy filter. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          AI-Powered Face Analysis System
        </h1>
        <p className="text-lg text-gray-600">
          Professional skincare analysis with privacy protection and
          budget-aware recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Upload Section - EXACTLY like Python */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Image Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-80 w-full rounded-lg border object-cover"
                  style={{ maxWidth: "300px", aspectRatio: "3/4" }}
                />
              </div>
            )}

            {/* Camera Preview */}
            {showCamera && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="mx-auto h-80 w-full rounded-lg border bg-gray-100 object-cover"
                  style={{
                    maxWidth: "300px",
                    aspectRatio: "3/4",
                    transform: "scaleX(-1)",
                  }} // Mirror the video for selfie effect
                  onError={(e) => {
                    console.error("Video error:", e);
                    console.error("Camera stream not working properly");
                  }}
                >
                  <track kind="captions" />
                </video>
                {!cameraStream && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-100">
                    <div className="text-center">
                      <Camera className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Starting camera...
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform space-x-2">
                  <Button
                    onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    disabled={!cameraStream}
                  >
                    <Camera className="mr-1 h-4 w-4" />
                    Capture
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outlined"
                    className="bg-opacity-90 bg-white"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Upload Options */}
            <div className="space-y-3">
              <Label>Upload Image</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={startCamera}
                  className="flex items-center justify-center"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {selectedImage
                  ? `Selected: ${selectedImage.name}`
                  : "No image selected"}
              </div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {/* Privacy Protection - EXACTLY like Python */}
            {imagePreview && (
              <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                <h3 className="text-lg font-semibold">Privacy Protection</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="privacy-mask"
                    defaultChecked={false}
                    className="h-4 w-4 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        applyPrivacyFilter();
                      } else {
                        setFilterResult(null);
                      }
                    }}
                  />
                  <Label htmlFor="privacy-mask" className="text-base">
                    Apply privacy mask (recommended)
                  </Label>
                </div>

                {/* Privacy Filter Result */}
                {filterResult && (
                  <div className="space-y-4 pt-4">
                    {filterResult.success && filterResult.filtered_image && (
                      <div className="space-y-2">
                        <img
                          src={`data:image/jpeg;base64,${filterResult.filtered_image}`}
                          alt="Filtered"
                          className="mx-auto h-80 w-full rounded border object-cover"
                          style={{ maxWidth: "300px", aspectRatio: "3/4" }}
                        />
                      </div>
                    )}
                    {!filterResult.success && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {filterResult.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information - EXACTLY like Python */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ethnicity ComboBox */}
            <div className="space-y-3">
              <Label htmlFor="ethnicity" className="text-base font-medium">
                Ethnicity
              </Label>
              <ComboBox
                options={ethnicityOptions}
                value={ethnicity}
                onChange={(value) => setEthnicity(value)}
                placeholder="Select ethnicity"
                searchable={true}
                clearable={true}
                className="w-full"
              />
            </div>

            {/* Gender ComboBox */}
            <div className="space-y-3">
              <Label htmlFor="gender" className="text-base font-medium">
                Gender
              </Label>
              <ComboBox
                options={genderOptions}
                value={gender}
                onChange={(value) => setGender(value)}
                placeholder="Select gender"
                searchable={true}
                clearable={true}
                className="w-full"
              />
            </div>

            {/* Budget Slider - EXACTLY like Python */}
            <div className="space-y-3">
              <Label htmlFor="budget" className="text-base font-medium">
                Budget (₹)
              </Label>
              <div className="space-y-3">
                <Slider
                  value={[budget]}
                  onValueChange={(value) => setBudget(value[0])}
                  min={500}
                  max={5000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₹500</span>
                  <span className="text-base font-semibold">₹{budget}</span>
                  <span>₹5000</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Your budget for skincare products in Indian Rupees
              </p>
            </div>

            {/* Analyze Button - EXACTLY like Python */}
            <div className="pt-4">
              <Button
                onClick={analyzeImage}
                disabled={!selectedImage || loading}
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">
                      Analyzing image with Claude AI... This may take 1-2
                      minutes
                    </span>
                    <span className="sm:hidden">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">
                      Analyze & Get Recommendations
                    </span>
                    <span className="sm:hidden">Analyze</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results - EXACTLY like Python */}
      {analysisResult && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Analysis Results</CardTitle>
            <CardDescription className="text-base">
              Your skin health analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult.success ? (
              <div className="space-y-8">
                {/* Overall Score - EXACTLY like Python */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-gray-50 p-6">
                    <div className="mb-3 text-4xl font-bold text-gray-900">
                      {analysisResult.overall_score}/100
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      Overall Skin Health Score
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-6">
                    <div className="mb-3 text-4xl font-bold text-gray-900">
                      {analysisResult.estimated_age}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      Estimated Age
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-6">
                    <div className="mb-3 text-4xl font-bold text-gray-900">
                      {analysisResult.estimated_skintype}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                      Skin Type
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis - EXACTLY like Python */}
                {analysisResult.analysis && (
                  <div className="space-y-4">
                    <h3 className="mb-6 text-2xl font-bold text-gray-900">
                      Detailed Analysis
                    </h3>
                    {Object.entries(analysisResult.analysis).map(
                      ([key, value]) => (
                        <div key={key} className="rounded-lg border p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-xl font-bold text-gray-900 capitalize">
                              {key.replace("_", " ")}: {value.score}/100
                            </h4>
                            <Badge
                              variant={getScoreBadgeVariant(value.score)}
                              className="px-3 py-1 text-lg"
                            >
                              {value.score}/100
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <h5 className="mb-2 text-lg font-semibold text-gray-900">
                                Observation:
                              </h5>
                              <p className="text-base leading-relaxed text-gray-700">
                                {value.observation}
                              </p>
                            </div>
                            <div>
                              <h5 className="mb-2 text-lg font-semibold text-gray-900">
                                Recommendation:
                              </h5>
                              <p className="text-base leading-relaxed text-gray-700">
                                {value.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* Summary - EXACTLY like Python */}
                {analysisResult.summary && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-semibold text-blue-900">
                      Summary
                    </h4>
                    <p className="text-sm text-blue-800">
                      {analysisResult.summary}
                    </p>
                  </div>
                )}

                {/* Manual Recommendations Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={getRecommendations}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Get Product Recommendations
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  {analysisResult.error || "Analysis failed. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Recommendations - EXACTLY like Python */}
      {recommendations && recommendations.success && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Product Recommendations</CardTitle>
            <CardDescription className="text-base">
              Complete skincare routine based on your analysis and budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Budget Summary - EXACTLY like Python */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-2xl font-bold text-green-700">
                    ₹
                    {recommendations.budget_summary?.total_cost?.toFixed(1) ||
                      "0"}
                  </div>
                  <div className="text-sm text-green-600">Total Cost</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {recommendations.budget_summary?.budget_used_percent?.toFixed(
                      1,
                    ) || "0"}
                    %
                  </div>
                  <div className="text-sm text-blue-600">Budget Used</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    ₹
                    {Math.abs(
                      recommendations.budget_summary?.remaining || 0,
                    ).toFixed(1)}
                  </div>
                  <div className="text-sm text-purple-600">
                    {(recommendations.budget_summary?.remaining || 0) >= 0
                      ? "Remaining"
                      : "Over Budget"}
                  </div>
                </div>
              </div>

              {/* Complete Routine Status */}
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <div className="text-green-600">✅</div>
                  <span className="font-semibold text-green-800">
                    Complete Skincare Routine
                  </span>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  {recommendations.budget_summary?.products_count || 0}/
                  {recommendations.budget_summary?.target_count || 4} products
                  recommended for your complete routine
                </p>
              </div>

              {/* Recommendations by Category - EXACTLY like Python */}
              {recommendations.recommendations &&
                recommendations.recommendations.length > 0 && (
                  <div className="space-y-4">
                    {Object.entries(
                      recommendations.recommendations.reduce(
                        (
                          acc: Record<
                            string,
                            Array<{
                              name: string;
                              brand: string;
                              category: string;
                              price_inr: number;
                              description: string;
                              ingredients: string[];
                              skin_types: string[];
                              concerns: string[];
                              reasoning: string;
                              url: string;
                            }>
                          >,
                          product,
                        ) => {
                          const category = product.category || "Other";
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(product);
                          return acc;
                        },
                        {},
                      ),
                    ).map(([category, products]) => (
                      <div key={category} className="rounded-lg border p-4">
                        <h4 className="mb-3 text-lg font-semibold">
                          {category} ({products.length} product
                          {products.length > 1 ? "s" : ""})
                        </h4>
                        <div className="space-y-3">
                          {products.map((product, index: number) => (
                            <div
                              key={index}
                              className="rounded-lg bg-gray-50 p-3"
                            >
                              <div className="mb-2 flex items-start justify-between">
                                <h5 className="text-base font-semibold">
                                  {product.name}
                                </h5>
                                <span className="text-lg font-bold text-green-600">
                                  ₹{product.price_inr?.toFixed(1) || "0"}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                  <strong>Brand:</strong>{" "}
                                  {product.brand || "Unknown"}
                                </p>
                                <p>
                                  <strong>Skin Types:</strong>{" "}
                                  {product.skin_types?.join(", ") || "All"}
                                </p>
                                <p>
                                  <strong>Concerns:</strong>{" "}
                                  {product.concerns?.join(", ") || "General"}
                                </p>
                                {product.description && (
                                  <p>
                                    <strong>Description:</strong>{" "}
                                    {product.description}
                                  </p>
                                )}
                              </div>
                              {product.reasoning && (
                                <div className="mt-2 rounded bg-blue-50 p-2">
                                  <p className="text-sm text-blue-800">
                                    <strong>Why This Product:</strong>{" "}
                                    {product.reasoning}
                                  </p>
                                </div>
                              )}
                              {product.url && (
                                <div className="mt-2">
                                  <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 underline hover:text-blue-800"
                                  >
                                    View Product →
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error handling for recommendations */}
      {recommendations && !recommendations.success && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Failed to get recommendations:{" "}
                {recommendations.error || "Unknown error"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FaceAnalysisPage;
