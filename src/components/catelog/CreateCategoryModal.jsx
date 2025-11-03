import React, { useState, useEffect } from 'react';
import { X, Upload, Clock, AlertCircle, Edit, Loader } from 'lucide-react';

const CreateCategoryModal = ({ 
  onClose, 
  onSuccess, 
  restaurantId = null, 
  isEditMode = false, 
  initialData = null,
  loading = false
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState('always');
  const [availableAfterTime, setAvailableAfterTime] = useState('');
  const [availableFromTime, setAvailableFromTime] = useState('');
  const [availableToTime, setAvailableToTime] = useState('');
  const [active, setActive] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [error, setError] = useState(null);

  // Initialize form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setAvailability(initialData.availability || 'always');
      setAvailableAfterTime(initialData.availableAfterTime || '');
      setAvailableFromTime(initialData.availableFromTime || '');
      setAvailableToTime(initialData.availableToTime || '');
      setActive(initialData.active !== undefined ? initialData.active : true);
      
      // Handle existing images
      if (initialData.images && initialData.images.length > 0) {
        setExistingImages(initialData.images);
      }
    }
  }, [isEditMode, initialData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    // Validate time range
    if (availability === 'time-range') {
      if (!availableFromTime || !availableToTime) {
        setError('Both start time and end time are required for time range availability');
        return;
      }
      if (availableFromTime >= availableToTime) {
        setError('End time must be after start time');
        return;
      }
    }

    // Validate time-based
    if (availability === 'time-based' && !availableAfterTime) {
      setError('Available after time is required for time-based availability');
      return;
    }

    try {
      const categoryData = {
        // Always include these fields
        name: name.trim(),
        description: description.trim(),
        availability,
        availableAfterTime: availability === 'time-based' ? availableAfterTime : null,
        availableFromTime: availability === 'time-range' ? availableFromTime : null,
        availableToTime: availability === 'time-range' ? availableToTime : null,
        active,
        restaurantId,
        imageFiles,
        imagesToRemove,
        
        // Include edit-specific data
        ...(isEditMode && initialData && { 
          _id: initialData._id, // Send the category ID for editing
          existingImages // Send current existing images
        })
      };

      // Send data back to parent component
      onSuccess(categoryData);
    } catch (error) {
      setError(error.message || 'An error occurred while preparing the category data');
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + imageFiles.length + existingImages.length - imagesToRemove.length > 8) {
      setError('Maximum 8 images allowed');
      return;
    }
    
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs for selected images
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
    setError(null);
  };

  const removeImage = (index, type) => {
    if (type === 'existing') {
      // Mark existing image for removal
      setImagesToRemove(prev => [...prev, existingImages[index]]);
      const newExisting = [...existingImages];
      newExisting.splice(index, 1);
      setExistingImages(newExisting);
    } else if (type === 'new') {
      // Remove new file and its preview
      const newFiles = [...imageFiles];
      newFiles.splice(index, 1);
      setImageFiles(newFiles);
      
      const newUrls = [...previewUrls];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      setPreviewUrls(newUrls);
    }
  };

  const restoreImage = (imageUrl) => {
    // Remove from imagesToRemove and add back to existingImages
    setImagesToRemove(prev => prev.filter(img => img !== imageUrl));
    setExistingImages(prev => [...prev, imageUrl]);
  };

  const allImages = [
    ...existingImages.map(img => ({ type: 'existing', url: img })),
    ...previewUrls.map((url, index) => ({ type: 'new', url, index }))
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <Edit className="w-5 h-5 text-blue-600" />
            ) : (
              <Upload className="w-5 h-5 text-blue-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditMode ? 'Edit Category' : 'Create New Category'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-start p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle size={18} className="mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Appetizers, Main Course"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe this category..."
              disabled={loading}
            />
          </div>
          
          {/* Availability Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              Availability Settings
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Type
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={loading}
                >
                  <option value="always">Always Available</option>
                  <option value="time-based">Available After Time</option>
                  <option value="time-range">Time Range</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              
              {/* Time-based Availability */}
              {availability === 'time-based' && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available After
                  </label>
                  <input
                    type="time"
                    value={availableAfterTime}
                    onChange={(e) => setAvailableAfterTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Category will be available after this time
                  </p>
                </div>
              )}
              
              {/* Time Range Availability */}
              {availability === 'time-range' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Available Time Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <input
                        type="time"
                        value={availableFromTime}
                        onChange={(e) => setAvailableFromTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <input
                        type="time"
                        value={availableToTime}
                        onChange={(e) => setAvailableToTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  {availableFromTime && availableToTime && availableFromTime >= availableToTime && (
                    <p className="text-xs text-red-500">
                      ⚠️ End time must be after start time
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Category will only be available during this time range
                  </p>
                </div>
              )}
              
              {/* Disabled Availability */}
              {availability === 'disabled' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-700">
                      This category will be hidden from customers
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Status
              </label>
              <p className="text-xs text-gray-500">Active categories are visible to customers</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input 
                type="checkbox" 
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only"
                id="active-toggle"
                disabled={loading}
              />
              <label 
                htmlFor="active-toggle"
                className={`block h-6 w-12 rounded-full cursor-pointer ${active ? 'bg-green-500' : 'bg-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out ${active ? 'transform translate-x-6' : ''}`} />
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Images
              <span className="text-xs text-gray-500 ml-2">
                ({allImages.length}/8 used)
              </span>
            </label>
            
            {/* Image previews */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {allImages.map((item, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={item.url} 
                      alt={`Preview ${index + 1}`} 
                      className="h-20 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(item.type === 'existing' ? index : item.index, item.type)}
                      disabled={loading}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Removed images section (edit mode only) */}
            {isEditMode && imagesToRemove.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Images to be removed:</p>
                <div className="grid grid-cols-3 gap-2">
                  {imagesToRemove.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`Removed ${index + 1}`} 
                        className="h-20 w-full object-cover rounded-md opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => restoreImage(imageUrl)}
                        disabled={loading}
                        className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {allImages.length < 8 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  accept="image/*"
                  disabled={loading || allImages.length >= 8}
                />
                <label 
                  htmlFor="image-upload" 
                  className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag images or <span className="text-blue-500">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB • {8 - allImages.length} remaining
                  </p>
                </label>
              </div>
            )}
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex justify-between p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{isEditMode ? 'Update Category' : 'Create Category'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;