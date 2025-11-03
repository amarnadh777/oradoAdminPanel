import { useState, useEffect, useRef } from "react";
import {
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiPlus,
  FiChevronDown,
  FiInfo,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getAdminOrders } from "../../../apis/adminApis/adminFuntionsApi";
import { Link } from "react-router-dom";
import { updateOrderStatus } from "../../../apis/adminApis/orderApi";
import socket, {
  connectSocket,
  disconnectSocket,
} from "../../../services/socket";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrdersTable = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "orderTime",
    direction: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState({});
  const notificationSound = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit] = useState(30); // Items per page

  const tabs = [
    "All",
    "pending",
    "accepted_by_restaurant",
    "rejected_by_restaurant",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled_by_customer",
  ];

  const adminStatusOptions = [
    "pending",
    "accepted_by_restaurant",
    "rejected_by_restaurant",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled_by_customer",
  ];

  const statusDisplayNames = {
    pending: "Pending",
    pending_agent_acceptance: "Pending Agent",
    accepted_by_restaurant: "Accepted",
    rejected_by_restaurant: "Rejected",
    preparing: "Preparing",
    ready: "Ready",
    assigned_to_agent: "Assigned",
    picked_up: "Picked Up",
    on_the_way: "On The Way",
    out_for_delivery: "Out for Delivery",
    reached_customer: "Reached Customer",
    in_progress: "In Progress",
    arrived: "Arrived",
    completed: "Completed",
    delivered: "Delivered",
    cancelled_by_customer: "Cancelled",
    awaiting_agent_assignment: "Awaiting Agent",
    rejected_by_agent: "Agent Rejected",
  };

  // Payment status display names
  const paymentStatusDisplayNames = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
    cancelled: "Cancelled",
  };

  // Payment method display names
  const paymentMethodDisplayNames = {
    cash: "Cash",
    card: "Card",
    online:"Online",
    upi: "UPI",
    wallet: "Wallet",
    netbanking: "Net Banking",
  };

  // Delivery mode display names
  const deliveryModeDisplayNames = {
    delivery: "Delivery",
    pickup: "Pickup",
    dine_in: "Dine In",
  };

  // Delivery type display names
  const deliveryTypeDisplayNames = {
    standard: "Standard",
    express: "Express",
    scheduled: "Scheduled",
  };

  // Add this function to check if order is new (within last 10 minutes)
 const isNewOrder = (order) => {
  const newOrderStatuses = [
    "pending", 
    "accepted_by_restaurant"
  ];
  return newOrderStatuses.includes(order.orderStatus);
};

const getRowBackgroundColor = (order) => {
  // Only new orders (pending and accepted_by_restaurant) get colored background
  if (isNewOrder(order)) {
    return 'bg-[#fedad3] hover:bg-[#fec9ba]'; // Light coral with darker hover
  }
  
  // All other statuses get white background
  return 'bg-white hover:bg-gray-50';
}


