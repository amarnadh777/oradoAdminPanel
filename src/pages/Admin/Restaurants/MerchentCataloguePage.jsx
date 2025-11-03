  import React, { useEffect, useState, useRef } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import {
    Plus,
    RefreshCw,
    Clock,
    Package,
    Image,
    Activity,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    ChevronRight,
    AlertCircle,
    MoreVertical,
    ToggleRight,
    ToggleLeft,
    MapPin,
    Phone,
    Mail,
    Store,
    Star,
    Shield,
    CreditCard,
    Truck,
    Users,
    Download,
    Upload,
    Info,
    FileText,
    CheckCircle,
    X,
    Import,
    Edit,Archive
  } from "lucide-react";

  import {
    getStoreById,
    fetchCategoryProducts,
    fetchRestaurantCategories,
    createCategory,
    createProduct,
    deleteCategory,
    deleteProduct,
    updateProductById,
    toggleProductStatus,
    updateCategory,
    downloadCategoryTemplate,
    importCategoriesExcel,
    exportCategoriesExcel,
    bulkEditCategoriesExcel,
    exportProducts,
    bulkEditProducts,
    toggleCategoryStatus,
      archiveProduct, // Add this
  unarchiveProduct // Add this
  } from "../../../apis/adminApis/storeApi2";

  import { Link } from "react-router-dom";
  
  import CreateCategoryModal from "../../../components/catelog/CreateCategoryModal";
  // import toast from "react-hot-toast";
  import { toast } from "react-toastify";
  import AddProductPage from "../../../components/catelog/AddProductPage";
  import DeleteConfirmationModal from "../../../components/catelog/DeleteConfirmationModal";
  import ImportCategoriesModal from "../../../components/catelog/ImportCategoriesModal";
  import BulkEditCategoriesModal from "../../../components/catelog/BulkEditCategoriesModal";
  import ImportProductsModal from "../../../components/catelog/ImportProductsModal";
  import BulkEditProductsModal from "../../../components/catelog/BulkEditProductsModal";
  import { archiveCategory, unarchiveCategory } from "../../../apis/adminApis/storeApi";

  function CatelogManagement() {
    const id = useParams().id;

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [categoryDropdown, setCategoryDropdown] = useState(null);
    const [loading, setLoading] = useState({
      categories: false,
      products: false,
      store: false,
      actions: false,

      categoryCreate: false, // Separate for create
      categoryEdit: false, // Separate for edit
    });
    const [error, setError] = useState({
      categories: null,
      products: null,
      store: null,
    });

    const [showModal, setShowModal] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [productDropdown, setProductDropdown] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [deleteCategoryId, setDeleteCategoryId] = useState(null);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [deleteMode, setDeleteMode] = useState(""); // "category" | "product"
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showInactiveProducts, setShowInactiveProducts] = useState(false);
    const [openProductDropdown, setOpenProductDropdown] = useState(null);
    const [openCategoryDropdown, setOpenCategoryDropdown] = useState(null);
    const [showProdutDeleteModal, setShowProductDeleteModal] = useState(false);

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isProductImportModalOpen, setIsProductImportModalOpen] =
      useState(false);
    const [isBulkProductModalOpen, setIsBulkProductModalOpen] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [importStatus, setImportStatus] = useState(null); // 'uploading', 'success', 'error'
    const [importMessage, setImportMessage] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });



  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState({ top: 0, left: 0 });
const [productDropdownPosition, setProductDropdownPosition] = useState({ top: 0, left: 0 });
    const fileInputRef = useRef(null);

    // Format product data from backend to frontend structure
  // Format product data from backend to frontend structure
const formatProduct = (product) => ({
  id: product._id,
  _id: product._id,
  categoryId: product.categoryId,
  name: product.name,
  price: product.price,
  foodType: product.foodType,
  unit: product.unit,
  status: product.active ? "Active" : "Inactive",
  active: product.active,
  archived: product.archived || false, // Add this line
  archivedAt: product.archivedAt || null, // Add this line if you want to use it
  preparationTime: product.preparationTime,
  minOrderQty: product.minimumOrderQuantity,
  maxOrderQty: product.maximumOrderQuantity,
  availability: product.availability || "always",
  availableAfterTime: product.availableAfterTime || "",
  availableFromTime: product.availableFromTime || "",
  availableToTime: product.availableToTime || "",
  description: product.description,
  images: product.images || [],
  stock: product.enableInventory ? product.stock : undefined,
  enableInventory: product.enableInventory,
  reorderLevel: product.reorderLevel,
  isLowStock: product.enableInventory && product.stock < product.reorderLevel,
  costPrice: product.costPrice,
  revenueShare: product.revenueShare,
  specialOffer: product.specialOffer,
  restaurantId: product.restaurantId,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

    // Format category data from backend to frontend structure
  const formatCategory = (category) => ({
  _id: category._id,
  name: category.name,
  productCount: category.productCount || 0,
  isActive: category.active,
  active: category.active,
  archived: category.archived,
  images: category.images,
  description: category.description,
  availability: category.availability || 'always',
  availableAfterTime: category.availableAfterTime || '',
  availableFromTime: category.availableFromTime || '',
  availableToTime: category.availableToTime || '',
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});




    const fetchCategories = async () => {
  try {
    setLoading((prev) => ({ ...prev, categories: true }));
    const categoriesData = await fetchRestaurantCategories(id);
    const formattedCategories = categoriesData.map(formatCategory);

    console.log(formattedCategories)
    setCategories(formattedCategories);
  } catch (err) {
    console.error(err);
    setError((prev) => ({ ...prev, categories: err.message }));
    toast.error("Failed to load categories");
  } finally {
    setLoading((prev) => ({ ...prev, categories: false }));
  }
};

const handleDisableCategory = async (categoryId) => {
  try {
    const category = categories.find(cat => cat._id === categoryId);
    const categoryName = category?.name || 'Category';
    
    await toggleCategoryStatus(categoryId);
    await fetchCategories();
    
    toast.success(`🚫 "${categoryName}" has been disabled!`, {
      duration: 4000,
    });
  } catch (error) {
    console.error('Failed to disable category:', error);
    toast.error('❌ Failed to disable category');
  }
};

const handleEnableCategory = async (categoryId) => {
  try {
    const category = categories.find(cat => cat._id === categoryId);
    const categoryName = category?.name || 'Category';
    
    await toggleCategoryStatus(categoryId);
    await fetchCategories();
    
    toast.success(`✅ "${categoryName}" has been enabled!`, {
      duration: 4000,
    });
  } catch (error) {
    console.error('Failed to enable category:', error);
    toast.error('❌ Failed to enable category');
  }
};
    const handleCategoryCreate = async (newCategory) => {
      try {
        setLoading((prev) => ({ ...prev, actions: true })); // ✅ Start loading
        console.log("Creating category with data:", newCategory);
        const response = await createCategory(newCategory);
        setCategories((prevCategories) => [...prevCategories, response.data]);
        console.log("Category created successfully:", response);
        toast.success("Category created successfully");
        setIsCategoryModalOpen(false);
      } catch (err) {
        console.error("Error creating category:", err);
        setError((prev) => ({ ...prev, actions: err.message }));
        toast.error("Failed to create category");
      } finally {
        setLoading((prev) => ({ ...prev, actions: false })); // ✅ End loading
      }
    };





const handleUnarchiveProduct = async (productId) => {
  try {
    const product = products.find(p => p._id === productId);
    const productName = product?.name || 'Product';
    
    await unarchiveProduct(productId);
    
    // Refresh products to get updated archived status
    if (selectedCategory) {
      const productsData = await fetchCategoryProducts(id, selectedCategory);
      const formattedProducts = productsData.map(formatProduct);
      setProducts(formattedProducts);
    }
    
    toast.success(`🔄 "${productName}" has been unarchived!`);
  } catch (error) {
    console.error('Failed to unarchive product:', error);
    toast.error('❌ Failed to unarchive product');
  }
};

const handleArchiveProduct = async (productId) => {
  try {
    const product = products.find(p => p._id === productId);
    const productName = product?.name || 'Product';
    
    await archiveProduct(productId);
    
    // Refresh products to get updated archived status
    if (selectedCategory) {
      const productsData = await fetchCategoryProducts(id, selectedCategory);
      const formattedProducts = productsData.map(formatProduct);
      setProducts(formattedProducts);
    }
    
    toast.success(`📁 "${productName}" has been archived!`);
  } catch (error) {
    console.error('Failed to archive product:', error);
    toast.error('❌ Failed to archive product');
  }
};







    useEffect(() => {
      const fetchInitialData = async () => {
        try {
          setLoading((prev) => ({ ...prev, store: true, categories: true }));

          // Fetch restaurant details
          const restaurantData = await getStoreById(id);
          console.log(restaurantData, "dsfsdkfsdfsdfj");
          setRestaurant(restaurantData);

          const categoriesData = await fetchRestaurantCategories(id);
          const formattedCategories = categoriesData.map(formatCategory);

          console.log(categoriesData)
          setCategories(formattedCategories);

          if (formattedCategories.length > 0) {
            setSelectedCategory(formattedCategories[0]._id);
          }
        } catch (err) {
          console.error(err);
          setError((prev) => ({
            ...prev,
            store: err.message,
            categories: err.message,
          }));
          toast.error("Failed to load initial data");
        } finally {
          setLoading((prev) => ({ ...prev, store: false, categories: false }));
        }
      };

      fetchInitialData();
    }, [id]);

    useEffect(() => {
      if (!selectedCategory) return;

      const fetchProducts = async () => {
        setLoading((prev) => ({ ...prev, products: true }));
        setError((prev) => ({ ...prev, products: null }));

        try {
          const productsData = await fetchCategoryProducts(id, selectedCategory);
          const formattedProducts = productsData.map(formatProduct);
          setProducts(formattedProducts);
          if (formattedProducts.length > 0) {
            setSelectedProduct(formattedProducts[0].id);
          }
        } catch (err) {
          console.error(err);
          setError((prev) => ({ ...prev, products: err.message }));
          toast.error("Failed to load products");
        } finally {
          setLoading((prev) => ({ ...prev, products: false }));
        }
      };

      fetchProducts();
    }, [id, selectedCategory]);

   const toggleProductDropdown = (productId, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
  
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left - 150, // Adjust based on your dropdown width
    });
    
    setProductDropdown(productDropdown === productId ? null : productId);
    setCategoryDropdown(null); // Close category dropdown if open
  };

     const toggleCategoryDropdown = (categoryId, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left - 150, // Adjust based on your dropdown width
    });
    
    setCategoryDropdown(categoryDropdown === categoryId ? null : categoryId);
    setProductDropdown(null); // Close product dropdown if open
  };


   useEffect(() => {
    const handleClickOutside = () => {
      setCategoryDropdown(null);
      setProductDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

   const handleProductCreate = async (productData) => {
  try {
    setLoading((prev) => ({ ...prev, products: true }));
    console.log("Product before create:", productData);

    // 1. Split images into existing (URLs) and new (Files)
    const newImages = productData.images.filter((img) => img instanceof File);
    const existingImages = productData.images.filter(
      (img) => typeof img === "string"
    );

    // 2. Prepare product data with proper time fields based on availability
    const preparedProductData = {
      ...productData,
      images: existingImages, // keep only URLs in productData
      
      // Handle time fields based on availability type
      ...(productData.availability === "time-based" && {
        availableAfterTime: productData.availableAfterTime,
        availableFromTime: null,
        availableToTime: null
      }),
      ...(productData.availability === "time-range" && {
        availableFromTime: productData.availableFromTime,
        availableToTime: productData.availableToTime,
        availableAfterTime: null
      }),
      ...(productData.availability === "always" && {
        availableAfterTime: null,
        availableFromTime: null,
        availableToTime: null
      }),
      ...(productData.availability === "out-of-stock" && {
        availableAfterTime: null,
        availableFromTime: null,
        availableToTime: null
      })
    };

    console.log("Sending product data for creation:", preparedProductData);

    // 3. Call API with correct params
    const response = await createProduct(preparedProductData, id, selectedCategory);
    
    // 4. Format response
    const formattedData = formatProduct(response.data);

    // 5. Update UI state
    setProducts((prevProducts) => [...prevProducts, formattedData]);
    setSelectedProduct(response.data._id);
    setLoading((prev) => ({ ...prev, products: false }));
    toast.success("Product created successfully");
    setIsProductModalOpen(false);
  } catch (err) {
    console.error("Error creating product:", err);
    setError((prev) => ({ ...prev, products: err.message }));
    setLoading((prev) => ({ ...prev, products: false }));
    toast.error("Failed to create product");
  }
};
 const handleEditProduct = async (product) => {
  try {
    setLoading((prev) => ({ ...prev, products: true }));
    console.log("Product before update:", product);

    // 1. Split images into existing (URLs) and new (Files)
    const newImages = product.images.filter((img) => img instanceof File);
    const existingImages = product.images.filter(
      (img) => typeof img === "string"
    );

    // 2. Prepare product data with proper time fields based on availability
    const productData = {
      ...product,
      images: existingImages, // keep only URLs in productData
      
      // Handle time fields based on availability type
      ...(product.availability === "time-based" && {
        availableAfterTime: product.availableAfterTime,
        availableFromTime: null,
        availableToTime: null
      }),
      ...(product.availability === "time-range" && {
        availableFromTime: product.availableFromTime,
        availableToTime: product.availableToTime,
        availableAfterTime: null
      }),
      ...(product.availability === "always" && {
        availableAfterTime: null,
        availableFromTime: null,
        availableToTime: null
      }),
      ...(product.availability === "out-of-stock" && {
        availableAfterTime: null,
        availableFromTime: null,
        availableToTime: null
      })
    };

    console.log("Sending product data:", productData);

    // 3. Call API with correct params
    const response = await updateProductById(
      product._id,
      productData, // send prepared product data
      product.imagesToRemove || [], // tell backend which to remove
      newImages // upload these
    );

    // 4. Format response
    const formattedData = formatProduct(response.data);

    // 5. Update UI state
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p._id === product._id ? formattedData : p))
    );
    setLoading((prev) => ({ ...prev, products: false }));
    toast.success("Product updated successfully");
    setIsEditProductModalOpen(false);
  } catch (error) {
    setLoading((prev) => ({ ...prev, products: false }));
    console.error("Update failed:", error);
    toast.error("Failed to update product");
  }
};

    const handleEdit = (categoryId, e) => {
      e.stopPropagation();
      // Implement category edit logic here
      console.log("Edit category:", categoryId);
      setOpenCategoryDropdown(null);
    };

    // const toggleCategoryStatus = (categoryId, e) => {
    //   e.stopPropagation();

    //   console.log("Toggle category status:", categoryId);
    //   setOpenCategoryDropdown(null);
    // };

    const handleViewDetails = (productId, e) => {
      e.stopPropagation();
      setSelectedProduct(productId);
      setOpenProductDropdown(null);
    };

    const handleDelete = async (productId, e) => {
      e.stopPropagation();
      setDeleteProductId(productId);
      setDeleteMode("product");
      setShowModal(true);
      setOpenProductDropdown(null);
    };
const handleEditCategory = async (editedCategory) => {
  try {
    setLoading((prev) => ({ ...prev, actions: true }));

    console.log("Editing category with data:", editedCategory);

    // Extract data for the API call
    const {
      imageFiles = [],
      imagesToRemove = [],
      _id,
      ...categoryData
    } = editedCategory;

    // Prepare the data for API call - include ALL fields
    const apiData = {
      name: categoryData.name,
      description: categoryData.description,
      availability: categoryData.availability,
      restaurantId: categoryData.restaurantId,
      // Convert active to boolean string for FormData
      active: categoryData.active === 'true' ? 'true' : String(Boolean(categoryData.active)),
      autoOnOff: categoryData.autoOnOff || 'false',
      // Include ALL time fields - let backend handle which ones to use
      availableAfterTime: categoryData.availableAfterTime,
      availableFromTime: categoryData.availableFromTime,
      availableToTime: categoryData.availableToTime
    };

    console.log("Sending to API:", apiData);

    // Call the update API with prepared data
    const response = await updateCategory(
      _id, // category ID
      apiData, // category data
      imagesToRemove, // images to remove
      imageFiles // new images to upload
    );

    // Format the response
    const formattedCategory = formatCategory(response.data);

    // Update the categories list
    setCategories((prev) =>
      prev.map((c) => (c._id === _id ? formattedCategory : c))
    );

    // If we're editing the currently selected category, update it too
    if (selectedCategory === _id) {
      setSelectedCategory(_id);
    }

    toast.success("Category updated successfully");
    setIsEditCategoryModalOpen(false);
  } catch (error) {
    console.error("Error updating category:", error);
    toast.error("Failed to update category");
  } finally {
    setLoading((prev) => ({ ...prev, actions: false }));
  }
};
    const handleExport = async () => {
      try {
        setImportStatus("uploading");
        setImportMessage("Generating Excel file...");

        await exportCategoriesExcel(id);

        setImportStatus("success");
        setImportMessage("✅ Categories exported successfully!");
      } catch (error) {
        setImportStatus("error");
        setImportMessage("❌ Failed to export categories.");
      }
    };

    const handleExportProduct = async () => {
      try {
        setImportStatus("uploading");
        setImportMessage("Generating Excel file...");

        await exportProducts(id);

        setImportStatus("success");
        setImportMessage("✅ Categories exported successfully!");
      } catch (error) {
        setImportStatus("error");
        setImportMessage("❌ Failed to export categories.");
      }
    };

  const handleProductDelete = async (productId) => {
  try {
    // Validate productId
    if (!productId) {
      toast.error("Invalid product ID");
      return;
    }
    
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    await deleteProduct(productId);

    toast.success("Product deleted successfully");
    
    // Reset states
    setShowModal(false);
    setDeleteProductId(null);
    setDeleteMode("");
    
    // If the deleted product was selected, clear the selection
    if (selectedProduct === productId) {
      setSelectedProduct(null);
    }
  } catch (error) {
    console.log(error);
    toast.error("Failed to delete product");
    
    // Reset states
    setShowModal(false);
    setDeleteProductId(null);
    setDeleteMode("");
  }
};

    const handleToggleProductActive = async (id) => {
      try {
        const response = await toggleProductStatus(id);
        // console.log(response)

        const product = response.data;
        const formattedData = formatProduct(product);

        setProducts((prevProducts) =>
          prevProducts.map((p) => (p._id === product._id ? formattedData : p))
        );

        if (product.active) {
          toast.success("✅ Product is now available");
        } else {
          toast.info("🚫 Product is now unavailable");
        }
      } catch (error) {}
    };

    const HandleDeleteCategory = async (categoryId) => {
  try {
    console.log("Deleting category with ID:", categoryId);
    
    // Validate categoryId
    if (!categoryId) {
      toast.error("Invalid category ID");
      return;
    }
    
    // Optimistically update UI
    const originalCategories = [...categories];
    const originalProducts = [...products];

    setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    setProducts((prev) => prev.filter((p) => p.categoryId !== categoryId));

    await deleteCategory(categoryId);
    toast.success("Category deleted successfully");
    
    // Reset states
    setShowModal(false);
    setDeleteCategoryId(null);
    setDeleteMode("");
  } catch (error) {
    console.error("Error deleting category:", error);
    // Rollback state if API fails
    setCategories(originalCategories);
    setProducts(originalProducts);
    toast.error("Failed to delete category");
    
    // Reset states
    setShowModal(false);
    setDeleteCategoryId(null);
    setDeleteMode("");
  }
};

    const resetImportModal = () => {
      setIsImportModalOpen(false);
      setUploadedFile(null);
      setImportStatus(null);
      setImportMessage("");
    };
    const filteredProducts = products.filter((product) => {
      const matchesCategory = product.categoryId === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    const currentProduct = products.find(
      (product) => product.id === selectedProduct
    );
    const selectedCategoryData = categories.find(
      (cat) => cat._id === selectedCategory
    );

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadedFile(file);
      }
    };

    const handleDownloadTemplate = async () => {
      try {
        await downloadCategoryTemplate();
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const resetBulkModal = () => {
      setIsBulkModalOpen(false);
      setUploadedFile(null);
      setImportStatus("");
      setImportMessage("");
    };

    const importCategories = async () => {
      if (!uploadedFile) {
        setImportStatus("error");
        setImportMessage("Please select a file before uploading.");
        return;
      }

      try {
        setImportStatus("uploading");
        setImportMessage("Uploading and processing file...");

        const result = await importCategoriesExcel(id, uploadedFile);

        setImportStatus("success");
        setImportMessage(`✅ Imported ${result.count} categories successfully!`);

        console.log("Imported categories:", result.savedCategories);

        // Update categories: replace updated ones, add new ones
        setCategories((prev) => {
          const updated = [...prev];
          result.savedCategories.forEach((cat) => {
            const index = updated.findIndex((c) => c._id === cat._id);
            if (index >= 0) {
              updated[index] = cat; // update existing
            } else {
              updated.push(cat); // add new
            }
          });
          return updated;
        });

        setUploadedFile(null);
        setIsImportModalOpen(false);
      } catch (error) {
        console.error("Error importing Excel:", error);
        setImportStatus("error");
        setImportMessage(
          "❌ Failed to import categories. Please check the file format."
        );
      }
    };






 
const handleArchiveCategory = async (categoryId) => {
  try {   toast.success('Category archived successfully! 📁');
    await archiveCategory(categoryId);
    await fetchCategories();
 
  } catch (error) {
    console.error('Failed to archive category:', error);
    toast.error('Failed to archive category');
  }
};
  const handleUnarchiveCategory = async (categoryId) => {
  try {
    await unarchiveCategory(categoryId);
    await fetchCategories();
    toast.success('Category unarchived successfully! 🔄');
  } catch (error) {
    console.error('Failed to unarchive category:', error);
    toast.error('Failed to restore category');
  }
};


    






    const handleImportExcel = async () => {
      if (!uploadedFile) {
        setImportStatus("error");
        setImportMessage("Please select a file before uploading.");
        return;
      }

      try {
        setImportStatus("uploading");
        setImportMessage("Uploading and processing file...");

        const result = await importCategoriesExcel(id, uploadedFile);

        setImportStatus("success");
        setImportMessage(`✅ Imported ${result.count} categories successfully!`);

        console.log("Imported categories:", result.savedCategories);
        setCategories((prev) => [...prev, ...result.savedCategories]);

        // Reset file
        setUploadedFile(null);

        // Close modal after success
        setIsImportModalOpen(false);
      } catch (error) {
        console.error("Error importing Excel:", error);
        setImportStatus("error");
        setImportMessage(
          "❌ Failed to import categories. Please check the file format."
        );
      }
    };

    const handleBulkEditProducts = async () => {
      if (!uploadedFile) {
        setImportStatus("error");
        setImportMessage("Please select a file before uploading.");
        return;
      }

      try {
        setImportStatus("uploading");
        setImportMessage("Uploading and processing product file...");

        // Prepare FormData
        const formData = new FormData();
        formData.append("file", uploadedFile);
        // formData.append("restaurantId", id); // if backend expects restaurantId

        // Send FormData instead of raw file
        const result = await bulkEditProducts(id, formData);

        setImportStatus("success");
        setImportMessage(
          `✅ Updated ${result.updatedCount} products successfully!`
        );

        console.log("Updated products:", result.updatedProducts);

        // ✅ Update local state with edited products
        if (result.updatedProducts && result.updatedProducts.length > 0) {
          const formattedUpdates = result.updatedProducts.map((p) =>
            formatProduct(p)
          );

          setProducts((prev) =>
            prev.map((prod) => {
              const updated = formattedUpdates.find((p) => p._id === prod._id);
              return updated ? updated : prod;
            })
          );
        }

        // Reset file
        setUploadedFile(null);

        // Close modal after success
        setIsBulkModalOpen(false);

        // Show toast
        toast.success(`✅ ${result.updatedCount} products updated successfully!`);
      } catch (error) {
        console.error("Error bulk editing products:", error);
        setImportStatus("error");
        setImportMessage(
          "❌ Failed to update products. Please check the file format."
        );
        toast.error("❌ Bulk update failed");
      }
    };

    const getStatusColor = (status) => {
      return status === "Active"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-red-100 text-red-800 border-red-200";
    };

    const getFoodTypeColor = (foodType) => {
      return foodType === "veg"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-orange-100 text-orange-800 border-orange-200";
    };
    const getApprovalStatusColor = (status) => {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-800 border-green-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "rejected":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getStoreTypeColor = (type) => {
      switch (type) {
        case "restaurant":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "pharmacy":
          return "bg-purple-100 text-purple-800 border-purple-200";
        case "grocery":
          return "bg-green-100 text-green-800 border-green-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div>
          {isCategoryModalOpen && (
            <CreateCategoryModal
              restaurantId={id}
              onSuccess={handleCategoryCreate}
              onClose={() => setIsCategoryModalOpen(false)}
              loading={loading.actions}
            />
          )}
        </div>

        <div>
          {isEditCategoryModalOpen && (
            <CreateCategoryModal
              restaurantId={id}
              onSuccess={handleEditCategory}
              onClose={() => setIsEditCategoryModalOpen(false)}
              initialData={editingCategory}
              isEditMode={true}
              loading={loading.actions}
            />
          )}
        </div>

        <div>
          {isEditProductModalOpen && (
            <AddProductPage
              onAddProduct={handleEditProduct}
              onClose={() => setIsEditProductModalOpen(false)}
              initialData={editingProduct}
              isEditMode={true}
              loading={loading.products}
            />
          )}
        </div>

        <div>
          {isProductModalOpen && (
            <AddProductPage
              onAddProduct={handleProductCreate}
              onClose={() => setIsProductModalOpen(false)}
              loading={loading.products}
            />
          )}
        </div>

        {/* <DeleteConfirmationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            HandleDeleteCategory(deleteCategoryId);
          }}
          title="Delete Product"
          itemName="Onion Rings"
          message="This product will be permanently removed from your menu and cannot be recovered."
        /> */}

      <DeleteConfirmationModal
  isOpen={showModal}
  onClose={() => {
    setShowModal(false);
    setDeleteCategoryId(null);
    setDeleteProductId(null);
  }}
  onConfirm={() => {
    if (deleteMode === "category" && deleteCategoryId) {
      HandleDeleteCategory(deleteCategoryId);
    } else if (deleteMode === "product" && deleteProductId) {
      handleProductDelete(deleteProductId);
    }
  }}
  title={deleteMode === "category" ? "Delete Category" : "Delete Product"}
  itemName={
    deleteMode === "category" 
      ? categories.find(cat => cat._id === deleteCategoryId)?.name || "this category"
      : products.find(prod => prod._id === deleteProductId)?.name || "this product"
  }
  message={
    deleteMode === "category" 
      ? "This category and all its products will be permanently removed from your menu and cannot be recovered."
      : "This product will be permanently removed from your menu and cannot be recovered."
  }
/>
        {/* <div className="w-full mx-auto p-4 sm:p-6">
          {restaurant && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 mr-4"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back
                  </button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                      <Store className="h-8 w-8" />
                      {restaurant.name}
                    </h1>
                    <p className="text-blue-100 mt-1">
                      Manage menu categories and products for your restaurant
                    </p>
                  </div>
                  {restaurant.images && restaurant.images.length > 0 && (
                    <div className="hidden md:block">
                      <img
                        src={restaurant.images[0]}
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                      />
                    </div>
                  )}
                </div>
              </div>

             
            </div>
          )}
        </div> */}
        <div className="w-full mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden ">
            <div className="p-6">


  <div className="flex items-center gap-2 mb-4">
        <Store className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          {restaurant?.name || "Restaurant"} - Catalog Management
        </h2>
      </div>
                <div className="border-b border-gray-200">
                      <div className="container mx-auto px-4">
                        <ul className="flex space-x-8">
                          <li>
                            <Link
                              to={`/admin/dashboard/merchants/merchant-config/${id}`}
                              className={`px-4 py-3 block ${
                                location.pathname ===
                                `/admin/dashboard/merchants/merchant-config/${id}`
                                  ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              Configurations
                            </Link>
                          </li>
                          <li>
                            <Link
                              to={`/admin/dashboard/merchants/merchant-catelogue/${id}`}
                              className={`px-4 py-3 block ${
                                location.pathname ===
                                `/admin/dashboard/merchants/merchant-catelogue/${id}`
                                  ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              Catalogue
                            </Link>
                          </li>
                          <li>
                            <Link
                              to={`/admin/dashboard/merchants/merchant-details/${id}`}
                              className={`px-4 py-3 block ${
                                location.pathname ===
                                `/admin/dashboard/merchants/merchant-details/${id}`
                                  ? "border-b-2 border-orange-500 text-orange-500 font-medium"
                                  : "text-gray-500"
                              }`}
                            >
                              Merchant
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
              {/* Search and Filter Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                


                

             
                  {/* Search and Filter Bar */}
                  {/* <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium"
                        onClick={() => {
                          if (selectedCategory) {
                            const fetchProducts = async () => {
                              try {
                                setLoading((prev) => ({
                                  ...prev,
                                  products: true,
                                }));
                                const productsData = await fetchCategoryProducts(
                                  id,
                                  selectedCategory
                                );
                                const formattedProducts =
                                  productsData.map(formatProduct);
                                setProducts(formattedProducts);
                              } catch (err) {
                                toast.error("Failed to refresh products");
                              } finally {
                                setLoading((prev) => ({
                                  ...prev,
                                  products: false,
                                }));
                              }
                            };
                            fetchProducts();
                          }
                        }}
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>
                  </div> */}

                  {/* Import and Bulk Edit Buttons */}
                  {/* <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => setIsProductImportModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Import Products</span>
                    </button>

                    <button
                      onClick={() => setIsBulkProductModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Bulk Edit Products</span>
                    </button>
                  </div> */}
             
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[700px]">
                {/* Categories Column */}
                {/* <div className="xl:col-span-3">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Filter size={18} className="text-blue-600" />
                        Categories
                      </h2>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {categories.length}
                      </span>
                    </div>

                    <div className="space-y-3 mb-5">
        
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsImportModalOpen(true)}
                              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-2 rounded-lg shadow-sm transition-colors flex-1 justify-center"
                            >
                              <Upload size={16} />
                              Import
                            </button>

                            <button
                              onClick={() => setIsBulkModalOpen(true)}
                              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-2 rounded-lg shadow-sm transition-colors flex-1 justify-center"
                            >
                              <Upload size={16} />
                              Bulk edit
                            </button>
                          </div>
                      
                        </div>
                      </div>

                  
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          onClick={() => setSelectedCategory(category._id)}
                          className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                            selectedCategory === category._id
                              ? "bg-blue-50 border-blue-300 shadow-md transform scale-[1.02]"
                              : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  category.isActive
                                    ? "bg-green-400"
                                    : "bg-gray-400"
                                }`}
                              />
                              <span className="font-semibold text-gray-800">
                                {category.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                {category.productCount}
                              </span>
                              <div className="relative">
                                <button
                                  onClick={(e) =>
                                    toggleCategoryDropdown(category._id, e)
                                  }
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {openCategoryDropdown === category._id && (
                                  <div
                                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        setEditingCategory(category);
                                        setIsEditCategoryModalOpen(true);
                                      }}
                                    >
                                      <Edit3 size={14} className="mr-2" />
                                      Edit Category
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeleteCategoryId(category._id);
                                        setShowModal(true);

                                        setDeleteMode("category");
                                      }}
                                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      <Trash2 size={14} className="mr-2" />
                                      Delete Category
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      onClick={() => setIsCategoryModalOpen(true)}
                    >
                      <Plus size={18} />
                      Add New Category
                    </button>
                  </div>
                </div> */}

                {/* Categories Column */}
            <div className="lg:col-span-3 bg-white">
  <div className="p-3 border-b border-gray-200">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-gray-800 text-base">
        Category ({categories.length})
      </h3>
      <button
        className="p-1 text-red-600 hover:text-red-700 transition-colors"
        onClick={() => setIsCategoryModalOpen(true)}
      >
        <Plus size={24} />
      </button>
    </div>
  </div>

  <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
    {categories.map((category) => (
      <div
        key={category._id}
        onClick={() => setSelectedCategory(category._id)}
        className={`w-full p-3 flex justify-between items-center cursor-pointer transition-all duration-150 rounded-lg border ${
          selectedCategory === category._id
            ? "bg-gray-100 border-gray-300 shadow-sm"
            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
        }`}
      >
        <span
          className={`text-sm uppercase truncate ${
            selectedCategory === category._id
              ? "font-bold text-gray-800"
              : "font-medium text-gray-700"
          }`}
        >
          {category.name}
        </span>

        <div className="relative">
          <button
            onClick={(e) => toggleCategoryDropdown(category._id, e)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    ))}
  </div>

{/* Category Dropdown - FIXED */}
{categoryDropdown && (
  <div
    className="absolute z-[9999] bg-white rounded-md shadow-lg border border-gray-200 w-56"
    style={{
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Archive/Unarchive Option - FIRST */}
    {categories.find(c => c._id === categoryDropdown)?.archived ? (
      <button
        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          handleUnarchiveCategory(categoryDropdown);
          setCategoryDropdown(null);
        }}
      >
        <Archive size={14} />
        Unarchive Category
      </button>
    ) : (
      <button
        className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          handleArchiveCategory(categoryDropdown);
          setCategoryDropdown(null);
        }}
      >
        <Archive size={14} />
        Archive Category
      </button>
    )}

    {/* Add Product Option - SECOND */}
    <button
      className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 flex items-center gap-2"
      onClick={(e) => {
        e.stopPropagation();
        // Set the selected category and open product modal
        setSelectedCategory(categoryDropdown);
        setIsProductModalOpen(true);
        setCategoryDropdown(null);
      }}
    >
      <Plus size={14} />
      Add Product
    </button>

    {/* Disable/Enable Category Option - THIRD */}
    {categories.find(c => c._id === categoryDropdown)?.active ? (
      <button
        className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          // You'll need to implement handleDisableCategory function
          handleDisableCategory(categoryDropdown);
          setCategoryDropdown(null);
        }}
      >
        <EyeOff size={14} />
        Disable Category
      </button>
    ) : (
      <button
        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100 flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          // You'll need to implement handleEnableCategory function
          handleEnableCategory(categoryDropdown);
          setCategoryDropdown(null);
        }}
      >
        <Eye size={14} />
        Enable Category
      </button>
    )}

    {/* Edit Category Option - FOURTH */}
    <button
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      onClick={(e) => {
        e.stopPropagation();
        const category = categories.find(c => c._id === categoryDropdown);
        setEditingCategory(category);
        setIsEditCategoryModalOpen(true);
        setCategoryDropdown(null);
      }}
    >
      <Edit3 size={14} />
      Edit Category
    </button>

    {/* Delete Category Option - FIFTH */}
   <button
  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
  onClick={(e) => {
    e.stopPropagation();
    setDeleteCategoryId(categoryDropdown); // FIXED: Proper function call
    setDeleteMode("category");
    setShowModal(true);
    setCategoryDropdown(null);
  }}
>
      <Trash2 size={14} />
      Delete Category
    </button>
  </div>
)}
</div>

{console.log("category dletet i d",deleteCategoryId)}

                <ImportCategoriesModal
                  isOpen={isImportModalOpen}
                  onClose={resetImportModal}
                  handleDownloadTemplate={handleDownloadTemplate}
                  handleImportExcel={handleImportExcel}
                  fileInputRef={fileInputRef}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  importStatus={importStatus}
                  importMessage={importMessage}
                  handleFileSelect={handleFileSelect}
                />

                <BulkEditCategoriesModal
                  isOpen={isBulkModalOpen}
                  onClose={resetBulkModal}
                  handleDownloadTemplate={() => {}}
                  handleExportCurrent={handleExport}
                  handleImportExcel={importCategories}
                  fileInputRef={fileInputRef}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  importStatus={importStatus}
                  importMessage={importMessage}
                  handleFileSelect={handleFileSelect}
                />

                <ImportProductsModal
                  isOpen={isProductImportModalOpen}
                  onClose={() => {
                    setIsProductImportModalOpen(false);
                  }}
                  handleDownloadTemplate={handleDownloadTemplate}
                  handleImportExcel={() => {}}
                  fileInputRef={fileInputRef}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  importStatus={importStatus}
                  importMessage={importMessage}
                  handleFileSelect={handleFileSelect}
                />

                <BulkEditProductsModal
                  isOpen={isBulkProductModalOpen}
                  onClose={() => {
                    setIsBulkProductModalOpen(false);
                  }}
                  handleDownloadTemplate={() => {}}
                  handleExportCurrent={handleExportProduct}
                  handleImportExcel={handleBulkEditProducts}
                  fileInputRef={fileInputRef}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  importStatus={importStatus}
                  importMessage={importMessage}
                  handleFileSelect={handleFileSelect}
                />

                {/* Products Column */}

                {/* Products Column */}
                <div className="xl:col-span-3">
  <div className="bg-white rounded-xl h-full border border-gray-200">
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 className="text-base font-semibold text-gray-800">
        Product ({filteredProducts.length})
      </h2>
      <div className="flex items-center gap-2">
        <button className="p-1 text-gray-500 hover:text-red-600 transition-colors">
          <Search size={20} />
        </button>
        <button 
          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
          onClick={() => setIsProductModalOpen(true)}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>

    {loading.products ? (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    ) : (
      <>
        <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product._id)}
                className={`w-full p-3 flex justify-between items-center cursor-pointer transition-all duration-150 rounded-lg border ${
                  selectedProduct === product._id
                    ? "bg-gray-100 border-gray-300 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span
                  className={`text-sm uppercase truncate ${
                    selectedProduct === product._id
                      ? "font-bold text-gray-800"
                      : "font-medium text-gray-500"
                  }`}
                >
                  {product.name}
                </span>

                <div className="relative">
                  <button
                    onClick={(e) => toggleProductDropdown(product._id, e)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded-md transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-red-300" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </>
    )}
  </div>

  {/* Product Dropdown - FIXED */}
{productDropdown && (
  <div
    className="fixed z-[9999] bg-white rounded-md shadow-lg border border-gray-200 w-48"
    style={{
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {/* Archive/Unarchive Option - FIRST */}
    {products.find(p => p._id === productDropdown)?.archived ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleUnarchiveProduct(productDropdown);
          setProductDropdown(null);
        }}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
      >
        <Archive size={14} className="mr-2" />
        Unarchive Product
      </button>
    ) : (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleArchiveProduct(productDropdown);
          setProductDropdown(null);
        }}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
      >
        <Archive size={14} className="mr-2" />
        Archive Product
      </button>
    )}

    {/* Edit Product Option - SECOND */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        const product = products.find(p => p._id === productDropdown);
        setEditingProduct(product);
        setIsEditProductModalOpen(true);
        setProductDropdown(null);
      }}
      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <Edit3 size={14} className="mr-2" />
      Edit Product
    </button>

    {/* Toggle Availability Option - THIRD */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleToggleProductActive(productDropdown);
        setProductDropdown(null);
      }}
      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {products.find(p => p._id === productDropdown)?.active ? (
        <>
          <ToggleRight size={14} className="mr-2 text-green-600" />
          Set Unavailable
        </>
      ) : (
        <>
          <ToggleRight size={14} className="mr-2 text-red-600" />
          Set Available
        </>
      )}
    </button>

    {/* View Details Option - FOURTH */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedProduct(productDropdown);
        setProductDropdown(null);
      }}
      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <Eye size={14} className="mr-2" />
      View Details
    </button>

    {/* Delete Option - FIFTH */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setDeleteProductId(productDropdown);
        setDeleteMode("product");
        setShowModal(true);
        setProductDropdown(null);
      }}
      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
    >
      <Trash2 size={14} className="mr-2" />
      Delete
    </button>
  </div>
)}
</div>

   
                {/* Product Details Column */}
                <div className="xl:col-span-6">
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-5 h-full border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Edit3 size={18} className="text-purple-600" />
                        Product Details
                      </h2>
                      {currentProduct && (
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {currentProduct ? (
                      <div className="space-y-5 max-h-[600px] overflow-y-auto">
                        {/* Alert for Low Stock */}
                        {currentProduct.enableInventory &&
                          currentProduct.isLowStock && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                              <AlertCircle
                                className="text-red-500 flex-shrink-0"
                                size={20}
                              />
                              <div>
                                <p className="font-medium text-red-800">
                                  Low Stock Alert!
                                </p>
                                <p className="text-sm text-red-600">
                                  Current stock ({currentProduct.stock}) is below
                                  reorder level ({currentProduct.reorderLevel})
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Basic Information */}
                        {/* Basic Information Card with Image */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          {/* Header with title */}
                          <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Activity size={18} className="text-blue-600" />
                              Basic Information
                            </h3>
                          </div>

                          {/* Content with image and details */}
                          <div className="p-5">
                            <div className="flex flex-col md:flex-row gap-5">
                              {/* Product Image */}
                              <div className="w-full md:w-1/3 flex-shrink-0">
                                {currentProduct.images?.length > 0 ? (
                                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                    <img
                                      src={currentProduct.images[0]}
                                      alt={currentProduct.name}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <Image size={40} className="text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Product Name
                                  </label>
                                  <p className="text-gray-900 font-semibold text-lg">
                                    {currentProduct.name}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Price
                                  </label>
                                  <p className="text-green-600 font-bold text-xl">
                                    ${currentProduct.price}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Food Type
                                  </label>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFoodTypeColor(
                                      currentProduct.foodType
                                    )}`}
                                  >
                                    {currentProduct.foodType === "veg"
                                      ? "🍏 Veg"
                                      : "🍗 Non-Veg"}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Unit
                                  </label>
                                  <p className="text-gray-900 font-medium capitalize">
                                    {currentProduct.unit}
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-500">
                                    Status
                                  </label>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                      currentProduct.status
                                    )}`}
                                  >
                                    {currentProduct.status === "Active"
                                      ? "✅ Active"
                                      : "❌ Inactive"}
                                  </span>
                                </div>

                                {currentProduct.description && (
                                  <div className="sm:col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-gray-500">
                                      Description
                                    </label>
                                    <p className="text-gray-700">
                                      {currentProduct.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Operational Details */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-orange-600" />
                            Operational Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <Clock
                                size={18}
                                className="text-blue-600 flex-shrink-0"
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Preparation Time
                                </label>
                                <p className="text-gray-900 font-semibold">
                                  {currentProduct.preparationTime} minutes
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <Package
                                size={18}
                                className="text-green-600 flex-shrink-0"
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Allowed Order Quantity
                                </label>
                                <p className="text-gray-900 font-semibold">
                                  Min: {currentProduct.minOrderQty} | Max:{" "}
                                  {currentProduct.maxOrderQty}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Clock
                                size={18}
                                className="text-purple-600 flex-shrink-0"
                              />
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Available From
                                </label>
                                <p className="text-gray-900 font-semibold">
                                  {currentProduct.availabilityTime}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium text-gray-600 block mb-2">
                              Description
                            </label>
                            <p className="text-gray-900 leading-relaxed">
                              {currentProduct.description}
                            </p>
                          </div>
                        </div>

                        {/* Images */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Image size={16} className="text-indigo-600" />
                            Product Images
                            <span className="text-sm font-normal text-gray-500">
                              ({currentProduct.images.length})
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {currentProduct.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Product ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors duration-200"
                                />
                                <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                            <button className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all duration-200 group">
                              <Plus
                                size={20}
                                className="text-gray-400 group-hover:text-indigo-600"
                              />
                            </button>
                          </div>
                        </div>

                        {/* Inventory - Only show if inventory is enabled */}
                        {currentProduct.enableInventory && (
                          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <Package size={16} className="text-emerald-600" />
                              Inventory Management
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <label className="text-sm font-medium text-gray-600 block mb-1">
                                  Current Stock
                                </label>
                                <p className="text-2xl font-bold text-emerald-600">
                                  {currentProduct.stock}{" "}
                                  <span className="text-sm font-normal text-gray-600">
                                    {currentProduct.unit}
                                  </span>
                                </p>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <label className="text-sm font-medium text-gray-600 block mb-1">
                                  Reorder Level
                                </label>
                                <p className="text-2xl font-bold text-orange-600">
                                  {currentProduct.reorderLevel}{" "}
                                  <span className="text-sm font-normal text-gray-600">
                                    {currentProduct.unit}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Stock Status Bar */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                  Stock Level
                                </span>
                                <span className="text-sm text-gray-500">
                                  {Math.round(
                                    (currentProduct.stock /
                                      (currentProduct.reorderLevel * 3)) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    currentProduct.isLowStock
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (currentProduct.stock /
                                        (currentProduct.reorderLevel * 3)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Backend Fields */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            Additional Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Cost Price
                              </label>
                              <p className="text-gray-900 font-medium">
                                ${currentProduct.costPrice}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Created At
                              </label>
                              <p className="text-gray-900 font-medium">
                                {new Date(
                                  currentProduct.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-600">
                                Last Updated
                              </label>
                              <p className="text-gray-900 font-medium">
                                {new Date(
                                  currentProduct.updatedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <Package size={64} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No Product Selected
                        </h3>
                        <p className="text-center text-gray-500 max-w-md">
                          Select a product from the list to view and edit its
                          details, manage inventory, and update images.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default CatelogManagement;
