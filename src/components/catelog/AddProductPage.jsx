import { useEffect, useState } from "react";
import {Clock, ChevronDown, Upload, X, Info, ArrowLeft, Sparkles, Camera, Star, RotateCcw, Maximize ,Loader} from "lucide-react";

const AddProductPage = ({
  onClose,
  merchantName = "Demo Restaurant",
  categoryName = "Main Course",
  onAddProduct = () => {},
  initialData = null,
  isEditMode = false,
   loading = false,
}) => {
const [formData, setFormData] = useState({
  name: "",
  description: "",
  price: "",
  minQty: "",
  maxQty: "",
  costPrice: "",
  preparationTime: "",
  isRecurring: false,
  images: [],
  availability: "always",
  availableFrom: "",
  availableTo: "",
  availableAfterTime: "",
  unit: "piece",
  stock: 0,
  reorderLevel: 0,
  enableInventory: false,
  foodType: "veg",
  _id: null,
  imagesToRemove: null
});

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const productData = {
      name: formData.name || "",
      _id: formData._id,
      description: formData.description || "",
      price: formData.price || "",
      minQty: formData.minQty || "",
      maxQty: formData.maxQty || "",
      costPrice: formData.costPrice || "",
      preparationTime: formData.preparationTime || "",
      isRecurring: formData.isRecurring || false,
      images: formData.images || [],
      availability: formData.availability || "always",
      // Handle different availability types - ensure no null values
      availableAfterTime: formData.availability === "time-based" ? (formData.availableAfterTime || "") : null,
      availableFromTime: formData.availability === "time-range" ? (formData.availableFrom || "") : null,
      availableToTime: formData.availability === "time-range" ? (formData.availableTo || "") : null,
      unit: formData.unit || "piece",
      stock: formData.stock || 0,
      reorderLevel: formData.reorderLevel || 0,
      enableInventory: formData.enableInventory || false,
      foodType: formData.foodType || "veg",
      minimumOrderQuantity: formData.minQty || "",
      maximumOrderQuantity: formData.maxQty || "",
      imagesToRemove: imagesToRemove || []
    };
    await onAddProduct(productData);
    onClose();
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
 
 useEffect(() => {
  if (isEditMode && initialData) {
    const images = initialData.images || [];
    const imageUrls = [];
    const imageFiles = [];
    
    setFormData({
      // Set defaults for all fields first
      name: "",
      description: "",
      price: "",
      minQty: "",
      maxQty: "",
      costPrice: "",
      preparationTime: "",
      isRecurring: false,
      images: [],
      availability: "always",
      availableFrom: "",
      availableTo: "",
      availableAfterTime: "",
      unit: "piece",
      stock: 0,
      reorderLevel: 0,
      enableInventory: false,
      foodType: "veg",
      _id: null,
      imagesToRemove: null,
      
      // Then override with initialData, ensuring no null values for string fields
      ...initialData,
      _id: initialData._id,
      minQty: initialData.minOrderQty || "",
      maxQty: initialData.maxOrderQty || "",
      availability: initialData.availability || "always",
      availableFrom: initialData.availableFromTime || "",
      availableTo: initialData.availableToTime || "",
      availableAfterTime: initialData.availableAfterTime || "",
      name: initialData.name || "",
      description: initialData.description || "",
      price: initialData.price || "",
      costPrice: initialData.costPrice || "",
      preparationTime: initialData.preparationTime || "",
      unit: initialData.unit || "piece",
      stock: initialData.stock || 0,
      reorderLevel: initialData.reorderLevel || 0,
      enableInventory: initialData.enableInventory || false,
      foodType: initialData.foodType || "veg",
      isRecurring: initialData.isRecurring || false,
    });
    
    setExistingImageUrls(imageUrls);
  }
}, [isEditMode, initialData]);

  const getImageSrc = (image) => {
    if (typeof image === 'string') {
      return image;
    } else if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return '';
  };

  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(image));
        }
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = e.target ? e.target.files : e;
    if (files) {
      const newFiles = Array.from(files);
      
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024;
        return isValidType && isValidSize;
      });

      if (validFiles.length !== newFiles.length) {
        alert('Some files were skipped. Please ensure all files are images under 5MB.');
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));

      validFiles.forEach((file, index) => {
        const fileId = `${Date.now()}-${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress >= 100) {
              clearInterval(interval);
              const { [fileId]: removed, ...rest } = prev;
              return rest;
            }
            return { ...prev, [fileId]: currentProgress + 10 };
          });
        }, 100);
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const toggleInventory = () => {
    setFormData((prev) => ({
      ...prev,
      enableInventory: !prev.enableInventory,
    }));
  };

  const handleAvailabilityChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      availability: value,
      // Reset time fields when switching availability types
      availableFrom: value === "time-range" ? prev.availableFrom || "" : "",
      availableTo: value === "time-range" ? prev.availableTo || "" : "",
      availableAfterTime: value === "time-based" ? prev.availableAfterTime || "" : "",
    }));
  };

  const removeImage = (index) => {
    const removedImageUrl = formData.images[index];
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagesToRemove((prevRemoved) => [...prevRemoved, removedImageUrl]);
  };

  const setMainImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const mainImage = newImages.splice(index, 1)[0];
      return {
        ...prev,
        images: [mainImage, ...newImages],
      };
    });
  };

  const reorderImages = (fromIndex, toIndex) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const allImages = [...existingImageUrls, ...formData.images];

  {console.log("Form Data Images:", formData);}
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Enhanced Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container with Animation */}
      <div className="flex items-start justify-center min-h-screen pt-8 px-4 pb-20">
        <div className="relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 w-full max-w-6xl mx-auto animate-in slide-in-from-bottom-4">
          {/* Modern Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
          </button>

          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/80 transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? "Edit Product" : "Add New Product"}
                  </h1>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <span className="font-medium">{merchantName}</span>
                    <span className="mx-2">•</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {categoryName}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Content */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="p-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                
                {/* Left Column */}
                <div className="space-y-8">
                  
                  {/* Product Details Card */}
                  <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-800">Product Details</h2>
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">Standard price for this product</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Min Qty <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="minQty"
                          value={formData.minQty}
                          onChange={handleChange}
                          placeholder="1"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Max Qty</label>
                        <input
                          type="number"
                          name="maxQty"
                          value={formData.maxQty}
                          onChange={handleChange}
                          placeholder="No limit"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Cost Price */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Cost Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          name="costPrice"
                          value={formData.costPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Your cost for this product</p>
                    </div>
                  </div>

                  {/* Inventory Tracking Card */}
                  <div className="bg-amber-50 rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Inventory Tracking</h2>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enableInventory}
                          onChange={toggleInventory}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-sm"></div>
                      </label>
                    </div>

                    {formData.enableInventory && (
                      <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Stock Quantity</label>
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="Current stock"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Reorder Level</label>
                          <input
                            type="number"
                            name="reorderLevel"
                            value={formData.reorderLevel}
                            onChange={handleChange}
                            placeholder="Alert threshold"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  
                  {/* Product Information Card */}
                  <div className="bg-green-50 rounded-xl p-6 space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-800">Product Information</h2>
                    </div>

                    {/* Food Type */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Food Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-white ${formData.foodType === "veg" ? "border-green-500 bg-green-100" : "border-gray-200"}`}>
                          <input
                            type="radio"
                            name="foodType"
                            value="veg"
                            checked={formData.foodType === "veg"}
                            onChange={handleChange}
                            className="sr-only"
                            required
                          />
                          <div className="w-4 h-4 rounded-full border-2 border-green-500 mr-3 flex items-center justify-center">
                            {formData.foodType === "veg" && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">🥬 Vegetarian</span>
                        </label>
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-white ${formData.foodType === "non-veg" ? "border-red-500 bg-red-100" : "border-gray-200"}`}>
                          <input
                            type="radio"
                            name="foodType"
                            value="non-veg"
                            checked={formData.foodType === "non-veg"}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="w-4 h-4 rounded-full border-2 border-red-500 mr-3 flex items-center justify-center">
                            {formData.foodType === "non-veg" && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">🍖 Non-Vegetarian</span>
                        </label>
                      </div>
                    </div>

                    {/* Unit & Prep Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Unit</label>
                        <div className="relative">
                          <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none"
                          >
                            <option value="piece">Piece</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="g">Gram (g)</option>
                            <option value="lb">Pound (lb)</option>
                            <option value="oz">Ounce (oz)</option>
                            <option value="pack">Pack</option>
                            <option value="box">Box</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Prep Time (min)</label>
                        <input
                          type="number"
                          name="preparationTime"
                          value={formData.preparationTime}
                          onChange={handleChange}
                          placeholder="0"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Recurring Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Recurring Bookings</p>
                          <p className="text-sm text-gray-600">Allow customers to book repeatedly</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isRecurring"
                          checked={formData.isRecurring}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-sm"></div>
                      </label>
                    </div>
                  </div>

                  {/* Enhanced Availability Card */}
                  <div className="bg-emerald-50 rounded-xl p-6 space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-800">Availability Settings</h2>
                    </div>

                    {/* Availability Type */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Availability <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-white ${
                          formData.availability === "always" ? "border-emerald-500 bg-emerald-100" : "border-gray-200"
                        }`}>
                          <input
                            type="radio"
                            name="availability"
                            value="always"
                            checked={formData.availability === "always"}
                            onChange={handleAvailabilityChange}
                            className="sr-only"
                          />
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 mr-3 flex items-center justify-center">
                            {formData.availability === "always" && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">Always</span>
                        </label>
                        
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-white ${
                          formData.availability === "time-based" ? "border-blue-500 bg-blue-100" : "border-gray-200"
                        }`}>
                          <input
                            type="radio"
                            name="availability"
                            value="time-based"
                            checked={formData.availability === "time-based"}
                            onChange={handleAvailabilityChange}
                            className="sr-only"
                          />
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 mr-3 flex items-center justify-center">
                            {formData.availability === "time-based" && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">After Time</span>
                        </label>
                        
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-white ${
                          formData.availability === "time-range" ? "border-purple-500 bg-purple-100" : "border-gray-200"
                        }`}>
                          <input
                            type="radio"
                            name="availability"
                            value="time-range"
                            checked={formData.availability === "time-range"}
                            onChange={handleAvailabilityChange}
                            className="sr-only"
                          />
                          <div className="w-4 h-4 rounded-full border-2 border-purple-500 mr-3 flex items-center justify-center">
                            {formData.availability === "time-range" && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">Time Range</span>
                        </label>
                        
                        <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-white ${
                          formData.availability === "out-of-stock" ? "border-red-500 bg-red-100" : "border-gray-200"
                        }`}>
                          <input
                            type="radio"
                            name="availability"
                            value="out-of-stock"
                            checked={formData.availability === "out-of-stock"}
                            onChange={handleAvailabilityChange}
                            className="sr-only"
                          />
                          <div className="w-4 h-4 rounded-full border-2 border-red-500 mr-3 flex items-center justify-center">
                            {formData.availability === "out-of-stock" && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-700">Out of Stock</span>
                        </label>
                      </div>
                    </div>

                    {/* Time-based Availability Settings */}
                    {formData.availability === "time-based" && (
                      <div className="space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Available After Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            name="availableAfterTime"
                            value={formData.availableAfterTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                          <p className="text-xs text-gray-500">Product will be available after this time</p>
                        </div>
                      </div>
                    )}

                    {/* Time Range Availability Settings */}
                   {formData.availability === "time-range" && (
  <div className="space-y-4 animate-in slide-in-from-top-2">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Available From <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          name="availableFrom"
          value={formData.availableFrom}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          required
        />
        {!formData.availableFrom && (
          <p className="text-xs text-red-500">Start time is required</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Available To <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          name="availableTo"
          value={formData.availableTo}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          required
        />
        {!formData.availableTo && (
          <p className="text-xs text-red-500">End time is required</p>
        )}
      </div>
    </div>
    
    {/* Validation Messages */}
    {formData.availableFrom && formData.availableTo && formData.availableFrom >= formData.availableTo && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-medium text-red-800">Invalid Time Range</p>
          <p className="text-sm text-red-700 mt-1">
            End time must be after start time. Please adjust your time range.
          </p>
        </div>
      </div>
    )}
    
    {/* Success Message when valid */}
    {formData.availableFrom && formData.availableTo && formData.availableFrom < formData.availableTo && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-medium text-green-800">Valid Time Range</p>
          <p className="text-sm text-green-700 mt-1">
            Product will be available from {formData.availableFrom} to {formData.availableTo}
          </p>
        </div>
      </div>
    )}
    
    {/* Time Range Display */}
    {formData.availableFrom && formData.availableTo && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Time Range Set</p>
              <p className="text-xs text-gray-600">
                {formData.availableFrom} - {formData.availableTo}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-blue-600">
              {(() => {
                const [fromHour, fromMinute] = formData.availableFrom.split(':').map(Number);
                const [toHour, toMinute] = formData.availableTo.split(':').map(Number);
                const totalMinutes = (toHour * 60 + toMinute) - (fromHour * 60 + fromMinute);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
              })()}
            </p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>
        </div>
      </div>
    )}
    
    {/* Help Text */}
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-start space-x-2">
        <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-800 mb-1">About Time Range Availability</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Product will only be visible and orderable during the specified hours</li>
            <li>• Outside this range, the product will appear as unavailable</li>
            <li>• Set 24-hour format times (e.g., 09:00, 17:30, 22:00)</li>
            <li>• Ensure end time is later than start time for the range to be valid</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}

                    {/* Out of Stock Message */}
                    {formData.availability === "out-of-stock" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                        <div className="flex items-center space-x-2">
                          <Info className="w-5 h-5 text-red-600" />
                          <p className="text-sm font-medium text-red-800">
                            This product is currently out of stock and won't be available for ordering.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description Card */}
                  <div className="bg-purple-50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                        <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                      </div>
                      <button
                        type="button"
                        className="flex items-center space-x-2 px-3 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
                        <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">AI Write</span>
                      </button>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your product in detail..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      rows="4"
                    />
                  </div>

                  {/* Enhanced Image Upload Card */}
                  <div className="bg-rose-50 rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-8 bg-rose-500 rounded-full"></div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">Product Images</h2>
                          <p className="text-sm text-gray-600">Add up to 8 high-quality images</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-white rounded-full font-medium">
                          {formData.images.length}/8
                        </span>
                      </div>
                    </div>
                    
                    {/* Main Upload Area */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                        isDragOver 
                          ? 'border-rose-500 bg-rose-100 scale-[1.02]' 
                          : 'border-rose-200 bg-white hover:bg-rose-25'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <input
                        type="file"
                        id="prodImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        multiple
                        disabled={formData.images.length >= 8}
                      />
                      
                      {formData.images.length === 0 ? (
                        <label htmlFor="prodImage" className="cursor-pointer block p-12">
                          <div className="text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
                              isDragOver ? 'bg-rose-200 scale-110' : 'bg-rose-100'
                            }`}>
                              <Camera className="w-10 h-10 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {isDragOver ? 'Drop images here!' : 'Upload Product Images'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Drag and drop your images here, or click to browse
                            </p>
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-4">
                              <span>• JPG, PNG, WebP</span>
                              <span>• Max 5MB each</span>
                              <span>• 800×800px recommended</span>
                            </div>
                            <button 
                              type="button"
                              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-all shadow-lg hover:shadow-xl"
                            >
                              <Upload className="w-5 h-5 mr-2" />
                              Choose Files
                            </button>
                          </div>
                        </label>
                      ) : (
                        <div className="p-6">
                          {/* Image Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                            {formData.images.map((image, index) => (
                              <div key={index} className="group relative">
                                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-square">
                                  <img
                                    src={getImageSrc(image)}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />

                                  {/* Main Image Badge */}
                                  {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                                      <Star className="w-3 h-3 mr-1" />
                                      Main
                                    </div>
                                  )}

                                  {/* Image Controls Overlay */}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => setMainImage(index)}
                                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                                      title="Set as main image"
                                    >
                                      <Star className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      type="button"
                                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                                      title="View full size"
                                    >
                                      <Maximize className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
                                      title="Remove image"
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                </div>

                                {/* Image Info */}
                                <div className="mt-2 text-center">
                                  <p className="text-xs text-gray-600 truncate">
                                    {image instanceof File ? image.name : `Image ${index + 1}`}
                                  </p>
                                  {image instanceof File && (
                                    <p className="text-xs text-gray-500">
                                      {(image.size / 1024 / 1024).toFixed(1)}MB
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {/* Add More Button */}
                            {formData.images.length < 8 && (
                              <label htmlFor="prodImage" className="cursor-pointer">
                                <div className="border-2 border-dashed border-rose-300 rounded-xl aspect-square flex flex-col items-center justify-center hover:border-rose-500 hover:bg-rose-50 transition-all group">
                                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-rose-200 transition-colors">
                                    <Upload className="w-6 h-6 text-rose-600" />
                                  </div>
                                  <p className="text-sm font-medium text-rose-600">Add More</p>
                                  <p className="text-xs text-gray-500">{8 - formData.images.length} remaining</p>
                                </div>
                              </label>
                            )}
                          </div>
                          
                          {/* Image Tips */}
                          <div className="bg-white rounded-lg p-4 border border-rose-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Info className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Image Guidelines</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• First image will be used as the main product image</li>
                                  <li>• Use high-quality, well-lit photos</li>
                                  <li>• Show different angles and details of your product</li>
                                  <li>• Square format (1:1 ratio) works best</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Footer */}
              <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center"
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      {isEditMode ? "Update Product" : "Add Product"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;