// Admin JavaScript for OpenMart

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

function initializeAdmin() {
    // Initialize all admin functionality
    setupAdminSidebar();
    setupDataTables();
    setupModals();
    setupFilters();
    setupBulkActions();
    
    // Load initial data
    loadAdminStats();
}

// Sidebar Management
function setupAdminSidebar() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.querySelector('[data-bs-toggle="collapse"]');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.admin-sidebar').classList.toggle('show');
        });
    }
    
    // Active link highlighting
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.admin-sidebar .nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Data Tables Setup
function setupDataTables() {
    // This would normally initialize DataTables for better table functionality
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // Add basic table enhancements
        table.classList.add('table-hover');
    });
}

// Modal Management
function setupModals() {
    // Product modals
    const addProductModal = document.getElementById('addProductModal');
    if (addProductModal) {
        addProductModal.addEventListener('show.bs.modal', function() {
            // Reset form when modal opens
            document.getElementById('addProductForm').reset();
        });
    }
    
    // Category modals
    const addCategoryModal = document.getElementById('addCategoryModal');
    if (addCategoryModal) {
        addCategoryModal.addEventListener('show.bs.modal', function() {
            document.getElementById('addCategoryForm').reset();
        });
    }
}

// Filter Management
function setupFilters() {
    // Product filters
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const resetFilters = document.getElementById('resetFilters');
    
    if (productSearch) {
        productSearch.addEventListener('input', debounce(applyProductFilters, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyProductFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyProductFilters);
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', resetProductFilters);
    }
    
    // Order filters
    const orderSearch = document.getElementById('orderSearch');
    const orderStatusFilter = document.getElementById('statusFilter');
    
    if (orderSearch) {
        orderSearch.addEventListener('input', debounce(applyOrderFilters, 300));
    }
    
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', applyOrderFilters);
    }
}

function applyProductFilters() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    const rows = document.querySelectorAll('#productsTable tbody tr');
    
    rows.forEach(row => {
        const productName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const productCategory = row.querySelector('td:nth-child(3)').textContent;
        const productStatus = row.querySelector('td:nth-child(6) .badge').textContent.toLowerCase();
        
        let showRow = true;
        
        // Search filter
        if (searchTerm && !productName.includes(searchTerm)) {
            showRow = false;
        }
        
        // Category filter
        if (category && productCategory !== category) {
            showRow = false;
        }
        
        // Status filter
        if (status) {
            if (status === 'active' && productStatus !== 'active') {
                showRow = false;
            } else if (status === 'inactive' && productStatus !== 'inactive') {
                showRow = false;
            } else if (status === 'outofstock' && !productStatus.includes('out of stock')) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function applyOrderFilters() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    
    const rows = document.querySelectorAll('#ordersTable tbody tr');
    
    rows.forEach(row => {
        const orderId = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const customerName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const orderStatus = row.querySelector('td:nth-child(6) select').value;
        
        let showRow = true;
        
        // Search filter
        if (searchTerm && !orderId.includes(searchTerm) && !customerName.includes(searchTerm)) {
            showRow = false;
        }
        
        // Status filter
        if (status && orderStatus !== status) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function resetProductFilters() {
    document.getElementById('productSearch').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    applyProductFilters();
}

// Bulk Actions
function setupBulkActions() {
    const selectAll = document.getElementById('selectAll');
    const productCheckboxes = document.querySelectorAll('.product-checkbox');
    const bulkAction = document.getElementById('bulkAction');
    const applyBulkAction = document.getElementById('applyBulkAction');
    
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const isChecked = this.checked;
            productCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
    }
    
    if (applyBulkAction) {
        applyBulkAction.addEventListener('click', function() {
            const action = bulkAction.value;
            const selectedProducts = Array.from(productCheckboxes).filter(cb => cb.checked);
            
            if (selectedProducts.length === 0) {
                showAdminNotification('Please select at least one product', 'warning');
                return;
            }
            
            if (!action) {
                showAdminNotification('Please select an action', 'warning');
                return;
            }
            
            // Perform bulk action
            performBulkAction(action, selectedProducts);
        });
    }
}

function performBulkAction(action, selectedProducts) {
    const productIds = selectedProducts.map(cb => {
        const row = cb.closest('tr');
        return row.querySelector('td:nth-child(2) .text-muted').textContent.replace('SKU: ', '');
    });
    
    switch(action) {
        case 'activate':
            updateProductsStatus(productIds, 'active');
            break;
        case 'deactivate':
            updateProductsStatus(productIds, 'inactive');
            break;
        case 'featured':
            updateProductsFeatured(productIds, true);
            break;
        case 'unfeatured':
            updateProductsFeatured(productIds, false);
            break;
        case 'delete':
            deleteProducts(productIds);
            break;
    }
}

function updateProductsStatus(productIds, status) {
    // This would normally make an API call
    console.log(`Updating products ${productIds.join(', ')} to status: ${status}`);
    showAdminNotification(`Updated ${productIds.length} products to ${status}`, 'success');
    
    // Reset selection
    document.getElementById('selectAll').checked = false;
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
}

function updateProductsFeatured(productIds, featured) {
    console.log(`Setting featured status for products ${productIds.join(', ')} to: ${featured}`);
    showAdminNotification(`Updated featured status for ${productIds.length} products`, 'success');
    
    document.getElementById('selectAll').checked = false;
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
}

function deleteProducts(productIds) {
    if (confirm(`Are you sure you want to delete ${productIds.length} products? This action cannot be undone.`)) {
        console.log(`Deleting products: ${productIds.join(', ')}`);
        showAdminNotification(`Deleted ${productIds.length} products`, 'success');
        
        document.getElementById('selectAll').checked = false;
        document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
    }
}

// Order Status Management
function setupOrderStatusUpdates() {
    const statusSelects = document.querySelectorAll('.status-select');
    
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            const orderId = this.getAttribute('data-order-id');
            const newStatus = this.value;
            
            updateOrderStatus(orderId, newStatus);
        });
    });
}

function updateOrderStatus(orderId, status) {
    // This would normally make an API call
    console.log(`Updating order ${orderId} to status: ${status}`);
    showAdminNotification(`Order #${orderId} status updated to ${status}`, 'success');
}

// Product Management
function setupProductManagement() {
    const saveProductBtn = document.getElementById('saveProduct');
    
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', function() {
            saveProduct();
        });
    }
    
    const saveCategoryBtn = document.getElementById('saveCategory');
    
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', function() {
            saveCategory();
        });
    }
}

function saveProduct() {
    const form = document.getElementById('addProductForm');
    const formData = new FormData(form);
    
    const productData = {
        name: formData.get('productName'),
        sku: formData.get('productSku'),
        category: formData.get('productCategory'),
        price: formData.get('productPrice'),
        comparePrice: formData.get('comparePrice'),
        stockQuantity: formData.get('stockQuantity'),
        description: formData.get('productDescription'),
        isFeatured: document.getElementById('isFeatured').checked,
        isActive: document.getElementById('isActive').checked
    };
    
    // Validate required fields
    if (!productData.name || !productData.sku || !productData.category || !productData.price || !productData.stockQuantity) {
        showAdminNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // This would normally make an API call
    console.log('Saving product:', productData);
    showAdminNotification('Product saved successfully!', 'success');
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    form.reset();
}

function saveCategory() {
    const form = document.getElementById('addCategoryForm');
    const formData = new FormData(form);
    
    const categoryData = {
        name: formData.get('categoryName'),
        slug: formData.get('categorySlug'),
        description: formData.get('categoryDescription'),
        isActive: document.getElementById('categoryStatus').checked
    };
    
    if (!categoryData.name || !categoryData.slug) {
        showAdminNotification('Please fill in all required fields', 'error');
        return;
    }
    
    console.log('Saving category:', categoryData);
    showAdminNotification('Category saved successfully!', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
    modal.hide();
    form.reset();
}

// Stats Loading
function loadAdminStats() {
    // This would normally fetch from API
    // For now, we'll use static data that's already in the HTML
    console.log('Loading admin stats...');
}

// Utility Functions
function showAdminNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} admin-notification`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for global use
window.Admin = {
    showNotification: showAdminNotification,
    updateOrderStatus,
    saveProduct,
    saveCategory
};