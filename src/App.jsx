import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Campaigns from './pages/Campaigns'
import Templates from './pages/Templates'
import Analytics from './pages/Analytics'
import LiveChat from './pages/LiveChat'
import LiveChat2 from './pages/EnhancedChat'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/contacts" element={<ProtectedRoute><Contacts/></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><Campaigns/></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates/></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics/></ProtectedRoute>} />
      <Route path="/whatsapp" element={<ProtectedRoute><LiveChat2/></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