// Updated function to get row background color


  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "cod":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "cash":
        return "bg-green-100 text-green-800 border border-green-200";
      case "credit_card":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "debit_card":
      case "card":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "upi":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "wallet":
        return "bg-pink-100 text-pink-800 border border-pink-200";
      case "net_banking":
        return "bg-teal-100 text-teal-800 border border-teal-200";
      case "online":
        return "bg-cyan-100 text-cyan-800 border border-cyan-200";
      case "credit":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "corporate":
      case "meal_card":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const enableAudio = async () => {
    try {
      notificationSound.current = new Audio('/sound/bell.wav');
      notificationSound.current.preload = 'auto';
      
      await notificationSound.current.load();
      
      notificationSound.current.muted = true;
      await notificationSound.current.play();
      notificationSound.current.pause();
      notificationSound.current.currentTime = 0;
      notificationSound.current.muted = false;
      
      setAudioEnabled(true);
      localStorage.setItem('audioNotificationsEnabled', 'true');
      toast.success('Sound notifications enabled');
    } catch (e) {
      console.error('Audio initialization failed:', e);
      toast.error('Sound notifications failed to enable. Please interact with page first.');
    }
  };

  const disableAudio = () => {
    setAudioEnabled(false);
    localStorage.removeItem('audioNotificationsEnabled');
  };

  useEffect(() => {
    if (localStorage.getItem('audioNotificationsEnabled') === 'true') {
      enableAudio();
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const testNotification = () => {
    if (audioEnabled && notificationSound.current) {
      notificationSound.current.play().catch(e => {
        console.log('Audio play failed:', e);
        disableAudio();
      });
    }

    if (Notification.permission === 'granted') {
      new Notification('Test Notification', { 
        body: 'This is a test notification from the admin panel',
        icon: '/path/to/icon.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Test Notification', { 
            body: 'This is a test notification from the admin panel',
            icon: '/path/to/icon.png'
          });
        }
      });
    }
  };

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await getAdminOrders(page, limit);
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalOrders(response.pagination.totalOrders);
      setCurrentPage(response.pagination.currentPage);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleNewOrder = (orderData) => {
    console.log('New order received:', orderData);
    
    setOrders(prev => [orderData, ...prev.slice(0, limit - 1)]);
    setTotalOrders(prev => prev + 1);
    
    toast.success(`New Order #${orderData.orderId} Received!`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    
    if (audioEnabled && notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(e => {
        console.log('Audio play failed:', e);
        disableAudio();
        toast.info('Sound notifications disabled due to browser restrictions. Please enable again.');
      });
    }
    
    if (Notification.permission === 'granted') {
      new Notification('New Order', { 
        body: `New order #${orderData.orderId} received`,
        icon: '/path/to/icon.png'
      });
    }
  };

  useEffect(() => {
    const adminId = localStorage.getItem('userId');
    if (!adminId) {
      console.error('No admin ID found');
      return;
    }

    connectSocket();

    const handleConnect = () => {
      console.log('Socket connected - joining admin rooms');
      socket.emit('join-room', {
        userId: adminId,
        userType: 'admin'
      });
      fetchData().catch(console.error);
    };

    const handleOrderStatusUpdate = (data) => {
      console.log('Order status update received:', data);

      let mappedStatus;
      switch (data.newStatus) {
        case "picked_up":
          mappedStatus = "picked_up";
          break;
        case "out_for_delivery":
        case "reached_customer":
          mappedStatus = "on_the_way";
          break;
        case "delivered":
          mappedStatus = "delivered";
          break;
        default:
          mappedStatus = data.newStatus;
          break;
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === data.orderId
            ? { ...order, orderStatus: mappedStatus }
            : order
        )
      );

      toast.info(
        `Order #${data.orderId} status updated to: ${statusDisplayNames[mappedStatus] || mappedStatus}`,
        { position: "top-right", autoClose: 3000 }
      );
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
    };

    socket.on('connect', handleConnect);
    socket.on('new_order', handleNewOrder);
    socket.on('order_status_update_admin', handleOrderStatusUpdate);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    if (socket.connected) {
      handleConnect();
    } else {
      fetchData().catch(console.error);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_update_admin', handleOrderStatusUpdate);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);

      disconnectSocket();
    };
  }, []);

  const handleSort = (key) => {
    let direction = "desc";
    
    if (key !== "orderTime") {
      direction = sortConfig.key === key && sortConfig.direction === "asc" 
        ? "desc" 
        : "asc";
    } else {
      if (sortConfig.key === key) {
        direction = sortConfig.direction === "asc" ? "desc" : "asc";
      }
    } 
    
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchData(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab !== "All" && order.orderStatus !== activeTab) {
      return false;
    }
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.restaurantName.toLowerCase().includes(searchLower) ||
        order.address.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key === "orderTime") {
      const dateA = new Date(a[sortConfig.key]).getTime();
      const dateB = new Date(b[sortConfig.key]).getTime();
      
      return sortConfig.direction === "asc" 
        ? dateA - dateB 
        : dateB - dateA;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    }
  });

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalOrders);

  const getStatusColor = (status) => {
    let displayStatus = status;
    switch (status) {
      case "out_for_delivery":
      case "reached_customer":
        displayStatus = "on_the_way";
        break;
      default:
        displayStatus = status;
    }
    
    switch (displayStatus) {
      case "pending":
      case "pending_agent_acceptance":
      case "awaiting_agent_assignment":
        return "bg-yellow-100 text-yellow-800";
      case "accepted_by_restaurant":
      case "preparing":
      case "ready":
      case "assigned_to_agent":
      case "picked_up":
      case "on_the_way":
      case "in_progress":
      case "arrived":
        return "bg-blue-100 text-blue-800";
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "rejected_by_restaurant":
      case "cancelled_by_customer":
      case "rejected_by_agent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "ASAP";
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPreparationTime = (minutes) => {
    if (!minutes) return "N/A";
    return `${minutes} min`;
  };

  const renderAudioControl = () => (
    <button 
      onClick={audioEnabled ? disableAudio : enableAudio}
      className={`p-2 rounded-lg flex items-center ${audioEnabled ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
      title={audioEnabled ? "Disable sound notifications" : "Enable sound notifications"}
    >
      {audioEnabled ? (
        <>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="text-xs">Sound On</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span className="text-xs">Sound Off</span>
        </>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-lg p-2 mr-3 text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Orders</h1>
            <p className="text-sm text-gray-500">
              Manage and track all customer orders
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            {renderAudioControl()}
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => fetchData(currentPage)}
              title="Refresh"
            >
              <FiRefreshCw size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Filter"
            >
              <FiFilter size={18} />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Export"
            >
              <FiDownload size={18} />
            </button>
            <button
              onClick={testNotification}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
              title="Test notifications"
            >
              <FiInfo className="mr-1" />
              <span className="text-xs">Test Notifications</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap relative ${
                activeTab === tab
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab === "All" ? "All" : statusDisplayNames[tab]}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container with Fixed Height */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto ">
<div className="relative flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 h-[32em]">

           <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Merchant Name
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("orderTime")}
                      >
                        <div className="flex items-center">
                          Order Time
                          {sortConfig.key === "orderTime" && (
                            <FiChevronDown
                              className={`ml-1 transform ${
                                sortConfig.direction === "asc" ? "rotate-180" : ""
                              }`}
                              size={14}
                            />
                          )}
                        </div>
                      </th>  
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule Delivery
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Mode
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preparation Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="14" className="px-4 py-6 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : sortedOrders.length > 0 ? (
                      sortedOrders.map((order) => (
                        <tr 
                          key={order.orderId} 
                          className={getRowBackgroundColor(order)}
                        >
                          {/* Order ID with new order indicator */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center">
                              {isNewOrder(order.orderTime) && (
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" title="New Order"></span>
                              )}
                              <Link
                                to={`/admin/dashboard/order/table/details/${order.orderId}`}
                                className="text-blue-600 hover:underline"
                              >
                                {order.billId || order.orderId}
                              </Link>
                            </div>
                          </td>
                          
                          {/* Order Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="relative">
                              {updatingOrders[order.orderId] ? (
                                <div className="flex items-center justify-center py-1">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                </div>
                              ) : (
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                  className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.orderStatus)} cursor-pointer`}
                                  disabled={updatingOrders[order.orderId]}
                                >
                                  {adminStatusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {statusDisplayNames[status] || status}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>
                          
                          {/* Merchant Name */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {order.restaurantId ? (
                              <Link
                                to={`/admin/dashboard/merchants/merchant-details/${order.restaurantId}`}
                                className="text-blue-600 hover:underline"
                              >
                                {order.restaurantName}
                              </Link>
                            ) : (
                              <span>{order.restaurantName}</span>
                            )}
                          </td>
                          
                          {/* Order Time */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.orderTime).toLocaleString()}
                          </td>
                          
                          {/* Schedule Delivery */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {order.scheduledDeliveryTime 
                              ? formatTime(order.scheduledDeliveryTime)
                              : "ASAP"
                            }
                          </td>
                          
                          {/* Customer */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {order.customerId ? (
                                  <Link
                                    to={`/admin/dashboard/customer/${order.customerId}/details`}
                                    className="font-medium text-blue-600 hover:underline"
                                  >
                                    {order.customerName}
                                  </Link>
                                ) : (
                                  <span>{order.customerName}</span>
                                )}
                              </span>
                            </div>
                          </td>
                          
                          {/* Amount */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{order.amount}
                          </td>
                          
                          {/* Address */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-xs text-gray-500 max-w-xs truncate block">
                              {order.address}
                            </span>
                          </td>
                          
                          {/* Delivery Mode */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.deliveryMode === 'delivery' 
                                ? 'bg-blue-100 text-blue-800'
                                : order.deliveryMode === 'pickup'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {deliveryModeDisplayNames[order.deliveryMode] || "Home Delivery"}
                            </span>
                          </td>
                          
                          {/* Payment Status */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {paymentStatusDisplayNames[order.paymentStatus] || order.paymentStatus}
                            </span>
                          </td>
                          
                          {/* Payment Method */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentMethodColor(order.paymentMethod)}`}>
                              {paymentMethodDisplayNames[order.paymentMethod] || order.paymentMethod}
                            </span>
                          </td>
                          
                          {/* Preparation Time */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatPreparationTime(order.preparationTime)}
                          </td>
                          
                          {/* Delivery Type */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.deliveryType === 'express' 
                                ? 'bg-orange-100 text-orange-800'
                                : order.deliveryType === 'scheduled'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {deliveryTypeDisplayNames[order.deliveryType] || order.deliveryType}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="14" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg
                              className="w-16 h-16 text-gray-400 mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                            <p className="text-gray-500 mb-2">
                              No orders found
                            </p>
                            {searchQuery && (
                              <button
                                className="text-sm text-blue-600 hover:text-blue-800"
                                onClick={() => setSearchQuery("")}
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Pagination at Bottom */}
        {sortedOrders.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sticky bottom-0">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex}</span> to{" "}
                  <span className="font-medium">{endIndex}</span> of{" "}
                  <span className="font-medium">{totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTable;