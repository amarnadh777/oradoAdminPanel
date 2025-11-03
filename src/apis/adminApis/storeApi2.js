import apiClient from "../apiClient/apiClient";

export const fetchRestaurantCategories = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/admin/restaurant/${restaurantId}/category`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching restaurant categories:", error.response?.data?.message || error.message);
    throw error;
  }
};



export const fetchCategoryProducts = async (restaurantId, categoryId, status = '', search = '') => {
  try {
    const params = new URLSearchParams();
    // if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await apiClient.get(
      `/admin/restaurant/${restaurantId}/category/${categoryId}?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching category products:", error.response?.data?.message || error.message);
    throw error;
  }
};


export const createStore = async (storeData) => {
  const formData = new FormData();

  // Append all basic fields except arrays/files
  Object.keys(storeData).forEach(key => {
    if (key !== 'address' && 
        key !== 'openingHours' && 
        key !== 'images' && 
        key !== 'fssaiDoc' && 
        key !== 'gstDoc' && 
        key !== 'aadharDoc' &&
        key !== 'commission' &&
        key !== 'paymentMethods') {
      formData.append(key, storeData[key]);
    }
  });

  // Append paymentMethods as individual fields
  storeData.paymentMethods.forEach(method => {
    formData.append('paymentMethods', method);
  });

  // Append complex objects as JSON strings
  formData.append("address", JSON.stringify(storeData.address));
  formData.append("openingHours", JSON.stringify(storeData.openingHours));
  formData.append("commission", JSON.stringify(storeData.commission));

  // Append images (multiple)
  storeData.images.forEach((file) => {
    formData.append("images", file);
  });

  // Append KYC documents
  formData.append("fssaiDoc", storeData.fssaiDoc);
  formData.append("gstDoc", storeData.gstDoc);
  formData.append("aadharDoc", storeData.aadharDoc);

  try {
    const response = await apiClient.post("/store/register", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating store:", {
      request: error.config,
      response: error.response?.data
    });
    throw error.response?.data || { message: "Request failed" };
  }
};

