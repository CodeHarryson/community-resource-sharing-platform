# Frontend Code Examples

## Authentication Context (AuthContext.js)

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    // Login handler
    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    };

    // Register handler
    const register = async (name, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Registration failed');
            }

            // Auto-login after registration
            return login(email, password);
        } catch (err) {
            console.error('Register error:', err);
            throw err;
        }
    };

    // Logout handler
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Update user data
    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
```

## Resource Creation Form (CreateResource.js)

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreateResource() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'other',
        image: null
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle file input changes
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            setError('File too large (max 5MB)');
            return;
        }
        setForm(prev => ({ ...prev, image: file }));
        setError('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let imageFilename = null;

            // Upload image if selected
            if (form.image) {
                const formData = new FormData();
                formData.append('file', form.image);

                const uploadRes = await fetch('/api/uploads', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!uploadRes.ok) {
                    throw new Error('Image upload failed');
                }

                const uploadData = await uploadRes.json();
                imageFilename = uploadData.filename;
            }

            // Create resource
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    image_filename: imageFilename
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create resource');
            }

            navigate('/dashboard');
        } catch (err) {
            console.error('Create resource error:', err);
            setError(err.message || 'Failed to create resource');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Resource</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2"
                        maxLength={200}
                    />
                </div>

                <div>
                    <label className="block mb-1">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        className="w-full border rounded p-2 h-32"
                    />
                </div>

                <div>
                    <label className="block mb-1">Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    >
                        <option value="other">Other</option>
                        <option value="books">Books</option>
                        <option value="tools">Tools</option>
                        <option value="electronics">Electronics</option>
                        <option value="furniture">Furniture</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1">Image (optional)</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Max file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-500 text-white py-2 px-4 rounded 
                             ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                    {loading ? 'Creating...' : 'Create Resource'}
                </button>
            </form>
        </div>
    );
}
```

## Resource List Component (ItemCard.js)

```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ItemCard({ resource, onRequest }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id, title, description, category, image_url, owner_name } = resource;

    // Format date helper
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle request button click
    const handleRequest = async (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        onRequest(id);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="aspect-w-16 aspect-h-9">
                <img
                    src={image_url}
                    alt={title}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                        e.target.src = `/images/default.svg`;
                    }}
                />
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-1">{title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            Shared by {owner_name}
                        </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {category}
                    </span>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{description}</p>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleRequest}
                        disabled={resource.user_id === user?.id}
                        className={`px-4 py-2 rounded 
                            ${resource.user_id === user?.id
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        {resource.user_id === user?.id ? 'Your Resource' : 'Request'}
                    </button>

                    <span className="text-sm text-gray-500">
                        {formatDate(resource.created_at)}
                    </span>
                </div>
            </div>
        </div>
    );
}
```

## API Service (api.js)

```javascript
// Base API configuration
const API_URL = process.env.REACT_APP_API_URL || '';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper for API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
    };

    try {
        const res = await fetch(url, { ...options, headers });
        
        if (!res.ok) {
            // Handle token expiration
            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Session expired');
            }
            
            const error = await res.json();
            throw new Error(error.message || 'API request failed');
        }

        return await res.json();
    } catch (err) {
        console.error(`API error (${endpoint}):`, err);
        throw err;
    }
}

// Resource-related API calls
export const resourceApi = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/api/resources?${query}`);
    },

    create: (data) => {
        return apiRequest('/api/resources', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    get: (id) => apiRequest(`/api/resources/${id}`),

    update: (id, data) => {
        return apiRequest(`/api/resources/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete: (id) => {
        return apiRequest(`/api/resources/${id}`, {
            method: 'DELETE'
        });
    },

    search: (query) => {
        return apiRequest(`/api/resources/search?q=${encodeURIComponent(query)}`);
    }
};

// Request-related API calls
export const requestApi = {
    create: (resourceId) => {
        return apiRequest('/api/requests', {
            method: 'POST',
            body: JSON.stringify({ resourceId })
        });
    },

    list: (status) => {
        const query = status ? `?status=${status}` : '';
        return apiRequest(`/api/requests${query}`);
    },

    update: (requestId, status) => {
        return apiRequest(`/api/requests/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
};

// User-related API calls
export const userApi = {
    updateProfile: (data) => {
        return apiRequest('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    getNotifications: () => apiRequest('/api/users/notifications'),

    markNotificationRead: (id) => {
        return apiRequest(`/api/users/notifications/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ read: true })
        });
    }
};

// Upload-related API calls
export const uploadApi = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/api/uploads`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: formData
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Upload failed');
        }

        return res.json();
    }
};
```