export const createMerchantAndStore = async (formData) => {
  return apiClient.post("/store/create-merchant-and-store", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};






export const getStoreById = async (id) => {
  try {
    const response = await apiClient.get(`/store/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch restaurant by ID:", error);
    throw error;
  }
}






export const createProduct = async (productData, storeId, categoryId) => {
  try {
    const formData = new FormData();
    
    // Log for debugging
    console.log('Raw productData:', productData);
    console.log('Images array:', productData.images);

    // Append all basic product data
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('price', productData.price);
    formData.append('storeId', storeId);
    formData.append('categoryId', categoryId);
    formData.append('preparationTime', productData.preparationTime || 10);
    formData.append('availability', productData.availability || 'always');
    
    // Append time fields based on availability type
    if (productData.availableAfterTime) {
      formData.append('availableAfterTime', productData.availableAfterTime);
    }
    if (productData.availableFromTime) {
      formData.append('availableFromTime', productData.availableFromTime);
    }
    if (productData.availableToTime) {
      formData.append('availableToTime', productData.availableToTime);
    }
    
    formData.append('unit', productData.unit || 'piece');
    formData.append('stock', productData.stock || 0);
    formData.append('reorderLevel', productData.reorderLevel || 0);
    formData.append('enableInventory', productData.enableInventory || false);
    formData.append('foodType', productData.foodType || 'veg');
    formData.append('costPrice', productData.costPrice || 0);
    formData.append('minimumOrderQuantity', productData.minOrderQty || productData.minQty || 1);
    formData.append('maximumOrderQuantity', productData.maxOrderQty || productData.maxQty || 100);
    formData.append('active', productData.active !== undefined ? productData.active : true);

    // Handle image uploads
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`images`, image);
        } else if (typeof image === 'string') {
          console.warn('Skipping existing image URL - only new uploads are supported for creation');
        }
      });
    } else {
      console.log('No images to upload');
    }

    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? value.name : value);
    }

    const response = await apiClient.post('/store/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Create product failed:', error.response?.data || error.message);
    throw error;
  }
};



export const updateProductById = async (productId, productData, imagesToRemove = [], newImages = []) => {
  const formData = new FormData();

  // Add basic product fields
  if (productData.name) formData.append('name', productData.name);
  if (productData.description) formData.append('description', productData.description);
  if (productData.price) formData.append('price', productData.price);
  if (productData.foodType) formData.append('foodType', productData.foodType);
  if (productData.unit) formData.append('unit', productData.unit);
  if (productData.preparationTime) formData.append('preparationTime', productData.preparationTime);
  if (productData.minimumOrderQuantity) formData.append('minimumOrderQuantity', productData.minimumOrderQuantity);
  if (productData.maximumOrderQuantity) formData.append('maximumOrderQuantity', productData.maximumOrderQuantity);
  if (productData.availability) formData.append('availability', productData.availability);
  
  // Add time fields
  if (productData.availableAfterTime) formData.append('availableAfterTime', productData.availableAfterTime);
  if (productData.availableFromTime) formData.append('availableFromTime', productData.availableFromTime);
  if (productData.availableToTime) formData.append('availableToTime', productData.availableToTime);
  
  // Add boolean fields
  formData.append('active', productData.active);
  formData.append('enableInventory', productData.enableInventory || false);
  
  // Add inventory fields if enabled
  if (productData.enableInventory) {
    if (productData.stock) formData.append('stock', productData.stock);
    if (productData.reorderLevel) formData.append('reorderLevel', productData.reorderLevel);
  }
  
  // Add cost fields
  if (productData.costPrice) formData.append('costPrice', productData.costPrice);

  // Add imagesToRemove (as JSON string)
  if (imagesToRemove.length > 0) {
    formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
  }

  // Append new images (files)
  newImages.forEach((imageFile) => {
    formData.append('images', imageFile);
  });

  console.log("Updating product with data:", {
    productId,
    productData,
    imagesToRemoveCount: imagesToRemove.length,
    newImagesCount: newImages.length
  });

  // Send PATCH request
  const response = await apiClient.patch(`/store/product/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const toggleCategoryStatus = async (categoryId) => {
  try {
    console.log("Toggling category status for:", categoryId);

    const response = await apiClient.put(`/store/category/${categoryId}/toggle-status`);

    console.log("Toggle category response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Toggle category status failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}


export const updateCategoryById = async (id, categoryData, imagesToRemove = [], newImages = []) => {
  const formData = new FormData();

  // Add basic fields
  if (categoryData.name) formData.append('name', categoryData.name);
  if (categoryData.description) formData.append('description', categoryData.description);
  if (categoryData.restaurantId) formData.append('restaurantId', categoryData.restaurantId);
  formData.append('active', categoryData.active);
  formData.append('autoOnOff', categoryData.autoOnOff);

  // Add imagesToRemove (as JSON string)
  if (imagesToRemove.length > 0) {
    formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
  }

  // Append new images (files)
  newImages.forEach((imageFile) => {
    formData.append('images', imageFile); // must match `upload.array('images')` field
  });

  // Send PATCH request
  const response = await apiClient.patch(`/store/category/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};  



export const createCategory = async (categoryData, imageFiles = []) => {
  try {
    const formData = new FormData();

    // Append text fields
    if (categoryData.name) formData.append('name', categoryData.name);
    if (categoryData.restaurantId) formData.append('restaurantId', categoryData.restaurantId);
    if (categoryData.availability) formData.append('availability', categoryData.availability);
    if (categoryData.availableAfterTime) formData.append('availableAfterTime', categoryData.availableAfterTime);
    if (categoryData.description) formData.append('description', categoryData.description);
    formData.append('active', categoryData.active);
    formData.append('autoOnOff', categoryData.autoOnOff);

    // Append image files
    imageFiles.forEach(file => {
      formData.append('images', file); // matches upload.array('images') on backend
    });

    const response = await apiClient.post('/store/category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data; // success response
  } catch (error) {
    console.error('Error creating category:', error);
    // Optional: throw custom error or return fallback
    throw error.response?.data || { message: 'Unexpected error occurred' };
  }
};

// export const deleteCategory = async (id, categoryData, imagesToRemove = [], newImages = []) => {
//   const formData = new FormData();

//   // Add basic fields
//   if (categoryData.name) formData.append('name', categoryData.name);
//   if (categoryData.description) formData.append('description', categoryData.description);
//   if (categoryData.restaurantId) formData.append('restaurantId', categoryData.restaurantId);
//   formData.append('active', categoryData.active);
//   formData.append('autoOnOff', categoryData.autoOnOff);

//   // Add imagesToRemove (as JSON string)
//   if (imagesToRemove.length > 0) {
//     formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
//   }

//   // Append new images (files)
//   newImages.forEach((imageFile) => {
//     formData.append('images', imageFile); // must match `upload.array('images')` field
//   });

//   // Send PATCH request
//   const response = await apiClient.patch(`/store/category/${id}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });

//   return response;
// };  
export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/store/category/${categoryId}`);
    return response; // return server response
  } catch (error) {
    console.error("Error deleting category:", error.response?.data || error.message);
    throw error; // rethrow so caller (frontend) can handle it
  }
};


export const toggleCategoryActiveStatus = async (id, categoryData, imagesToRemove = [], newImages = []) => {
  const formData = new FormData();

  // Add basic fields
  if (categoryData.name) formData.append('name', categoryData.name);
  if (categoryData.description) formData.append('description', categoryData.description);
  if (categoryData.restaurantId) formData.append('restaurantId', categoryData.restaurantId);
  formData.append('active', categoryData.active);
  formData.append('autoOnOff', categoryData.autoOnOff);

  // Add imagesToRemove (as JSON string)
  if (imagesToRemove.length > 0) {
    formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
  }

  // Append new images (files)
  newImages.forEach((imageFile) => {
    formData.append('images', imageFile); // must match `upload.array('images')` field
  });

  // Send PATCH request
  const response = await apiClient.patch(`/store/category/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};  


export const updateCategory = async (id, categoryData, imagesToRemove = [], newImages = []) => {
  const formData = new FormData();

  // Add ALL basic fields - not just name and description
  if (categoryData.name) formData.append('name', categoryData.name);
  if (categoryData.description) formData.append('description', categoryData.description);
  if (categoryData.availability) formData.append('availability', categoryData.availability);
  if (categoryData.restaurantId) formData.append('restaurantId', categoryData.restaurantId);
  
  // Add time fields based on availability
  if (categoryData.availableAfterTime) formData.append('availableAfterTime', categoryData.availableAfterTime);
  if (categoryData.availableFromTime) formData.append('availableFromTime', categoryData.availableFromTime);
  if (categoryData.availableToTime) formData.append('availableToTime', categoryData.availableToTime);
  
  // Add boolean fields
  formData.append('active', categoryData.active);
  formData.append('autoOnOff', categoryData.autoOnOff || false);

  // Add imagesToRemove (as JSON string)
  if (imagesToRemove.length > 0) {
    formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
  }

  // Append new images (files)
  newImages.forEach((imageFile) => {
    formData.append('images', imageFile);
  });

  console.log("Sending FormData with fields:", {
    name: categoryData.name,
    description: categoryData.description,
    availability: categoryData.availability,
    active: categoryData.active,
    autoOnOff: categoryData.autoOnOff,
    availableAfterTime: categoryData.availableAfterTime,
    availableFromTime: categoryData.availableFromTime,
    availableToTime: categoryData.availableToTime,
    imagesToRemoveCount: imagesToRemove.length,
    newImagesCount: newImages.length
  });

  // Send PATCH request
  const response = await apiClient.patch(`/store/category/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};









export const toggleProductStatus = async (productId) => {
  try {                                           
    const response = await apiClient.patch(`/store/product/${productId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling product status:', error);
    throw error.response?.data || { message: 'Unknown error' };
  }
};

// Delete Product
export const deleteProduct = async (productId, restaurantId) => {
  try {
    const response = await apiClient.delete(`/store/product/${productId}`, {
      data: { restaurantId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error.response?.data || { message: 'Unknown error' };
  }
};



export const getServiceAreas = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}/service-areas`);
    console.log("Fetched service areas:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching service areas:", error);
    throw error;
  }
};


export const addServiceArea = async (restaurantId, serviceAreas) => {
  try {
    const response = await apiClient.post(`/restaurants/${restaurantId}/service-areas`, {
      serviceAreas
    });
    return response.data;
  } catch (error) {
    console.error("Error adding service areas:", error.response?.data || error.message);
    throw error;
  }
};


export const downloadCategoryTemplate = async () => {
  try {
    const response = await apiClient.get(
      "/store/category/download-template",
      {
        responseType: "blob", // very important for files
      }
    );

    // Create a Blob URL for the downloaded file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "category_template.xlsx"; // File name
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download template:", error);
    throw error;
  }
}




export const importCategoriesExcel = async (restaurantId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `/store/category/import/${restaurantId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to import categories:", error);
    throw error;
  }
};





export const exportCategoriesExcel = async (restaurantId) => {
  try {
    const response = await apiClient.get(
      `/store/${restaurantId}/category/export`,
      {
        responseType: "blob", // important for file download
      }
    );

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "categories.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Failed to export categories:", error);
    throw error;
  }
};
export const bulkEditCategoriesExcel = async (restaurantId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `/store/${restaurantId}/category/bulk-edit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // e.g., { message: "...", updatedCount: n }
  } catch (error) {
    console.error("Failed to bulk edit categories:", error);
    throw error;
  }
};





export const exportProducts = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/store/${restaurantId}/products/export`, {
      responseType: "blob", // important for downloading files
    });

    // Create a Blob URL for the file
    const url = window.URL.createObjectURL(new Blob([response.data]));

    // Create a link element
    const link = document.createElement("a");
    link.href = url;

    // Set a default file name
    link.setAttribute("download", `products_${restaurantId}.xlsx`);

    // Append link to body and trigger click
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// ✅ Import products from Excel/CSV
export const importProducts = async (formData) => {
  try {
    const response = await apiClient.post("/admin/products/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ✅ Download product import template
export const downloadProductTemplate = async () => {
  try {
    const response = await apiClient.get("/admin/products/template", {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};



export const bulkEditProducts = async (restaurantId,formData) => {
  try {
    const response = await apiClient.post(`/store/${restaurantId}/products/bulk-edit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};




// ✅ Archive Product
export const archiveProduct = async (productId) => {
  try {
    const res = await apiClient.put(`/store/product/${productId}/archive`);
    console.log("Archive product response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error archiving product:", error);
    throw error;
  }
};

// ✅ Unarchive Product
export const unarchiveProduct = async (productId) => {
  try {
    const res = await apiClient.put(`/store/product/${productId}/unarchive`);
    console.log("Unarchive product response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error unarchiving product:", error);
    throw error;
  }
};